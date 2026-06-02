import type { DrawerPage, Theme } from "../types";
import { Avatar } from "./Avatar";

type AccountMenuProps = {
  deviceId: string;
  avatar: string;
  profileColor: string;
  theme: Theme;
  moreOpen: boolean;
  onOpenDrawer: (page: DrawerPage) => void;
  onAddContact: () => void;
  onToggleMore: () => void;
  onToggleTheme: () => void;
};

export function AccountMenu({
  deviceId,
  avatar,
  profileColor,
  theme,
  moreOpen,
  onOpenDrawer,
  onAddContact,
  onToggleMore,
  onToggleTheme
}: AccountMenuProps) {
  function open(page: DrawerPage): void {
    onOpenDrawer(page);
  }

  return (
    <div className="account-menu" role="menu">
      <button type="button" className="menu-profile" onClick={() => open("settings")}>
        <Avatar color={profileColor} image={avatar} size="small" />
        <span>
          <b>{deviceId}</b>
          <small>Место Встречи</small>
        </span>
      </button>
      <button type="button" onClick={onAddContact}>＋ Добавить контакт</button>
      <button type="button" onClick={() => open("contacts")}>👥 Контакты</button>
      <button type="button" onClick={() => open("settings")}>⚙️ Настройки</button>
      <button type="button" className="more-trigger" onClick={onToggleMore} aria-expanded={moreOpen}>
        <span>⋯ Подробнее</span>
        <span aria-hidden="true">›</span>
      </button>
      {moreOpen && (
        <div className="more-menu" role="menu">
          <button type="button" onClick={onToggleTheme}>{theme === "dark" ? "☀️ Светлый режим" : "🌙 Тёмный режим"}</button>
          <button type="button" onClick={() => open("network")}>📡 Сеть и QR</button>
          <button type="button" onClick={() => open("contacts")}>👥 Все контакты</button>
          <button type="button" onClick={onAddContact}>＋ Новый контакт</button>
          <button type="button" onClick={() => open("settings")}>⚙️ Профиль и оформление</button>
          <button type="button" onClick={() => window.alert("Место Встречи — локальный mesh-мессенджер. После первого открытия PWA может работать без интернета.")}>❔ О приложении</button>
        </div>
      )}
    </div>
  );
}
