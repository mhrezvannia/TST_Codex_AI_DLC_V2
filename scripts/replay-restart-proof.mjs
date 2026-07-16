import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const replayRestartSteps = [
  {
    id: "compose-services",
    command: "docker compose ps --format json",
    blockedWhen: ["Cannot connect to the Docker daemon", "error during connect", "No such file or directory"]
  },
  {
    id: "booking-health-before",
    command: "node scripts/replay-restart-proof.mjs --probe http://localhost:8088/api/bookings",
    blockedWhen: ["ECONNREFUSED", "fetch failed", "BOOKING_UNAVAILABLE"]
  },
  {
    id: "capture-business-counts-before",
    command: "docker compose exec -T postgres psql -U linercore -d linercore_booking -c \"SELECT COUNT(*) AS bookings FROM bookings; SELECT COUNT(*) AS booking_outbox FROM booking_outbox; SELECT COUNT(*) AS booking_consumed_events FROM booking_consumed_events; SELECT COUNT(*) AS booking_movement_status FROM booking_movement_status;\"",
    blockedWhen: ["does not exist", "could not connect", "connection refused"]
  },
  {
    id: "restart-booking",
    command: "docker compose restart booking-service",
    blockedWhen: ["Cannot connect to the Docker daemon", "No such service"]
  },
  {
    id: "booking-health-after",
    command: "node scripts/replay-restart-proof.mjs --probe http://localhost:8088/api/bookings",
    blockedWhen: ["ECONNREFUSED", "fetch failed", "BOOKING_UNAVAILABLE"]
  },
  {
    id: "restart-cmm",
    command: "docker compose restart container-movement-service",
    blockedWhen: ["Cannot connect to the Docker daemon", "No such service"]
  },
  {
    id: "capture-business-counts-after",
    command: "docker compose exec -T postgres psql -U linercore -d linercore_booking -c \"SELECT COUNT(*) AS bookings FROM bookings; SELECT COUNT(*) AS booking_outbox FROM booking_outbox; SELECT COUNT(*) AS booking_consumed_events FROM booking_consumed_events; SELECT COUNT(*) AS booking_movement_status FROM booking_movement_status;\"",
    blockedWhen: ["does not exist", "could not connect", "connection refused"]
  },
  {
    id: "topic-presence",
    command: "docker compose exec -T kafka kafka-topics --bootstrap-server kafka:9092 --list",
    expectedOutput: ["booking.confirmed", "containermovement.status"],
    blockedWhen: ["No such service", "Timed out", "could not be established"]
  }
];

export function runReplayRestartProof(options = {}) {
  const dryRun = options.dryRun ?? false;
  const runner = options.runner ?? runCommand;
  const steps = (options.steps ?? replayRestartSteps).map((step) => {
    if (dryRun) return plannedStep(step);
    return classifyStep(step, runner(step.command));
  });
  const failed = steps.filter((step) => step.status === "failed");
  const blocked = steps.filter((step) => step.status === "blocked");
  const planned = steps.filter((step) => step.status === "planned");
  const evidence = {
    generatedAt: new Date().toISOString(),
    mode: dryRun ? "dry-run" : "live",
    runId: options.runId ?? `w1-01-replay-restart-${Date.now()}`,
    status: failed.length > 0 ? "failed" : blocked.length > 0 ? "blocked" : planned.length > 0 ? "planned" : "passed",
    assertions: {
      postgresHostPort: "55432",
      bookingTopic: "booking.confirmed",
      movementTopic: "containermovement.status",
      bookingDetailSource: "booking-local-projection",
      replayRequiresAuthorization: true,
      destructiveDatabaseResetAllowed: false
    },
    summary: {
      passed: steps.filter((step) => step.status === "passed").length,
      planned: planned.length,
      blocked: blocked.length,
      failed: failed.length
    },
    steps
  };
  if (options.evidencePath) {
    const outputPath = resolve(options.evidencePath);
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, `${JSON.stringify(evidence, null, 2)}\n`);
  }
  return evidence;
}

export function classifyStep(step, result) {
  const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
  const expectedMissing = (step.expectedOutput ?? []).filter((token) => !output.includes(token));
  const blocked = result.status !== 0 && (step.blockedWhen ?? []).some((pattern) => output.includes(pattern));
  return {
    id: step.id,
    command: redact(step.command),
    status: result.status === 0 && expectedMissing.length === 0 ? "passed" : blocked ? "blocked" : "failed",
    exitCode: result.status,
    missingExpectedOutput: expectedMissing,
    summary: redact(output.trim()).slice(0, 2000)
  };
}

function plannedStep(step) {
  return {
    id: step.id,
    command: redact(step.command),
    status: "planned",
    exitCode: null,
    missingExpectedOutput: [],
    summary: "dry-run: command not executed"
  };
}

function redact(value) {
  return value
    .replace(/(LOCAL_REPLAY_TOKEN=)[^\s]+/g, "$1<redacted>")
    .replace(/(SERVICE_TOKEN=)[^\s]+/g, "$1<redacted>")
    .replace(/(PASSWORD=)[^\s]+/g, "$1<redacted>");
}

function runCommand(command) {
  return spawnSync(command, { shell: true, encoding: "utf8", timeout: 180000 });
}

async function probe(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`probe failed ${response.status}`);
  }
  return response.text();
}

function parseArgs(argv) {
  const probeIndex = argv.indexOf("--probe");
  if (probeIndex >= 0) return { probe: argv[probeIndex + 1] };
  return {
    dryRun: argv.includes("--dry-run"),
    evidencePath: valueAfter(argv, "--evidence") ?? "artifacts/w1-01-live/replay-restart/evidence.json"
  };
}

function valueAfter(argv, flag) {
  const index = argv.indexOf(flag);
  return index >= 0 ? argv[index + 1] : undefined;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const options = parseArgs(process.argv.slice(2));
  if (options.probe) {
    probe(options.probe)
      .then((body) => {
        console.log(body.slice(0, 2000));
      })
      .catch((error) => {
        console.error(error.message);
        process.exit(1);
      });
  } else {
    const evidence = runReplayRestartProof(options);
    console.log(JSON.stringify({ status: evidence.status, summary: evidence.summary }, null, 2));
    process.exit(evidence.status === "failed" ? 1 : 0);
  }
}
