export type Theme = "light" | "dark";

export type DrawerPage = "network" | "contacts" | "addContact" | "settings" | "more";

export type NodeInfo = {
  id: string;
  label: string;
  color: string;
  avatar?: string;
  background?: string;
  lastSeen: number;
  publicKey?: JsonWebKey;
};

export type Envelope = {
  id: string;
  type: "hello" | "chat" | "ack";
  from: string;
  to?: string;
  createdAt: number;
  ttl: number;
  route: string[];
  payload: unknown;
};

export type ChatPayload = {
  text?: string;
  image?: string;
  encrypted?: string;
  publicKey?: JsonWebKey;
};

export type Message = {
  id: string;
  chatId: string;
  from: string;
  to: string;
  text: string;
  image?: string;
  createdAt: number;
  incoming: boolean;
  status: "sending" | "sent" | "delivered";
};

export type Contact = {
  id: string;
  name: string;
  note?: string;
  color: string;
  avatar?: string;
  createdAt: number;
};

export type ProfileSettings = {
  deviceId: string;
  draftId: string;
  theme: Theme;
  profileColor: string;
  avatar: string;
  backgroundColor: string;
  backgroundImage: string;
  appIcon: string;
};
