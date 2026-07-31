import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import path from "node:path";
import { pathToFileURL } from "node:url";
import registry from "./acceptance-registry.json" with { type: "json" };
import { createPlaywrightPageDriver, runBrowserEvidence } from "../../tools/u06/browser-adapter.mjs";

test("signed edge drives the exact closed 76-cell browser scenarios", async ({ page }) => {
  test.skip(!process.env.U06_BROWSER_SCENARIO_MODULE || !process.env.U06_SIGNED_SESSION_SUBJECT,
    "acceptance entry point records missing signed scenario capability as BLOCKED");
  let AxeBuilder;
  try { AxeBuilder = (await import("@axe-core/playwright")).default; }
  catch { throw Object.assign(new Error("@axe-core/playwright capability unavailable"), { status: "BLOCKED" }); }
  const scenarioPath = path.resolve(process.cwd(), process.env.U06_BROWSER_SCENARIO_MODULE);
  const scenarios = await import(pathToFileURL(scenarioPath).href);
  const cookies = await page.context().cookies();
  const signedSession = cookies.length ? { signed: true, subject: process.env.U06_SIGNED_SESSION_SUBJECT,
    sessionId: createHash("sha256").update(JSON.stringify(cookies.map(({ name, domain }) => ({ name, domain })))).digest("hex") } : null;
  const base = createPlaywrightPageDriver({ page, signedSession, routeFixtures: scenarios.routeFixtures,
    scenarioController: { prepare: scenarios.prepareScenario, assert: scenarios.assertScenario },
    axeScan: async () => {
      const axe = await new AxeBuilder({ page }).analyze();
      return { ...axe, serious: axe.violations.filter((item) => item.impact === "serious").length,
        critical: axe.violations.filter((item) => item.impact === "critical").length };
    } });
  const driver = { ...base, async executeCell(cell) {
      const structural = /-(375|768|1024|1440)-(LIGHT|DARK)$/.exec(cell.key);
      await page.setViewportSize({ width: structural ? Number(structural[1]) : 1024, height: 900 });
      await page.emulateMedia({ colorScheme: structural?.[2].toLowerCase() ?? "light", reducedMotion: "reduce" });
      const observed = await base.executeCell(cell);
      const traceText = JSON.stringify({ cell: cell.key, assertions: observed.assertions, correlationId: observed.correlationId });
      observed.traceEntries = observed.traceEntries?.length ? observed.traceEntries
        : [{ name: `${cell.key}.json`, text: traceText, compressedContent: gzipSync(traceText) }];
      return observed;
    } };
  const publishArtifacts = async ({ cell, observed, trace }) => {
    const values = { screenshot: observed.screenshot, "assertion-json": observed.assertionJson, "axe-report": observed.axeReport,
      "sanitized-trace": Buffer.from(JSON.stringify(trace.entries)) };
    const kinds = registry.members.find((member) => member.key === cell.key).artifactKinds;
    const refs = kinds.map((kind) => { const bytes = values[kind];
      if (!bytes) throw new Error(`browser evidence payload ${kind} unavailable`);
      return { kind, sha256: createHash("sha256").update(bytes).digest("hex"), bytes: bytes.length }; });
    return { refs, records: [] };
  };
  const result = await runBrowserEvidence({ registry, driver, publishArtifacts });
  expect(result.results).toHaveLength(76); expect(result.status).toBe("PASS");
});
