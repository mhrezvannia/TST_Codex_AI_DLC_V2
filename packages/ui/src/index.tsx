import type { CSSProperties, ReactNode } from "react";
import { DesignSystemStyles } from "./primitives";
import { ThemeToggle } from "./interactive";

export * from "./primitives";
export * from "./interactive";
export { designSystemCss, tokensCss } from "./styles";

type Stage = {
  label: string;
  module: string;
};

export type WorkflowQueueItem = {
  label: string;
  owner: string;
  status: string;
  severity?: "normal" | "attention" | "blocked";
};

export type EvidenceItem = {
  label: string;
  value: string;
};

const stages: Stage[] = [
  { label: "Agreement", module: "Charge module" },
  { label: "Booking", module: "Booking module" },
  { label: "Track & trace", module: "Movement module" },
  { label: "D&D & invoice", module: "Charge -> Finance" }
];

const moduleItems = [
  { key: "overview", label: "Overview", href: "/" },
  { key: "booking", label: "Booking", href: "/booking" },
  { key: "reference", label: "Reference data", href: "/reference-data/" },
  { key: "charge", label: "Charge agreements", href: "/charge-agreements" }
];

export function PlatformShell({
  title,
  children,
  showRail = true
}: {
  title: string;
  children: ReactNode;
  showRail?: boolean;
}) {
  const activeStage = title.toLowerCase().includes("charge") ? 0 : title.toLowerCase().includes("auth") ? -1 : 1;
  const activeModule = title.toLowerCase().includes("charge")
    ? "charge"
    : title.toLowerCase().includes("reference")
      ? "reference"
      : title.toLowerCase().includes("booking")
        ? "booking"
        : "overview";

  return (
    <>
      <DesignSystemStyles />
      <style>{platformShellResponsiveCss}</style>
      <div className="erp-platform-shell" style={{ ...styles.shell, gridTemplateColumns: showRail ? "236px minmax(0, 1fr)" : "minmax(0, 1fr)" }}>
        {showRail ? <aside style={styles.rail}>
          <a href="/" style={styles.sidebarBrand}>LinerCore</a>
          <nav aria-label="LinerCore modules" className="erp-module-nav" style={styles.railNav}>
            {moduleItems.map((item) => {
              const active = item.key === activeModule;
              return (
                <a
                  key={item.key}
                  aria-current={active ? "page" : undefined}
                  href={item.href}
                  style={active ? styles.railItemActive : styles.railItem}
                >
                  <span style={styles.railLabel}>{item.label}</span>
                </a>
              );
            })}
          </nav>
        </aside> : null}

        <section className="erp-platform-application" style={styles.application}>
          <header className="erp-platform-topbar" style={styles.topbar}>
            <div className="erp-platform-brand" style={styles.brandBlock}>
              <span style={styles.brandName}>LinerCore</span>
              <span style={styles.brandDivider} />
              <span style={styles.brandSubcopy}>Commercial & Equipment Platform</span>
              <span style={styles.scopePill}>MVP - ONE TRADE LANE</span>
            </div>
            <div className="erp-platform-search" style={styles.searchBar} aria-label="Global search">
              <span aria-hidden="true">Search</span>
              <span>Search bookings, containers...</span>
            </div>
            <div className="erp-platform-tools" style={{ display: "flex", alignItems: "center", gap: 12, justifySelf: "end" }}>
              <span style={styles.currency}>USD</span>
              <ThemeToggle />
            </div>
          </header>

          <div className="erp-platform-stages" style={styles.stageRibbon} aria-label="MVP journey">
            {stages.map((stage, index) => {
              const active = index === activeStage;
              const complete = activeStage > index;
              return (
                <div key={stage.label} style={styles.stageItem}>
                  <span style={active ? styles.stageNumberActive : complete ? styles.stageNumberComplete : styles.stageNumber}>
                    {index + 1}
                  </span>
                  <span style={styles.stageText}>
                    <strong style={styles.stageLabel}>{stage.label}</strong>
                    <small style={styles.stageModule}>{stage.module}</small>
                  </span>
                </div>
              );
            })}
          </div>

          <div style={styles.content}>{children}</div>
        </section>
      </div>
    </>
  );
}

export function WorkflowCommandCenter({
  queue,
  evidence,
  exceptions
}: {
  queue: WorkflowQueueItem[];
  evidence: EvidenceItem[];
  exceptions: WorkflowQueueItem[];
}) {
  return (
    <section aria-label="Workflow command center" style={styles.commandCenter}>
      <div style={styles.commandPanel}>
        <div style={styles.commandHeader}>
          <strong>Work queue</strong>
          <span>{queue.length} active</span>
        </div>
        <div style={styles.queueList}>
          {queue.map((item) => (
            <div key={`${item.label}-${item.owner}`} style={styles.queueRow}>
              <span style={severityStyle(item.severity)} />
              <span style={styles.queueText}>
                <strong>{item.label}</strong>
                <small>{item.owner}</small>
              </span>
              <span style={styles.queueStatus}>{item.status}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={styles.commandPanel}>
        <div style={styles.commandHeader}>
          <strong>Evidence</strong>
          <span>Live/API backed</span>
        </div>
        <dl style={styles.evidenceList}>
          {evidence.map((item) => (
            <div key={item.label} style={styles.evidenceRow}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div style={styles.commandPanel}>
        <div style={styles.commandHeader}>
          <strong>Exceptions</strong>
          <span>{exceptions.length} open</span>
        </div>
        <div style={styles.queueList}>
          {exceptions.map((item) => (
            <div key={`${item.label}-${item.owner}`} style={styles.queueRow}>
              <span style={severityStyle(item.severity ?? "attention")} />
              <span style={styles.queueText}>
                <strong>{item.label}</strong>
                <small>{item.owner}</small>
              </span>
              <span style={styles.queueStatus}>{item.status}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function severityStyle(severity: WorkflowQueueItem["severity"] = "normal"): CSSProperties {
  const color = severity === "blocked" ? "var(--erp-color-danger)" : severity === "attention" ? "var(--erp-color-warning)" : "var(--erp-color-success)";
  return {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: color,
    flex: "0 0 auto"
  };
}

// Shell + command-center layout. Colors reference design tokens so the chrome is
// theme-aware (light/dark); layout dimensions stay literal. Brand marks (logo gradient,
// avatar) intentionally keep fixed brand colors that read on both themes.
const styles: Record<string, CSSProperties> = {
  shell: {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "72px minmax(0, 1fr)",
    background: "var(--erp-color-bg)"
  },
  rail: {
    position: "sticky",
    top: 0,
    height: "100vh",
    background: "var(--erp-color-surface)",
    borderRight: "1px solid var(--erp-color-border)",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: 24,
    padding: 18
  },
  sidebarBrand: {
    minHeight: 38,
    display: "flex",
    alignItems: "center",
    color: "var(--erp-color-text)",
    textDecoration: "none",
    fontSize: 16,
    fontWeight: 700,
    padding: "0 10px"
  },
  railNav: {
    display: "grid",
    alignContent: "start",
    gap: 6,
    width: "100%"
  },
  railItem: {
    width: "100%",
    minHeight: 38,
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    padding: "8px 10px",
    boxSizing: "border-box",
    color: "var(--erp-color-text-muted)",
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 700
  },
  railItemActive: {
    width: "100%",
    minHeight: 38,
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    padding: "8px 10px",
    boxSizing: "border-box",
    background: "var(--erp-color-primary)",
    color: "var(--erp-color-on-primary)",
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 700,
    boxShadow: "0 8px 18px rgba(12, 39, 66, 0.2)"
  },
  railLabel: {
    lineHeight: 1
  },
  application: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column"
  },
  topbar: {
    minHeight: 56,
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(240px, 340px) auto",
    alignItems: "center",
    gap: 18,
    padding: "0 26px",
    background: "var(--erp-color-surface)",
    borderBottom: "1px solid var(--erp-color-border)"
  },
  brandBlock: {
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    gap: 14,
    whiteSpace: "nowrap"
  },
  brandName: {
    fontWeight: 700,
    color: "var(--erp-color-text)"
  },
  brandDivider: {
    width: 1,
    height: 18,
    background: "var(--erp-color-border)"
  },
  brandSubcopy: {
    color: "var(--erp-color-text-muted)",
    fontSize: 13
  },
  scopePill: {
    borderRadius: 6,
    background: "var(--erp-color-info-bg)",
    color: "var(--erp-color-info)",
    padding: "4px 9px",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.05em"
  },
  searchBar: {
    minWidth: 0,
    height: 34,
    border: "1px solid var(--erp-color-border)",
    borderRadius: 8,
    color: "var(--erp-color-text-muted)",
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "0 12px",
    fontSize: 13,
    background: "var(--erp-color-surface)"
  },
  currency: {
    color: "var(--erp-color-text-muted)",
    fontSize: 12,
    fontWeight: 700
  },
  stageRibbon: {
    minHeight: 62,
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(120px, 1fr))",
    gap: 10,
    alignItems: "center",
    padding: "0 26px",
    background: "var(--erp-color-surface)",
    borderBottom: "1px solid var(--erp-color-border)",
    overflowX: "auto"
  },
  stageItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    minWidth: 0
  },
  stageNumber: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    flex: "0 0 auto",
    background: "var(--erp-color-surface-2)",
    color: "var(--erp-color-text-muted)",
    fontSize: 12,
    fontWeight: 700
  },
  stageNumberActive: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    flex: "0 0 auto",
    background: "var(--erp-color-primary)",
    color: "var(--erp-color-on-primary)",
    fontSize: 12,
    fontWeight: 700
  },
  stageNumberComplete: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    flex: "0 0 auto",
    background: "var(--erp-color-success-bg)",
    color: "var(--erp-color-success)",
    fontSize: 12,
    fontWeight: 700
  },
  stageText: {
    display: "grid",
    minWidth: 0,
    lineHeight: 1.2
  },
  stageLabel: {
    fontSize: 13,
    color: "var(--erp-color-text)"
  },
  stageModule: {
    fontSize: 11,
    color: "var(--erp-color-text-muted)"
  },
  content: {
    minWidth: 0,
    flex: 1,
    overflowX: "hidden"
  },
  commandCenter: {
    display: "grid",
    gridTemplateColumns: "1.2fr 0.9fr 1fr",
    gap: 14,
    marginBottom: 16
  },
  commandPanel: {
    minWidth: 0,
    background: "var(--erp-color-surface)",
    border: "1px solid var(--erp-color-border)",
    borderRadius: 8,
    padding: 16,
    boxShadow: "var(--erp-shadow-1)"
  },
  commandHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    color: "var(--erp-color-text)",
    fontSize: 13,
    marginBottom: 12
  },
  queueList: {
    display: "grid",
    gap: 10
  },
  queueRow: {
    display: "grid",
    gridTemplateColumns: "8px minmax(0, 1fr) auto",
    alignItems: "center",
    gap: 10,
    minHeight: 38,
    color: "var(--erp-color-text-muted)"
  },
  queueText: {
    display: "grid",
    gap: 2,
    minWidth: 0,
    color: "var(--erp-color-text)"
  },
  queueStatus: {
    color: "var(--erp-color-text-muted)",
    fontSize: 12,
    fontWeight: 700
  },
  evidenceList: {
    display: "grid",
    gap: 10,
    margin: 0
  },
  evidenceRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    color: "var(--erp-color-text-muted)",
    fontSize: 13
  }
};

const platformShellResponsiveCss = `
  @media (max-width: 820px) {
    .erp-platform-shell {
      grid-template-columns: minmax(0, 1fr) !important;
    }

    .erp-platform-shell > aside {
      position: static !important;
      height: auto !important;
      border-right: 0 !important;
      border-bottom: 1px solid var(--erp-color-border);
    }

    .erp-module-nav {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .erp-platform-topbar {
      min-height: auto !important;
      grid-template-columns: minmax(0, 1fr) auto !important;
      gap: 10px !important;
      padding: 12px 18px !important;
    }

    .erp-platform-brand {
      grid-column: 1 / -1;
      flex-wrap: wrap;
      white-space: normal !important;
    }

    .erp-platform-search {
      min-width: 0;
    }

    .erp-platform-tools {
      min-width: max-content;
    }

    .erp-platform-stages {
      grid-template-columns: repeat(4, minmax(140px, 1fr)) !important;
      padding: 10px 18px !important;
    }
  }
`;
