import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { classifyStep, compareBusinessCounts, replayRestartSteps, runReplayRestartProof } from "./replay-restart-proof.mjs";

test("dry-run writes planned replay/restart evidence without executing commands", () => {
  const dir = mkdtempSync(join(tmpdir(), "replay-restart-"));
  const evidencePath = join(dir, "evidence.json");
  const evidence = runReplayRestartProof({
    dryRun: true,
    evidencePath,
    runner: () => {
      throw new Error("runner should not execute in dry-run");
    }
  });

  assert.equal(evidence.status, "planned");
  assert.equal(evidence.summary.planned, replayRestartSteps.length);
  assert.equal(evidence.assertions.postgresHostPort, "55432");
  assert.equal(evidence.assertions.bookingTopic, "booking.events");
  assert.equal(evidence.assertions.movementTopic, "containermovement.status");
  assert.equal(JSON.parse(readFileSync(evidencePath, "utf8")).status, "planned");
});

test("live evidence classifies docker daemon failures as blocked", () => {
  const evidence = runReplayRestartProof({
    steps: [{
      id: "compose-services",
      command: "docker compose ps --format json",
      blockedWhen: ["Cannot connect to the Docker daemon"]
    }],
    runner: () => ({ status: 1, stdout: "", stderr: "Cannot connect to the Docker daemon" })
  });

  assert.equal(evidence.status, "blocked");
  assert.equal(evidence.summary.blocked, 1);
});

test("expected topic output is required for a passing topic-presence step", () => {
  const step = {
    id: "topic-presence",
    command: "list topics",
    expectedOutput: ["booking.events", "containermovement.status"]
  };

  assert.equal(classifyStep(step, { status: 0, stdout: "booking.events", stderr: "" }).status, "failed");
  assert.equal(classifyStep(step, {
    status: 0,
    stdout: "booking.events\ncontainermovement.status",
    stderr: ""
  }).status, "passed");
});

test("business counts must remain stable across service restarts", () => {
  const counts = "booking_records=2\nbooking_outbox=1\nbooking_consumed_events=3\nbooking_movement_status=1";
  const stable = compareBusinessCounts([
    { id: "capture-business-counts-before", status: "passed", summary: counts },
    { id: "capture-business-counts-after", status: "passed", summary: counts }
  ]);
  const changed = compareBusinessCounts([
    { id: "capture-business-counts-before", status: "passed", summary: counts },
    { id: "capture-business-counts-after", status: "passed", summary: counts.replace("booking_records=2", "booking_records=1") }
  ]);

  assert.equal(stable.status, "passed");
  assert.equal(changed.status, "failed");
});
