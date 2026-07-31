// @erp/ui primitives — the shared component vocabulary every app builds from.
// All styling comes from design tokens (see styles.ts); no inline hex, no local style objects.
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TableHTMLAttributes
} from "react";
import { forwardRef } from "react";
import { designSystemCss } from "./styles";

function cx(...parts: Array<string | false | undefined | null>): string {
  return parts.filter(Boolean).join(" ");
}

/** Injects the design-system stylesheet once. Render at the app root (the shell does this). */
export function DesignSystemStyles() {
  return <style data-erp-design-system>{designSystemCss}</style>;
}

/* ---- Layout ---- */
export function Stack({ children, gap, className }: { children: ReactNode; gap?: number; className?: string }) {
  return (
    <div className={cx("erp-stack", className)} style={gap === undefined ? undefined : { gap: `var(--erp-space-${gap})` }}>
      {children}
    </div>
  );
}

export function Inline({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("erp-inline", className)}>{children}</div>;
}

/* ---- Button ---- */
type ButtonVariant = "default" | "primary" | "danger" | "ghost";
export const Button = forwardRef<HTMLButtonElement, { variant?: ButtonVariant; size?: "sm" } & ButtonHTMLAttributes<HTMLButtonElement>>(function Button({
  variant = "default",
  size,
  className,
  type = "button",
  ...rest
}, ref) {
  return (
    <button
      type={type}
      ref={ref}
      className={cx("erp-btn", variant !== "default" && `erp-btn--${variant}`, size === "sm" && "erp-btn--sm", className)}
      {...rest}
    />
  );
});

/* ---- Field + Input + Select ---- */
export function Field({
  label,
  hint,
  error,
  htmlFor,
  hintId,
  errorId,
  children
}: {
  label: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  hintId?: string;
  errorId?: string;
  children: ReactNode;
}) {
  return (
    <div className="erp-field">
      <label className="erp-field__label" htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && !error ? <span id={hintId} className="erp-field__hint">{hint}</span> : null}
      {error ? <span id={errorId} className="erp-field__error">{error}</span> : null}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, { invalid?: boolean } & InputHTMLAttributes<HTMLInputElement>>(function Input(
  { invalid, className, ...rest },
  ref
) {
  return <input ref={ref} className={cx("erp-input", className)} aria-invalid={invalid || undefined} {...rest} />;
});

export const Select = forwardRef<HTMLSelectElement, { invalid?: boolean } & SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { invalid, className, children, ...rest },
  ref
) {
  return (
    <select ref={ref} className={cx("erp-select", className)} aria-invalid={invalid || undefined} {...rest}>
      {children}
    </select>
  );
});

/* ---- Card / Panel ---- */
export function Card({ title, inverse, className, children, ...rest }: { title?: ReactNode; inverse?: boolean } & HTMLAttributes<HTMLElement>) {
  return (
    <section className={cx("erp-card", inverse && "erp-card--inverse", className)} {...rest}>
      {title ? <h2 className="erp-card__title">{title}</h2> : null}
      {children}
    </section>
  );
}

/* ---- Badge / StatusBadge ---- */
type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info";
export function Badge({ tone = "neutral", dot, className, children, ...rest }: { tone?: BadgeTone; dot?: boolean } & HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cx("erp-badge", tone !== "neutral" && `erp-badge--${tone}`, className)} {...rest}>
      {dot ? <span className="erp-badge__dot" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}

/** Maps a domain status string to a semantic tone. Extend the map as states are added. */
const STATUS_TONE: Record<string, BadgeTone> = {
  CONFIRMED: "success",
  RECONFIRMED: "success",
  PRICED: "info",
  VALIDATED: "info",
  PRICING_PENDING: "warning",
  MANUAL_PRICING: "warning",
  VALIDATION_BLOCKED: "danger",
  DRAFT: "neutral",
  AMENDED: "warning",
  EXCEPTION: "danger",
  CANCELLED: "danger"
};

function statusLabel(status: string): string {
  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={STATUS_TONE[status] ?? "neutral"} dot data-status={status}>{statusLabel(status)}</Badge>;
}

/* ---- Table ---- */
export function Table({ className, children, ...rest }: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <table className={cx("erp-table", className)} {...rest}>
      {children}
    </table>
  );
}

export function TableContainer({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("erp-table-container", className)} {...rest}>{children}</div>;
}

/* ---- Empty state ---- */
export function EmptyState({ title, children, className, ...rest }: { title: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx("erp-empty", className)} {...rest}>
      <p className="erp-empty__title">{title}</p>
      {children ? <div>{children}</div> : null}
    </div>
  );
}

/* ---- Skeleton (loading placeholder) ---- */
export function Skeleton({ height = 16, width = "100%", radius, className, ...rest }: { height?: number | string; width?: number | string; radius?: number } & HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cx("erp-skeleton", className)}
      style={{ display: "block", height, width, borderRadius: radius === undefined ? undefined : `var(--erp-radius-${radius >= 12 ? "lg" : "sm"})` }}
      aria-hidden="true"
      {...rest}
    />
  );
}

/* ---- Status strip (inline, aria-live) ---- */
export const StatusStrip = forwardRef<HTMLDivElement, {
  tone?: "neutral" | "info" | "success" | "warning" | "danger";
  live?: "off" | "polite" | "assertive";
} & HTMLAttributes<HTMLDivElement>>(function StatusStrip({
  children,
  tone = "neutral",
  live = "polite",
  className,
  ...rest
}, ref) {
  return (
    <div
      ref={ref}
      className={cx("erp-status", tone !== "neutral" && `erp-status--${tone}`, className)}
      aria-live={live}
      {...rest}
    >
      {children}
    </div>
  );
});
