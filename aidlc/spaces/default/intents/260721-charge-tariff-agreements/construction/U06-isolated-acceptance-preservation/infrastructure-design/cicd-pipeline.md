# CI/CD Pipeline — U06 Isolated Acceptance and Preservation

## Inputs and pipeline boundary

This pipeline consumes `performance-design.md`, `security-design.md`,
`scalability-design.md`, `reliability-design.md`, `logical-components.md`,
`components.md`, `services.md`, and `business-logic-model.md`.
U06 is the guarded full-stack release-evidence job; it does not deploy a
production environment or approve release.

## Ordered gates

1. freeze commit/dirty/runtime provenance and hash prior-wave evidence/waiver;
2. run pre-manager guard/inventory and validate rendered Wave A isolation;
3. build/test/scan images and execute empty/legacy/drift migration matrices;
4. create/checksum owner backups and guarded isolated restores;
5. start/seed Wave A and execute the 13 commercial IDs;
6. execute the 40 structural, 33 state, 3 design-dependency, and 6 security
   browser cells through signed edge 18088;
7. run exact fresh/replay performance and three-cycle resource/query gates;
8. restart and prove RPO-0 replay/history/deduplication;
9. run 5 preservation, 6 observability, 10 quality, and 4 audit/manual IDs;
10. capture logs/DB evidence, guarded teardown, post-manager equality, rehash,
    closed-registry compilation, and derived manifest finalization.

A terminal FAILED/BLOCKED gate writes legal SKIPPED records for later unsafe
IDs. One failure is never retried into green within the run.

## Build, security, and quality

Lockfile builds run backend/frontend tests, provider/consumer contracts,
migration suites, changed-code coverage >=80%, lint/typecheck/build, nginx
regression, Playwright/axe, performance, restart/restore, and `git diff --check`.
Pinned report-first SAST/secret/vulnerability/license/SBOM gates use the closed
current-UTC waiver policy.

CI verifies the lockfile and native SHA-256 for `koffi`, then runs Win32 FFI
contract tests for handle-relative no-replace rename and final identity checks.
Missing/digest-drifted FFI support blocks Windows evidence; path-based rename
is not a fallback.

Both `aidlc-audit` and `erp-fidelity-audit` require detector output plus every
manual seam disposition with severity/file:line/scenario. Exit zero with an
unreviewed lead is not green.

## Evidence publication and crash tests

Pipeline tests inject crashes before/after temp write, sync, rename, hash,
ledger frame, manifest version, and publication. Recovery must truncate only a
torn tail, reconcile or quarantine orphans deterministically, and republish the
same manifest status/hash idempotently. Windows reparse/hardlink/parent-swap/
case/device/UNC/ADS attack fixtures must fail containment.

Trace fixtures cover safe, cookie/token/body-bearing, unknown, encrypted,
corrupt, and sanitizer-failure archives. Only fully sanitized and rescanned ZIPs
may enter the ledger. ZIP-bomb/entry-count/ratio/disk fixtures prove the exact
2,048-entry, 64/256/32-MiB, 20:1, 512-MiB temp, 2-GiB root, and 5-GiB reserve
bounds. Startup cleanup proves stale raw traces require a valid run marker and
an acquirable inactive lock; active/unowned paths are untouched.

## Promotion and recovery

Technical PASSED requires both manager guards/inventories equal, every required
registry ID closed, every artifact rehashed, no unresolved blocker/security/
audit lead, and all commercial/performance/restart/resource gates passing.
There is no automated application rollback: migrations are forward-only;
recovery is candidate restart, later repair, or guarded new-target restore.
Charge and Booking use distinct targets, source/target OIDs, owners, backups,
manifest records, and guarded cleanup records as defined in
`deployment-architecture.md`.

The immutable manifest contains source/images/SBOM/scans, rendered config,
manager fingerprints, backup/restore identities, Flyway/catalog/data hashes,
registry/results, raw performance/resource/query/browser evidence, redaction,
audit dispositions, and prior-manifest link. Human AI-DLC approval remains a
separate later gate.
