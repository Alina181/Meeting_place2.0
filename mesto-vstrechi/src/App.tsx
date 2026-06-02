import { useMemo, useState } from "react";
import type { DrawerPage, NodeInfo } from "./types";
import { AppDrawer } from "./components/drawer/AppDrawer";
import { Conversation } from "./components/Conversation";
import { Sidebar } from "./components/Sidebar";
import { useContacts } from "./hooks/useContacts";
import { useMesh } from "./hooks/useMesh";
import { useProfile } from "./hooks/useProfile";
import { useServerInfo } from "./hooks/useServerInfo";

export function App() {
  const profile = useProfile();
  const server = useServerInfo();
  const { settings } = profile;
  const contactsApi = useContacts();
  const [manualId, setManualId] = useState("");
  const [activeChat, setActiveChat] = useState("");
  const [text, setText] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerPage, setDrawerPage] = useState<DrawerPage>("network");
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactId, setContactId] = useState("");
  const [contactNote, setContactNote] = useState("");
  const [contactAvatar, setContactAvatar] = useState("");

  const me: NodeInfo = useMemo(
    () => ({
      id: settings.deviceId,
      label: settings.deviceId,
      color: settings.profileColor,
      avatar: settings.avatar,
      background: settings.backgroundImage,
      lastSeen: Date.now()
    }),
    [settings.avatar, settings.backgroundImage, settings.deviceId, settings.profileColor]
  );

  const mesh = useMesh(me, contactsApi.contacts, manualId);
  const activeMessages = mesh.messages.filter((message) => message.chatId === activeChat);
  const activeNode = mesh.chats.find((chat) => chat.id === activeChat);

  function openDrawer(page: DrawerPage): void {
    setDrawerPage(page);
    setDrawerOpen(true);
    setMenuOpen(false);
    setMoreOpen(false);
  }

  function startAddContact(id = ""): void {
    setContactId(id || manualId.trim());
    setContactName("");
    setContactNote("");
    setContactAvatar("");
    openDrawer("addContact");
  }

  function saveContact(): void {
    const id = contactId.trim();

    if (!id) {
      return;
    }

    contactsApi.addContact(id, contactName, contactNote, contactAvatar);
    setManualId(id);
    setActiveChat(id);
    setContactId("");
    setContactName("");
    setContactNote("");
    setContactAvatar("");
    setDrawerOpen(false);
  }

  function openContactChat(id: string): void {
    setActiveChat(id);
    setDrawerOpen(false);
  }

  async function copyDeviceId(): Promise<void> {
    try {
      await navigator.clipboard.writeText(settings.deviceId);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = settings.deviceId;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  async function sendCurrentMessage(image = ""): Promise<void> {
    const to = activeChat || manualId.trim();

    if (!to || (!text.trim() && !image)) {
      return;
    }

    await mesh.sendMessage(to, text, image);
    setText("");
    setActiveChat(to);
  }

  return (
    <main
      className="app-shell"
      style={{ backgroundImage: settings.theme === "dark" && settings.backgroundImage ? `url(${settings.backgroundImage})` : undefined }}
    >
      <Sidebar
        activeChat={activeChat}
        deviceId={settings.deviceId}
        avatar={settings.avatar}
        profileColor={settings.profileColor}
        theme={settings.theme}
        manualId={manualId}
        chats={mesh.chats}
        menuOpen={menuOpen}
        moreOpen={moreOpen}
        onManualIdChange={setManualId}
        onOpenChat={setActiveChat}
        onStartAddContact={startAddContact}
        onOpenDrawer={openDrawer}
        onToggleMenu={() => setMenuOpen((value) => !value)}
        onToggleMore={() => setMoreOpen((value) => !value)}
        onToggleTheme={() => profile.setThemeState(settings.theme === "dark" ? "light" : "dark")}
      />

      <Conversation
        activeChat={activeChat}
        activeNode={activeNode}
        nodes={mesh.nodes}
        messages={activeMessages}
        text={text}
        onTextChange={setText}
        onBack={() => setActiveChat("")}
        onSend={sendCurrentMessage}
      />

      <AppDrawer
        open={drawerOpen}
        page={drawerPage}
        settings={settings}
        nodes={mesh.nodes}
        contacts={contactsApi.contacts}
        copied={copied}
        serverInfo={server.serverInfo}
        restartingServer={server.restarting}
        contactForm={{ name: contactName, id: contactId, note: contactNote, avatar: contactAvatar }}
        onClose={() => setDrawerOpen(false)}
        onBack={() => setDrawerPage("network")}
        onOpenAddContact={() => startAddContact()}
        onOpenChat={openContactChat}
        onRemoveContact={contactsApi.removeContact}
        onSaveContact={saveContact}
        onCopyId={copyDeviceId}
        onRestartServer={server.restartServer}
        onDraftIdChange={profile.setDraftId}
        onProfileColorChange={profile.setProfileColorState}
        onAvatarChange={profile.setAvatarState}
        onBackgroundColorChange={profile.setBackgroundColorState}
        onBackgroundImageChange={profile.setBackgroundImageState}
        onAppIconChange={profile.setAppIconState}
        onSaveProfile={profile.saveProfile}
        onContactNameChange={setContactName}
        onContactIdChange={setContactId}
        onContactNoteChange={setContactNote}
        onContactAvatarChange={setContactAvatar}
      />
    </main>
  );
}
