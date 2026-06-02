import { useRef, useState, type ReactNode } from "react";
import type { DrawerPage } from "../../types";

type DrawerShellProps = {
  open: boolean;
  page: DrawerPage;
  children: ReactNode;
  onClose: () => void;
  onBack: () => void;
};

const titles: Record<DrawerPage, string> = {
  network: "Настройки сети",
  contacts: "Контакты",
  addContact: "Добавить контакт",
  settings: "Настройки",
  more: "Подробнее"
};

const subtitles: Record<DrawerPage, string> = {
  network: "Подключение, QR и mesh",
  contacts: "Сохранённые собеседники",
  addContact: "Новый собеседник",
  settings: "Профиль и оформление",
  more: "О приложении"
};

export function DrawerShell({ open, page, children, onClose, onBack }: DrawerShellProps) {
  const [offset, setOffset] = useState(0);
  const startX = useRef<number | null>(null);

  function closeFromBackdrop(event: React.MouseEvent<HTMLElement>): void {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  function startSwipe(event: React.PointerEvent<HTMLDivElement>): void {
    const target = event.target as HTMLElement;

    if (target.closest("button, input, textarea, select, label, canvas, a")) {
      return;
    }

    startX.current = event.clientX;
    setOffset(0);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveSwipe(event: React.PointerEvent<HTMLDivElement>): void {
    if (startX.current === null) {
      return;
    }

    setOffset(Math.min(0, event.clientX - startX.current));
  }

  function endSwipe(): void {
    if (offset < -120) {
      onClose();
    }

    startX.current = null;
    setOffset(0);
  }

  return (
    <aside className={`settings-drawer ${open ? "open" : ""}`} onClick={closeFromBackdrop}>
      <div
        className="drawer-card"
        style={{ transform: open ? `translateX(${offset}px)` : undefined }}
        onPointerDown={startSwipe}
        onPointerMove={moveSwipe}
        onPointerUp={endSwipe}
        onPointerCancel={endSwipe}
      >
        <span className="drawer-grabber" aria-hidden="true" />
        <header className={`drawer-head ${page === "network" ? "no-back" : ""}`}>
          {page !== "network" && <button className="round back-drawer" onClick={onBack} aria-label="Назад">‹</button>}
          <div>
            <b>{titles[page]}</b>
            <p>{subtitles[page]}</p>
          </div>
          <button className="round" onClick={onClose} aria-label="Закрыть" title="Закрыть">×</button>
        </header>
        {children}
      </div>
    </aside>
  );
}
