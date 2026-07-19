import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const evidenceFiles = [
  "manifest.json",
  "browser-evidence.json",
  "runtime-readiness.json",
  "scenarios.jsonl",
  "actor-evidence.jsonl",
  "sign-out-evidence.json",
  "compatibility-preservation.md",
  "detector-6d.txt",
  "erp-fidelity-audit.txt",
  "aidlc-audit.txt",
  "final-decision.md"
];

export const requiredScenarios = [
  "allow-booking-create-detail",
  "deny-booking-access",
  "sign-out-reauth-stale-call",
  "legacy-bookings-compatibility"
];

const defaultOutputRoot = "artifacts/w2-01-live/app-shell-auth";
const w1WaiverStatus = "W1-01 live-proof waiver remains BLOCKED at compose-start; not a W2-01 PASS.";
const liveNotRunBlockerId = "W2-01-LIVE-NOT-RUN";

export function runW201Acceptance(options = {}) {
  const outputRoot = resolve(options.outputRoot ?? defaultOutputRoot);
  const now = options.now ?? new Date().toISOString();
  const dryRun = options.dryRun ?? false;
  mkdirSync(outputRoot, { recursive: true });

  const blockers = [];
  let browserEvidence = null;
  if (dryRun) {
    blockers.push(liveNotRunBlocker(now, "dry-run requested; live Compose/browser proof was not executed"));
    browserEvidence = blockedBrowserEvidence(now, "dry-run: browser driver not executed");
  } else {
    browserEvidence = runBrowserDriver(outputRoot);
    const livePassed = browserEvidence.runtime?.status === "PASS"
      && requiredScenarios.every((scenarioId) => browserEvidence.scenarios?.some((scenario) => scenario.scenarioId === scenarioId && scenario.status === "PASS"));
    if (!livePassed) {
      blockers.push(liveNotRunBlocker(now, browserEvidence.errors?.join("; ") || "one or more live browser scenarios were blocked"));
    }
  }
  writeJson(join(outputRoot, "browser-evidence.json"), browserEvidence);

  const runtime = browserEvidence.runtime ?? runtimeReadiness(now, dryRun);
  writeJson(join(outputRoot, "runtime-readiness.json"), runtime);

  const scenarios = requiredScenarios.map((scenarioId) => {
    const observed = browserEvidence.scenarios?.find((scenario) => scenario.scenarioId === scenarioId);
    return {
      scenarioId,
      unit: "U06-final-live-acceptance-detector-audit",
      actor: observed?.actor ?? scenarioActor(scenarioId),
      route: observed?.route ?? scenarioRoute(scenarioId),
      startedAt: now,
      expectedResult: observed?.expectedResult ?? scenarioExpectedResult(scenarioId),
      observedResult: observed?.observedResult ?? "blocked: live scenario evidence not populated",
      status: observed?.status === "PASS" ? "PASS" : "BLOCKED",
      correlationId: observed?.correlationId ?? "not-captured",
      evidenceRefs: observed?.evidenceRefs ?? [],
      blockerId: observed?.status === "PASS" ? undefined : liveNotRunBlockerId
    };
  });
  writeJsonl(join(outputRoot, "scenarios.jsonl"), scenarios);
  writeJsonl(join(outputRoot, "actor-evidence.jsonl"), browserEvidence.actors ?? []);

  writeJson(join(outputRoot, "sign-out-evidence.json"), browserEvidence.signOut ?? {
    preSignOutSubject: null,
    signOutCorrelationId: "not-captured",
    signOutCommand: "POST /api/auth/sign-out through shell/auth route",
    signOutExitOrHttpStatus: null,
    cookieCleared: false,
    postSignOutRoute: "/booking",
    postSignOutDecision: "BLOCKED - live proof not executed",
    staleCallStatus: null,
    staleCallCode: null,
    staleCallCorrelationId: "not-captured",
    backendLocalUserObserved: false
  });

  writeFileSync(join(outputRoot, "compatibility-preservation.md"), renderCompatibilityPreservation(now, browserEvidence.compatibility ?? []));

  const commands = dryRun ? dryRunCommands(now, outputRoot) : runCommands(now, outputRoot);
  for (const command of commands) {
    if (command.status === "BLOCKED" && command.blockerId && !blockers.some((blocker) => blocker.blockerId === command.blockerId)) {
      blockers.push(commandBlocker(command, now));
    }
  }

  const finalDecision = blockers.length === 0 && commands.every((command) => command.status === "PASS")
    ? "PASS"
    : "BLOCKED";
  syncBlockersFile(outputRoot, blockers);

  const manifest = {
    intent: "W2-01-app-shell-and-auth",
    branch: options.branch ?? "intent/W2-01-app-shell-and-auth",
    baseBranch: "integ/main-reconciled",
    baseCommit: "5dd6481",
    generatedAt: now,
    runtimeStatus: runtime.status,
    finalDecision,
    evidenceRoot: normalizeForManifest(outputRoot),
    scenarios: scenarios.map((scenario) => ({
      scenarioId: scenario.scenarioId,
      status: scenario.status,
      blockerId: scenario.blockerId
    })),
    commands,
    blockers: blockers.map((blocker) => blocker.blockerId),
    w1WaiverStatus,
    artifacts: indexArtifacts(outputRoot)
  };
  writeJson(join(outputRoot, "manifest.json"), {
    ...manifest,
    artifacts: indexArtifacts(outputRoot)
  });
  writeFileSync(join(outputRoot, "final-decision.md"), renderFinalDecision(manifest));
  writeJson(join(outputRoot, "manifest.json"), {
    ...manifest,
    artifacts: indexArtifacts(outputRoot)
  });
  return manifest;
}

export function validateEvidencePackage(outputRoot = defaultOutputRoot, options = {}) {
  const root = resolve(outputRoot);
  const failures = [];
  for (const file of evidenceFiles) {
    if (!existsSync(join(root, file))) failures.push(`missing ${file}`);
  }
  const manifest = readJson(root, "manifest.json", failures);
  const runtime = readJson(root, "runtime-readiness.json", failures);
  const scenarios = readJsonl(root, "scenarios.jsonl", failures);
  const actors = readJsonl(root, "actor-evidence.jsonl", failures);
  const signOut = readJson(root, "sign-out-evidence.json", failures);
  const blockers = existsSync(join(root, "blockers.jsonl")) ? readJsonl(root, "blockers.jsonl", failures) : [];
  const finalDecision = readText(root, "final-decision.md", failures);

  if (manifest) {
    for (const field of ["intent", "branch", "baseBranch", "baseCommit", "generatedAt", "runtimeStatus", "finalDecision", "evidenceRoot", "scenarios", "commands", "blockers", "w1WaiverStatus"]) {
      if (!(field in manifest)) failures.push(`manifest missing ${field}`);
    }
    if (!["PASS", "BLOCKED"].includes(manifest.runtimeStatus)) failures.push("manifest runtimeStatus must be PASS or BLOCKED");
    if (!["PASS", "BLOCKED"].includes(manifest.finalDecision)) failures.push("manifest finalDecision must be PASS or BLOCKED");
    if (options.requirePass && manifest.finalDecision !== "PASS") failures.push("manifest finalDecision must be PASS");
    if (options.requirePass && manifest.runtimeStatus !== "PASS") failures.push("manifest runtimeStatus must be PASS");
    if (!String(manifest.w1WaiverStatus ?? "").includes("BLOCKED at compose-start")) failures.push("W1 waiver status must remain BLOCKED at compose-start");
    if (manifest.finalDecision === "BLOCKED" && blockers.length === 0) failures.push("BLOCKED manifest requires blockers.jsonl rows");
    if (manifest.finalDecision === "PASS" && blockers.length > 0) failures.push("PASS manifest must not retain blockers.jsonl rows");
  }
  if (runtime && !["PASS", "BLOCKED"].includes(runtime.status)) failures.push("runtime-readiness status must be PASS or BLOCKED");

  const scenarioIds = scenarios.map((scenario) => scenario.scenarioId);
  for (const scenarioId of requiredScenarios) {
    if (scenarioIds.filter((id) => id === scenarioId).length !== 1) failures.push(`scenario ${scenarioId} must appear exactly once`);
  }
  const blockerIds = new Set(blockers.map((blocker) => blocker.blockerId));
  for (const scenario of scenarios) {
    if (!["PASS", "BLOCKED"].includes(scenario.status)) failures.push(`scenario ${scenario.scenarioId} has invalid status`);
    if (scenario.status === "BLOCKED" && !blockerIds.has(scenario.blockerId)) failures.push(`scenario ${scenario.scenarioId} references missing blocker`);
  }
  for (const actor of actors) {
    if (actor.actorHeader === "local-user") failures.push(`actor evidence ${actor.scenarioId ?? "(unknown)"} uses local-user`);
  }
  if (signOut && signOut.backendLocalUserObserved !== false) failures.push("sign-out evidence must set backendLocalUserObserved=false");
  if (finalDecision && !finalDecision.includes("W1-01 live-proof waiver remains BLOCKED at compose-start")) {
    failures.push("final decision must preserve W1 waiver BLOCKED wording");
  }
  return { status: failures.length === 0 ? "PASS" : "FAIL", failures };
}

export function syncBlockersFile(outputRoot, blockers) {
  const blockerPath = join(resolve(outputRoot), "blockers.jsonl");
  if (blockers.length > 0) {
    writeJsonl(blockerPath, blockers);
  } else if (existsSync(blockerPath)) {
    rmSync(blockerPath);
  }
}

function runtimeReadiness(now, dryRun) {
  return {
    timestamp: now,
    composeProject: "linercore-w2-01",
    entrypointUrl: "http://127.0.0.1:8088",
    status: "BLOCKED",
    services: ["nginx", "apps-shell", "apps-auth", "apps-booking", "booking-service", "identity-service", "keycloak"].map((name) => ({
      name,
      expected: "available through local Compose/Nginx",
      observed: dryRun ? "not checked - dry-run" : "not checked by code-generation package script",
      status: "BLOCKED",
      blockerId: liveNotRunBlockerId
    }))
  };
}

function runBrowserDriver(outputRoot) {
  const result = spawnSync(process.execPath, [
    resolve("scripts/w2-01-live-browser.mjs"),
    "--output-root",
    outputRoot,
    "--compose-project",
    process.env.W2_01_COMPOSE_PROJECT ?? "linercore-w2-01"
  ], { encoding: "utf8", timeout: 240000 });
  try {
    return JSON.parse(readFileSync(join(outputRoot, "browser-evidence.json"), "utf8"));
  } catch (error) {
    return blockedBrowserEvidence(new Date().toISOString(), redact(`${error.message}; ${result.stderr ?? result.stdout ?? "browser driver failed"}`));
  }
}

function blockedBrowserEvidence(now, reason) {
  return {
    generatedAt: now,
    runtime: runtimeReadiness(now, true),
    scenarios: [],
    actors: [],
    signOut: null,
    compatibility: [],
    screenshots: [],
    errors: [reason]
  };
}

function dryRunCommands(now, outputRoot) {
  return [
    plannedCommand("detector-6d", "internal detector 6d scan for hardcoded auth", "detector-6d.txt", now, outputRoot),
    plannedCommand("erp-fidelity-audit", "bash .claude/skills/erp-fidelity-audit/detectors.sh", "erp-fidelity-audit.txt", now, outputRoot),
    plannedCommand("aidlc-audit", "bash .claude/skills/aidlc-audit/detectors.sh", "aidlc-audit.txt", now, outputRoot)
  ];
}

function runCommands(now, outputRoot) {
  const detector = runDetector6d(outputRoot, now);
  const bashExecutable = resolveBashExecutable();
  return [
    detector,
    runShellCommand("erp-fidelity-audit", "bash .claude/skills/erp-fidelity-audit/detectors.sh", "erp-fidelity-audit.txt", now, outputRoot, {
      executable: bashExecutable,
      args: [".claude/skills/erp-fidelity-audit/detectors.sh"]
    }),
    runShellCommand("aidlc-audit", "bash .claude/skills/aidlc-audit/detectors.sh", "aidlc-audit.txt", now, outputRoot, {
      executable: bashExecutable,
      args: [".claude/skills/aidlc-audit/detectors.sh"]
    })
  ];
}

export function resolveBashExecutable({
  platform = process.platform,
  env = process.env,
  pathExists = existsSync
} = {}) {
  const override = env.W2_01_BASH_PATH?.trim();
  if (override) return override;
  if (platform !== "win32") return "bash";

  const candidates = [
    join(env.ProgramFiles ?? "C:\\Program Files", "Git", "bin", "bash.exe"),
    join(env["ProgramFiles(x86)"] ?? "C:\\Program Files (x86)", "Git", "bin", "bash.exe")
  ];
  return candidates.find((candidate) => pathExists(candidate)) ?? "bash";
}

export function runDetector6d(outputRoot = defaultOutputRoot, now = new Date().toISOString()) {
  const root = resolve(".");
  const hits = [];
  for (const dir of ["apps/shell", "apps/booking"]) {
    for (const file of listSourceFiles(resolve(root, dir))) {
      const rel = normalizeForManifest(relative(root, file));
      if (/\.test\.[tj]sx?$/.test(rel)) continue;
      const text = readFileSync(file, "utf8");
      const lines = text.split(/\r?\n/);
      lines.forEach((line, index) => {
        if (/actorSubjectId:\s*["']local-user["']|subjectId\s*=\s*["']local|X-Local-User/.test(line)) {
          hits.push(`${rel}:${index + 1}:${line.trim()}`);
        }
      });
    }
  }
  const status = hits.length === 0 ? "PASS" : "BLOCKED";
  const output = [
    "command=internal detector 6d scan for hardcoded auth",
    `status=${status}`,
    `exitCode=${hits.length === 0 ? 0 : 1}`,
    "",
    hits.length === 0 ? "zero hardcoded-auth hits for mounted shell/Booking surfaces" : hits.join("\n")
  ].join("\n");
  writeFileSync(join(resolve(outputRoot), "detector-6d.txt"), output);
  return {
    commandId: "detector-6d",
    command: "internal detector 6d scan for hardcoded auth",
    startedAt: now,
    endedAt: now,
    exitCode: hits.length === 0 ? 0 : 1,
    status,
    outputPath: "detector-6d.txt",
    blockerId: status === "BLOCKED" ? "W2-01-DETECTOR-6D" : undefined
  };
}

function runShellCommand(commandId, command, outputPath, now, outputRoot, invocation = {}) {
  const result = invocation.executable
    ? spawnSync(invocation.executable, invocation.args ?? [], { encoding: "utf8", timeout: 300000 })
    : spawnSync(command, { shell: true, encoding: "utf8", timeout: 300000 });
  const output = redact(`${result.stdout ?? ""}\n${result.stderr ?? ""}\n${result.error?.message ?? ""}`).trim();
  writeFileSync(join(outputRoot, outputPath), [
    `command=${redact(command)}`,
    `status=${result.status === 0 ? "PASS" : "BLOCKED"}`,
    `exitCode=${result.status ?? 1}`,
    "",
    output
  ].join("\n"));
  return {
    commandId,
    command: redact(command),
    startedAt: now,
    endedAt: new Date().toISOString(),
    exitCode: result.status ?? 1,
    status: result.status === 0 ? "PASS" : "BLOCKED",
    outputPath,
    blockerId: result.status === 0 ? undefined : `W2-01-${commandId.toUpperCase()}`
  };
}

function plannedCommand(commandId, command, outputPath, now, outputRoot) {
  writeFileSync(join(outputRoot, outputPath), [
    `command=${command}`,
    "status=BLOCKED",
    "exitCode=",
    "",
    "dry-run: command not executed"
  ].join("\n"));
  return {
    commandId,
    command,
    startedAt: now,
    endedAt: now,
    exitCode: null,
    status: "BLOCKED",
    outputPath,
    blockerId: liveNotRunBlockerId
  };
}

function liveNotRunBlocker(now, observedFailure) {
  return {
    blockerId: liveNotRunBlockerId,
    detectedAt: now,
    dependency: "local Compose/Nginx/Keycloak live proof",
    commandOrScenario: "allow, deny, sign-out, and /bookings* compatibility scenarios",
    observedFailure,
    impact: "W2-01 final acceptance cannot be marked PASS without live actor/correlation evidence",
    nextAction: "Run the live stack and populate the required U06 evidence package files through Nginx",
    owner: "delivery/quality",
    w1WaiverRelated: false
  };
}

function commandBlocker(command, now) {
  return {
    blockerId: command.blockerId,
    detectedAt: now,
    dependency: command.commandId,
    commandOrScenario: command.command,
    observedFailure: `${command.commandId} returned ${command.status}`,
    impact: "W2-01 final acceptance cannot be marked PASS while detector/audit command is blocked",
    nextAction: "Fix the command finding or record a reviewed W2-01 blocker",
    owner: "quality",
    w1WaiverRelated: false
  };
}

function renderCompatibilityPreservation(now, observations = []) {
  const liveRows = observations.length === 0
    ? "- Live observation: not captured."
    : observations.map((row) => `- ${row.legacyPath} -> ${row.location ?? "(none)"}: ${row.status} (HTTP ${row.httpStatus})`).join("\n");
  return `# Compatibility and Preservation Evidence

Generated at: ${now}

## Route Compatibility

- /bookings -> /booking: implemented as shell-owned 308 compatibility route; live observation still required.
- /bookings/new -> /booking/new: implemented as shell-owned 308 compatibility route; live observation still required.
- /bookings/[id] -> /booking/[id]: implemented as shell-owned safe one-segment 308 compatibility route; live observation still required.

${liveRows}

## Prior-Work Preservation

| Prior work | Status | Evidence |
| --- | --- | --- |
| W0-01 platform/eventing | Preserved | No U06 runtime service, queue, eventing, outbox, or telemetry redesign. |
| W0-02 reference-data | Preserved | No reference-data migration in U06. |
| W1-01 Booking | Preserved | Booking BFF/service behavior is consumed for evidence; dry-run is not a PASS. |
| W2-02 design-system foundation | Preserved | No design-system foundation rewrite in U06. |

W1-01 live-proof waiver remains BLOCKED at compose-start; not rewritten as PASS.
`;
}

function renderFinalDecision(manifest) {
  const lines = [
    "# W2-01 Final Decision",
    "",
    `Final decision: ${manifest.finalDecision}`,
    `Runtime status: ${manifest.runtimeStatus}`,
    "",
    "| Scenario | Status | Blocker |",
    "| --- | --- | --- |"
  ];
  for (const scenario of manifest.scenarios) {
    lines.push(`| ${scenario.scenarioId} | ${scenario.status} | ${scenario.blockerId ?? ""} |`);
  }
  lines.push("", "| Command | Status | Exit Code | Blocker |", "| --- | --- | --- | --- |");
  for (const command of manifest.commands) {
    lines.push(`| ${command.commandId} | ${command.status} | ${command.exitCode ?? ""} | ${command.blockerId ?? ""} |`);
  }
  lines.push("", w1WaiverStatus, "");
  return `${lines.join("\n")}\n`;
}

function scenarioActor(scenarioId) {
  if (scenarioId === "deny-booking-access") return "local.reference.admin";
  if (scenarioId === "legacy-bookings-compatibility") return "local.booking.user or local.reference.admin";
  return "local.booking.user";
}

function scenarioRoute(scenarioId) {
  if (scenarioId === "deny-booking-access") return "/booking";
  if (scenarioId === "sign-out-reauth-stale-call") return "/api/auth/sign-out -> /booking";
  if (scenarioId === "legacy-bookings-compatibility") return "/bookings, /bookings/new, /bookings/[id]";
  return "/booking/new -> /booking/[id]";
}

function scenarioExpectedResult(scenarioId) {
  if (scenarioId === "deny-booking-access") return "authenticated denied state inside shell";
  if (scenarioId === "sign-out-reauth-stale-call") return "cookie cleared, protected route requires login, stale call fails closed";
  if (scenarioId === "legacy-bookings-compatibility") return "legacy routes resolve to canonical shell routes";
  return "Booking create/detail allowed for non-local-user actor";
}

function indexArtifacts(outputRoot) {
  return evidenceFiles
    .concat(existsSync(join(outputRoot, "blockers.jsonl")) ? ["blockers.jsonl"] : [])
    .filter((file) => existsSync(join(outputRoot, file)))
    .map((file) => {
      const content = readFileSync(join(outputRoot, file));
      return {
        path: file,
        sha256: createHash("sha256").update(content).digest("hex"),
        bytes: content.length
      };
    });
}

function listSourceFiles(dir) {
  if (!existsSync(dir)) return [];
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".next") files.push(...listSourceFiles(path));
    } else if (/\.[tj]sx?$/.test(entry.name)) {
      files.push(path);
    }
  }
  return files;
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function writeJsonl(path, rows) {
  writeFileSync(path, rows.map((row) => JSON.stringify(row)).join("\n") + (rows.length ? "\n" : ""));
}

function readJson(root, file, failures) {
  try {
    return JSON.parse(readFileSync(join(root, file), "utf8"));
  } catch (error) {
    failures.push(`${file} is not valid JSON: ${error.message}`);
    return null;
  }
}

function readJsonl(root, file, failures) {
  try {
    const text = readFileSync(join(root, file), "utf8").trim();
    return text ? text.split(/\r?\n/).map((line) => JSON.parse(line)) : [];
  } catch (error) {
    failures.push(`${file} is not valid JSONL: ${error.message}`);
    return [];
  }
}

function readText(root, file, failures) {
  try {
    return readFileSync(join(root, file), "utf8");
  } catch (error) {
    failures.push(`${file} cannot be read: ${error.message}`);
    return "";
  }
}

export function redact(value) {
  return value
    .replace(/(TOKEN=)[^\s]+/gi, "$1<redacted>")
    .replace(/(PASSWORD=)[^\s]+/gi, "$1<redacted>")
    .replace(/(SECRET=)[^\s]+/gi, "$1<redacted>")
    .replace(/(COOKIE=)[^\s]+/gi, "$1<redacted>")
    .replace(/(lc_session=)[^;\s]+/gi, "$1<redacted>");
}

function normalizeForManifest(value) {
  return value.replaceAll("\\", "/");
}

function parseArgs(argv) {
  return {
    dryRun: argv.includes("--dry-run"),
    requirePass: argv.includes("--require-pass"),
    validate: argv.includes("--validate"),
    outputRoot: valueAfter(argv, "--output-root") ?? defaultOutputRoot
  };
}

function valueAfter(argv, flag) {
  const index = argv.indexOf(flag);
  return index >= 0 ? argv[index + 1] : undefined;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const options = parseArgs(process.argv.slice(2));
  if (options.validate) {
    const result = validateEvidencePackage(options.outputRoot, { requirePass: options.requirePass });
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.status === "PASS" ? 0 : 1);
  }
  const manifest = runW201Acceptance(options);
  console.log(JSON.stringify({ finalDecision: manifest.finalDecision, evidenceRoot: manifest.evidenceRoot }, null, 2));
  if (options.requirePass && manifest.finalDecision !== "PASS") process.exit(1);
}
