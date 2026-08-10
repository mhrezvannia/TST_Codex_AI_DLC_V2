import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const liveAcceptanceGates = [
  {
    id: "preflight",
    section: "preflight",
    mapsTo: ["BR-U07-002", "BR-U07-003"],
    command: "node scripts/w1-live-acceptance.mjs --preflight",
    blockedWhen: ["PRECHECK_BLOCKED", "Cannot connect to the Docker daemon"]
  },
  {
    id: "compose-config",
    section: "compose",
    mapsTo: ["BR-U07-002", "BR-U07-003"],
    command: "docker compose config --quiet",
    blockedWhen: ["Cannot connect to the Docker daemon", "error during connect"]
  },
  {
    id: "compose-start",
    section: "compose",
    mapsTo: ["BR-U07-001", "BR-U07-003"],
    command: "docker compose --profile full up -d --build",
    blockedWhen: [
      "Cannot connect to the Docker daemon",
      "no space left on device",
      "pull access denied",
      "failed to fetch anonymous token",
      "Docker Desktop has no HTTPS proxy",
      "connectex"
    ]
  },
  {
    id: "contracts",
    section: "quality",
    mapsTo: ["BR-U07-004"],
    command: "node scripts/validate-contract-catalog.mjs"
  },
  {
    id: "seed-dry-run",
    section: "seed",
    mapsTo: ["BR-U07-001"],
    command: "node scripts/seed-local.mjs --dry-run --seed-file infrastructure/seeds/shared-platform-mvp-defaults.json"
  },
  {
    id: "seed-live",
    section: "seed",
    mapsTo: ["BR-U07-001"],
    command: "node scripts/seed-local.mjs --seed-file infrastructure/seeds/shared-platform-mvp-defaults.json --summary-file artifacts/w1-01-live/current/seed/seed-apply.json",
    blockedWhen: ["ECONNREFUSED", "fetch failed", "REFERENCE_DATA_UNAVAILABLE"]
  },
  {
    id: "booking-ui-health",
    section: "journey",
    mapsTo: ["BR-U07-001"],
    command: "node scripts/w1-live-acceptance.mjs --probe http://localhost:8088/bookings",
    blockedWhen: ["ECONNREFUSED", "fetch failed", "probe failed"]
  },
  {
    id: "replay-restart",
    section: "replay-restart",
    mapsTo: ["BR-U07-001", "BR-U07-003"],
    command: "node scripts/replay-restart-proof.mjs --evidence artifacts/w1-01-live/current/replay-restart/evidence.json",
    blockedWhen: ["ECONNREFUSED", "Cannot connect to the Docker daemon", "fetch failed"]
  },
  {
    id: "quality-gates",
    section: "quality",
    mapsTo: ["BR-U07-006"],
    command: "node scripts/run-quality-gates.mjs --all --evidence artifacts/w1-01-live/current/quality/evidence.json"
  },
  {
    id: "aidlc-audit",
    section: "audits",
    mapsTo: ["BR-U07-007"],
    command: "bash .claude/skills/aidlc-audit/detectors.sh"
  },
  {
    id: "erp-fidelity-audit",
    section: "audits",
    mapsTo: ["BR-U07-007"],
    command: "bash .claude/skills/erp-fidelity-audit/detectors.sh"
  }
];

export function runLiveAcceptance(options = {}) {
  const dryRun = options.dryRun ?? false;
  const runId = options.runId ?? `w1-01-live-${new Date().toISOString().replace(/[:.]/g, "-")}`;
  const outputRoot = resolve(options.outputRoot ?? "artifacts/w1-01-live");
  const runDir = resolve(outputRoot, runId);
  const runner = options.runner ?? runCommand;
  mkdirSync(runDir, { recursive: true });

  let stopped = false;
  const gates = (options.gates ?? liveAcceptanceGates).map((gate) => {
    const resolved = resolveGateCommand(gate, runDir);
    if (stopped) return skippedGate(resolved);
    const result = dryRun ? plannedGate(gate, resolved) : classifyGate(gate, resolved, runner(resolved.command));
    writeGateEvidence(runDir, result);
    if (result.status === "FAIL" || result.status === "BLOCKED") stopped = true;
    return result;
  });

  const status = gates.some((gate) => gate.status === "FAIL")
    ? "FAILED"
    : gates.some((gate) => gate.status === "BLOCKED")
      ? "BLOCKED"
      : gates.some((gate) => gate.status === "PLANNED")
        ? "PLANNED"
        : "PASSED";
  const manifest = {
    runId,
    startedAt: options.startedAt ?? new Date().toISOString(),
    completedAt: new Date().toISOString(),
    status,
    branch: options.branch ?? "unknown",
    commit: options.commit ?? "unknown",
    dirtySummary: options.dirtySummary ?? "not captured",
    assertions: {
      postgresHostPort: "55432",
      nginxHostPort: "8088",
      realMessagingRequired: true,
      destructiveDatabaseResetAllowed: false
    },
    gates,
    artifacts: indexArtifacts(runDir, options.gates ?? liveAcceptanceGates)
  };
  const manifestPath = resolve(runDir, "manifest.json");
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  const finalManifest = {
    ...manifest,
    artifacts: indexArtifacts(runDir, options.gates ?? liveAcceptanceGates)
  };
  writeFileSync(manifestPath, `${JSON.stringify(finalManifest, null, 2)}\n`);
  writeFileSync(resolve(runDir, "index.md"), renderIndex(finalManifest));
  return finalManifest;
}

export function validateLivePreflight(options = {}) {
  const composeText = options.composeText ?? readFileSync(resolve("compose.yaml"), "utf8");
  const failures = [];
  if (!composeText.includes("${POSTGRES_HOST_PORT:-55432}:5432")) {
    failures.push("PostgreSQL host port must default to 55432");
  }
  if (!composeText.includes("8088:80")) {
    failures.push("nginx host port 8088 is required");
  }
  if (!composeText.includes("${GRAFANA_HOST_PORT:-3003}:3000")) {
    failures.push("Grafana host port must not collide with Booking UI port 3001");
  }
  if (!composeText.includes("MESSAGING_REQUIRE_REAL: \"true\"")) {
    failures.push("MESSAGING_REQUIRE_REAL must be true for live services");
  }
  if (composeText.includes("SPRING_PROFILES_ACTIVE: local,local-noop")) {
    failures.push("local-noop profile cannot satisfy W1 live acceptance");
  }
  return {
    status: failures.length === 0 ? "PASS" : "BLOCKED",
    failures
  };
}

export function classifyGate(gate, resolved, result) {
  const output = redact(`${result.stdout ?? ""}\n${result.stderr ?? ""}`);
  const blocked = result.status !== 0 && (gate.blockedWhen ?? []).some((pattern) => output.includes(pattern));
  return {
    id: gate.id,
    section: gate.section,
    mapsTo: gate.mapsTo,
    command: redact(resolved.command),
    status: result.status === 0 ? "PASS" : blocked ? "BLOCKED" : "FAIL",
    exitCode: result.status,
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    artifactPath: `${gate.section}/${gate.id}.txt`,
    summary: output.trim().slice(0, 2000)
  };
}

function resolveGateCommand(gate, runDir) {
  return {
    ...gate,
    command: gate.command.replaceAll("artifacts/w1-01-live/current", normalizeForCommand(runDir))
  };
}

function plannedGate(gate, resolved) {
  return {
    id: gate.id,
    section: gate.section,
    mapsTo: gate.mapsTo,
    command: redact(resolved.command),
    status: "PLANNED",
    exitCode: null,
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    artifactPath: `${gate.section}/${gate.id}.txt`,
    summary: "dry-run: command not executed"
  };
}

function skippedGate(gate) {
  return {
    id: gate.id,
    section: gate.section,
    mapsTo: gate.mapsTo,
    command: redact(gate.command),
    status: "SKIPPED",
    exitCode: null,
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    artifactPath: `${gate.section}/${gate.id}.txt`,
    summary: "skipped after prior blocking gate"
  };
}

function writeGateEvidence(runDir, gate) {
  const artifactPath = resolve(runDir, gate.artifactPath);
  mkdirSync(dirname(artifactPath), { recursive: true });
  writeFileSync(artifactPath, [
    `gate=${gate.id}`,
    `status=${gate.status}`,
    `exitCode=${gate.exitCode ?? ""}`,
    `command=${gate.command}`,
    "",
    gate.summary
  ].join("\n"));
}

function indexArtifacts(runDir, gates) {
  const artifacts = [];
  function add(path) {
    try {
      const content = readFileSync(path);
      artifacts.push({
        path: normalizeForManifest(relative(runDir, path)),
        sha256: createHash("sha256").update(content).digest("hex"),
        bytes: content.length
      });
    } catch {
      // Artifact does not exist yet.
    }
  }
  for (const gate of gates) {
    add(resolve(runDir, gate.section, `${gate.id}.txt`));
  }
  return artifacts;
}

function renderIndex(manifest) {
  const lines = [
    `# W1-01 Live Acceptance - ${manifest.runId}`,
    "",
    `Status: ${manifest.status}`,
    "",
    "| Gate | Status | Maps To | Evidence |",
    "|---|---|---|---|"
  ];
  for (const gate of manifest.gates) {
    lines.push(`| ${gate.id} | ${gate.status} | ${gate.mapsTo.join(", ")} | ${gate.artifactPath} |`);
  }
  lines.push("", "## Artifacts", "");
  for (const artifact of manifest.artifacts) {
    lines.push(`- ${artifact.path} sha256=${artifact.sha256}`);
  }
  return `${lines.join("\n")}\n`;
}

function runCommand(command) {
  return spawnSync(command, { shell: true, encoding: "utf8", timeout: 300000 });
}

function redact(value) {
  return value
    .replace(/(TOKEN=)[^\s]+/g, "$1<redacted>")
    .replace(/(PASSWORD=)[^\s]+/g, "$1<redacted>")
    .replace(/(W1_EVIDENCE_SIGNING_KEY_PATH=)[^\s]+/g, "$1<redacted>");
}

function normalizeForCommand(value) {
  return value.replaceAll("\\", "/");
}

function normalizeForManifest(value) {
  return value.replaceAll("\\", "/");
}

function parseArgs(argv) {
  if (argv.includes("--preflight")) return { preflight: true };
  const probeIndex = argv.indexOf("--probe");
  if (probeIndex >= 0) return { probe: argv[probeIndex + 1] };
  return {
    dryRun: argv.includes("--dry-run"),
    outputRoot: valueAfter(argv, "--output-root") ?? "artifacts/w1-01-live",
    runId: valueAfter(argv, "--run-id")
  };
}

function valueAfter(argv, flag) {
  const index = argv.indexOf(flag);
  return index >= 0 ? argv[index + 1] : undefined;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const options = parseArgs(process.argv.slice(2));
  if (options.preflight) {
    const result = validateLivePreflight();
    if (result.status !== "PASS") {
      console.error(`PRECHECK_BLOCKED ${result.failures.join("; ")}`);
      process.exit(1);
    }
    console.log(JSON.stringify(result, null, 2));
  } else if (options.probe) {
    fetch(options.probe, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`probe failed ${response.status}`);
        }
        return response.text();
      })
      .then((body) => {
        console.log(body.slice(0, 2000));
      })
      .catch((error) => {
        console.error(error.message);
        process.exit(1);
      });
  } else {
    const manifest = runLiveAcceptance(options);
    console.log(JSON.stringify({ status: manifest.status, runId: manifest.runId }, null, 2));
    process.exit(manifest.status === "FAILED" ? 1 : 0);
  }
}
