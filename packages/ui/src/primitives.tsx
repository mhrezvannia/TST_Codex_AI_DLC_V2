// @erp/ui primitives — the shared component vocabulary every app builds from.
// All styling comes from design tokens (see styles.ts); no inline hex, no local style objects.
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TableHTMLAttributes
} from "react";
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
export function Button({
  variant = "default",
  size,
  className,
  type = "button",
  ...rest
}: { variant?: ButtonVariant; size?: "sm" } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={cx("erp-btn", variant !== "default" && `erp-btn--${variant}`, size === "sm" && "erp-btn--sm", className)}
      {...rest}
    />
  );
}

/* ---- Field + Input + Select ---- */
export function Field({ label, hint, error, htmlFor, children }: { label: string; hint?: string; error?: string; htmlFor?: string; children: ReactNode }) {
  return (
    <label className="erp-field" htmlFor={htmlFor}>
      <span className="erp-field__label">{label}</span>
      {children}
      {hint && !error ? <span className="erp-field__hint">{hint}</span> : null}
      {error ? <span className="erp-field__error">{error}</span> : null}
    </label>
  );
}

export function Input({ invalid, className, ...rest }: { invalid?: boolean } & InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cx("erp-input", className)} aria-invalid={invalid || undefined} {...rest} />;
}

export function Select({ invalid, className, children, ...rest }: { invalid?: boolean } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cx("erp-select", className)} aria-invalid={invalid || undefined} {...rest}>
      {children}
    </select>
  );
}

/* ---- Card / Panel ---- */
export function Card({ title, inverse, className, children }: { title?: ReactNode; inverse?: boolean; className?: string; children: ReactNode }) {
  return (
    <section className={cx("erp-card", inverse && "erp-card--inverse", className)}>
      {title ? <h2 className="erp-card__title">{title}</h2> : null}
      {children}
    </section>
  );
}

/* ---- Badge / StatusBadge ---- */
type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info";
export function Badge({ tone = "neutral", dot, children }: { tone?: BadgeTone; dot?: boolean; children: ReactNode }) {
  return (
    <span className={cx("erp-badge", tone !== "neutral" && `erp-badge--${tone}`)}>
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
  DRAFT: "neutral",
  AMENDED: "warning",
  EXCEPTION: "danger",
  CANCELLED: "danger"
};
export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={STATUS_TONE[status] ?? "neutral"} dot>{status}</Badge>;
}

/* ---- Table ---- */
export function Table({ className, children, ...rest }: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <table className={cx("erp-table", className)} {...rest}>
      {children}
    </table>
  );
}

/* ---- Empty state ---- */
export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="erp-empty">
      <p className="erp-empty__title">{title}</p>
      {children ? <div>{children}</div> : null}
    </div>
  );
}

/* ---- Skeleton (loading placeholder) ---- */
export function Skeleton({ height = 16, width = "100%", radius }: { height?: number | string; width?: number | string; radius?: number }) {
  return (
    <span
      className="erp-skeleton"
      style={{ display: "block", height, width, borderRadius: radius === undefined ? undefined : `var(--erp-radius-${radius >= 12 ? "lg" : "sm"})` }}
      aria-hidden="true"
    />
  );
}

/* ---- Status strip (inline, aria-live) ---- */
export function StatusStrip({ children }: { children: ReactNode }) {
  return (
    <div className="erp-status" aria-live="polite">
      {children}
    </div>
  );
}
