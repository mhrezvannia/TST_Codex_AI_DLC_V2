"use client";

// Interactive @erp/ui primitives (stateful / keyboard-driven). Accessibility is built in:
// roles, aria state, keyboard navigation, focus management. Styling via design tokens only.
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode
} from "react";

function cx(...parts: Array<string | false | undefined | null>): string {
  return parts.filter(Boolean).join(" ");
}

/* ---------------- Tabs ---------------- */
export type TabItem = { id: string; label: string; content: ReactNode };

export function Tabs({ tabs, initialId, "aria-label": ariaLabel }: { tabs: TabItem[]; initialId?: string; "aria-label"?: string }) {
  const [activeId, setActiveId] = useState(initialId ?? tabs[0]?.id);
  const baseId = useId();

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = tabs.length - 1;
    let next = index;
    if (event.key === "ArrowRight") next = index === last ? 0 : index + 1;
    else if (event.key === "ArrowLeft") next = index === 0 ? last : index - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    else return;
    event.preventDefault();
    const target = tabs[next];
    setActiveId(target.id);
    document.getElementById(`${baseId}-tab-${target.id}`)?.focus();
  }

  const active = tabs.find((t) => t.id === activeId) ?? tabs[0];
  return (
    <div className="erp-tabs">
      <div className="erp-tabs__list" role="tablist" aria-label={ariaLabel}>
        {tabs.map((tab, index) => {
          const selected = tab.id === active?.id;
          return (
            <button
              key={tab.id}
              id={`${baseId}-tab-${tab.id}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              className={cx("erp-tab", selected && "erp-tab--active")}
              onClick={() => setActiveId(tab.id)}
              onKeyDown={(event) => onKeyDown(event, index)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {active ? (
        <div id={`${baseId}-panel-${active.id}`} role="tabpanel" aria-labelledby={`${baseId}-tab-${active.id}`} className="erp-tabpanel">
          {active.content}
        </div>
      ) : null}
    </div>
  );
}

/* ---------------- Combobox (reference lookups) ---------------- */
export type ComboOption = { value: string; label: string };

export function Combobox({
  options,
  value,
  onChange,
  placeholder,
  emptyLabel = "No matches",
  "aria-label": ariaLabel
}: {
  options: ComboOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyLabel?: string;
  "aria-label"?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const selectedLabel = useMemo(() => options.find((o) => o.value === value)?.label ?? "", [options, value]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)) : options;
  }, [options, query]);

  useEffect(() => {
    function onDocClick(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const commit = useCallback((option: ComboOption) => {
    onChange(option.value);
    setQuery("");
    setOpen(false);
  }, [onChange]);

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      if (open && filtered[activeIndex]) {
        event.preventDefault();
        commit(filtered[activeIndex]);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="erp-combobox" ref={rootRef}>
      <input
        className="erp-input"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-label={ariaLabel}
        placeholder={placeholder}
        value={open ? query : selectedLabel}
        onChange={(event) => { setQuery(event.target.value); setOpen(true); setActiveIndex(0); }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />
      {open ? (
        <ul className="erp-combobox__list" id={listId} role="listbox">
          {filtered.length === 0 ? (
            <li className="erp-combobox__empty">{emptyLabel}</li>
          ) : (
            filtered.map((option, index) => (
              <li
                key={option.value}
                role="option"
                aria-selected={option.value === value}
                className={cx("erp-combobox__option", index === activeIndex && "erp-combobox__option--active")}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) => { event.preventDefault(); commit(option); }}
              >
                {option.label}
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}

/* ---------------- Dialog (modal) ---------------- */
export function Dialog({ open, title, onClose, children, actions }: { open: boolean; title: string; onClose: () => void; children: ReactNode; actions?: ReactNode }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    function onKey(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    dialogRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="erp-dialog__backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="erp-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} ref={dialogRef}>
        <h2 className="erp-dialog__title" id={titleId}>{title}</h2>
        <div className="erp-dialog__body">{children}</div>
        {actions ? <div className="erp-dialog__actions">{actions}</div> : null}
      </div>
    </div>
  );
}

/* ---------------- Toasts ---------------- */
export type ToastTone = "info" | "success" | "warning" | "danger";
export type ToastItem = { id: string; tone?: ToastTone; message: ReactNode };

export function Toasts({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div className="erp-toasts" role="region" aria-label="Notifications" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={cx("erp-toast", toast.tone && toast.tone !== "info" && `erp-toast--${toast.tone}`)} role="status">
          <span style={{ flex: 1 }}>{toast.message}</span>
          <button type="button" className="erp-toast__close" aria-label="Dismiss notification" onClick={() => onDismiss(toast.id)}>×</button>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Theme toggle ---------------- */
const THEME_STORAGE_KEY = "erp-theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const root = document.documentElement;
    const stored = (() => {
      try { return window.localStorage?.getItem(THEME_STORAGE_KEY) as "light" | "dark" | null; } catch { return null; }
    })();
    const initial = stored
      ?? (root.getAttribute("data-theme") as "light" | "dark" | null)
      ?? (window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light");
    setTheme(initial);
    root.setAttribute("data-theme", initial);
  }, []);
  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try { window.localStorage?.setItem(THEME_STORAGE_KEY, next); } catch { /* storage unavailable */ }
  }
  return (
    <button type="button" className="erp-theme-toggle" onClick={toggle} aria-pressed={theme === "dark"} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}>
      {theme === "dark" ? "◐ Dark" : "◑ Light"}
    </button>
  );
}
