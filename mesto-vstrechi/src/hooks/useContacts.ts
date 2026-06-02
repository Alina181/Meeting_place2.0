import { useEffect, useState } from "react";
import type { Contact } from "../types";
import { loadContacts, saveContacts } from "../lib/storage";
import { colorFromId, uniqueBy } from "../lib/ids";

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>(() => loadContacts());

  useEffect(() => {
    saveContacts(contacts);
  }, [contacts]);

  function addContact(id: string, name: string, note: string, avatar = ""): void {
    const cleanId = id.trim();

    if (!cleanId) {
      return;
    }

    const existing = contacts.find((contact) => contact.id === cleanId);
    const next: Contact = {
      id: cleanId,
      name: name.trim() || cleanId,
      note: note.trim(),
      color: existing?.color ?? colorFromId(cleanId),
      avatar: avatar || existing?.avatar,
      createdAt: Date.now()
    };

    setContacts((previous) => uniqueBy([...previous.filter((contact) => contact.id !== cleanId), next], (contact) => contact.id));
  }

  function removeContact(id: string): void {
    setContacts((previous) => previous.filter((contact) => contact.id !== id));
  }

  return { contacts, addContact, removeContact };
}
