import { createServer as createHttpServer } from "node:http";
import { createServer as createNetServer } from "node:net";
import { readFile, stat } from "node:fs/promises";
import { exec } from "node:child_process";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { networkInterfaces } from "node:os";

const root = join(fileURLToPath(new URL("..", import.meta.url)), "dist");
const preferredPort = Number(process.env.PORT || 9000);
const nodes = new Map();
const queues = new Map();
const stableIds = new Map();

let activePort = preferredPort;
let localUrls = [];

function json(res, data, status = 200) {
  const body = JSON.stringify(data, null, 2);

  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
  });

  res.end(body);
}

function getLocalUrls(port) {
  const urls = [`http://localhost:${port}`];
  const nets = networkInterfaces();

  for (const items of Object.values(nets)) {
    for (const item of items || []) {
      if (item.family === "IPv4" && !item.internal) {
        urls.push(`http://${item.address}:${port}`);
      }
    }
  }

  return [...new Set(urls)];
}

function getClientKey(req) {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded || req.socket.remoteAddress || "local";

  return String(ip).replace(/^::ffff:/, "");
}

function createStableId(key) {
  let hash = 0;

  for (const char of key) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return `device_${hash.toString(36).slice(0, 6)}`;
}

async function readBody(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8");

  return raw ? JSON.parse(raw) : {};
}

function enqueue(to, envelope) {
  if (!queues.has(to)) {
    queues.set(to, []);
  }

  queues.get(to).push(envelope);
}

async function api(req, res, pathname) {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
    });
    res.end();
    return true;
  }

  if (pathname === "/api/server-info" && req.method === "GET") {
    json(res, {
      ok: true,
      port: activePort,
      urls: localUrls,
      primaryUrl: localUrls[0],
      lanUrl: localUrls.find((url) => !url.includes("localhost")) || localUrls[0]
    });
    return true;
  }

  if (pathname === "/api/restart" && req.method === "POST") {
    json(res, { ok: true, message: "server_restarting" });
    setTimeout(() => process.exit(42), 250);
    return true;
  }

  if (pathname === "/api/stable-id" && req.method === "GET") {
    const key = getClientKey(req);
    const id = stableIds.get(key) || createStableId(key);
    stableIds.set(key, id);
    json(res, { id });
    return true;
  }

  if (pathname === "/api/stable-id" && req.method === "POST") {
    const key = getClientKey(req);
    const body = await readBody(req);
    const id = String(body.id || createStableId(key));
    stableIds.set(key, id);
    json(res, { id });
    return true;
  }

  if (pathname === "/api/hello" && req.method === "POST") {
    const node = await readBody(req);

    if (node.id) {
      nodes.set(node.id, { ...node, lastSeen: Date.now() });
    }

    json(res, { ok: true });
    return true;
  }

  if (pathname === "/api/nodes" && req.method === "GET") {
    const now = Date.now();
    const list = [...nodes.values()].filter((node) => now - Number(node.lastSeen || 0) < 15000);
    json(res, list);
    return true;
  }

  if (pathname === "/api/send" && req.method === "POST") {
    const envelope = await readBody(req);

    if (envelope.to) {
      enqueue(envelope.to, envelope);
    }

    for (const id of nodes.keys()) {
      if (id !== envelope.from && id !== envelope.to) {
        enqueue(id, envelope);
      }
    }

    json(res, { ok: true });
    return true;
  }

  if (pathname.startsWith("/api/poll/") && req.method === "GET") {
    const id = decodeURIComponent(pathname.slice("/api/poll/".length));
    const items = queues.get(id) || [];
    queues.set(id, []);
    json(res, items.slice(-100));
    return true;
  }

  return false;
}

const types = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".webmanifest", "application/manifest+json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"]
]);

async function staticFile(_req, res, pathname) {
  const safePath = normalize(pathname).replace(/^([.][.][/\\])+/, "");
  let filePath = join(root, safePath === "/" ? "index.html" : safePath);

  try {
    const info = await stat(filePath);

    if (info.isDirectory()) {
      filePath = join(filePath, "index.html");
    }
  } catch {
    filePath = join(root, "index.html");
  }

  const data = await readFile(filePath);
  const type = types.get(extname(filePath)) || "application/octet-stream";
  res.writeHead(200, { "Content-Type": type });
  res.end(data);
}

function canUsePort(port) {
  return new Promise((resolve) => {
    const test = createNetServer();

    test.once("error", () => resolve(false));
    test.once("listening", () => {
      test.close(() => resolve(true));
    });
    test.listen(port, "0.0.0.0");
  });
}

async function findFreePort(startPort) {
  for (let port = startPort; port < startPort + 40; port += 1) {
    if (await canUsePort(port)) {
      return port;
    }
  }

  throw new Error(`Не удалось найти свободный порт начиная с ${startPort}`);
}

function openBrowser(url) {
  if (process.env.NO_OPEN === "1") {
    return;
  }

  const escaped = url.replace(/"/g, "");
  const command = process.platform === "win32"
    ? `start "" "${escaped}"`
    : process.platform === "darwin"
      ? `open "${escaped}"`
      : `xdg-open "${escaped}"`;

  exec(command, () => undefined);
}

const server = createHttpServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

    if (await api(req, res, url.pathname)) {
      return;
    }

    await staticFile(req, res, url.pathname);
  } catch (error) {
    console.error(error);
    json(res, { error: "server_error" }, 500);
  }
});

activePort = await findFreePort(preferredPort);
localUrls = getLocalUrls(activePort);

server.listen(activePort, "0.0.0.0", () => {
  const lanUrl = localUrls.find((url) => !url.includes("localhost"));

  console.log("\nМесто Встречи запущено");
  console.log(`Ноутбук: http://localhost:${activePort}`);

  if (lanUrl) {
    console.log(`Телефон/другое устройство: ${lanUrl}`);
  }

  if (activePort !== preferredPort) {
    console.log(`Порт ${preferredPort} был занят, выбран свободный порт ${activePort}`);
  }

  console.log("Кнопка перезапуска доступна в панели сети приложения.\n");
  openBrowser(`http://localhost:${activePort}`);
});
