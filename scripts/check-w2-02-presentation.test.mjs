import assert from "node:assert/strict";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { scanPresentation } from "./check-w2-02-presentation.mjs";

test("positive scan is read-only and accepts tokenized fixtures", async () => {
  const root = join(tmpdir(), `w2-02-positive-${process.pid}`);
  await mkdir(root, { recursive: true });
  try {
    await writeFile(join(root, "page.css"), ".page { color: var(--erp-color-text); }");
    assert.deepEqual(await scanPresentation([root]), []);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("negative probes reject hardcoded colors and local style systems", async () => {
  const root = join(tmpdir(), `w2-02-negative-${process.pid}`);
  await mkdir(root, { recursive: true });
  try {
    await writeFile(join(root, "page.tsx"), 'import type { CSSProperties } from "react";\nconst styles: CSSProperties = { color: "#fff" };');
    const violations = await scanPresentation([root]);
    assert.deepEqual(new Set(violations.map(({ rule }) => rule)), new Set(["hardcoded-color", "local-style-system"]));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("scans arbitrary app directories and rejects new violations outside shell and booking", async () => {
  const root = join(tmpdir(), `w2-02-other-app-${process.pid}`);
  await mkdir(join(root, "other", "app"), { recursive: true });
  try {
    await writeFile(join(root, "other", "app", "page.tsx"), 'export const style = { color: "#abcdef" };');
    const violations = await scanPresentation([root]);
    assert.equal(violations.some(({ file, rule }) => file.includes("other/app/page.tsx") && rule === "hardcoded-color"), true);
  } finally { await rm(root, { recursive: true, force: true }); }
});
