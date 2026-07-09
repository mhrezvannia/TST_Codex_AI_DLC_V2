import type { CSSProperties, ReactNode } from "react";

type Stage = {
  label: string;
  module: string;
};

const stages: Stage[] = [
  { label: "Agreement", module: "Charge module" },
  { label: "Booking", module: "Booking module" },
  { label: "Track & trace", module: "Movement module" },
  { label: "D&D & invoice", module: "Charge -> Finance" }
];

const railItems = [
  { key: "pricing", label: "Pricing", icon: "PR" },
  { key: "booking", label: "Booking", icon: "BK" },
  { key: "equipment", label: "Equip.", icon: "EQ" },
  { key: "identity", label: "Auth", icon: "ID" }
];

export function PlatformShell({ title, children }: { title: string; children: ReactNode }) {
  const activeStage = title.toLowerCase().includes("charge") ? 0 : title.toLowerCase().includes("auth") ? -1 : 1;
  const activeRail = title.toLowerCase().includes("charge") ? "pricing" : title.toLowerCase().includes("auth") ? "identity" : "booking";

  return (
    <>
      <style>{baseCss}</style>
      <div style={styles.shell}>
        <aside aria-label="LinerCore modules" style={styles.rail}>
          <div aria-hidden="true" style={styles.logoMark}>LC</div>
          <nav style={styles.railNav}>
            {railItems.map((item) => {
              const active = item.key === activeRail;
              return (
                <a
                  key={item.key}
                  aria-current={active ? "page" : undefined}
                  href={railHref(item.key)}
                  title={item.label}
                  style={active ? styles.railItemActive : styles.railItem}
                >
                  <span style={styles.railIcon}>{item.icon}</span>
                  <span style={styles.railLabel}>{item.label}</span>
                </a>
              );
            })}
          </nav>
          <div style={styles.avatar}>RT</div>
        </aside>

        <section style={styles.application}>
          <header style={styles.topbar}>
            <div style={styles.brandBlock}>
              <span style={styles.brandName}>LinerCore</span>
              <span style={styles.brandDivider} />
              <span style={styles.brandSubcopy}>Commercial & Equipment Platform</span>
              <span style={styles.scopePill}>MVP - ONE TRADE LANE</span>
            </div>
            <div style={styles.searchBar} aria-label="Global search">
              <span aria-hidden="true">Search</span>
              <span>Search bookings, containers...</span>
            </div>
            <span style={styles.currency}>USD</span>
          </header>

          <div style={styles.stageRibbon} aria-label="MVP journey">
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

function railHref(key: string) {
  const hrefs: Record<string, string> = {
    pricing: "http://localhost:3002",
    booking: "#",
    equipment: "#",
    identity: "http://localhost:3000"
  };
  return hrefs[key] ?? "#";
}

const baseCss = `
  html, body {
    margin: 0;
    min-height: 100%;
    background: #f4f7fb;
  }
  body {
    font-family: "IBM Plex Sans", Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    color: #102235;
  }
  a {
    color: inherit;
  }
  button, input, textarea, select {
    font: inherit;
  }
  code {
    font-family: "IBM Plex Mono", "SFMono-Regular", Consolas, monospace;
  }
`;

const styles: Record<string, CSSProperties> = {
  shell: {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "72px minmax(0, 1fr)",
    background: "#f4f7fb"
  },
  rail: {
    position: "sticky",
    top: 0,
    height: "100vh",
    background: "#ffffff",
    borderRight: "1px solid #e3e9f1",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 18,
    padding: "18px 10px"
  },
  logoMark: {
    width: 34,
    height: 34,
    borderRadius: 8,
    background: "linear-gradient(135deg, #082b4c, #185f8f)",
    color: "#ffffff",
    display: "grid",
    placeItems: "center",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0
  },
  railNav: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    width: "100%"
  },
  railItem: {
    width: 52,
    minHeight: 54,
    borderRadius: 8,
    display: "grid",
    placeItems: "center",
    gap: 3,
    color: "#7a8795",
    textDecoration: "none",
    fontSize: 10,
    fontWeight: 600
  },
  railItemActive: {
    width: 52,
    minHeight: 54,
    borderRadius: 8,
    display: "grid",
    placeItems: "center",
    gap: 3,
    background: "#0c2742",
    color: "#ffffff",
    textDecoration: "none",
    fontSize: 10,
    fontWeight: 600,
    boxShadow: "0 8px 18px rgba(12, 39, 66, 0.2)"
  },
  railIcon: {
    fontFamily: "\"IBM Plex Mono\", Consolas, monospace",
    fontSize: 11
  },
  railLabel: {
    lineHeight: 1
  },
  avatar: {
    marginTop: "auto",
    width: 34,
    height: 34,
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    background: "#0e8079",
    color: "#ffffff",
    fontSize: 11,
    fontWeight: 700
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
    background: "#ffffff",
    borderBottom: "1px solid #e6ebf2"
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
    color: "#102235"
  },
  brandDivider: {
    width: 1,
    height: 18,
    background: "#d9e0e8"
  },
  brandSubcopy: {
    color: "#71808f",
    fontSize: 13
  },
  scopePill: {
    borderRadius: 6,
    background: "#edf3fb",
    color: "#255f99",
    padding: "4px 9px",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.05em"
  },
  searchBar: {
    minWidth: 0,
    height: 34,
    border: "1px solid #e1e7ee",
    borderRadius: 8,
    color: "#94a1af",
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "0 12px",
    fontSize: 13,
    background: "#ffffff"
  },
  currency: {
    color: "#586777",
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
    background: "#ffffff",
    borderBottom: "1px solid #e6ebf2",
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
    background: "#eef2f6",
    color: "#9aa7b4",
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
    background: "#11427a",
    color: "#ffffff",
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
    background: "#e4f4ec",
    color: "#1f8a5b",
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
    color: "#102235"
  },
  stageModule: {
    fontSize: 11,
    color: "#8896a5"
  },
  content: {
    minWidth: 0,
    flex: 1,
    overflowX: "hidden"
  }
};
