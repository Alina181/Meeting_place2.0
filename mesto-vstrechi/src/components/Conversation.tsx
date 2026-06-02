import type { ChangeEvent } from "react";
import type { Message, NodeInfo } from "../types";
import { colorFromId } from "../lib/ids";
import { readImageFile } from "../lib/file";
import { Avatar } from "./Avatar";

type ActiveNode = {
  id: string;
  label: string;
  color: string;
  avatar?: string;
};

type ConversationProps = {
  activeChat: string;
  activeNode?: ActiveNode;
  nodes: NodeInfo[];
  messages: Message[];
  text: string;
  onTextChange: (value: string) => void;
  onBack: () => void;
  onSend: (image?: string) => void;
};

export function Conversation({ activeChat, activeNode, nodes, messages, text, onTextChange, onBack, onSend }: ConversationProps) {
  async function sendPhoto(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];

    if (file) {
      onSend(await readImageFile(file));
      event.target.value = "";
    }
  }

  if (!activeChat) {
    return (
      <section className="conversation">
        <div className="desktop-placeholder">
          <h1>Место Встречи</h1>
          <p>Выберите чат слева или дождитесь автопоиска устройства.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="conversation mobile-open">
      <header className="conversation-head">
        <button className="round back" onClick={onBack}>‹</button>
        <Avatar color={activeNode?.color ?? colorFromId(activeChat)} image={activeNode?.avatar} />
        <div>
          <b>{activeNode?.label ?? activeChat}</b>
          <p>{nodes.some((node) => node.id === activeChat) ? "в сети" : "ожидание узла"}</p>
        </div>
      </header>

      <div className="messages">
        {messages.length === 0 && <div className="empty chat-empty">Сообщений пока нет. Можно отправить текст или фото.</div>}
        {messages.map((message) => (
          <article key={message.id} className={`bubble ${message.incoming ? "in" : "out"}`}>
            {message.image && <img className="message-photo" src={message.image} alt="Фото в сообщении" />}
            {message.text && <b>{message.text}</b>}
            <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {message.status}</span>
          </article>
        ))}
      </div>

      <footer className="composer">
        <label className="photo-button" title="Отправить фото">
          📷
          <input type="file" accept="image/*" onChange={sendPhoto} />
        </label>
        <textarea
          value={text}
          placeholder="Сообщение"
          onChange={(event) => onTextChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
              onSend();
            }
          }}
        />
        <button onClick={() => onSend()}>➤</button>
      </footer>
    </section>
  );
}
