const DEFAULT_ICON = "icons/icon-192.svg";

function upsertLink(rel: string, href: string, type?: string): void {
  let link = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);

  if (!link) {
    link = document.createElement("link");
    link.rel = rel;
    document.head.appendChild(link);
  }

  link.href = href;

  if (type) {
    link.type = type;
  }
}

export function applyAppIcon(icon: string): void {
  const iconSrc = icon || DEFAULT_ICON;

  // Браузеры берут иконку установленного PWA из manifest.webmanifest.
  // Пользовательская картинка здесь применяется как иконка вкладки и предпросмотр
  // в настройках. Static manifest оставлен для корректной PWA-установки.
  upsertLink("icon", iconSrc);
  upsertLink("apple-touch-icon", iconSrc);
}
