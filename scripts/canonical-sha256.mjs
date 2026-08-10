import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

export function sha256CanonicalText(filePath) {
  const canonical = readFileSync(filePath, "utf8").replace(/\r\n?/g, "\n");
  return createHash("sha256").update(canonical, "utf8").digest("hex");
}
