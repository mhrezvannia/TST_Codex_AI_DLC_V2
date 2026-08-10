# Business Rules - U06 Isolated Acceptance and Preservation

## Run safety and truth rules

| ID | Rule | Enforcement/evidence |
| --- | --- | --- |
| BR-U06-001 | U06 produces tests, scripts, and evidence only; it introduces no deployable or commercial fallback. | Changed-path allowlist and architecture review. |
| BR-U06-002 | `npm run demo:guard` runs before and after acceptance with its default manager project and `http://127.0.0.1:8088`. | Two command records plus manager inventory fingerprints. |
| BR-U06-003 | No acceptance command targets, stops, restarts, rebuilds, or reconfigures port 8088 or the manager Compose project. | Command ledger and before/after inventory equality. |
| BR-U06-004 | All Compose commands use `node scripts/wave-a-compose.mjs`; the rendered project is exactly `linercore-wave-a` and edge is 18088. | Wrapper-command allowlist and rendered-config assertions. |
| BR-U06-005 | A missing observation is `BLOCKED`; a mismatch is `FAIL`; neither may be represented as `PASS`. | Manifest schema/validator. |
| BR-U06-006 | A later verified W1 run is separate from the original blocked/waived record. The original wording, bytes, path, and status are not changed. | Protected-file hashes before/after and explicit manifest fields. |
| BR-U06-007 | W2-02 pending acceptance and DS-01/02/03 are reported exactly as observed. U06 cannot waive them or edit shared UI/shell ownership. | Diff allowlist plus browser-cell statuses. |
| BR-U06-008 | Every command record contains command ID, redacted invocation, start/end, exit code, status, output path, and mapped requirements. | Evidence validator. |
| BR-U06-009 | Secrets, cookies, tokens, customer payloads, and commercial amounts are excluded from logs/labels; evidence stores only necessary expected/observed amounts. | Redaction scan and audit review. |
| BR-U06-009A | Exactly one blocking preservation result exists for each of W0-01, W0-02, W1-01, W2-01, and W2-02; unavailable/incompatible validation is BLOCKED, never omitted. | Closed-set manifest validation. |
| BR-U06-009B | Security evidence covers allowed human, denied/no-disclosure, spoofed browser authority, missing service identity/permission, missing secret, and non-local bypass rejection. | Closed security matrix; every cell blocking. |
| BR-U06-009C | Observability evidence links safe correlated logs and before/after metric deltas for latency, terminal outcome, basis, manual fallback, and replay/conflict; redaction scans are green. | Typed observability record and scenario references. |

## Migration and integrity rules

| ID | Rule | Enforcement/evidence |
| --- | --- | --- |
| BR-U06-010 | Charge migrations are exact V1 adoption followed by additive V2 rate, V3 agreement/backfill, and V4 terminal evidence; Booking uses its next ordered additive migration. | Flyway histories/checksums from baseline and empty fixtures. |
| BR-U06-011 | Only an exact complete nonempty Charge legacy catalog may baseline at V1; partial/drifted catalogs abort startup. | Positive and negative live migration tests. |
| BR-U06-012 | Legacy agreement backfill identity is deterministic `av-` + `md5(id:version)`, preserves legacy values, marks `LEGACY`, and creates no invented W2 rate links. | Before/after row evidence and repeat-upgrade hash. |
| BR-U06-013 | Existing Booking flattened snapshots remain readable in place and are not transformed into synthetic itemised rows. | Old-fixture API/UI test and DB absence assertion. |
| BR-U06-014 | Approved rate/agreement versions, activity, and Booking typed snapshots are immutable and exact-decimal across successor and restart. | Mutation rejection plus canonical row hashes/value comparison. |
| BR-U06-015 | Applied migrations are never edited or rolled back destructively. Recovery uses a verified pre-upgrade backup in a new isolated database or a later forward-repair migration. | Recovery report and restore/repair rehearsal. |
| BR-U06-016 | Restart/replay cannot duplicate a pricing receipt, OPEN case, or Booking snapshot and cannot partially persist a price. | Fault/restart scenario counts and payload hashes. |

## Commercial scenario rules

| ID | Rule | Enforcement/evidence |
| --- | --- | --- |
| BR-U06-017 | Agreement resolution wins over tariff and uses the exact approved linked versions. | Agreement scenario API/DB/Booking comparison. |
| BR-U06-018 | Tariff fallback requires exactly one OFR, BAF, and THC; a success has exactly three ordered BASE/OFR, SURCHARGE/BAF, LOCAL/THC lines. | Tariff scenario and bilateral contract assertions. |
| BR-U06-019 | Amounts are seeded decimal USD unit rate times positive equipment quantity, rounded HALF_UP per line; total is the sum of rounded lines. | Independent expected-value fixture and JSON/DB/UI equality. |
| BR-U06-020 | Reprice follows a pricing-affecting amendment, creates a new current immutable snapshot, preserves prior history, and never hides a Charge call inside Reconfirm. | Correlated request counts and history hashes. |
| BR-U06-021 | No applicable authority returns terminal 404 `NO_RATE`, exactly one replayable OPEN Charge case, and Booking `MANUAL_PRICING_REQUIRED` with no current total. | API/status, owner-local DB, replay, and UI proof. |
| BR-U06-022 | Agreement/rate ambiguity remains 422 with its exact reason and Charge case; outage/circuit evidence remains Booking-local with no Charge case. | Focused integration/fault matrix. |
| BR-U06-023 | Disabling Charge can never produce a newly priced Booking, hardcoded amount, cached fallback, or fabricated line. | Fault scenario and absence checks. |
| BR-U06-024 | Each live scenario must link a unique correlation across edge/API, Booking, Charge, owner-local DB evidence, logs, and UI. | Correlation proof validator; no cross-DB join. |

## UI, performance, and release rules

| ID | Rule | Enforcement/evidence |
| --- | --- | --- |
| BR-U06-025 | Playwright covers 375, 768, 1024, and 1440 px in light and dark for representative Charge and Booking page/state families. | Matrix JSON, screenshots, and trace index. |
| BR-U06-026 | Keyboard/focus, loading/empty/error/denied/manual/in-progress states, no-overlap, and critical/serious axe assertions are blocking. | Assertion JSON and accessibility report. |
| BR-U06-027 | Charge-owned pages may use only Charge-local composition and the existing design system; no `packages/ui`, shared shell, navigation, typography, or palette redesign is accepted. | Git diff allowlist and ERP fidelity review. |
| BR-U06-028 | Known-rate and no-rate sets each retain at least 100 measured post-warm-up samples using a distinct namespace and unique valid provider key per sample. Each sample is a non-replayed distinct terminal receipt; each no-rate request has exactly one deduplicated case. Duplicate/replayed/unexpected results fail and remain counted. | Raw sample, receipt/case, and uniqueness validator. |
| BR-U06-029 | Nearest-rank p99 for each measured set is at most 800 ms with host, commit, concurrency, warm-up, and count recorded. This is only a provisional isolated-local target. | Recomputed summary from raw samples. |
| BR-U06-030 | Changed Charge and Booking code has at least 80% line coverage and all required build/lint/type/unit/integration/contract/migration/browser regressions pass. | Quality command ledger and coverage reports. |
| BR-U06-031 | `aidlc-audit` and `erp-fidelity-audit` require detector exit zero and completed manual reviews with every lead/finding dispositioned. | Two reports linked to live evidence. |
| BR-U06-032 | Technical `PASSED` requires all required artifact hashes, exactly-once scenario/preservation/security/matrix IDs, zero blockers, both manager guards, and all technical gates green. It only makes the intent eligible for the separate later AI-DLC human release gate. | Manifest validator; human gate remains outside this predicate. |

## Command boundary

Permitted Compose forms are `node scripts/wave-a-compose.mjs config`, `up`,
`ps`, `logs`, `exec`, `restart`, `stop`, and isolated cleanup as explicitly
recorded. Raw `docker` may be used only for read-only manager inventory needed
to prove BR-U06-003; it cannot mutate a container, image, network, or volume.
Direct database evidence uses service-owned credentials through a checked-in
redacting harness or wrapper `exec`; no password is written to artifacts.

The audits run exactly:

- `bash .claude/skills/aidlc-audit/detectors.sh`
- `bash .claude/skills/erp-fidelity-audit/detectors.sh`

Their output is a lead list, not the final verdict. The corresponding SKILL
manual checks are required before BR-U06-031 can pass.

## Upstream trace

BR-U06-001-009C cover FR-702-FR-703 and NFR-004/NFR-009/NFR-010;
BR-U06-010-016 cover FR-701 and NFR-002-NFR-005; BR-U06-017-024 cover
FR-704 and FR-401-FR-507; BR-U06-025-032 cover FR-705-FR-706,
NFR-001/NFR-006-NFR-009, and QC-01-QC-03.
