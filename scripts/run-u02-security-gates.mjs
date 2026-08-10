import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const lockPath = path.resolve("infrastructure/security/u02-toolchain-lock.json");
if (!existsSync(lockPath)) {
  console.error("U02 security gate blocked: approved version/digest toolchain lock is missing");
  process.exit(2);
}
const lock = JSON.parse(readFileSync(lockPath, "utf8"));
if (!Array.isArray(lock.tools) || lock.tools.length === 0
  || lock.tools.some((tool) => !tool.version || !tool.digest)) {
  console.error("U02 security gate blocked: toolchain lock is malformed");
  process.exit(2);
}
console.error("U02 security gate blocked: approved pinned tool runners are not yet integrated");
process.exit(2);
