#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const options = parseArgs(process.argv.slice(2));
if (options.help) {
  console.log(`Usage:
  node scripts/u01-rate-performance.mjs --base-url http://127.0.0.1:18084 --subject SUBJECT [--samples 100] [--warmup 10]
  node scripts/u01-rate-performance.mjs --base-url URL --subject SUBJECT --approval-fixtures fixtures.json

The list mode records raw post-warm-up timings for GET /api/charge-rates.
An approval fixture file is a JSON array of {rateId, versionId, expectedRowVersion}.
It must contain at least one unique Draft per requested sample. No SLO claim is emitted.`);
  process.exit(0);
}

const baseUrl = requiredUrl(options.baseUrl);
const subject = requiredText(options.subject, "--subject");
const samples = boundedInteger(options.samples, 100, 1, 10_000);
const warmup = boundedInteger(options.warmup, 10, 0, 1_000);
const approvalFixtures = options.approvalFixtures
  ? await loadApprovalFixtures(options.approvalFixtures, samples)
  : null;

const timings = [];
if (!approvalFixtures) {
  for (let index = 0; index < warmup + samples; index += 1) {
    const elapsed = await timedRequest("/api/charge-rates?page=0&size=25", "GET");
    if (index >= warmup) timings.push(elapsed);
  }
} else {
  for (const fixture of approvalFixtures.slice(0, samples)) {
    const path = `/api/charge-rates/${encodeURIComponent(fixture.rateId)}/versions/`
      + `${encodeURIComponent(fixture.versionId)}/approve`;
    timings.push(await timedRequest(path, "POST", { expectedRowVersion: fixture.expectedRowVersion }));
  }
}

const sorted = [...timings].sort((left, right) => left - right);
const result = {
  evidenceType: "u01-rate-raw-timing",
  productionSloClaim: false,
  operation: approvalFixtures ? "approve" : "list",
  sampleCount: timings.length,
  warmupCount: approvalFixtures ? 0 : warmup,
  capturedAt: new Date().toISOString(),
  p50Ms: percentile(sorted, 0.50),
  p95Ms: percentile(sorted, 0.95),
  p99Ms: percentile(sorted, 0.99),
  rawTimingsMs: timings
};
console.log(JSON.stringify(result, null, 2));

async function timedRequest(path, method, body) {
  const correlationId = crypto.randomUUID();
  const started = performance.now();
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      "x-actor-subject": subject,
      "x-correlation-id": correlationId
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const elapsed = Number((performance.now() - started).toFixed(3));
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const safeCode = typeof payload?.code === "string" ? payload.code : "UNKNOWN";
    throw new Error(`Rate ${method} failed with HTTP ${response.status} (${safeCode})`);
  }
  await response.arrayBuffer();
  return elapsed;
}

async function loadApprovalFixtures(path, minimum) {
  const parsed = JSON.parse(await readFile(path, "utf8"));
  if (!Array.isArray(parsed) || parsed.length < minimum) {
    throw new Error(`Approval fixture file requires at least ${minimum} unique Draft entries`);
  }
  const seen = new Set();
  return parsed.map((value, index) => {
    const rateId = requiredText(value?.rateId, `fixture[${index}].rateId`);
    const versionId = requiredText(value?.versionId, `fixture[${index}].versionId`);
    const expectedRowVersion = boundedInteger(value?.expectedRowVersion, NaN, 0, Number.MAX_SAFE_INTEGER);
    const key = `${rateId}\u0000${versionId}`;
    if (seen.has(key)) throw new Error(`Approval fixture ${index} is not unique`);
    seen.add(key);
    return { rateId, versionId, expectedRowVersion };
  });
}

function percentile(sorted, fraction) {
  return sorted[Math.max(0, Math.ceil(sorted.length * fraction) - 1)];
}

function parseArgs(args) {
  const parsed = {};
  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];
    if (token === "--help") {
      parsed.help = true;
      continue;
    }
    if (!token.startsWith("--")) throw new Error(`Unexpected argument: ${token}`);
    const key = token.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    parsed[key] = args[index + 1];
    index += 1;
  }
  return parsed;
}

function requiredUrl(value) {
  const parsed = new URL(requiredText(value, "--base-url"));
  if (!["http:", "https:"].includes(parsed.protocol) || parsed.username || parsed.password) {
    throw new Error("--base-url must be an HTTP(S) origin without credentials");
  }
  return parsed.origin;
}

function requiredText(value, field) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${field} is required`);
  return value.trim();
}

function boundedInteger(value, fallback, minimum, maximum) {
  const number = value === undefined ? fallback : Number(value);
  if (!Number.isSafeInteger(number) || number < minimum || number > maximum) {
    throw new Error(`Expected an integer between ${minimum} and ${maximum}`);
  }
  return number;
}
