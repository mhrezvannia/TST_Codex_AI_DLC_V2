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
import { LucideIcon, type LucideIconName } from "./icons";
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

export function ProductWordmark({
  href,
  context,
  showMark = true,
  className,
  dataTestId
}: {
  href?: string;
  context?: string;
  showMark?: boolean;
  className?: string;
  dataTestId?: string;
}) {
  const content = (
    <>
      {showMark ? <span className="erp-product-wordmark__mark" aria-hidden="true">LC</span> : null}
      <span className="erp-product-wordmark__copy">
        <span>LinerCore</span>
        {context ? <span className="erp-product-wordmark__context">{context}</span> : null}
      </span>
    </>
  );
  return href
    ? <a className={cx("erp-product-wordmark", className)} data-testid={dataTestId} href={href} aria-label="LinerCore home">{content}</a>
    : <span className={cx("erp-product-wordmark", className)}>{content}</span>;
}

export function EnvironmentBadge({ children }: { children: ReactNode }) {
  return <span className="erp-environment-badge">{children}</span>;
}

export type SideNavigationItem = {
  href: string;
  label: string;
  icon: LucideIconName;
  active?: boolean;
  testId?: string;
};

export function SideNavigation({
  items,
  label = "Application modules",
  className
}: {
  items: SideNavigationItem[];
  label?: string;
  className?: string;
}) {
  return (
    <nav className={cx("erp-side-navigation", className)} aria-label={label}>
      {items.map((item) => (
        <a
          aria-current={item.active ? "page" : undefined}
          data-testid={item.testId}
          href={item.href}
          key={item.href}
        >
          <LucideIcon name={item.icon} size={18} />
          <span>{item.label}</span>
        </a>
      ))}
    </nav>
  );
}

/* ---- Button ---- */
type ButtonVariant = "default" | "primary" | "danger" | "ghost";
export const Button = forwardRef<HTMLButtonElement, {
  variant?: ButtonVariant;
  size?: "sm";
  busy?: boolean;
  busyLabel?: ReactNode;
  icon?: LucideIconName;
} & ButtonHTMLAttributes<HTMLButtonElement>>(function Button({
  variant = "default",
  size,
  busy = false,
  busyLabel,
  icon,
  className,
  type = "button",
  disabled,
  children,
  ...rest
}, ref) {
  return (
    <button
      type={type}
      ref={ref}
      className={cx("erp-btn", variant !== "default" && `erp-btn--${variant}`, size === "sm" && "erp-btn--sm", className)}
      {...rest}
      aria-busy={busy || undefined}
      disabled={busy || disabled}
    >
      {busy ? <LucideIcon className="erp-btn__spinner" name="refresh-cw" size={16} /> : icon ? <LucideIcon name={icon} size={16} /> : null}
      <span>{busy ? busyLabel ?? children : children}</span>
    </button>
  );
});

/* ---- Field + Input + Select ---- */
export function Field({
  label,
  hint,
  error,
  hintId,
  errorId,
  htmlFor,
  required,
  children
}: {
  label: string;
  hint?: string;
  error?: string;
  hintId?: string;
  errorId?: string;
  htmlFor?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="erp-field">
      <label className="erp-field__label" htmlFor={htmlFor}>
        {label}{required ? <span aria-hidden="true"> *</span> : null}
        {required ? <span className="erp-sr-only"> (required)</span> : null}
      </label>
      {children}
      {hint && !error ? <span className="erp-field__hint" id={hintId}>{hint}</span> : null}
      {error ? <span className="erp-field__error" id={errorId}>{error}</span> : null}
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
  PRICING_PENDING: "info",
  DRAFT: "neutral",
  AMENDED: "warning",
  VALIDATION_BLOCKED: "warning",
  MANUAL_PRICING: "warning",
  EXCEPTION: "danger",
  CANCELLED: "danger"
};
const STATUS_LABEL: Record<string, string> = {
  CONFIRMED: "Confirmed",
  RECONFIRMED: "Reconfirmed",
  PRICED: "Priced",
  VALIDATED: "Validated",
  PRICING_PENDING: "Pricing pending",
  DRAFT: "Draft",
  AMENDED: "Amended",
  VALIDATION_BLOCKED: "Validation blocked",
  MANUAL_PRICING: "Manual pricing",
  EXCEPTION: "Exception",
  CANCELLED: "Cancelled"
};
export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={STATUS_TONE[status] ?? "neutral"} dot>{STATUS_LABEL[status] ?? sentenceCase(status)}</Badge>;
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
export function EmptyState({
  title,
  children,
  headingLevel = 2,
  className,
  ...rest
}: {
  title: string;
  children?: ReactNode;
  headingLevel?: 1 | 2 | 3;
} & HTMLAttributes<HTMLDivElement>) {
  const heading = headingLevel === 1
    ? <h1 className="erp-empty__title">{title}</h1>
    : headingLevel === 3
      ? <h3 className="erp-empty__title">{title}</h3>
      : <h2 className="erp-empty__title">{title}</h2>;
  return (
    <div className={cx("erp-empty", className)} {...rest}>
      {heading}
      {children ? <div>{children}</div> : null}
    </div>
  );
}

export function TableContainer({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("erp-table-container", className)} {...rest}>{children}</div>;
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
export type StatusTone = "neutral" | "info" | "success" | "warning" | "danger";
export const StatusStrip = forwardRef<HTMLDivElement, {
  title?: string;
  tone?: StatusTone;
  icon?: LucideIconName;
  actions?: ReactNode;
  announce?: "off" | "polite" | "assertive";
  live?: "off" | "polite" | "assertive";
} & HTMLAttributes<HTMLDivElement>>(function StatusStrip({
  title,
  tone = "neutral",
  icon,
  actions,
  announce = "polite",
  live,
  className,
  children,
  ...rest
}, ref) {
  return (
    <div
      ref={ref}
      className={cx("erp-status", tone !== "neutral" && `erp-status--${tone}`, className)}
      aria-live={live ?? announce}
      {...rest}
    >
      {icon ? <LucideIcon className="erp-status__icon" name={icon} size={18} /> : null}
      <div className="erp-status__content">
        {title ? <h2 className="erp-status__title">{title}</h2> : null}
        <div className="erp-status__body">{children}</div>
      </div>
      {actions ? <div className="erp-status__actions">{actions}</div> : null}
    </div>
  );
});

export type BreadcrumbItem = { label: string; href?: string };
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="erp-breadcrumbs" aria-label="Breadcrumb">
      <ol>
        {items.map((item, index) => {
          const current = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`}>
              {item.href && !current ? <a href={item.href}>{item.label}</a> : <span aria-current={current ? "page" : undefined}>{item.label}</span>}
              {!current ? <LucideIcon name="chevron-right" size={14} /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="erp-page-header">
      <div>
        {eyebrow ? <p className="erp-page-header__eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {description ? <div className="erp-page-header__description">{description}</div> : null}
      </div>
      {actions ? <div className="erp-page-header__actions">{actions}</div> : null}
    </header>
  );
}

export function RecordHeader({
  back,
  title,
  subtitle,
  status,
  meta,
  blocker,
  actions
}: {
  back?: ReactNode;
  title: string;
  subtitle?: ReactNode;
  status?: ReactNode;
  meta?: ReactNode;
  blocker?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="erp-record-header">
      {back ? <div className="erp-record-header__back">{back}</div> : null}
      <div className="erp-record-header__main">
        <div className="erp-record-header__identity">
          <h1>{title}</h1>
          {subtitle ? <div className="erp-record-header__subtitle">{subtitle}</div> : null}
          {status || meta ? <div className="erp-record-header__meta">{status}{meta}</div> : null}
        </div>
        {blocker || actions ? (
          <div className="erp-record-header__command">
            {blocker ? <div className="erp-record-header__blocker">{blocker}</div> : null}
            {actions ? <div className="erp-record-header__actions">{actions}</div> : null}
          </div>
        ) : null}
      </div>
    </header>
  );
}

export type RouteTab = { label: string; href: string; active?: boolean };
export function RouteTabs({ label, tabs }: { label: string; tabs: RouteTab[] }) {
  return (
    <nav className="erp-route-tabs" aria-label={label}>
      {tabs.map((tab) => (
        <a key={tab.href} href={tab.href} aria-current={tab.active ? "page" : undefined}>
          {tab.label}
        </a>
      ))}
    </nav>
  );
}

export type DefinitionItem = { term: ReactNode; description: ReactNode };
export function DefinitionList({ items, columns = 2 }: { items: DefinitionItem[]; columns?: 1 | 2 | 3 | 4 }) {
  return (
    <dl className={`erp-definition-list erp-definition-list--${columns}`}>
      {items.map((item, index) => (
        <div key={index}>
          <dt>{item.term}</dt>
          <dd>{item.description}</dd>
        </div>
      ))}
    </dl>
  );
}

export function FilterToolbar({ children }: { children: ReactNode }) {
  return <div className="erp-filter-toolbar">{children}</div>;
}

export function FilterChip({ label, removeHref }: { label: string; removeHref: string }) {
  return (
    <span className="erp-filter-chip">
      {label}
      <a href={removeHref} aria-label={`Remove ${label} filter`} title={`Remove ${label} filter`}>
        <LucideIcon name="x" size={14} />
      </a>
    </span>
  );
}

export function Pagination({
  previousHref,
  nextHref,
  label
}: {
  previousHref?: string;
  nextHref?: string;
  label: string;
}) {
  return (
    <nav className="erp-pagination" aria-label="Pagination">
      {previousHref ? <a href={previousHref}><LucideIcon name="chevron-left" size={16} />Previous</a> : <span aria-disabled="true"><LucideIcon name="chevron-left" size={16} />Previous</span>}
      <span>{label}</span>
      {nextHref ? <a href={nextHref}>Next<LucideIcon name="chevron-right" size={16} /></a> : <span aria-disabled="true">Next<LucideIcon name="chevron-right" size={16} /></span>}
    </nav>
  );
}

export function FailureState({
  icon,
  title,
  children,
  actions,
  technicalDetails
}: {
  icon: LucideIconName;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  technicalDetails?: ReactNode;
}) {
  return (
    <section className="erp-failure-state" aria-labelledby="failure-state-title">
      <LucideIcon className="erp-failure-state__icon" name={icon} size={22} />
      <div>
        <h1 id="failure-state-title" tabIndex={-1}>{title}</h1>
        <div className="erp-failure-state__body">{children}</div>
        {actions ? <div className="erp-failure-state__actions">{actions}</div> : null}
        {technicalDetails}
      </div>
    </section>
  );
}

export function PartialDataNotice({ children, actions }: { children: ReactNode; actions?: ReactNode }) {
  return <StatusStrip title="Some booking details are unavailable" tone="warning" icon="triangle-alert" actions={actions}>{children}</StatusStrip>;
}

export function ConflictStrip({ title = "This record changed", children, actions }: { title?: string; children: ReactNode; actions?: ReactNode }) {
  return <StatusStrip title={title} tone="warning" icon="history" actions={actions} id="record-conflict" tabIndex={-1}>{children}</StatusStrip>;
}

export function TechnicalDetails({ items }: { items: DefinitionItem[] }) {
  return (
    <details className="erp-technical-details">
      <summary>Technical details</summary>
      <DefinitionList items={items} columns={1} />
    </details>
  );
}

export function IdentifierValue({ children }: { children: ReactNode }) {
  return <code className="erp-identifier">{children}</code>;
}

function sentenceCase(value: string) {
  const normalized = value.replaceAll("_", " ").toLowerCase();
  return normalized ? normalized[0].toUpperCase() + normalized.slice(1) : value;
}
