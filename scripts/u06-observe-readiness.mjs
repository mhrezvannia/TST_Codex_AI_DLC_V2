import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { observeAuthenticatedReadiness } from "../tools/u06/readiness-observer.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export async function runReadinessObservation({ storageStatePath, subject, output = "artifacts/u06/observations/readiness.json" }) {
  if (!storageStatePath || !subject) throw new Error("signed storage state and subject are required");
  const absolute = path.resolve(root, output); const allowed = path.resolve(root, "artifacts", "u06", "observations");
  if (!(absolute === path.join(allowed, "readiness.json"))) throw new Error("readiness observation output path rejected");
  const deadline = Date.now() + 90_000;
  let envelope; let attempts = 0;
  do {
    attempts += 1;
    envelope = await observeAuthenticatedReadiness({ root, storageStatePath, subject });
    if (envelope.proof.status === "PASS" || Date.now() >= deadline) break;
    await new Promise((resolve) => setTimeout(resolve, 2_000));
  } while (true);
  envelope.proof.attempts = attempts;
  mkdirSync(path.dirname(absolute), { recursive: true });
  writeFileSync(absolute, `${JSON.stringify(envelope, null, 2)}\n`, { mode: 0o600 });
  process.stdout.write(`${JSON.stringify({ status: envelope.proof.status, services: envelope.proof.services.length })}\n`);
  return envelope;
}

function valueAfter(argv, flag) { const index = argv.indexOf(flag); return index >= 0 ? argv[index + 1] : undefined; }

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const envelope = await runReadinessObservation({ storageStatePath: valueAfter(process.argv, "--storage-state"),
    subject: valueAfter(process.argv, "--subject") });
  process.exitCode = envelope.proof.status === "PASS" ? 0 : 1;
}
