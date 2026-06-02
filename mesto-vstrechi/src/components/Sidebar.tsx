import type { DrawerPage, Theme } from "../types";
import { AccountMenu } from "./AccountMenu";
import { ChatList } from "./ChatList";
import { TopBar } from "./TopBar";

type ChatItem = {
  id: string;
  label: string;
  color: string;
  avatar?: string;
  lastText: string;
};

type SidebarProps = {
  activeChat: string;
  deviceId: string;
  avatar: string;
  profileColor: string;
  theme: Theme;
  manualId: string;
  chats: ChatItem[];
  menuOpen: boolean;
  moreOpen: boolean;
  onManualIdChange: (value: string) => void;
  onOpenChat: (id: string) => void;
  onStartAddContact: (id?: string) => void;
  onOpenDrawer: (page: DrawerPage) => void;
  onToggleMenu: () => void;
  onToggleMore: () => void;
  onToggleTheme: () => void;
};

export function Sidebar({
  activeChat,
  deviceId,
  avatar,
  profileColor,
  theme,
  manualId,
  chats,
  menuOpen,
  moreOpen,
  onManualIdChange,
  onOpenChat,
  onStartAddContact,
  onOpenDrawer,
  onToggleMenu,
  onToggleMore,
  onToggleTheme
}: SidebarProps) {
  return (
    <section className={`sidebar ${activeChat ? "mobile-hidden" : ""}`}>
      <div className="menu-wrap">
        <TopBar
          deviceId={deviceId}
          avatar={avatar}
          profileColor={profileColor}
          theme={theme}
          menuOpen={menuOpen}
          onToggleMenu={onToggleMenu}
          onToggleTheme={onToggleTheme}
        />
        {menuOpen && (
          <AccountMenu
            deviceId={deviceId}
            avatar={avatar}
            profileColor={profileColor}
            theme={theme}
            moreOpen={moreOpen}
            onOpenDrawer={onOpenDrawer}
            onAddContact={() => onStartAddContact()}
            onToggleMore={onToggleMore}
            onToggleTheme={onToggleTheme}
          />
        )}
      </div>

      <div className="search-row">
        <input value={manualId} onChange={(event) => onManualIdChange(event.target.value)} placeholder="ID собеседника или QR" />
        <button onClick={() => (manualId.trim() ? onStartAddContact(manualId.trim()) : onOpenDrawer("contacts"))} aria-label="Добавить контакт">
          +
        </button>
      </div>

      <ChatList chats={chats} onOpenChat={onOpenChat} />
    </section>
  );
}
