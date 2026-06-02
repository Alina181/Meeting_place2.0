import type { ChangeEvent } from "react";
import { readImageFile } from "../../lib/file";
import { Avatar } from "../Avatar";

type AddContactPageProps = {
  name: string;
  id: string;
  note: string;
  avatar: string;
  onNameChange: (value: string) => void;
  onIdChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onAvatarChange: (value: string) => void;
  onSave: () => void;
};

export function AddContactPage({ name, id, note, avatar, onNameChange, onIdChange, onNoteChange, onAvatarChange, onSave }: AddContactPageProps) {
  async function loadAvatar(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];

    if (file) {
      onAvatarChange(await readImageFile(file));
    }
  }

  return (
    <section className="settings-list">
      <div className="contact-photo-card">
        <Avatar color="var(--accent)" image={avatar} size="hero" />
        <label className="photo-pick">
          📷 Добавить фото
          <input type="file" accept="image/*" onChange={loadAvatar} />
        </label>
      </div>
      <label className="field-row">
        <span>👤</span>
        <div>
          <b>Имя контакта</b>
          <input value={name} onChange={(event) => onNameChange(event.target.value)} placeholder="Например: Алина" />
        </div>
      </label>
      <label className="field-row">
        <span>@</span>
        <div>
          <b>ID устройства</b>
          <input value={id} onChange={(event) => onIdChange(event.target.value)} placeholder="device_..." />
        </div>
      </label>
      <label className="field-row">
        <span>✎</span>
        <div>
          <b>Заметка</b>
          <input value={note} onChange={(event) => onNoteChange(event.target.value)} placeholder="Например: группа / телефон" />
        </div>
      </label>
      <button className="wide-action" onClick={onSave}>Сохранить и открыть чат</button>
    </section>
  );
}
