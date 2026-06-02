import { useEffect, useState, type ChangeEvent } from "react";
import type { ProfileSettings } from "../../types";
import { readImageFile } from "../../lib/file";
import { canInstallApp, getInstallInstruction, installApp, isAppInstalled, onInstallAvailabilityChange, showInstallNotification } from "../../lib/pwa";
import { Avatar } from "../Avatar";

type SettingsPageProps = {
  settings: ProfileSettings;
  onDraftIdChange: (value: string) => void;
  onProfileColorChange: (value: string) => void;
  onAvatarChange: (value: string) => void;
  onBackgroundColorChange: (value: string) => void;
  onBackgroundImageChange: (value: string) => void;
  onAppIconChange: (value: string) => void;
  onSave: () => void;
};

export function SettingsPage({
  settings,
  onDraftIdChange,
  onProfileColorChange,
  onAvatarChange,
  onBackgroundColorChange,
  onBackgroundImageChange,
  onAppIconChange,
  onSave
}: SettingsPageProps) {
  async function loadAvatar(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];

    if (file) {
      onAvatarChange(await readImageFile(file));
    }
  }


  async function loadAppIcon(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];

    if (file) {
      onAppIconChange(await readImageFile(file));
    }
  }

  const [installState, setInstallState] = useState<"ready" | "manual" | "loading" | "installed">(
    isAppInstalled() ? "installed" : canInstallApp() ? "ready" : "manual"
  );
  const [showInstallFlyout, setShowInstallFlyout] = useState(false);
  const [installMessage, setInstallMessage] = useState(getInstallInstruction());

  useEffect(() => {
    return onInstallAvailabilityChange(() => {
      const nextState = isAppInstalled() ? "installed" : canInstallApp() ? "ready" : "manual";
      setInstallState(nextState);

      if (nextState === "installed") {
        setShowInstallFlyout(false);
      }
    });
  }, []);

  useEffect(() => {
    if (isAppInstalled()) {
      setShowInstallFlyout(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setInstallMessage(getInstallInstruction());
      setShowInstallFlyout(true);
    }, 700);

    return () => window.clearTimeout(timer);
  }, []);

  async function loadBackground(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];

    if (file) {
      onBackgroundImageChange(await readImageFile(file));
    }
  }

  async function handleInstall(): Promise<void> {
    setShowInstallFlyout(true);

    if (isAppInstalled()) {
      setInstallState("installed");
      setInstallMessage("Приложение уже установлено и может открываться как отдельное приложение.");
      await showInstallNotification("Приложение уже установлено.");
      return;
    }

    setInstallState("loading");
    setInstallMessage("Проверяю возможность установки и запускаю окно установки...");
    await showInstallNotification("Запускаю установку приложения...");

    const result = await installApp();

    if (result === "installed" || result === "already-installed") {
      setInstallState("installed");
      setInstallMessage("Готово. Приложение установлено на устройство.");
      await showInstallNotification("Приложение установлено.");
      return;
    }

    if (result === "opened") {
      setInstallState(canInstallApp() ? "ready" : "manual");
      setInstallMessage("Окно установки было открыто. Если вы нажали «Отмена», нажмите кнопку установки ещё раз или установите через меню браузера.");
      await showInstallNotification("Окно установки было открыто.");
      return;
    }

    const instruction = getInstallInstruction();
    setInstallState("manual");
    setInstallMessage(instruction);
    await showInstallNotification(instruction);
  }

  return (
    <>
      <section className="settings-hero">
        <Avatar color={settings.profileColor} image={settings.avatar} size="hero" />
        <h2>{settings.deviceId}</h2>
        <p>В сети</p>
      </section>

      <section className="settings-list">
        <label className="field-row">
          <span>🆔</span>
          <div>
            <b>ID профиля</b>
            <input value={settings.draftId} onChange={(event) => onDraftIdChange(event.target.value)} />
          </div>
        </label>
        <button onClick={onSave} className="wide-action">Сохранить ID</button>

        <label className="field-row">
          <span>🎨</span>
          <div>
            <b>Цвет профиля</b>
            <input type="color" value={settings.profileColor} onChange={(event) => onProfileColorChange(event.target.value)} />
          </div>
        </label>
        <label className="field-row photo-row">
          <span>🖼️</span>
          <div>
            <b>Фото профиля</b>
            <small>Показывается в чатах и контактах.</small>
            <input type="file" accept="image/*" onChange={loadAvatar} />
          </div>
        </label>
        <label className="field-row photo-row">
          <span>📱</span>
          <div>
            <b>Иконка приложения</b>
            <small>Выберите фото/картинку — она станет иконкой установленного приложения.</small>
            <div className="icon-preview-row">
              <span className="app-icon-preview" style={{ background: settings.appIcon ? `url(${settings.appIcon}) center/cover` : "linear-gradient(135deg, var(--accent), var(--accent-2))" }}>⚓</span>
              <input type="file" accept="image/*" onChange={loadAppIcon} />
            </div>
          </div>
        </label>
        <label className="field-row">
          <span>🌈</span>
          <div>
            <b>Цвет фона чата</b>
            <input type="color" value={settings.backgroundColor} onChange={(event) => onBackgroundColorChange(event.target.value)} />
          </div>
        </label>
        <label className="field-row">
          <span>🏞️</span>
          <div>
            <b>Фон из галереи</b>
            <small>Можно поставить своё фото или картинку на фон.</small>
            <input type="file" accept="image/*" onChange={loadBackground} />
          </div>
        </label>
        <button onClick={onSave} className="wide-action">Сохранить оформление</button>

        <button onClick={onSave} className="wide-action secondary-action">💾 Сохранить иконку и фото</button>

        {installState !== "installed" && (
          <div className="install-promo-card">
            <div className="install-promo-arrow" aria-hidden="true">↓</div>
            <div className="install-promo-title">📲 Установите приложение</div>
            <p>Нажмите кнопку ниже — сайт откроется как приложение на телефоне или ноутбуке.</p>
          </div>
        )}

        {installState !== "installed" ? (
          <button onClick={handleInstall} className="wide-action install-action install-pulse">📲 Установить приложение</button>
        ) : (
          <div className="install-installed-card">✅ Приложение уже установлено</div>
        )}
      </section>

      {showInstallFlyout && (
        <div className="install-flyout" role="status" aria-live="polite">
          <button className="install-flyout-close" type="button" onClick={() => setShowInstallFlyout(false)} aria-label="Закрыть">×</button>
          <div className="install-flyout-icon">
            <img src={settings.appIcon || "icons/icon-192.svg"} alt="Иконка приложения" />
          </div>
          <div>
            <b>{installState === "installed" ? "Приложение установлено" : installState === "loading" ? "Запускаю установку..." : "Установка приложения"}</b>
            <p>{installMessage}</p>
          </div>
        </div>
      )}

    </>
  );
}
