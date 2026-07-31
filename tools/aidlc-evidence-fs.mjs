import { createRequire } from "node:module";
import { createHash, randomBytes } from "node:crypto";
import { closeSync, existsSync, fsyncSync, fstatSync, lstatSync, mkdirSync, openSync, readFileSync, realpathSync, statSync, writeSync } from "node:fs";
import path from "node:path";
import { verifyEvidenceToolLock } from "./u06/evidence-tool-lock.mjs";

const require = createRequire(import.meta.url);
const toolRoot = path.resolve(import.meta.dirname, "u06");
const SAFE_DESTINATION = /^results\/[a-z0-9-]+\/[a-z0-9-]+\.json$/;
const INVALID_PATH = /^(?:[a-z]:|\\|\/|\\\?\\|\\\.\\)|:|(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i;
const MAX_ARTIFACT_BYTES = 64 * 1024 * 1024;
let cachedWin32Api;

export class EvidenceFsBlockedError extends Error {
  constructor(message) { super(message); this.name = "EvidenceFsBlockedError"; this.code = "U06_CAPABILITY_BLOCKED"; this.status = "BLOCKED"; }
}

export class EvidenceFsViolationError extends Error {
  constructor(message) { super(message); this.name = "EvidenceFsViolationError"; this.code = "U06_EVIDENCE_FS_VIOLATION"; this.status = "FAIL"; }
}

export class EvidenceWriter {
  constructor({ runRoot, registry, toolLock = verifyEvidenceToolLock() }) {
    if (process.platform !== "win32") throw new EvidenceFsBlockedError("Win32 handle-relative evidence writer unavailable");
    if (!path.isAbsolute(runRoot)) throw new EvidenceFsViolationError("run root must be absolute");
    this.registry = new Map(registry.members.map((member) => [member.key, member]));
    this.runRoot = path.resolve(runRoot);
    this.native = cachedWin32Api ??= createWin32Api(toolLock);
    mkdirSync(this.runRoot, { recursive: false });
    assertDirectoryChain(this.runRoot);
    this.rootIdentity = this.native.directoryIdentity(this.runRoot);
    for (const member of registry.members) {
      const destination = validateRegistryDestination(member.destination);
      mkdirSync(path.dirname(path.join(this.runRoot, destination)), { recursive: true });
    }
    assertDirectoryChain(this.runRoot);
  }

  commit(registryKey, value, { expectedSha256, crashPoint } = {}) {
    const member = this.registry.get(registryKey);
    if (!member) throw new EvidenceFsViolationError(`unknown registry key ${registryKey}`);
    const destination = validateRegistryDestination(member.destination);
    const bytes = Buffer.isBuffer(value) ? value : Buffer.from(value);
    if (bytes.length > MAX_ARTIFACT_BYTES) throw new EvidenceFsBlockedError("ordinary artifact exceeds 64 MiB cap");
    const finalPath = path.join(this.runRoot, destination);
    const parent = path.dirname(finalPath);
    const basename = path.basename(finalPath);
    assertDirectoryChain(parent, this.runRoot);
    if (existsSync(finalPath)) throw new EvidenceFsViolationError(`destination already exists ${destination}`);
    const parentBefore = this.native.directoryIdentity(parent);
    if (parentBefore.volumeSerial !== this.rootIdentity.volumeSerial) throw new EvidenceFsViolationError("cross-volume parent rejected");
    const tempPath = path.join(parent, `.${basename}.${randomBytes(8).toString("hex")}.tmp`);
    let fd;
    try {
      fd = openSync(tempPath, "wx", 0o600);
      writeSync(fd, bytes, 0, bytes.length, 0);
      fsyncSync(fd);
      const opened = fstatSync(fd);
      if (opened.nlink !== 1) throw new EvidenceFsViolationError("temporary hardlink rejected");
      if (opened.dev !== statSync(parent).dev) throw new EvidenceFsViolationError("cross-volume temporary rejected");
    } finally { if (fd !== undefined) closeSync(fd); }
    if (crashPoint === "after-temp-flush") throw new Error("U06_INJECTED_CRASH:after-temp-flush");
    const digest = sha256(bytes);
    if (expectedSha256 && expectedSha256 !== digest) throw new EvidenceFsViolationError("caller digest mismatch");
    const parentNow = this.native.directoryIdentity(parent);
    if (!sameIdentity(parentBefore, parentNow)) throw new EvidenceFsViolationError("validated parent identity changed");
    this.native.renameNoReplace(tempPath, parent, basename);
    if (crashPoint === "after-rename") throw new Error("U06_INJECTED_CRASH:after-rename");
    assertDirectoryChain(parent, this.runRoot);
    const parentFinal = this.native.directoryIdentity(parent);
    if (!sameIdentity(parentBefore, parentFinal)) throw new EvidenceFsViolationError("final parent identity changed");
    const finalStat = lstatSync(finalPath);
    if (!finalStat.isFile() || finalStat.isSymbolicLink() || finalStat.nlink !== 1) throw new EvidenceFsViolationError("final artifact identity rejected");
    if (finalStat.dev !== statSync(parent).dev) throw new EvidenceFsViolationError("final artifact volume mismatch");
    const finalIdentity = this.native.fileIdentity(finalPath);
    if (finalIdentity.volumeSerial !== this.rootIdentity.volumeSerial || finalIdentity.links !== 1) {
      throw new EvidenceFsViolationError("final native identity rejected");
    }
    const finalBytes = readFileSync(finalPath);
    const finalDigest = verifyFinalArtifactBytes({ sha256: digest, bytes: bytes.length }, finalBytes);
    return Object.freeze({
      schemaVersion: 1,
      capability: "win32-handle-relative-no-replace-v1",
      registryKey,
      relativePath: destination,
      sha256: finalDigest,
      bytes: finalBytes.length,
      nativeIdentity: Object.freeze({
        volumeSerial: finalIdentity.volumeSerial,
        rootIndexHigh: this.rootIdentity.indexHigh,
        rootIndexLow: this.rootIdentity.indexLow,
        parentIndexHigh: parentFinal.indexHigh,
        parentIndexLow: parentFinal.indexLow,
        fileIndexHigh: finalIdentity.indexHigh,
        fileIndexLow: finalIdentity.indexLow,
        links: finalIdentity.links,
      }),
    });
  }
}

export function validateRegistryDestination(destination) {
  if (typeof destination !== "string" || !SAFE_DESTINATION.test(destination) || INVALID_PATH.test(destination)
    || destination.includes("\\") || destination.includes(":") || destination.split("/").some((part) => part === "." || part === "..")) {
    throw new EvidenceFsViolationError("unsafe registry-generated destination");
  }
  return destination;
}

function createWin32Api() {
  let koffi;
  try { koffi = require(path.join(toolRoot, "node_modules", "koffi")); }
  catch { throw new EvidenceFsBlockedError("locked Koffi helper cannot load"); }
  const kernel32 = koffi.load("kernel32.dll");
  const FILETIME = koffi.struct("U06_FILETIME", { low: "uint32_t", high: "uint32_t" });
  const INFO = koffi.struct("U06_BY_HANDLE_FILE_INFORMATION", {
    attributes: "uint32_t", creationTime: FILETIME, accessTime: FILETIME, writeTime: FILETIME,
    volumeSerial: "uint32_t", sizeHigh: "uint32_t", sizeLow: "uint32_t", links: "uint32_t",
    indexHigh: "uint32_t", indexLow: "uint32_t",
  });
  const CreateFileW = kernel32.func("void * __stdcall CreateFileW(str16, uint32_t, uint32_t, void *, uint32_t, uint32_t, void *)");
  const CloseHandle = kernel32.func("bool __stdcall CloseHandle(void *)");
  const GetFileInformationByHandle = kernel32.func("bool __stdcall GetFileInformationByHandle(void *, _Out_ U06_BY_HANDLE_FILE_INFORMATION *)");
  const SetFileInformationByHandle = kernel32.func("bool __stdcall SetFileInformationByHandle(void *, int, const void *, uint32_t)");
  const GetLastError = kernel32.func("uint32_t __stdcall GetLastError()");
  const INVALID = koffi.address(CreateFileW("NUL", 0, 7, null, 3, 0, null));

  function open(filePath, access, flags) {
    const handle = CreateFileW(filePath, access, 7, null, 3, flags, null);
    if (!handle || koffi.address(handle) === INVALID) throw new EvidenceFsViolationError(`CreateFileW failed (${GetLastError()})`);
    return handle;
  }
  function directoryIdentity(directory) {
    const handle = open(directory, 0x80, 0x00200000 | 0x02000000);
    try {
      const info = {};
      if (!GetFileInformationByHandle(handle, info)) throw new EvidenceFsViolationError(`directory identity failed (${GetLastError()})`);
      if (info.attributes & 0x400) throw new EvidenceFsViolationError("reparse directory rejected");
      return { volumeSerial: info.volumeSerial, indexHigh: info.indexHigh, indexLow: info.indexLow, links: info.links };
    } finally { CloseHandle(handle); }
  }
  function fileIdentity(filePath) {
    const handle = open(filePath, 0x80, 0x02000000);
    try {
      const info = {};
      if (!GetFileInformationByHandle(handle, info)) throw new EvidenceFsViolationError(`file identity failed (${GetLastError()})`);
      if (info.attributes & 0x400) throw new EvidenceFsViolationError("reparse file rejected");
      return { volumeSerial: info.volumeSerial, indexHigh: info.indexHigh, indexLow: info.indexLow, links: info.links };
    } finally { CloseHandle(handle); }
  }
  function renameNoReplace(tempPath, parentPath, basename) {
    if (basename.length >= 512) throw new EvidenceFsViolationError("destination basename too long");
    const parent = open(parentPath, 0x00000001 | 0x00100000, 0x00200000 | 0x02000000);
    const temp = open(tempPath, 0x00010000 | 0x80, 0x00200000);
    try {
      const fileName = Buffer.from(basename, "utf16le");
      const info = Buffer.alloc((20 + fileName.length + 7) & ~7);
      info.writeUInt32LE(0, 0); // FileRenameInfoEx flags: no replace, no path fallback
      info.writeBigUInt64LE(koffi.address(parent), 8);
      info.writeUInt32LE(fileName.length, 16);
      fileName.copy(info, 20);
      if (!SetFileInformationByHandle(temp, 22, info, info.length)) throw new EvidenceFsBlockedError(`handle-relative no-replace rename unavailable (${GetLastError()})`);
    } finally { CloseHandle(temp); CloseHandle(parent); }
  }
  return { directoryIdentity, fileIdentity, renameNoReplace };
}

function assertDirectoryChain(directory, stop = path.parse(directory).root) {
  let current = path.resolve(directory);
  const resolvedStop = path.resolve(stop);
  while (true) {
    const entry = lstatSync(current);
    if (!entry.isDirectory() || entry.isSymbolicLink()) throw new EvidenceFsViolationError(`unsafe directory ancestor ${current}`);
    if (realpathSync.native(current).toLocaleLowerCase("en-US") !== current.toLocaleLowerCase("en-US")) throw new EvidenceFsViolationError(`case/alias path rejected ${current}`);
    if (current === resolvedStop) break;
    const parent = path.dirname(current);
    if (parent === current || !current.toLocaleLowerCase("en-US").startsWith(resolvedStop.toLocaleLowerCase("en-US"))) throw new EvidenceFsViolationError("directory containment escape");
    current = parent;
  }
}

export function assertStableIdentity(a, b) {
  if (!sameIdentity(a, b)) throw new EvidenceFsViolationError("opened identity changed");
  return true;
}

export function validateOpenedFileIdentity({ isFile, isSymbolicLink, nlink, dev }, parentDev) {
  if (!isFile || isSymbolicLink || nlink !== 1) throw new EvidenceFsViolationError("opened file identity rejected");
  if (dev !== parentDev) throw new EvidenceFsViolationError("cross-volume file rejected");
  return true;
}

export function verifyFinalArtifactBytes(expected, bytes) {
  const digest = sha256(bytes);
  if (digest !== expected.sha256 || bytes.length !== expected.bytes) throw new EvidenceFsViolationError("final artifact hash mismatch");
  return digest;
}

function sameIdentity(a, b) { return a.volumeSerial === b.volumeSerial && a.indexHigh === b.indexHigh && a.indexLow === b.indexLow; }
function sha256(bytes) { return createHash("sha256").update(bytes).digest("hex"); }
