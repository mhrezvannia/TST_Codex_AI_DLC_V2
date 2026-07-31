import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

const LOWER_SHA256 = /^[a-f0-9]{64}$/;

export function verifyEvidenceToolLock({ toolRoot = import.meta.dirname, packageArchivePath } = {}) {
  const lock = JSON.parse(readFileSync(path.join(toolRoot, "evidence-tool-lock.json"), "utf8"));
  if (lock.schemaVersion !== 1 || lock.failureStatus !== "BLOCKED" || lock.pathBasedFallback !== false) blocked("invalid evidence-tool lock policy");
  if (process.platform !== lock.native.platform || process.arch !== lock.native.arch) blocked(`native helper unsupported on ${process.platform}_${process.arch}`);
  if (!LOWER_SHA256.test(lock.package.tarballSha256) || !LOWER_SHA256.test(lock.native.sha256)) blocked("invalid locked digest");
  let packageJson;
  try { packageJson = JSON.parse(readFileSync(path.join(toolRoot, "node_modules", lock.package.name, "package.json"), "utf8")); }
  catch { blocked("koffi package unavailable"); }
  if (packageJson.name !== lock.package.name || packageJson.version !== lock.package.version) blocked("koffi package version mismatch");
  const nativePath = path.resolve(toolRoot, lock.native.relativePath);
  if (!nativePath.startsWith(path.resolve(toolRoot) + path.sep)) blocked("native helper path escape");
  let nativeBytes;
  try { nativeBytes = readFileSync(nativePath); } catch { blocked("native helper unavailable"); }
  if (sha256(nativeBytes) !== lock.native.sha256) blocked("native helper digest mismatch");
  if (packageArchivePath && sha256(readFileSync(packageArchivePath)) !== lock.package.tarballSha256) blocked("package tarball digest mismatch");
  return Object.freeze({ lock, nativePath });
}

function sha256(bytes) { return createHash("sha256").update(bytes).digest("hex"); }
function blocked(message) { const error = new Error(message); error.code = "U06_CAPABILITY_BLOCKED"; error.status = "BLOCKED"; throw error; }
