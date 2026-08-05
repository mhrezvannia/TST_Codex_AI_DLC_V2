import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const DEFAULT_ROOTS = ["apps"];
const SOURCE = /\.(?:css|ts|tsx)$/;
const TEST_FILE = /\.test\.[cm]?[jt]sx?$/;
const baseline = JSON.parse(await readFile(new URL("./w2-02-presentation-baseline.json", import.meta.url), "utf8"));

async function sourceFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await sourceFiles(path));
    else if (SOURCE.test(entry.name) && !TEST_FILE.test(entry.name) && !entry.name.endsWith("next-env.d.ts")) files.push(path);
  }
  return files;
}

const sha256 = (source) => createHash("sha256").update(source).digest("hex");

export async function scanPresentation(roots = DEFAULT_ROOTS, reviewedBaseline = roots === DEFAULT_ROOTS ? baseline : {}) {
  const violations = [];
  for (const root of roots) {
    for (const file of await sourceFiles(resolve(root))) {
      const source = await readFile(file, "utf8");
      const relative = file.slice(resolve(".").length + 1).replaceAll("\\", "/");
      const fileViolations = [];
      for (const match of source.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) fileViolations.push({ file: relative, rule: "hardcoded-color", detail: match[0] });
      if (/\bCSSProperties\b/.test(source)) fileViolations.push({ file: relative, rule: "local-style-system", detail: "CSSProperties" });
      if (/from\s+["'][^"']*(?:apps\/|apps\\)/.test(source)) fileViolations.push({ file: relative, rule: "app-to-app-import", detail: "application source import" });
      const exception = reviewedBaseline[relative];
      const rules = new Set(fileViolations.map(({ rule }) => rule));
      const reviewed = exception
        && exception.sha256 === sha256(source)
        && [...rules].every((rule) => exception.rules.includes(rule));
      if (!reviewed) violations.push(...fileViolations);
    }
  }
  return violations;
}

async function main() {
  const violations = await scanPresentation();
  if (violations.length) {
    for (const violation of violations) console.error(`${violation.rule}: ${violation.file} (${violation.detail})`);
    process.exitCode = 1;
    return;
  }
  console.log("W2-02 presentation anti-drift: PASS (all apps/**; reviewed baseline exceptions fingerprinted)");
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) await main();
