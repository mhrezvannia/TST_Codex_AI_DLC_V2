import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const localRequire = createRequire(import.meta.url);
const { WAVE_A_BASE_URL, WAVE_A_COMPOSE_PROJECT, validateDirectGuardRecord, validateWaveAEnvironment } = localRequire("./w2-02-acceptance-guard.mjs");
const { createBrowserPermit } = localRequire("./w2-02-browser-permit.mjs");

// Keep Playwright's transformed global-setup graph on the long-lived guard exports.
// validateDirectGuardRecord cross-checks these exact inputs against the authoritative module.
const PROTECTED_DEMO = Object.freeze({ composeProject: "linercore-shared-platform", imageTag: "demo-20260721", edgeURL: "http://127.0.0.1:8088" });

const executable = (name) => process.platform === "win32" ? `${name}.cmd` : name;
const hash = (value) => createHash("sha256").update(value).digest("hex");

export async function runPlaywrightGlobalSetup(env = process.env, exec = spawnSync) {
  validateWaveAEnvironment(env);
  for (const key of ["W2_02_RUN_ID", "W2_02_RUN_ROOT", "W2_02_WORKSPACE_IDENTITY_FILE"]) if (!env[key]) throw new Error(`Playwright global setup requires ${key}`);
  const identity = JSON.parse(await readFile(env.W2_02_WORKSPACE_IDENTITY_FILE, "utf8"));
  const guardEnv = { ...env, DEMO_COMPOSE_PROJECT: PROTECTED_DEMO.composeProject, DEMO_IMAGE_TAG: PROTECTED_DEMO.imageTag, DEMO_EDGE_URL: PROTECTED_DEMO.edgeURL };
  const startedAt = new Date().toISOString();
  const npmCommand = executable("npm");
  const isWindowsShim = process.platform === "win32" && /\.(?:cmd|bat)$/i.test(npmCommand);
  const invokedCommand = isWindowsShim ? (env.ComSpec || process.env.ComSpec || "cmd.exe") : npmCommand;
  const invokedArgs = isWindowsShim ? ["/d", "/s", "/c", npmCommand, "run", "demo:guard"] : ["run", "demo:guard"];
  const result = exec(invokedCommand, invokedArgs, { cwd: process.cwd(), env: guardEnv, encoding: "utf8", windowsHide: true, maxBuffer: 20 * 1024 * 1024 });
  const finishedAt = new Date().toISOString();
  const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
  const record = {
    schemaVersion: 3, producer: "playwright-global-setup", command: "npm run demo:guard", phase: "pre-browser", runId: env.W2_02_RUN_ID,
    workspaceDigest: identity.workspaceDigest, waveTarget: { baseURL: WAVE_A_BASE_URL, composeProject: WAVE_A_COMPOSE_PROJECT },
    protectedDemoInputs: { composeProject: PROTECTED_DEMO.composeProject, imageTag: PROTECTED_DEMO.imageTag, edgeURL: PROTECTED_DEMO.edgeURL },
    startedAt, finishedAt, directExit: true, exitCode: result.status ?? 1, result: result.status === 0 && !result.error ? "PASS" : "FAIL", outputHash: hash(output)
  };
  const path = join(env.W2_02_RUN_ROOT, "gates", "demo-guard-pre-browser.json");
  await mkdir(dirname(path), { recursive: true }); await writeFile(path, JSON.stringify(record, null, 2) + "\n", "utf8");
  validateDirectGuardRecord(record, { runId: env.W2_02_RUN_ID, workspaceDigest: identity.workspaceDigest, producer: "playwright-global-setup", phase: "pre-browser" });
  const permit = createBrowserPermit({ guard: record, runId: env.W2_02_RUN_ID, workspaceDigest: identity.workspaceDigest });
  const permitPath = join(env.W2_02_RUN_ROOT, "gates", "browser-authorized.json");
  await writeFile(permitPath, JSON.stringify(permit, null, 2) + "\n", "utf8");
  return { record, permit };
}

export default async function globalSetup() { await runPlaywrightGlobalSetup(); }
