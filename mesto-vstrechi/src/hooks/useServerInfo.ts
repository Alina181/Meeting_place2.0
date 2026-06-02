import { useCallback, useEffect, useState } from "react";

export type ServerInfo = {
  ok: boolean;
  port: number;
  urls: string[];
  primaryUrl: string;
  lanUrl: string;
};

const emptyServerInfo: ServerInfo = {
  ok: false,
  port: 0,
  urls: [],
  primaryUrl: "",
  lanUrl: ""
};

export function useServerInfo() {
  const [serverInfo, setServerInfo] = useState<ServerInfo>(emptyServerInfo);
  const [restarting, setRestarting] = useState(false);

  const refreshServerInfo = useCallback(async () => {
    try {
      const response = await fetch("/api/server-info", { cache: "no-store" });
      const data = (await response.json()) as ServerInfo;
      setServerInfo(data);
    } catch {
      setServerInfo(emptyServerInfo);
    }
  }, []);

  async function restartServer(): Promise<void> {
    setRestarting(true);

    try {
      await fetch("/api/restart", { method: "POST" });
    } catch {
      // Сервер может разорвать соединение в момент перезапуска — это нормально.
    }

    window.setTimeout(() => {
      window.location.reload();
    }, 1400);
  }

  useEffect(() => {
    refreshServerInfo();
    const timer = globalThis.setInterval(refreshServerInfo, 7000);

    return () => globalThis.clearInterval(timer);
  }, [refreshServerInfo]);

  return {
    serverInfo,
    restarting,
    refreshServerInfo,
    restartServer
  };
}
