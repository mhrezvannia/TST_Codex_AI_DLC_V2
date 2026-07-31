# U06 Isolated Acceptance and Preservation — Operator Guide

U06 is a non-deployable evidence harness. It never changes commercial authority,
the shared shell, `packages/ui`, or manager resources. A missing capability is
`BLOCKED`, an observed mismatch is `FAIL`, and later unsafe gates are linked
`SKIPPED`. Technical `PASSED` never records the later human AI-DLC approval.

## Prerequisites

- Node.js 24, Java 21/Maven, Yarn 4.5.3, Docker Compose, Playwright browsers,
  Bash, and at least 5 GiB free disk.
- The manager demo must be healthy at project `linercore-shared-platform` and
  edge `http://127.0.0.1:8088`.
- Koffi 2.14.1 and its Win32 x64 addon must match
  `tools/u06/evidence-tool-lock.json`. A native mismatch or unsupported
  `FileRenameInfoEx` capability blocks evidence; there is no path fallback.

## Commands

```powershell
node scripts/u06-freeze-boundary.mjs --status-stdin
node scripts/u06-generate-registry.mjs
node scripts/u06-acceptance.mjs --dry-run
npm run demo:guard
node scripts/wave-a-compose.mjs config
node scripts/wave-a-compose.mjs up -d --build
node --test --test-isolation=none tests/u06/*.test.mjs
npx playwright test --config tests/u06/playwright.config.mjs
```

The acceptance entry point owns the entire ordered lifecycle. Production-default
adapters use reviewed wrapper commands and bounded machine-readable observation
envelopes. Readiness, commercial, performance, security, observability,
preservation, quality, and audit observations use the fixed
`artifacts/u06/observations/<stage>.json` capability path. Each envelope pins its
stage, UTC observation time, closed registry order, typed proof, and artifact
payload kinds. Missing observations are `BLOCKED`; malformed, partial, reordered,
or validator-inconsistent observations are `FAIL`. Valid observations can reach
real `PASS` and publish through the U06 writer. `--dry-run` explicitly blocks
live mutation/observation and cannot produce `PASSED`.

Browser acceptance requires `U06_SIGNED_STORAGE_STATE` to reference a Playwright
storage-state file for an already signed-in edge session and
`U06_SIGNED_SESSION_SUBJECT` to name the observed subject. Set
`U06_BROWSER_SCENARIO_MODULE` to a repository-contained module exporting
`routeFixtures`, `prepareScenario`, and `assertScenario`; alternatively set
`U06_BROWSER_DRIVER_MODULE` to a complete driver exporting
`createU06BrowserDriver`. The adapter resolves every parameterized route before
navigation, drives the exact 76 reviewed cells and named states, observes axe,
keyboard/focus geometry, live regions, reduced motion, edge-only network origins,
correlation, screenshots, and real trace entries, then publishes through the U06
writer/ledger/manifest. Playwright attachments are not acceptance publication.
Missing signed-session, scenario, axe, browser, route, or trace capability is
`BLOCKED`, never a smoke-test pass.

All Compose mutations, `exec`, logs, restart, stop, and optional cleanup use
`node scripts/wave-a-compose.mjs`. Raw Docker is read-only manager inventory
only. Never override `DEMO_COMPOSE_PROJECT` or `DEMO_EDGE_URL`, use manager port
8088 for acceptance, or substitute alternate ports/topologies.

## Ordered lifecycle

1. Freeze dirty-tree/protected-input hashes and require the 5 GiB reserve.
2. Run the default pre-guard and read-only manager fingerprint.
3. Validate Wave A project `linercore-wave-a`, network, and edge 18088.
4. Start with wrapper `up -d --build`; enforce ten-minute stack and 120-second
   authenticated service readiness bounds.
5. Run separate Charge/Booking migration, backup, restore, commercial,
   security, observability, browser, performance, preservation, quality, and
   audit gates.
6. After any possible Wave A mutation, enter a non-short-circuiting recovery
   lane. Teardown, manager post-guard, after-inventory, and exact fingerprint
   comparison all execute even when startup or a later gate is `FAIL`/`BLOCKED`.
   A proven unstarted `spawnSync docker EPERM` does not trigger another Docker
   attempt.
7. Rehash ledger artifacts and derive the immutable manifest.

`PASSED` is possible only with the exact pinned 120-member registry digest, all
required terminal gate IDs, all 120 terminal PASS results, nonempty mandatory
artifacts, zero blockers, and a manifest whose immutable version and pointer are
reopened and checked for exact byte length and SHA-256. Partial/empty subsets,
unknown or `RUNNING` statuses, and trusted validation booleans are rejected.

Restore targets are separately generated as `w203_restore_charge_*` and
`w203_restore_booking_*`, use administrative database `postgres`, require
source/target/other-target OID inequality and run-owner markers, and never
address a source or manager database. Cleanup is allowed only after all guards
are revalidated. Applied migrations are never edited/down-migrated; recovery is
a new-target restore or later forward repair.

Migration evidence uses quiet, tuple-only `psql` JSON rows rather than formatted
table text. It observes database OIDs, starting/catalog shape, the Flyway
catalog, exact on-disk migration SHA-256 values, legacy fingerprints, restart
catalog stability, and a rolled-back immutable-row mutation attempt. Restore
guards query real OIDs before creation, write and query a
`U06:<OWNER>:<run-id>` database marker, compare source/restored catalog hashes,
drop the isolated target in `finally`, and query again to prove cleanup.

## Evidence tree

```text
artifacts/w2-03-live/<run-id>/
  ledger.log
  manifest.<sequence>.<sha256>.json
  manifest.json
  blockers.jsonl
  results/<category>/<registry-id>.json
  quarantine/index.json
```

The registry has exactly 120 results. Raw browser trace ZIPs exist only in the
restricted temporary area outside the evidence root. Only entry-sanitized,
deterministically recompressed, expanded, rescanned archives may be indexed.
Unsafe/corrupt/encrypted/oversized archives are BLOCKED and never published.
Acceptance never auto-deletes run roots. Any future retention action must be an
explicit dry-run/guarded operation preserving the latest ten roots per status.

Adapters receive no raw output path. They receive a restricted publication
capability keyed by a reviewed registry member. Each physical cell envelope is
committed once through handle-relative no-replace publication and returns a typed
receipt containing writer scheme, native volume/root/parent/file identity, link
count, digest, and byte length. The runner accepts only receipts issued by its
capability; ledger and manifest validation reject missing, mismatched, or
caller-fabricated receipts.

## Interpretation and audits

- `BLOCKED`: capability unavailable (Docker/browser/native helper/toolchain),
  with blocker, command, output, impact, owner, and next action.
- `FAIL`: the capability ran but an assertion, value, identity, timeout, hash,
  security, or manager comparison mismatched.
- `SKIPPED`: not executed after a named earlier BLOCKED/FAIL record.
- `PASSED`: every closed result/hash/guard is green and no blocker remains;
  this only makes the intent eligible for the separate human approval gate.

Run both detector commands exactly:

```text
bash .claude/skills/aidlc-audit/detectors.sh
bash .claude/skills/erp-fidelity-audit/detectors.sh
```

Detector zero is only a lead list. Every required manual seam records severity,
`file:line`, scenario, reviewer, disposition, and completion before audit PASS.
