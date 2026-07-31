// @vitest-environment node

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("manual pricing responsive and redaction source contract", () => {
  it("keeps bounded horizontal table handling and one-column narrow layout", () => {
    const css = readFileSync(resolve(
      "apps/charge-agreements/app/rates/rates.css"
    ), "utf8");
    expect(css).toMatch(/\.rates-table-region\s*\{[^}]*overflow-x:\s*auto/s);
    expect(css).toMatch(/\.rates-table-region table\s*\{[^}]*min-width:\s*760px/s);
    expect(css).toMatch(/@media \(max-width:\s*1024px\)[\s\S]*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
    expect(css).toMatch(/@media \(max-width:\s*640px\)[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
    expect(css).toMatch(/@media \(prefers-reduced-motion:\s*reduce\)/);
  });

  it("contains no amount, quote, assignment, approval, resolution, closure, or repricing controls", () => {
    const source = readFileSync(resolve(
      "apps/charge-agreements/app/manual-pricing/ManualPricingEvidence.tsx"
    ), "utf8");
    for (const prohibited of [
      /unitRate/, /totalAmount/, /quote input/i, /assignment control/i,
      /approve case/i, /resolve case/i, /close case/i, /reprice command/i
    ]) {
      expect(source).not.toMatch(prohibited);
    }
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain('aria-label="Manual pricing evidence"');
    expect(source).toContain('tabIndex={0}');
  });
});
