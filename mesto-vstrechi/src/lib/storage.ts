import {
  BACKGROUND_COLOR_KEY,
  BACKGROUND_IMAGE_KEY,
  APP_ICON_KEY,
  CONTACTS_KEY,
  DEVICE_ID_KEY,
  MESSAGES_KEY,
  PROFILE_AVATAR_KEY,
  PROFILE_COLOR_KEY,
  THEME_KEY
} from "../constants";
import type { Contact, Message, Theme } from "../types";
import { createDeviceId } from "./ids";

function readJson<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "") as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getDeviceId(): string {
  const existing = localStorage.getItem(DEVICE_ID_KEY);

  if (existing) {
    return existing;
  }

  const next = createDeviceId();
  localStorage.setItem(DEVICE_ID_KEY, next);
  return next;
}

export function setDeviceId(value: string): void {
  localStorage.setItem(DEVICE_ID_KEY, value.trim() || getDeviceId());
}

export async function getStableDeviceId(): Promise<string> {
  const response = await fetch("/api/stable-id").catch(() => undefined);

  if (!response) {
    return getDeviceId();
  }

  const data = (await response.json()) as { id?: string };
  return data.id || getDeviceId();
}

export async function saveStableDeviceId(id: string): Promise<void> {
  setDeviceId(id);

  await fetch("/api/stable-id", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id })
  }).catch(() => undefined);
}

export function getTheme(): Theme {
  return (localStorage.getItem(THEME_KEY) as Theme | null) ?? "dark";
}

export function setTheme(value: Theme): void {
  localStorage.setItem(THEME_KEY, value);
}

export function getProfileColor(): string {
  return localStorage.getItem(PROFILE_COLOR_KEY) ?? "#6b7cff";
}

export function setProfileColor(value: string): void {
  localStorage.setItem(PROFILE_COLOR_KEY, value);
}

export function getProfileAvatar(): string {
  return localStorage.getItem(PROFILE_AVATAR_KEY) ?? "";
}

export function setProfileAvatar(value: string): void {
  localStorage.setItem(PROFILE_AVATAR_KEY, value);
}

export function getBackgroundColor(): string {
  return localStorage.getItem(BACKGROUND_COLOR_KEY) ?? "#0f172a";
}

export function setBackgroundColor(value: string): void {
  localStorage.setItem(BACKGROUND_COLOR_KEY, value);
}

export function getBackgroundImage(): string {
  return localStorage.getItem(BACKGROUND_IMAGE_KEY) ?? "";
}

export function setBackgroundImage(value: string): void {
  localStorage.setItem(BACKGROUND_IMAGE_KEY, value);
}

export function getAppIcon(): string {
  return localStorage.getItem(APP_ICON_KEY) ?? "";
}

export function setAppIcon(value: string): void {
  localStorage.setItem(APP_ICON_KEY, value);
}


export function loadMessages(): Message[] {
  return readJson<Message[]>(MESSAGES_KEY, []);
}

export function saveMessages(messages: Message[]): void {
  writeJson(MESSAGES_KEY, messages.slice(-800));
}

export function loadContacts(): Contact[] {
  return readJson<Contact[]>(CONTACTS_KEY, []);
}

export function saveContacts(contacts: Contact[]): void {
  writeJson(CONTACTS_KEY, contacts.slice(-300));
}
