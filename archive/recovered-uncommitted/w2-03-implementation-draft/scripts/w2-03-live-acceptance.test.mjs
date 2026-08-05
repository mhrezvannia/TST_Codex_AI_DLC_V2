import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  classifyGate,
  resolveBashExecutable,
  runAudit,
  runLiveJourney,
  runW203Acceptance,
  validateEvidencePackage,
  validateLivePreflight
} from "./w2-03-live-acceptance.mjs";

test("dry-run writes a complete, hash-validated planned evidence package", () => {
  const outputRoot = mkdtempSync(join(tmpdir(), "w2-03-live-"));
  const manifest = runW203Acceptance({
    dryRun: true,
    outputRoot,
    runId: "dry-run-test",
    now: "2026-07-26T00:00:00.000Z"
  });

  assert.equal(manifest.status, "PLANNED");
  assert.ok(manifest.gates.every((gate) => gate.status === "PLANNED"));
  assert.deepEqual(validateEvidencePackage(join(outputRoot, "dry-run-test")).failures, []);
  assert.match(readFileSync(join(outputRoot, "dry-run-test", "index.md"), "utf8"), /W2-03-S5/);
});

test("require-pass validation rejects a truthful dry-run package", () => {
  const outputRoot = mkdtempSync(join(tmpdir(), "w2-03-live-"));
  runW203Acceptance({ dryRun: true, outputRoot, runId: "planned" });

  const result = validateEvidencePackage(join(outputRoot, "planned"), { requirePass: true });

  assert.equal(result.status, "FAIL");
  assert.ok(result.failures.includes("manifest status must be PASSED"));
});

test("blocking gate skips dependent work but still runs cleanup", () => {
  const executed = [];
  const manifest = runW203Acceptance({
    outputRoot: mkdtempSync(join(tmpdir(), "w2-03-live-")),
    runId: "blocked",
    gates: [
      { id: "preflight", section: "preflight", mapsTo: [], command: "preflight", blockedWhen: ["PRECHECK_BLOCKED"] },
      { id: "journey", section: "journey", mapsTo: [], command: "journey" },
      { id: "cleanup", section: "cleanup", mapsTo: [], command: "cleanup", alwaysRun: true }
    ],
    runner: (command) => {
      executed.push(command);
      return command === "preflight"
        ? { status: 1, stdout: "", stderr: "PRECHECK_BLOCKED missing durable storage" }
        : { status: 0, stdout: "ok", stderr: "" };
    }
  });

  assert.equal(manifest.status, "BLOCKED");
  assert.deepEqual(manifest.gates.map((gate) => gate.status), ["BLOCKED", "SKIPPED", "PASS"]);
  assert.deepEqual(executed, ["preflight", "cleanup"]);
});

test("preflight accepts the repository Compose contract and rejects missing durability", () => {
  assert.equal(validateLivePreflight().status, "PASS");
  assert.equal(validateLivePreflight({ composeText: "services: {}" }).status, "BLOCKED");
});

test("gate evidence redacts secret-like output", () => {
  const result = classifyGate({ id: "x", section: "x", mapsTo: [], command: "x" }, {
    status: 1,
    stdout: "TOKEN=abc PASSWORD=def lc_session=session-value",
    stderr: ""
  });

  assert.equal(result.status, "FAIL");
  assert.doesNotMatch(result.summary, /abc|def|session-value/);
});

test("Windows audits resolve Git Bash and retain the requested detector", () => {
  const bash = "C:\\Program Files\\Git\\bin\\bash.exe";
  assert.equal(resolveBashExecutable({ platform: "win32", env: { ProgramFiles: "C:\\Program Files" }, pathExists: (path) => path === bash }), bash);
  const invocations = [];
  const result = runAudit("aidlc", {
    executable: bash,
    runner: (executable, args) => { invocations.push({ executable, args }); return { status: 0, stdout: "PASS", stderr: "" }; }
  });
  assert.equal(result.status, 0);
  assert.deepEqual(invocations, [{ executable: bash, args: [".claude/skills/aidlc-audit/detectors.sh"] }]);
});

test("gate classification keeps the final Docker failure after truncation", () => {
  const result = classifyGate({ id: "compose", section: "compose", mapsTo: [], command: "compose", blockedWhen: ["failed to connect to the docker API"] }, {
    status: 1,
    stdout: "build output\n".repeat(1000),
    stderr: "failed to connect to the docker API"
  });
  assert.equal(result.status, "BLOCKED");
  assert.match(result.summary, /output truncated/);
  assert.match(result.summary, /failed to connect to the docker API/);
});

test("live journey drives create, approve, reprice, and manual Booking scenarios", async () => {
  const originalFetch = global.fetch;
  const rateIds = ["rate-1", "rate-2", "rate-3"];
  let rateIndex = 0;
  let agreementIndex = 0;
  let bookingIndex = 0;
  global.fetch = async (url, options = {}) => {
    const path = new URL(url).pathname;
    const method = options.method ?? "GET";
    const request = options.body ? JSON.parse(options.body) : {};
    let body;
    if (method === "POST" && path === "/api/charge-rates") {
      const id = rateIds[rateIndex++];
      body = { ...request, id, definitionId: `definition-${id}`, version: 1, status: "DRAFT" };
    } else if (method === "POST" && path.endsWith("/versions")) {
      body = { id: "rate-4", definitionId: "definition-rate-1", version: 2, status: "DRAFT" };
    } else if (method === "POST" && path.includes("/api/charge-rates/") && path.endsWith("/approve")) {
      const id = path.split("/")[3];
      body = { id, definitionId: id === "rate-4" ? "definition-rate-1" : `definition-${id}`, version: id === "rate-4" ? 2 : 1, status: "APPROVED" };
    } else if (method === "POST" && path === "/api/charge-agreements") {
      agreementIndex += 1;
      body = { id: `agreement-${agreementIndex}`, agreementNumber: request.agreementNumber, version: 1, status: "DRAFT" };
    } else if (method === "PUT" && path.startsWith("/api/charge-agreements/")) {
      body = { id: path.split("/")[3], agreementNumber: request.agreementNumber, version: 3, status: "DRAFT" };
    } else if (method === "POST" && path.endsWith("/rate-bindings")) {
      body = { rateVersionIds: request.rateVersionIds };
    } else if (method === "POST" && path.endsWith("/approve")) {
      body = { id: path.split("/")[3], version: 4, status: "APPROVED" };
    } else if (method === "POST" && path.endsWith("/suspend")) {
      body = { id: path.split("/")[3], version: 5, status: "SUSPENDED" };
    } else if (method === "POST" && path === "/api/bookings") {
      bookingIndex += 1;
      body = { id: `booking-${bookingIndex}`, revision: 1, status: "DRAFT" };
    } else if (method === "POST" && path.endsWith("/price")) {
      const id = path.split("/")[3];
      body = id === "booking-3"
        ? { id, status: "MANUAL_PRICING", exceptions: [{ code: "MANUAL_PRICING_REQUIRED" }] }
        : { id, status: "PRICED", pricingSnapshot: { quotedAmounts: { pricingBasis: "AGREEMENT", lineItemCount: "3", "line.1.amount": id === "booking-1" ? "1200" : "1400", "line.2.amount": "175", "line.3.amount": "90" } } };
    } else {
      return new Response(JSON.stringify({ code: "unexpected", path, method }), { status: 500 });
    }
    return new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });
  };

  try {
    const path = join(mkdtempSync(join(tmpdir(), "w2-03-journey-")), "scenarios.json");
    const result = await runLiveJourney(path, { suffix: "test" });
    assert.equal(result.status, "PASS");
    assert.deepEqual(result.scenarios.map((scenario) => scenario.status), ["PASS", "PASS", "PASS"]);
    assert.equal(JSON.parse(readFileSync(path, "utf8")).persistence.bookingIds.length, 3);
  } finally {
    global.fetch = originalFetch;
  }
});
