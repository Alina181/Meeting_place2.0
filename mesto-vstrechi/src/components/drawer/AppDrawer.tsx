import type { Contact, DrawerPage, NodeInfo, ProfileSettings } from "../../types";
import type { ServerInfo } from "../../hooks/useServerInfo";
import { AddContactPage } from "./AddContactPage";
import { ContactsPage } from "./ContactsPage";
import { DrawerShell } from "./DrawerShell";
import { NetworkPage } from "./NetworkPage";
import { SettingsPage } from "./SettingsPage";

type AppDrawerProps = {
  open: boolean;
  page: DrawerPage;
  settings: ProfileSettings;
  nodes: NodeInfo[];
  contacts: Contact[];
  copied: boolean;
  serverInfo: ServerInfo;
  restartingServer: boolean;
  contactForm: {
    name: string;
    id: string;
    note: string;
    avatar: string;
  };
  onClose: () => void;
  onBack: () => void;
  onOpenAddContact: () => void;
  onOpenChat: (id: string) => void;
  onRemoveContact: (id: string) => void;
  onSaveContact: () => void;
  onCopyId: () => void;
  onRestartServer: () => void;
  onDraftIdChange: (value: string) => void;
  onProfileColorChange: (value: string) => void;
  onAvatarChange: (value: string) => void;
  onBackgroundColorChange: (value: string) => void;
  onBackgroundImageChange: (value: string) => void;
  onAppIconChange: (value: string) => void;
  onSaveProfile: () => void;
  onContactNameChange: (value: string) => void;
  onContactIdChange: (value: string) => void;
  onContactNoteChange: (value: string) => void;
  onContactAvatarChange: (value: string) => void;
};

export function AppDrawer(props: AppDrawerProps) {
  return (
    <DrawerShell open={props.open} page={props.page} onClose={props.onClose} onBack={props.onBack}>
      {props.page === "settings" && (
        <SettingsPage
          settings={props.settings}
          onDraftIdChange={props.onDraftIdChange}
          onProfileColorChange={props.onProfileColorChange}
          onAvatarChange={props.onAvatarChange}
          onBackgroundColorChange={props.onBackgroundColorChange}
          onBackgroundImageChange={props.onBackgroundImageChange}
          onAppIconChange={props.onAppIconChange}
          onSave={props.onSaveProfile}
        />
      )}

      {props.page === "contacts" && (
        <ContactsPage
          contacts={props.contacts}
          onAdd={props.onOpenAddContact}
          onOpenChat={props.onOpenChat}
          onRemove={props.onRemoveContact}
        />
      )}

      {props.page === "addContact" && (
        <AddContactPage
          name={props.contactForm.name}
          id={props.contactForm.id}
          note={props.contactForm.note}
          avatar={props.contactForm.avatar}
          onNameChange={props.onContactNameChange}
          onIdChange={props.onContactIdChange}
          onNoteChange={props.onContactNoteChange}
          onAvatarChange={props.onContactAvatarChange}
          onSave={props.onSaveContact}
        />
      )}

      {props.page === "network" && (
        <NetworkPage
          settings={props.settings}
          nodes={props.nodes}
          copied={props.copied}
          serverInfo={props.serverInfo}
          restarting={props.restartingServer}
          onCopyId={props.onCopyId}
          onRestartServer={props.onRestartServer}
        />
      )}
    </DrawerShell>
  );
}
