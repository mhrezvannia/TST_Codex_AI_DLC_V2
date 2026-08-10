# Deployment Architecture — U06 Isolated Acceptance and Preservation

## Inputs and decision

This design consumes `performance-design.md`, `security-design.md`,
`scalability-design.md`, `reliability-design.md`, `logical-components.md`,
`components.md`, `services.md`, and `business-logic-model.md`.

U06 is a checked-in Node/Java/Playwright evidence package, not a deployable.
It creates no service, image, database authority, cache, queue, topic, route,
port, cloud resource, or UI. All application mutations occur only in Compose
project `linercore-wave-a` through `scripts/wave-a-compose.mjs`; human/browser
proof uses edge `http://127.0.0.1:18088`.

## Environment and network topology

The runner first executes `npm run demo:guard` with default manager settings
and captures read-only manager inventory. Rendered Wave A config must show the
exact project/network, loopback bindings, nginx 18088, no published 8088, and
no manager label. Raw Docker is permitted only for read-only inventory; every
config/up/exec/log/restart/teardown mutation uses the wrapper.

Wrapper `up` is bounded to 10 minutes. Each service restart/readiness plus
authenticated probe is bounded to 120 seconds with monotonic 1-second polling
backing off to at most 5 seconds. No alternative port/topology is a fallback.

## Evidence storage architecture

Each attempt exclusively creates
`artifacts/w2-03-live/<utc-random-run-id>/`. `acceptance-registry.json` alone
maps closed IDs to generated sanitized category/basenames; callers provide no
paths. Same-volume exclusive temp files require `nlink=1`, no reparse/junction/
symlink/ADS/device/UNC alias, stable opened-parent identity, atomic same-dir
rename, final reopen, and SHA-256 verification.

On Windows, checked-in Node module `tools/aidlc-evidence-fs.mjs` is the only
commit writer. It uses lockfile-pinned `koffi` FFI; the package/native-binary
SHA-256 is verified from the evidence-tool lock before loading. It opens the run root
and category parents using `CreateFileW` with
`FILE_FLAG_OPEN_REPARSE_POINT|FILE_FLAG_BACKUP_SEMANTICS`, verifies volume/file
IDs and reparse state with `GetFileInformationByHandleEx`, creates the temp
exclusively, and calls `SetFileInformationByHandle(FileRenameInfoEx)` with the
validated parent as `RootDirectory`, a relative registry basename, and no
replace flag. It then reopens relative to that handle and revalidates final
link count=1, volume/file/parent IDs, reparse state, and SHA-256. The Node driver
cannot fall back to path-based rename; missing/helper-digest mismatch is
BLOCKED. Parent-swap, hardlink, junction, case, device, UNC, and ADS fixtures
must fail.

Canonical ledger records are length/hash framed and synchronously flushed.
Recovery truncates a torn tail, reconciles renamed-but-unindexed artifacts,
quarantines mismatches, regenerates immutable versioned manifests from ledger
truth, and atomically republishes `manifest.json`. Repeated finalization is
idempotent and cannot turn BLOCKED/FAILED into PASSED.

## Restore topology

Charge and Booking use separate generated targets:
`w203_restore_charge_<utcRunId>_<random8>` and
`w203_restore_booking_<utcRunId>_<random8>`. Administrative connections use
only database `postgres` on the allow-listed Wave A host/project. Charge maps
source `linercore_pricing`, its owner role, and backup digest to the Charge
target; Booking independently maps `linercore_booking`, its owner role, and
backup digest to the Booking target.

Before either mutation, the runner records that service's source name/OID/
owner/backup, proves its target absent and unequal to both sources and the other
target, then wrapper-creates it and verifies a service+run owner marker/new OID.
Every restore/probe command names the applicable target.

Each cleanup record is separate and revalidates service, name, marker, target
OID, both source OIDs, and other-target inequality. A failed guard leaves that
target for manual cleanup. Source databases are never restore
targets. U06 consumes the U01–U05 recovery artifacts and additionally proves
integrated Charge/Booking restore, restart, replay, and immutable hashes.

## Resource and acceptance boundary

The driver has a fixed 10-worker pricing pool, at most 4 browser workers, one
ordered writer queue capped at 256 records, and at most 14 pending futures.
HTTP responses are capped at 1 MiB, each command log at 32 MiB, each ordinary
artifact at 64 MiB, and per-run non-trace logs at 512 MiB.

Each trace ZIP is capped at 2,048 entries, 64 MiB compressed, 256 MiB expanded,
32 MiB per entry, and compression ratio 20:1 before expansion. Raw-trace temp
is capped at 512 MiB, the immutable run root at 2 GiB, and startup requires a
5 GiB free reserve. Limit breach BLOCKS before allocation/expansion.

Raw trace temps carry a run-owner marker and exclusive active lock. Startup
enumerates only that fixed temp root; a stale entry is removed only after
marker validation and a successful nonblocking lock proves no active owner,
and cleanup metadata—not content—is recorded. Acceptance never auto-deletes
run roots. A separate explicit guarded retention command may remove terminal
roots older than 30 days while preserving the latest 10 of each status, after
manifest/hash/path checks and dry-run; acceptance never invokes it.
Serial gates include guards, migration/restore, seeding, conflicting mutations,
restart, teardown, audits, and manifest. Only fixture-isolated read/browser
cells may use a configured bounded pool.

Exactly 100 fresh known-rate calls (50 Agreement/50 Tariff), exactly 100 fresh
no-rate calls (25 each missing subtype), and a separate 100-call replay set are
required. Fresh subtype and aggregate nearest-rank p99 must be <=800 ms.
Technical PASSED is derived only after all closed IDs, hashes, guards, security,
quality, audit/manual, resource, restart, and preservation checks pass; human
approval remains outside the manifest.

## Review

**Verdict: NOT-READY — iteration 1**

### Blockers

1. **Restore identity is singular although two service-owned databases are
   restored.** Charge and Booking are dumped independently, but every artifact
   describes one `w203_restore_<run>_<random>` target. Define one generated
   target, source name/OID, administrative connection database, owner role,
   backup mapping, manifest record, and guarded cleanup record per service.
   Otherwise an implementer must choose whether the second restore shares,
   replaces, or bypasses the first target, defeating database isolation and the
   source-not-target proof.
2. **The Windows containment contract does not name an executable handle
   strategy.** Rechecking a parent and then performing Node's path-based rename
   leaves a parent-swap/hardlink race. Specify the Windows API/library that
   opens parents without following reparse points and commits relative to the
   validated handle, or establish an exclusive ACL boundary that removes the
   attacker race. Revalidate final `nlink`, volume, reparse state, parent/file
   identities, and hash after rename.
3. **Evidence and trace resource limits are asserted but not quantified.**
   Pricing workers are fixed at ten, but browser workers, writer queue/pending
   futures, response/log/file bytes, ZIP entry count, compressed and expanded
   trace sizes, compression ratio, total temporary/run-root disk, and retention
   are unspecified. The sanitizer can therefore be exhausted by a ZIP bomb or
   large trace before it can BLOCK the cell. Define numeric hard limits and
   cleanup/retention gates, including startup recovery of access-restricted raw
   trace temporaries left by a crash.
4. **The closed registry has counts, not a complete implementable membership.**
   The 120 result cardinality is internally consistent, but the six security
   IDs lack an ID-to-scenario table, the 33 functional-state IDs and naming
   scheme are not enumerated, and the ten owned route patterns/five edge
   regressions are not listed. Check in or specify the exact registry members,
   route values, ID grammar, required links, and legal-SKIPPED dependency for
   each member; cardinality alone still lets two implementations test different
   systems.
5. **Charge migration ownership overlaps.** `shared-infrastructure.md` assigns
   “Rate/Charge V1–V4” to U01 while also assigning agreement/outbox to U03 and
   pricing/cases to U04. Split the supplied backup/migration/probe contracts by
   authoritative unit (including V1/V2/V3/V4 ownership) so U06 knows which unit
   must repair a failed catalog or recovery assertion.

### Non-blockers

- The framed, synchronously flushed ledger, orphan quarantine, immutable
  manifest versions, and derived publication protocol close the principal
  crash-consistency paths without allowing FAILED/BLOCKED to become PASSED.
- Exact fresh populations (50/50 known-rate, four 25-sample no-rate subtypes,
  and separate 100 replay calls), nearest-rank calculations, ten pricing
  clients, and restart/readiness deadlines are coherent.
- Wrapper-only mutation, signed-edge browser traffic, owner-local database
  queries, trace entry sanitation, fail-closed capability handling, and
  pre/post manager equality form sound isolation and security boundaries once
  the blockers above are made executable.

### Validation

- All five required outputs exist; required-sections passed with H2 counts
  5/6/5/5/5, and every output names all eight declared consumed artifacts.
- No fenced or TypeScript/TSX/JavaScript snippets are present, so the code-shape
  lint/type-check sensors are inapplicable.
- The registry category counts sum to 120 and the CI ordering accounts for each
  category exactly once; the membership gap is the blocker described above.
- Repository verification confirms `scripts/wave-a-compose.mjs` hardcodes the
  Wave A env/project and passes Compose verbs through, so config/up/exec/logs/
  restart/down are available. Safety therefore depends on the U06 command and
  target allow-lists rather than enforcement by the wrapper itself.
- Manager 8088/project preservation, U01–U05 data-authority separation, and
  W2-02 shell/UI/nginx non-mutation otherwise cross-reference correctly.

### Iteration 2

**Verdict: READY**

#### Blockers

None.

#### Validation

- **PASS — restore isolation:** Charge and Booking now have distinct generated
  targets, source/target/other-target OID guards, `postgres` administrative
  connection, service-owner roles, backup mappings, owner markers, manifest
  entries, and separately guarded cleanup. Repository configuration resolves
  the owner roles to `linercore_pricing` and `linercore_booking`; neither source
  can be addressed as a restore or cleanup target.
- **PASS — executable Windows containment:** the sole writer is a checked-in
  module using lockfile-pinned and digest-verified `koffi`, `CreateFileW`,
  `GetFileInformationByHandleEx`, and handle-relative no-replace
  `SetFileInformationByHandle(FileRenameInfoEx)`. Final link,
  volume/file/parent, reparse, and hash checks are explicit; missing or
  mismatched native support BLOCKS with no path-based fallback.
- **PASS — quantitative resource safety:** pricing/browser workers, writer
  queue, pending futures, responses, command logs, artifacts, non-trace logs,
  ZIP entries/compressed/expanded/per-entry/ratio, raw temp, run root, and
  free-disk reserve all have numeric ceilings. Marker+lock stale-temp recovery
  and guarded 30-day/retain-ten terminal-root cleanup close crash and retention
  behavior without touching active or unowned paths.
- **PASS — closed registry:** literal security, 33 functional-state, 40
  structural, preservation, commercial, design, observability, quality, and
  audit members are defined. The category total remains 120; all ten owned
  routes and five edge regressions are listed, and per-member dependencies,
  artifacts, correlation requirements, and legal-SKIPPED linkage are explicit.
- **PASS — ownership:** U01 is the physical Charge V1–V4 Flyway/catalog/
  checksum-repair owner; U03 and U04 own only their V3/V4 behavior and probes.
  U05 Booking, U06 evidence, W2-02 UI/nginx, and protected manager boundaries
  remain non-overlapping.
- **PASS — overall coherence:** wrapper-only mutation, ledger/manifest crash
  recovery, trace sanitation, exact performance populations, manager before/
  after equality, owner-local evidence, and technical-versus-human gate
  separation remain consistent across all eight inputs and five outputs.
- **PASS — sensors:** required-sections passed with H2 counts 6/6/5/5/5 before
  this subsection; every output references all eight consumes. No fenced or
  TypeScript/TSX/JavaScript snippets are present, so code-shape lint/type-check
  checks are inapplicable.
