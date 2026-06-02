import type { Theme } from "../types";
import { Avatar } from "./Avatar";

type TopBarProps = {
  deviceId: string;
  avatar: string;
  profileColor: string;
  theme: Theme;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onToggleTheme: () => void;
};

export function TopBar({ deviceId, avatar, profileColor, theme, menuOpen, onToggleMenu, onToggleTheme }: TopBarProps) {
  return (
    <header className="topbar">
      <button className="round" onClick={onToggleMenu} aria-label="Открыть меню" title="Меню">
        ☰
      </button>
      <Avatar color={profileColor} image={avatar} />
      <div className="topbar-title">
        <b>{deviceId}</b>
        <p>Место Встречи</p>
      </div>
      <button className="round theme" onClick={onToggleTheme} aria-label="Переключить тему" title="Тема">
        {theme === "dark" ? "☀️" : "🌙"}
      </button>
      {menuOpen && <span className="menu-shadow" />}
    </header>
  );
}
