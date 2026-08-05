export const WAVE_A_BASE_URL = "http://127.0.0.1:18088";
export const WAVE_A_COMPOSE_PROJECT = "linercore-wave-a";
export const PROTECTED_DEMO = Object.freeze({ composeProject: "linercore-shared-platform", imageTag: "demo-20260721", edgeURL: "http://127.0.0.1:8088" });

export function validateWaveAEnvironment(env = process.env) {
  if (env.W2_02_BASE_URL !== WAVE_A_BASE_URL) throw new Error(`W2-02 baseURL must be exactly ${WAVE_A_BASE_URL}`);
  if (env.W2_02_COMPOSE_PROJECT !== WAVE_A_COMPOSE_PROJECT) throw new Error(`W2-02 Compose project must be exactly ${WAVE_A_COMPOSE_PROJECT}`);
  if (env.W2_02_BASE_URL === PROTECTED_DEMO.edgeURL || env.W2_02_COMPOSE_PROJECT === PROTECTED_DEMO.composeProject) throw new Error("Protected manager demo target is forbidden");
  return { baseURL: WAVE_A_BASE_URL, composeProject: WAVE_A_COMPOSE_PROJECT };
}

export function validateDirectGuardRecord(value, expected) {
  const producer = expected.producer ?? "playwright-global-setup";
  const phase = expected.phase ?? "pre-browser";
  if (value?.schemaVersion !== 3 || value?.producer !== producer || value?.command !== "npm run demo:guard" || value?.phase !== phase) throw new Error(`Guard was not directly produced by ${producer} for ${phase}`);
  if (value.runId !== expected.runId || value.workspaceDigest !== expected.workspaceDigest || value.result !== "PASS" || value.exitCode !== 0 || value.directExit !== true) throw new Error("Pre-guard is foreign or non-green");
  if (value.waveTarget?.baseURL !== WAVE_A_BASE_URL || value.waveTarget?.composeProject !== WAVE_A_COMPOSE_PROJECT) throw new Error("Pre-guard is not bound to isolated Wave A");
  if (value.protectedDemoInputs?.composeProject !== PROTECTED_DEMO.composeProject || value.protectedDemoInputs?.imageTag !== PROTECTED_DEMO.imageTag || value.protectedDemoInputs?.edgeURL !== PROTECTED_DEMO.edgeURL) throw new Error("Guard did not use the exact protected manager-demo inputs");
  const started = Date.parse(value.startedAt); const finished = Date.parse(value.finishedAt);
  if (!Number.isFinite(started) || !Number.isFinite(finished) || finished < started || (expected.requireFresh !== false && Date.now() - finished > 5 * 60_000)) throw new Error("Guard is stale or unordered");
  return value;
}
