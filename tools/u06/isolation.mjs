import { createHash } from "node:crypto";
import { runBoundedCommand } from "./command.mjs";

export const MANAGER_PROJECT = "linercore-shared-platform";
export const MANAGER_EDGE = "http://127.0.0.1:8088";
export const WAVE_A_PROJECT = "linercore-wave-a";
export const WAVE_A_EDGE = "http://127.0.0.1:18088";
const MUTATING = new Set(["up", "exec", "restart", "stop", "down", "logs", "ps", "config"]);

export function runPreGuard({ execute, env = process.env } = {}) {
  if (env.DEMO_COMPOSE_PROJECT !== undefined || env.DEMO_EDGE_URL !== undefined) return blockedGate("manager-pre-guard", "default manager settings were overridden");
  return runBoundedCommand({ id: "manager-pre-guard", phase: "isolation", command: "npm", args: ["run", "demo:guard"],
    requirements: ["BR-U06-002", "BR-U06-003"], timeoutMs: 120_000, env }, { execute });
}

export function runReadOnlyManagerInventory({ execute } = {}) {
  const result = runBoundedCommand({ id: "manager-read-only-inventory", phase: "isolation", command: "docker",
    args: ["ps", "--filter", `label=com.docker.compose.project=${MANAGER_PROJECT}`, "--format", "{{json .}}"],
    requirements: ["BR-U06-003"], timeoutMs: 30_000 }, { execute });
  if (result.status !== "PASS") return { gate: result, fingerprint: null };
  try {
    const rows = result.stdout.split(/\r?\n/).filter(Boolean).map((line) => {
      const item = JSON.parse(line);
      return { project: MANAGER_PROJECT, service: item.Labels?.match(/com\.docker\.compose\.service=([^,]+)/)?.[1] ?? item.Names,
        containerId: item.ID, imageId: item.ImageID ?? item.Image, startedAt: item.RunningFor, ports: String(item.Ports ?? "").split(",").map((v) => v.trim()).filter(Boolean) };
    });
    return { gate: result, fingerprint: fingerprintManagerInventory(rows) };
  } catch (error) { return { gate: { ...result, status: "FAIL", classification: "INVENTORY_PARSE_MISMATCH", summary: error.message }, fingerprint: null }; }
}

export function runWaveAConfig({ execute } = {}) {
  const result = runBoundedCommand({ id: "wave-a-isolation-config", phase: "isolation", command: "node",
    args: ["scripts/wave-a-compose.mjs", "config"], requirements: ["BR-U06-003", "BR-U06-004"], timeoutMs: 60_000,
    assert: ({ stdout }) => validateWaveAConfig(stdout) }, { execute });
  return result;
}

export function fingerprintManagerInventory(rows) {
  if (!Array.isArray(rows)) throw new Error("manager inventory must be a list");
  const normalized = rows.map((row) => ({ project: row.project, service: row.service, containerId: row.containerId,
    imageId: row.imageId, startedAt: row.startedAt, ports: [...(row.ports ?? [])].sort() }))
    .sort((a, b) => `${a.service}:${a.containerId}`.localeCompare(`${b.service}:${b.containerId}`));
  if (normalized.some((row) => row.project !== MANAGER_PROJECT)) throw new Error("manager inventory project mismatch");
  return { rows: normalized, sha256: createHash("sha256").update(JSON.stringify(normalized)).digest("hex") };
}

export function assertManagerUnchanged(before, after) {
  if (before.sha256 !== after.sha256 || JSON.stringify(before.rows) !== JSON.stringify(after.rows)) throw new Error("manager inventory changed");
  return true;
}

export function validateWaveAConfig(rendered) {
  if (typeof rendered !== "string" || !rendered.trim()) { const error = new Error("Wave A config unavailable"); error.status = "BLOCKED"; throw error; }
  const lower = rendered.toLowerCase();
  if (/(?:^|[^0-9])8088(?:[^0-9]|$)/m.test(rendered)) throw new Error("manager port 8088 is published or targeted");
  if (/linercore-manager/i.test(rendered) || lower.includes(`com.docker.compose.project=${MANAGER_PROJECT}`)) throw new Error("manager label detected");
  if (!lower.includes(WAVE_A_PROJECT) || !rendered.includes("18088")) throw new Error("Wave A project/edge mismatch");
  return true;
}

export function assertAllowedComposeCommand(argv) {
  if (!Array.isArray(argv) || argv[0] !== "node" || argv[1] !== "scripts/wave-a-compose.mjs" || !MUTATING.has(argv[2])) throw new Error("raw or unknown Compose mutation rejected");
  const joined = argv.join(" ");
  if (/\b8088\b|linercore-shared-platform|linercore-manager/i.test(joined)) throw new Error("manager target rejected");
  return true;
}

function blockedGate(id, summary) { return { recordKind: "gate", schemaVersion: 1, recordId: id, gateId: id, phase: "isolation", requirements: ["BR-U06-002"], command: ["npm", "run", "demo:guard"], startedAt: new Date().toISOString(), completedAt: new Date().toISOString(), startMonotonicNs: "0", endMonotonicNs: "0", exitCode: null, status: "BLOCKED", classification: "DEFAULTS_OVERRIDDEN", blockerId: `B-${id}`, summary }; }
