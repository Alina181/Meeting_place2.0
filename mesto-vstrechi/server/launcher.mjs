import { spawn } from "node:child_process";

function startServer() {
  const child = spawn(process.execPath, ["server/index.mjs"], {
    stdio: "inherit",
    env: process.env
  });

  child.on("exit", (code) => {
    if (code === 42) {
      console.log("\nПерезапуск сервера Место Встречи...\n");
      setTimeout(startServer, 400);
      return;
    }

    process.exit(code ?? 0);
  });
}

startServer();
