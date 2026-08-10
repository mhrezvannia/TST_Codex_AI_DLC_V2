import { describe, expect, it } from "vitest";
import { tokensCss } from "./styles";

// WCAG relative-luminance contrast. AA requires >= 4.5:1 for normal text.
function rgb(hexValue: string): [number, number, number] {
  const h = hexValue.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}
function channel(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}
function luminance([r, g, b]: [number, number, number]): number {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}
function contrast(fg: string, bg: string): number {
  const l1 = luminance(rgb(fg));
  const l2 = luminance(rgb(bg));
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

// Parse a `:root...{ --erp-color-x: #hex; }` block from the tokens stylesheet, so the
// test reads the REAL token values and cannot drift from styles.ts.
function tokensFor(selector: string): Record<string, string> {
  const start = tokensCss.indexOf(selector);
  const open = tokensCss.indexOf("{", start);
  const close = tokensCss.indexOf("}", open);
  const body = tokensCss.slice(open + 1, close);
  const out: Record<string, string> = {};
  for (const m of body.matchAll(/(--erp-color-[a-z0-9-]+):\s*(#[0-9a-fA-F]{6})/g)) {
    out[m[1]] = m[2];
  }
  return out;
}

const PAIRS: Array<[string, string]> = [
  ["--erp-color-text", "--erp-color-bg"],
  ["--erp-color-text", "--erp-color-surface"],
  ["--erp-color-text-muted", "--erp-color-surface"],
  ["--erp-color-on-primary", "--erp-color-primary"],
  ["--erp-color-success", "--erp-color-success-bg"],
  ["--erp-color-warning", "--erp-color-warning-bg"],
  ["--erp-color-danger", "--erp-color-danger-bg"],
  ["--erp-color-info", "--erp-color-info-bg"],
  ["--erp-color-text-inverse", "--erp-color-surface-inverse"]
];

describe.each([
  ["light", ':root[data-theme="light"]'],
  ["dark", ':root[data-theme="dark"]']
])("WCAG AA contrast — %s theme", (_name, selector) => {
  const tokens = tokensFor(selector);
  it.each(PAIRS)("%s on %s >= 4.5:1", (fg, bg) => {
    expect(tokens[fg], `${fg} missing`).toBeDefined();
    expect(tokens[bg], `${bg} missing`).toBeDefined();
    expect(contrast(tokens[fg], tokens[bg])).toBeGreaterThanOrEqual(4.5);
  });
});
