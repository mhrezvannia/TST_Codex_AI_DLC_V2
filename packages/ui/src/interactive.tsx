"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode
} from "react";
import { LucideIcon } from "./icons";

function cx(...parts: Array<string | false | undefined | null>): string {
  return parts.filter(Boolean).join(" ");
}

export type TabItem = { id: string; label: string; content: ReactNode };

export function Tabs({
  tabs,
  initialId,
  "aria-label": ariaLabel
}: {
  tabs: TabItem[];
  initialId?: string;
  "aria-label"?: string;
}) {
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

  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0];
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
        <div
          id={`${baseId}-panel-${active.id}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${active.id}`}
          className="erp-tabpanel"
        >
          {active.content}
        </div>
      ) : null}
    </div>
  );
}

export type ComboOption = { value: string; label: string };

export function Combobox({
  options,
  value,
  onChange,
  onBlur,
  id,
  name,
  placeholder,
  emptyLabel = "No matches",
  disabled,
  invalid,
  describedBy,
  required,
  "data-testid": dataTestId,
  "aria-label": ariaLabel
}: {
  options: ComboOption[];
  value: string;
  onChange: (value: string) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  id?: string;
  name?: string;
  placeholder?: string;
  emptyLabel?: string;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
  required?: boolean;
  "data-testid"?: string;
  "aria-label"?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const selectedLabel = useMemo(
    () => options.find((option) => option.value === value)?.label ?? "",
    [options, value]
  );
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return normalized
      ? options.filter((option) =>
          option.label.toLowerCase().includes(normalized)
          || option.value.toLowerCase().includes(normalized))
      : options;
  }, [options, query]);

  useEffect(() => {
    function onDocumentClick(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocumentClick);
    return () => document.removeEventListener("mousedown", onDocumentClick);
  }, []);

  const commit = useCallback((option: ComboOption) => {
    onChange(option.value);
    setQuery("");
    setOpen(false);
  }, [onChange]);

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (disabled) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) setOpen(true);
      setActiveIndex((index) => Math.min(index + 1, filtered.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      if (open && filtered[activeIndex]) {
        event.preventDefault();
        commit(filtered[activeIndex]);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  }

  return (
    <div className="erp-combobox" ref={rootRef}>
      <input
        id={id}
        name={name}
        className="erp-input"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        aria-activedescendant={open && filtered[activeIndex] ? `${listId}-${activeIndex}` : undefined}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        data-testid={dataTestId}
        value={open ? query : selectedLabel}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
          setActiveIndex(0);
        }}
        onFocus={() => setOpen(true)}
        onBlur={(event) => {
          window.setTimeout(() => setOpen(false), 0);
          onBlur?.(event);
        }}
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
                id={`${listId}-${index}`}
                role="option"
                aria-selected={option.value === value}
                className={cx(
                  "erp-combobox__option",
                  index === activeIndex && "erp-combobox__option--active"
                )}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) => {
                  event.preventDefault();
                  commit(option);
                }}
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

export function Dialog({
  open,
  title,
  onClose,
  children,
  actions
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  actions?: ReactNode;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex='-1'])"
      ));
      if (focusable.length === 0) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = originalOverflow;
      previous?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="erp-dialog__backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="erp-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        ref={dialogRef}
      >
        <h2 className="erp-dialog__title" id={titleId}>{title}</h2>
        <div className="erp-dialog__body">{children}</div>
        {actions ? <div className="erp-dialog__actions">{actions}</div> : null}
      </div>
    </div>
  );
}

export type ToastTone = "info" | "success" | "warning" | "danger";
export type ToastItem = { id: string; tone?: ToastTone; message: ReactNode };

export function Toasts({
  toasts,
  onDismiss
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;
  return (
    <div className="erp-toasts" role="region" aria-label="Notifications" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cx(
            "erp-toast",
            toast.tone && toast.tone !== "info" && `erp-toast--${toast.tone}`
          )}
          role="status"
        >
          <span style={{ flex: 1 }}>{toast.message}</span>
          <button
            type="button"
            className="erp-toast__close"
            aria-label="Dismiss notification"
            onClick={() => onDismiss(toast.id)}
          >
            <LucideIcon name="x" size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

const THEME_STORAGE_KEY = "erp-theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const root = document.documentElement;
    const stored = (() => {
      try {
        return window.localStorage?.getItem(THEME_STORAGE_KEY) as "light" | "dark" | null;
      } catch {
        return null;
      }
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
    try {
      window.localStorage?.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Theme persistence is optional.
    }
  }

  return (
    <button
      type="button"
      className="erp-theme-toggle"
      onClick={toggle}
      aria-pressed={theme === "dark"}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
    >
      {theme === "dark" ? "Dark" : "Light"}
    </button>
  );
}

export function CopyButton({
  value,
  label = "value"
}: {
  value: string;
  label?: string;
}) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
    } catch {
      setState("failed");
    }
    window.setTimeout(() => setState("idle"), 2000);
  }

  const accessibleLabel = state === "copied"
    ? `${label} copied`
    : state === "failed"
      ? `Copy ${label} failed`
      : `Copy ${label}`;

  return (
    <span className="erp-copy-control">
      <button
        type="button"
        className="erp-icon-button"
        aria-label={accessibleLabel}
        title={`Copy ${label}`}
        onClick={copy}
      >
        <LucideIcon name={state === "copied" ? "check" : "copy"} size={16} />
      </button>
      <span className="erp-sr-only" aria-live="polite">
        {state === "copied" ? `${label} copied` : state === "failed" ? `Copy ${label} failed` : ""}
      </span>
    </span>
  );
}
