import { QRCodeCanvas } from "qrcode.react";
import type { NodeInfo, ProfileSettings } from "../../types";
import type { ServerInfo } from "../../hooks/useServerInfo";
import { Avatar } from "../Avatar";

type NetworkPageProps = {
  settings: ProfileSettings;
  nodes: NodeInfo[];
  copied: boolean;
  serverInfo: ServerInfo;
  restarting: boolean;
  onCopyId: () => void;
  onRestartServer: () => void;
};

export function NetworkPage({ settings, nodes, copied, serverInfo, restarting, onCopyId, onRestartServer }: NetworkPageProps) {
  return (
    <>
      <section className="settings-block profile-row">
        <Avatar color={settings.profileColor} image={settings.avatar} size="large" />
        <div>
          <b>Профиль {settings.deviceId}</b>
          <p>Найдите ID другого устройства или покажите свой QR.</p>
        </div>
      </section>

      <section className="settings-block qr-grid">
        <div>
          <b>Подключение</b>
          <p>Откройте приложение на другом устройстве. Найденные ID появятся в списке чатов.</p>
          <p className="secure">🔐 ECDH включён автоматически. Общий пароль не нужен.</p>
          <div className="settings-actions">
            <button type="button" className="inline-button" onClick={onCopyId}>
              {copied ? "ID скопирован" : "Скопировать ID"}
            </button>
          </div>
        </div>
        <div className="qr-card">
          <QRCodeCanvas value={settings.deviceId} size={154} />
          <small>QR ID</small>
        </div>
      </section>

      <section className="settings-block qr-grid">
        <div>
          <b>Быстро открыть на телефоне</b>
          <p>
            Сервер сам выбирает свободный порт. Отсканируйте QR на телефоне или откройте ссылку вручную.
          </p>
          <code className="url-pill">{serverInfo.lanUrl || "Адрес появится после запуска сервера"}</code>
        </div>
        <div className="qr-card">
          <QRCodeCanvas value={serverInfo.lanUrl || globalThis.location.href} size={154} />
          <small>QR сайта</small>
        </div>
      </section>

      <section className="settings-block">
        <b>Сервер</b>
        <p>
          Порт: {serverInfo.port || "определяется"}. Если 9000 занят, приложение автоматически выберет следующий свободный порт.
        </p>
        <button type="button" className="wide-action danger-soft" onClick={onRestartServer} disabled={restarting}>
          {restarting ? "Перезапускаю сервер..." : "🟢 Перезапустить сервер"}
        </button>
      </section>

      <section className="settings-block">
        <b>Узлы рядом</b>
        <p>{nodes.length ? nodes.map((node) => node.id).join(", ") : "Пока никого нет. Откройте приложение на втором устройстве."}</p>
      </section>
    </>
  );
}
