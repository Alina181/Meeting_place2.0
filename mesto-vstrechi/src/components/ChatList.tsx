import { Avatar } from "./Avatar";

type ChatItem = {
  id: string;
  label: string;
  color: string;
  avatar?: string;
  lastText: string;
};

type ChatListProps = {
  chats: ChatItem[];
  onOpenChat: (id: string) => void;
};

export function ChatList({ chats, onOpenChat }: ChatListProps) {
  return (
    <div className="chat-list">
      {chats.length === 0 && <div className="empty">Откройте приложение на втором устройстве — чат появится здесь.</div>}
      {chats.map((chat) => (
        <button className="chat-card" key={chat.id} onClick={() => onOpenChat(chat.id)}>
          <Avatar color={chat.color} image={chat.avatar} />
          <span className="chat-meta">
            <b>{chat.label}</b>
            <small>{chat.lastText}</small>
          </span>
        </button>
      ))}
    </div>
  );
}
