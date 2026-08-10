import { existsSync, readFileSync } from "node:fs";

const [waiverPath] = process.argv.slice(2);
const trustedUtc = process.env.CI_TRUSTED_UTC;
const freshness = process.env.CI_TRUSTED_UTC_PROOF;
if (!trustedUtc || !freshness || !Number.isFinite(Date.parse(trustedUtc))) {
  console.error("Trusted CI UTC and freshness proof are required");
  process.exit(2);
}
if (!waiverPath || !existsSync(waiverPath)) {
  console.error("Security waiver file is required");
  process.exit(2);
}
const waivers = JSON.parse(readFileSync(waiverPath, "utf8"));
const now = Date.parse(trustedUtc);
const invalid = !Array.isArray(waivers) || waivers.some((waiver) =>
  !waiver.id || !waiver.owner || !waiver.expiresAt || Date.parse(waiver.expiresAt) <= now);
if (invalid) {
  console.error("Missing, malformed, or expired security waiver");
  process.exit(1);
}
console.log("Security waivers: PASS");
