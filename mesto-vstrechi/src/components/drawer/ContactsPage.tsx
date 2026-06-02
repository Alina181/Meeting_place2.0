import type { Contact } from "../../types";
import { Avatar } from "../Avatar";

type ContactsPageProps = {
  contacts: Contact[];
  onAdd: () => void;
  onOpenChat: (id: string) => void;
  onRemove: (id: string) => void;
};

export function ContactsPage({ contacts, onAdd, onOpenChat, onRemove }: ContactsPageProps) {
  return (
    <section className="contacts-page">
      <button className="add-contact-card" onClick={onAdd}>＋ Добавить контакт</button>
      {contacts.length === 0 && <p className="muted-box">Контактов пока нет. Добавьте ID собеседника, чтобы быстро писать ему.</p>}
      {contacts.map((contact) => (
        <article className="contact-row" key={contact.id}>
          <Avatar color={contact.color} image={contact.avatar} />
          <button onClick={() => onOpenChat(contact.id)}>
            <b>{contact.name}</b>
            <small>{contact.id}</small>
          </button>
          <button className="icon-action" onClick={() => onRemove(contact.id)}>×</button>
        </article>
      ))}
    </section>
  );
}
