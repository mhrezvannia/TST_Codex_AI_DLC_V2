// Design-system stylesheet for @erp/ui.
// Delivered as CSS custom-property tokens + scoped `erp-` component classes,
// injected once (SSR-safe, no runtime dependency). Consumed via <DesignSystemStyles/>.
//
// NOTE (deviation from the W2-02 answer "CSS variables + CSS modules"): the apps have
// no next.config and consume @erp/ui as raw source, so CSS Modules would require a
// per-app transpile config that cannot be verified offline. Tokens-as-CSS-variables +
// an injected stylesheet delivers the same guarantees (CSS variables, no runtime dep,
// SSR-safe) with zero build-config change. Revisit CSS Modules with W2-01 (app shell).

export const tokensCss = `
:root {
  --erp-font-sans: "IBM Plex Sans", Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --erp-font-mono: "IBM Plex Mono", "SFMono-Regular", Consolas, monospace;

  --erp-space-1: 4px;
  --erp-space-2: 8px;
  --erp-space-3: 12px;
  --erp-space-4: 16px;
  --erp-space-5: 20px;
  --erp-space-6: 24px;
  --erp-space-8: 32px;

  --erp-font-size-xs: 12px;
  --erp-font-size-sm: 13px;
  --erp-font-size-md: 14px;
  --erp-font-size-lg: 18px;
  --erp-font-size-xl: 24px;
  --erp-font-size-2xl: 32px;

  --erp-radius-sm: 6px;
  --erp-radius-md: 8px;
  --erp-radius-lg: 12px;
  --erp-radius-pill: 999px;

  /* Light theme (default) */
  --erp-color-bg: #f4f7fb;
  --erp-color-surface: #ffffff;
  --erp-color-surface-2: #eef3f9;
  --erp-color-surface-inverse: #0c2742;
  --erp-color-border: #d7e2ef;
  --erp-color-border-strong: #c2d0e0;
  --erp-color-text: #102235;
  --erp-color-text-muted: #5a6b7d;
  --erp-color-text-inverse: #eaf1f8;

  --erp-color-primary: #11427a;
  --erp-color-primary-hover: #0d3663;
  --erp-color-on-primary: #ffffff;
  --erp-color-accent: #2f73c4;

  --erp-color-success: #1f8a5b;
  --erp-color-success-bg: #e7f4ee;
  --erp-color-warning: #b76e00;
  --erp-color-warning-bg: #fbf0dc;
  --erp-color-danger: #b42318;
  --erp-color-danger-bg: #fbe9e7;
  --erp-color-info: #2f73c4;
  --erp-color-info-bg: #e7f0fb;

  --erp-shadow-1: 0 10px 30px rgba(16, 34, 53, 0.05);
  --erp-shadow-2: 0 14px 34px rgba(12, 39, 66, 0.18);
  --erp-focus-ring: 0 0 0 3px rgba(47, 115, 196, 0.45);
}

@media (prefers-color-scheme: dark) {
  :root {
    --erp-color-bg: #0b1622;
    --erp-color-surface: #12202f;
    --erp-color-surface-2: #1a2b3d;
    --erp-color-surface-inverse: #e7eef6;
    --erp-color-border: #26384c;
    --erp-color-border-strong: #33485f;
    --erp-color-text: #e7eef6;
    --erp-color-text-muted: #9db0c4;
    --erp-color-text-inverse: #0b1622;
    --erp-color-primary: #3f7fc4;
    --erp-color-primary-hover: #5a93d0;
    --erp-color-on-primary: #ffffff;
    --erp-color-success-bg: #143026;
    --erp-color-warning-bg: #33280f;
    --erp-color-danger-bg: #331512;
    --erp-color-info-bg: #12263c;
    --erp-shadow-1: 0 10px 30px rgba(0, 0, 0, 0.35);
    --erp-shadow-2: 0 14px 34px rgba(0, 0, 0, 0.45);
  }
}

/* Explicit theme override wins in both directions (viewer theme toggle). */
:root[data-theme="light"] {
  --erp-color-bg: #f4f7fb;
  --erp-color-surface: #ffffff;
  --erp-color-surface-2: #eef3f9;
  --erp-color-border: #d7e2ef;
  --erp-color-text: #102235;
  --erp-color-text-muted: #5a6b7d;
  --erp-color-primary: #11427a;
}
:root[data-theme="dark"] {
  --erp-color-bg: #0b1622;
  --erp-color-surface: #12202f;
  --erp-color-surface-2: #1a2b3d;
  --erp-color-border: #26384c;
  --erp-color-text: #e7eef6;
  --erp-color-text-muted: #9db0c4;
  --erp-color-primary: #3f7fc4;
}
`;

export const baseCss = `
html, body { margin: 0; min-height: 100%; background: var(--erp-color-bg); }
body { font-family: var(--erp-font-sans); color: var(--erp-color-text); }
a { color: inherit; }
button, input, textarea, select { font: inherit; }
code { font-family: var(--erp-font-mono); }
*:focus-visible { outline: none; box-shadow: var(--erp-focus-ring); border-radius: var(--erp-radius-sm); }
`;

export const componentsCss = `
/* Layout helpers */
.erp-stack { display: flex; flex-direction: column; gap: var(--erp-space-4); }
.erp-inline { display: flex; align-items: center; gap: var(--erp-space-2); flex-wrap: wrap; }

/* Card / Panel */
.erp-card {
  background: var(--erp-color-surface);
  border: 1px solid var(--erp-color-border);
  border-radius: var(--erp-radius-md);
  padding: var(--erp-space-5);
  box-shadow: var(--erp-shadow-1);
}
.erp-card--inverse {
  background: var(--erp-color-surface-inverse);
  color: var(--erp-color-text-inverse);
  border-color: var(--erp-color-surface-inverse);
  box-shadow: var(--erp-shadow-2);
}
.erp-card__title { margin: 0 0 var(--erp-space-3); font-size: var(--erp-font-size-lg); font-weight: 700; }

/* Button */
.erp-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: var(--erp-space-2);
  border: 1px solid var(--erp-color-border-strong);
  background: var(--erp-color-surface); color: var(--erp-color-text);
  border-radius: var(--erp-radius-sm); padding: 8px 12px; font-size: var(--erp-font-size-md);
  font-weight: 700; cursor: pointer; transition: background 120ms ease, border-color 120ms ease;
}
.erp-btn:hover:not(:disabled) { background: var(--erp-color-surface-2); }
.erp-btn:disabled { opacity: 0.55; cursor: not-allowed; }
.erp-btn--primary { background: var(--erp-color-primary); border-color: var(--erp-color-primary); color: var(--erp-color-on-primary); }
.erp-btn--primary:hover:not(:disabled) { background: var(--erp-color-primary-hover); }
.erp-btn--danger { background: var(--erp-color-danger); border-color: var(--erp-color-danger); color: #fff; }
.erp-btn--ghost { background: transparent; border-color: transparent; }
.erp-btn--sm { padding: 4px 8px; font-size: var(--erp-font-size-sm); }

/* Field + Input + Select */
.erp-field { display: flex; flex-direction: column; gap: var(--erp-space-1); font-size: var(--erp-font-size-sm); color: var(--erp-color-text-muted); }
.erp-field__label { font-weight: 600; }
.erp-field__hint { font-size: var(--erp-font-size-xs); }
.erp-field__error { font-size: var(--erp-font-size-xs); color: var(--erp-color-danger); font-weight: 600; }
.erp-input, .erp-select {
  min-width: 0; width: 100%; box-sizing: border-box;
  border: 1px solid var(--erp-color-border-strong); border-radius: var(--erp-radius-sm);
  padding: 8px 10px; background: var(--erp-color-surface); color: var(--erp-color-text);
  font-size: var(--erp-font-size-md);
}
.erp-input[aria-invalid="true"], .erp-select[aria-invalid="true"] { border-color: var(--erp-color-danger); }

/* Badge */
.erp-badge {
  display: inline-flex; align-items: center; gap: var(--erp-space-1);
  border-radius: var(--erp-radius-pill); padding: 2px 10px;
  font-size: var(--erp-font-size-xs); font-weight: 700; letter-spacing: 0.02em;
  background: var(--erp-color-surface-2); color: var(--erp-color-text-muted);
}
.erp-badge--success { background: var(--erp-color-success-bg); color: var(--erp-color-success); }
.erp-badge--warning { background: var(--erp-color-warning-bg); color: var(--erp-color-warning); }
.erp-badge--danger { background: var(--erp-color-danger-bg); color: var(--erp-color-danger); }
.erp-badge--info { background: var(--erp-color-info-bg); color: var(--erp-color-info); }
.erp-badge__dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; }

/* Table */
.erp-table { width: 100%; border-collapse: collapse; font-size: var(--erp-font-size-md); }
.erp-table th, .erp-table td { text-align: left; padding: 10px 12px; border-bottom: 1px solid var(--erp-color-border); }
.erp-table th { font-size: var(--erp-font-size-xs); text-transform: uppercase; letter-spacing: 0.06em; color: var(--erp-color-text-muted); font-weight: 700; }
.erp-table tbody tr:hover, .erp-table tbody tr:hover { background: var(--erp-color-surface-2); }
.erp-table__row--active { background: var(--erp-color-info-bg); }

/* Empty state */
.erp-empty { text-align: center; padding: var(--erp-space-8) var(--erp-space-4); color: var(--erp-color-text-muted); }
.erp-empty__title { margin: 0 0 var(--erp-space-2); font-weight: 700; color: var(--erp-color-text); }

/* Skeleton */
.erp-skeleton { background: linear-gradient(90deg, var(--erp-color-surface-2) 25%, var(--erp-color-border) 37%, var(--erp-color-surface-2) 63%); background-size: 400% 100%; border-radius: var(--erp-radius-sm); animation: erp-shimmer 1.4s ease infinite; }
@keyframes erp-shimmer { 0% { background-position: 100% 0; } 100% { background-position: 0 0; } }
@media (prefers-reduced-motion: reduce) { .erp-skeleton { animation: none; } }

/* Status message strip */
.erp-status { border: 1px solid var(--erp-color-border); border-radius: var(--erp-radius-sm); padding: 9px 12px; background: var(--erp-color-surface); color: var(--erp-color-text-muted); font-size: var(--erp-font-size-sm); }
`;

export const designSystemCss = `${tokensCss}\n${baseCss}\n${componentsCss}`;
