type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export type InstallResult = "installed" | "opened" | "manual" | "already-installed";

let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;
const installReadyEvent = "mesto-install-ready";
const installDoneEvent = "mesto-install-done";

function appBase(): string {
  return import.meta.env.BASE_URL || "./";
}

function isStandalone(): boolean {
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone === true;
}

export function canInstallApp(): boolean {
  return Boolean(deferredInstallPrompt) && !isStandalone();
}

export function isAppInstalled(): boolean {
  return isStandalone();
}

export function registerServiceWorker(): void {
  if ("serviceWorker" in navigator && window.isSecureContext) {
    window.setTimeout(() => {
      const base = appBase();
      navigator.serviceWorker.register(`${base}sw.js`, { scope: base }).catch(() => undefined);
    }, 600);
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event as BeforeInstallPromptEvent;
    window.dispatchEvent(new CustomEvent(installReadyEvent));
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    window.dispatchEvent(new CustomEvent(installDoneEvent));
  });
}

export async function installApp(): Promise<InstallResult> {
  if (isStandalone()) {
    return "already-installed";
  }

  if (deferredInstallPrompt) {
    const promptEvent = deferredInstallPrompt;
    deferredInstallPrompt = null;
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice.catch(() => ({ outcome: "dismissed" as const, platform: "" }));
    return choice.outcome === "accepted" ? "installed" : "opened";
  }

  return "manual";
}

export function getInstallInstruction(): string {
  const ua = navigator.userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(ua)) {
    return "Нажмите «Поделиться» → «На экран Домой», чтобы установить приложение.";
  }

  if (/android/.test(ua)) {
    return "Откройте меню браузера ⋮ и нажмите «Установить приложение» или «Добавить на главный экран».";
  }

  return "В адресной строке или меню браузера выберите «Установить приложение».";
}

export async function showInstallNotification(message: string): Promise<void> {
  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    return;
  }

  let permission = Notification.permission;

  if (permission === "default") {
    permission = await Notification.requestPermission();
  }

  if (permission !== "granted") {
    return;
  }

  const registration = await navigator.serviceWorker.ready.catch(() => null);

  if (registration) {
    registration.showNotification("Место Встречи", {
      body: message,
      icon: `${appBase()}icons/icon-192.svg`,
      badge: `${appBase()}icons/icon-192.svg`,
      tag: "mesto-install"
    });
  }
}

export function onInstallAvailabilityChange(callback: () => void): () => void {
  window.addEventListener(installReadyEvent, callback);
  window.addEventListener(installDoneEvent, callback);

  return () => {
    window.removeEventListener(installReadyEvent, callback);
    window.removeEventListener(installDoneEvent, callback);
  };
}
