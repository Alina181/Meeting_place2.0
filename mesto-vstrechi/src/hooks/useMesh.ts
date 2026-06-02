import { useEffect, useMemo, useRef, useState } from "react";
import { MAX_TTL } from "../constants";
import type { ChatPayload, Contact, Envelope, Message, NodeInfo } from "../types";
import { decryptText, deriveSharedKey, encryptText, getPublicKey } from "../lib/crypto";
import { loadMessages, saveMessages } from "../lib/storage";
import { colorFromId, uniqueBy } from "../lib/ids";

export function useMesh(device: NodeInfo, contacts: Contact[], manualId: string) {
  const [nodes, setNodes] = useState<NodeInfo[]>([]);
  const [messages, setMessages] = useState<Message[]>(() => loadMessages());
  const seenRef = useRef(new Set<string>());
  const keyCache = useRef(new Map<string, CryptoKey>());

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  async function announce(): Promise<void> {
    const publicKey = await getPublicKey();

    await fetch("/api/hello", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...device, publicKey })
    }).catch(() => undefined);
  }

  async function refreshNodes(): Promise<void> {
    const response = await fetch("/api/nodes").catch(() => undefined);

    if (!response) {
      return;
    }

    const list = (await response.json()) as NodeInfo[];
    setNodes(list.filter((node) => node.id !== device.id));
  }

  async function getPeerKey(peerId: string): Promise<CryptoKey | undefined> {
    const cached = keyCache.current.get(peerId);

    if (cached) {
      return cached;
    }

    const peer = nodes.find((node) => node.id === peerId);

    if (!peer?.publicKey) {
      return undefined;
    }

    const key = await deriveSharedKey(peer.publicKey, peerId);
    keyCache.current.set(peerId, key);
    return key;
  }

  async function processEnvelope(envelope: Envelope): Promise<void> {
    if (seenRef.current.has(envelope.id)) {
      return;
    }

    seenRef.current.add(envelope.id);

    if (envelope.type !== "chat") {
      return;
    }

    const payload = envelope.payload as ChatPayload;
    const chatId = envelope.from === device.id ? envelope.to ?? envelope.from : envelope.from;
    let visibleText = payload.text ?? "";

    if (payload.encrypted && envelope.from !== device.id) {
      const key = payload.publicKey ? await deriveSharedKey(payload.publicKey, envelope.from) : await getPeerKey(envelope.from);

      if (key) {
        visibleText = await decryptText(payload.encrypted, key).catch(() => "[Не удалось расшифровать]");
      }
    }

    if (envelope.to === device.id || !envelope.to) {
      setMessages((previous) =>
        uniqueBy(
          [
            ...previous,
            {
              id: envelope.id,
              chatId,
              from: envelope.from,
              to: envelope.to ?? device.id,
              text: visibleText,
              image: payload.image,
              createdAt: envelope.createdAt,
              incoming: envelope.from !== device.id,
              status: "delivered"
            }
          ],
          (message) => message.id
        )
      );
    }

    if (envelope.ttl > 0 && envelope.to !== device.id) {
      await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...envelope, ttl: envelope.ttl - 1, route: [...new Set([...envelope.route, device.id])] })
      }).catch(() => undefined);
    }
  }

  async function poll(): Promise<void> {
    const response = await fetch(`/api/poll/${encodeURIComponent(device.id)}`).catch(() => undefined);

    if (!response) {
      return;
    }

    const envelopes = (await response.json()) as Envelope[];

    for (const envelope of envelopes) {
      await processEnvelope(envelope);
    }
  }

  useEffect(() => {
    announce();
    refreshNodes();
    poll();

    const interval = window.setInterval(() => {
      announce();
      refreshNodes();
      poll();
    }, 900);

    return () => window.clearInterval(interval);
  }, [device.id, device.avatar, device.background, device.color]);

  const chats = useMemo(() => {
    const ids = new Set<string>();

    for (const contact of contacts) ids.add(contact.id);
    for (const node of nodes) ids.add(node.id);
    for (const message of messages) ids.add(message.chatId);
    if (manualId.trim()) ids.add(manualId.trim());

    return [...ids]
      .map((id) => {
        const node = nodes.find((item) => item.id === id);
        const contact = contacts.find((item) => item.id === id);
        const last = messages.filter((message) => message.chatId === id).at(-1);

        return {
          id,
          label: contact?.name ?? node?.label ?? id,
          color: contact?.color ?? node?.color ?? colorFromId(id),
          avatar: contact?.avatar ?? node?.avatar,
          note: contact?.note,
          lastText: last?.image ? "📷 Фото" : last?.text ?? contact?.note ?? "Нажмите, чтобы открыть чат",
          lastTime: last?.createdAt ?? contact?.createdAt ?? 0
        };
      })
      .sort((a, b) => b.lastTime - a.lastTime);
  }, [contacts, manualId, messages, nodes]);

  async function sendMessage(to: string, text: string, image = ""): Promise<void> {
    const body = text.trim();

    if (!to || (!body && !image)) {
      return;
    }

    const id = crypto.randomUUID();
    const createdAt = Date.now();
    const publicKey = await getPublicKey();
    const peerKey = await getPeerKey(to);
    const payload: ChatPayload = peerKey ? { encrypted: await encryptText(body, peerKey), image, publicKey } : { text: body, image, publicKey };

    const localMessage: Message = {
      id,
      chatId: to,
      from: device.id,
      to,
      text: body,
      image,
      createdAt,
      incoming: false,
      status: "sent"
    };

    setMessages((previous) => uniqueBy([...previous, localMessage], (message) => message.id));

    const envelope: Envelope = {
      id,
      type: "chat",
      from: device.id,
      to,
      createdAt,
      ttl: MAX_TTL,
      route: [device.id],
      payload
    };

    await fetch("/api/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(envelope)
    }).catch(() => undefined);
  }

  return { nodes, messages, chats, sendMessage };
}
