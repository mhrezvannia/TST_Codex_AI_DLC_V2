# Code Summary — U03 Agreement Authority

## Outcome

U03 implements versioned W2 Agreement authority across the Charge domain,
application, unchanged V3 persistence, strict dual-media REST boundary, additive
lifecycle events, the U02 BFF, and Charge-local LinerCore pages. The approved
plan has 56 of 77 items complete. The remaining 21 items are explicitly blocked
or unobserved; no release or live-runtime pass is inferred.

The existing U01 V1–V4 migrations were not edited. The bounded relay remains
disabled because V3 lacks a safe total text-to-JSON classifier for arbitrary
legacy snapshots; no unsafe cast, startup DDL, dual claiming, or migration
rewrite was introduced.

## Files Created or Modified

### Domain, application, and persistence

- Added the framework-free `domain/agreement` aggregate, version/link/activity
  value model, lifecycle enums, invariants, canonical approval key, and tests.
- Added typed Agreement commands, views, errors, authorization/reference/rate
  ports, transactional application service, and focused tests.
- Added fail-closed Identity/Reference adapters and one-query RateVersion
  validation for exactly three Approved OFR/BAF/THC links.
- Added W2 Agreement JDBC command/admin repositories over the unchanged V3
  schema, with optimistic Draft writes, advisory-lock approval, locked
  revalidation, inclusive-overlap detection, atomic activity/outbox behavior,
  LEGACY isolation, dual reads, and Docker-gated PostgreSQL tests.

### REST, contracts, and events

- Preserved explicit default-JSON LEGACY behavior and added exact
  `application/vnd.linercore.charge-agreement-v2+json` routing for W2
  list/create/detail/update/successor/approve/suspend/expire operations.
- W2 commands consume only the verified U02 request-subject attribute.
  Vendor reads may expose a LEGACY discriminator, while every LEGACY mutation
  fails with `LEGACY_AGREEMENT_READ_ONLY`.
- Extended Charge OpenAPI additively with W2 schemas and nested lifecycle
  routes.
- Extended five lifecycle Avro schemas with nullable/default-null W2 fields.
  Existing 1.0 fields, Kafka agreement key, and legacy compatibility remain.

### BFF and Charge UI

- Aligned U02 fixed Agreement policies and strict schemas without weakening its
  bounded admission, assertion, cancellation, origin, media, or error boundary.
- Added Agreement client/server seams and Charge-owned list, create, edit,
  detail, version history, rate-link, activity, and lifecycle-action pages.
- Implemented read-only LEGACY behavior, pending/validation/conflict/error
  states, evidence-bearing approval, focus/error handling, and LinerCore
  responsive/accessibility source behavior without editing `packages/ui` or the
  shared shell.
- Added focused BFF/schema/client/page/component tests and repaired stale U01/U02
  expectations to their intended safe-normalization behavior without changing
  production semantics.

### Runtime and evidence

- Added U03 preservation, performance-contract, quality-gate, and Playwright
  harnesses plus `docs/u03-agreement-authority.md` and contract documentation.
- Updated isolated Wave A Identity/Reference/token configuration while
  preserving loopback nginx port 18088 and avoiding manager port 8088.
- Added evidence that separates source/configuration passes from blocked live
  upgrade, restart, rollback, performance, browser, and accessibility cells.

## Key Decisions

1. An Agreement has one Draft and exactly three distinct Approved RateVersion
   links: BASE/OFR, SURCHARGE/BAF, and LOCAL/THC.
2. Approved versions are immutable. Corrections create successors; approval and
   terminal transitions are serialized and recorded with atomic activity.
3. Authorization precedes lookup. Approval revalidates references and
   RateVersions inside the repository lock/transaction.
4. Default JSON remains LEGACY; W2 is vendor-media only with no fallthrough.
5. U02-derived request keys are not represented as persisted Agreement command
   idempotency.
6. U03 implements no U04 pricing or Booking behavior and changes no shared UI
   ownership surface.

## Traceability

| Scope | Implementation |
|---|---|
| US-01 / US-04 / US-05 | Versioned Agreement create, edit, approve, successor, suspend, expire, read, and audit |
| US-13 / US-14 | Verified-subject BFF routing and Charge-local operational UI |
| US-15 | Additive Agreement lifecycle event/outbox contract |
| FR-201–FR-205 | Agreement authority, link validation, lifecycle, concurrency, and history |
| FR-001–FR-004 | Fail-closed identity, references, media, and trusted actor propagation |
| NFR-001–NFR-010 | Integrity, security, compatibility, performance contracts, accessibility source, and rollback evidence |

## Validation Evidence

| Check | Result |
|---|---|
| Charge frontend Vitest | PASS — 22 files / 96 tests |
| Focused U03 UI/BFF | PASS — 8 files / 20 tests |
| TypeScript type-check | PASS |
| Charge lint | PASS — zero warnings/errors |
| Next 15.5.19 production build | PASS |
| Charge Maven reactor | PASS — 113 reported, 95 executed, 18 Docker skips |
| Identity Maven | PASS — 20/20 |
| Controller/legacy compatibility | PASS — 8/8 |
| Kafka serde | PASS — 2/2 |
| Contract catalog / verification | PASS — 13 seams; 194 checks |
| U03 performance contract | PASS — 3/3 evaluator tests; no measured SLO claim |
| U03 and U02 preservation | PASS — 1/1 each |
| Demo guard / Wave A config | PASS |
| `git diff --check` | PASS |
| PostgreSQL/broker/live upgrade and concurrency | BLOCKED — Docker unavailable |
| Measured isolated-stack performance | BLOCKED — no measured runtime input |
| Playwright/WCAG/DS-01/02/03 | UNOBSERVED — 11 cases skipped without live base URL |
| Full security quality gate | BLOCKED — authoritative U02 toolchain lock absent |

## Deviations and Residual Work

- Relay Step 10 remains completely unchecked. An owner-approved forward
  migration must supply a safe classifier before bounded relay ownership can
  be implemented.
- Strict expanded client-schema/fixture coverage, broader component/recovery
  matrices, and live DS evidence remain open where the approved plan requires
  runtime proof rather than source inspection.
- PostgreSQL advisory-lock, rollback, backfill, restart, and broker evidence
  compiles but is Docker-skipped.
- Measured latency/resource evidence, live Playwright screenshots/accessibility,
  `aidlc-audit`, and `erp-fidelity-audit` remain required later; they are not
  claimed by this unit.

## Completion Assessment

U03 is source-complete for the safe portion of Agreement Authority and has green
executable static, unit, contract, compatibility, build, and preservation
evidence. Relay activation and live acceptance remain blocked by explicit
external dependencies and must stay fail-closed.

## Iteration 1 Remediation

### Relay activation boundary

- Changed the application-local fallback for
  `CHARGE_AGREEMENT_OUTBOX_RELAY_ENABLED` to `false`, supplied an explicit
  `false` value in the Wave A Compose service and environment example, and made
  the relay bean require an explicit `true` property with
  `matchIfMissing = false`.
- Added an application-context test proving that an absent or explicitly false
  relay property creates no `ScheduledOutboxRelay`, while an explicit true
  property creates exactly one claimant.
- Extended the U03 preservation check to require the opt-in bean condition,
  exactly one legacy claimant declaration, explicit false runtime
  configuration, and no enabled Compose claimant.
- No relay SQL, migration, classifier, or claiming algorithm was added. The V3
  relay remains disabled pending a safe classifier and atomic claim ownership.

### Lifecycle and form accessibility

- Routed approve, suspend, and expire through an evidence-bearing confirmation
  dialog that identifies the Agreement, immutable version, expected row
  version, and lifecycle consequence before accepting a required reason.
- Added focus containment, safe Escape handling, trigger-focus restoration,
  pending-state announcement, and synchronous duplicate-submit/dismiss
  prevention. Stabilizing the dialog close callback also prevents the shared
  dialog primitive from stealing focus while the reason is entered.
- Added an announced, focusable Agreement form error summary with links to
  known invalid fields. Inputs now expose `aria-invalid` and
  `aria-describedby`; inline errors remain outside the label so accessible
  names stay stable. Local validation and service failures preserve entered
  values and move focus to the summary.
- Accepted both the legacy Agreement `field`/`reason` error shape and the
  canonical BFF `path`/`code`/`message` shape so service field errors remain
  associated with their controls.

### Fresh remediation validation

| Check | Result |
|---|---|
| Focused lifecycle/form/client Vitest | PASS — 4 files / 15 tests |
| Full Charge frontend Vitest | PASS — 23 files / 106 tests |
| Charge TypeScript type-check | PASS |
| Charge lint | PASS — zero warnings/errors |
| Next 15.5.19 production build | PASS |
| Relay application-context test | PASS — 3/3 |
| U03 preservation test | PASS — 1/1 |
| `git diff --check` | PASS |

Docker/live concurrency, broker, upgrade, rollback, restart, measured
performance, Playwright/WCAG, `aidlc-audit`, and `erp-fidelity-audit` were not
run or claimed by this remediation.

## Review

### Iteration 1

**Verdict: NOT-READY**

#### Blocking findings

1. **Critical — the relay is enabled by default, contradicting the stated
   fail-closed boundary.** `application-local.yaml` defaults
   `CHARGE_AGREEMENT_OUTBOX_RELAY_ENABLED` to `true`;
   `ChargeAgreementMessagingConfiguration.agreementOutboxRelay` also uses
   `matchIfMissing = true`; and the Compose service supplies no disabling
   override. The activated legacy claimant reads every pending snapshot and
   claims by read-then-save without `FOR UPDATE SKIP LOCKED` or an equivalent
   atomic claim. This makes the summary's statements that the unsafe V3 relay
   “remains disabled” and that no dual claiming is exposed untrue for the
   shipped local stack. Default the relay off and add a source/configuration
   test proving it cannot activate until the classifier and atomic claim
   ownership exist.
2. **High — the Charge lifecycle UI does not implement its documented
   accessibility/confirmation source contract.** `AgreementDetailView` invokes
   approve, suspend, and expire directly from buttons; it has no evidence-bearing
   confirmation dialog, focus trap, Escape handling, or trigger-focus
   restoration. `AgreementForm` renders field errors without `aria-invalid` or
   error association and does not focus/link an error summary. These are source
   gaps, not merely absent live WCAG evidence, and make the summary's
   “evidence-bearing approval” and “focus/error handling” claims too strong.

#### Verified architecture

- Domain and application code enforce exactly three distinct links and validate
  Approved BASE/OFR, SURCHARGE/BAF, and LOCAL/THC RateVersions in one bounded
  query, including coverage and applicability checks.
- Authorization precedes Agreement lookup; W2 controllers consume only the
  verified U02 subject attribute; default JSON and exact W2 vendor-media routes
  remain isolated; LEGACY mutations are rejected.
- Draft-only commercial mutation, optimistic row versions, Approved-version
  successor rules, locked approval revalidation, canonical advisory locking,
  and inclusive overlap detection are present. Activity and outbox writes share
  the application transaction. Additive Avro fields are nullable with
  default-null and contract/resource copies match.
- PostgreSQL concurrency behavior is structurally implemented but remains
  Docker-skipped; this review does not convert that into live concurrency,
  upgrade, rollback, restart, broker, or performance evidence.

#### Fresh validation

- Charge lint: **PASS**, zero warnings/errors.
- Charge TypeScript type-check: **PASS**.
- Charge Vitest: **PASS**, 22 files / 96 tests.
- Focused Charge Maven reactor: **PASS** — domain 9, application 11,
  data-access 3 with 1 Docker-dependent skip, messaging serde 2, and controller
  compatibility 7.
- U03 preservation test: **PASS**, 1/1.
- Not run or claimed: Docker/live concurrency, live broker/upgrade/rollback,
  measured performance, Playwright/WCAG, security quality gate,
  `aidlc-audit`, or `erp-fidelity-audit`.

### Iteration 2

**Verdict: NOT-READY**

#### Blocking finding

1. **Critical — the relay is default-off but can still be explicitly activated
   without the required safety boundary.** The local fallback, Compose service,
   and Wave A environment are now explicitly false, and the Spring condition is
   correctly absent-off (`matchIfMissing = false`). However,
   `charge-agreement.outbox-relay.enabled=true` still creates the legacy
   `ScheduledOutboxRelay`; the context test explicitly requires that outcome.
   That relay still delegates to `publishOutboxBatch`, which calls the unchanged
   legacy `claimAvailable` path and then saves publication outcomes. No safe
   total legacy-snapshot classifier or atomic single-owner claim mechanism was
   added. Consequently an operator/configuration error can activate the known
   unsafe claimant before those prerequisites exist. The Iteration 1 requirement
   was that the claimant cannot activate until classification and atomic claim
   ownership are available, not merely that normal local configuration leaves it
   off. Remove the activatable bean/path or add a separate fail-closed readiness
   condition that cannot become true until both safeguards are implemented and
   tested.

#### Resolved finding

- Approve, suspend, and expire now route through an evidence-bearing
  confirmation dialog. The source and focused tests cover Agreement/version/row
  identity, consequences, required reason, focus containment, Escape,
  trigger-focus restoration, pending announcement, and duplicate/dismiss
  prevention.
- Agreement form failures now focus and announce a linked error summary, preserve
  entered values, expose `aria-invalid` and `aria-describedby`, and associate
  both legacy `field`/`reason` and canonical `path`/`code`/`message` service
  errors with known controls.

#### Fresh validation

- Charge TypeScript type-check: **PASS**.
- Charge lint: **PASS**, zero warnings/errors.
- Full Charge Vitest: **PASS**, 23 files / 106 tests.
- Relay application-context test: **PASS**, 3/3; it confirms absent/false-off
  but also confirms the unsafe legacy claimant remains activatable by explicit
  true.
- U03 preservation test: **PASS**, 1/1.
- `git diff --check`: **PASS**.
- Not run or claimed: Docker/live concurrency, broker, upgrade, rollback,
  restart, measured performance, Playwright/WCAG, security quality gate,
  `aidlc-audit`, or `erp-fidelity-audit`.

## Post-Review Remediation

- The historical Iteration 1 and Iteration 2 **NOT-READY** verdicts remain
  unchanged.
- Removed the `ScheduledOutboxRelay` bean and its conditional activation path
  from `ChargeAgreementMessagingConfiguration`. No configuration value can now
  instantiate the unsafe Agreement claimant before the classifier and atomic
  ownership safeguards exist.
- Updated the application-context test to prove absent, explicit `false`, and
  explicit `true` all produce zero `ScheduledOutboxRelay` beans.
- Updated U03 preservation to reject claimant declaration, legacy
  `publishOutboxBatch` delegation, or relay-property activation in the Agreement
  messaging configuration. Local application, Compose, and Wave A environment
  defaults remain explicitly `false`.

### Validation

- Focused relay application-context test: **PASS**, 3/3.
- U03 preservation test: **PASS**, 1/1.
- Charge Agreement Maven reactor compile: **PASS**, 8/8 modules.
- Full Charge Agreement Maven reactor test: **BLOCKED by the local Docker
  client** after the preceding domain, application-service, and non-container
  data-access tests passed; Testcontainers could not start Ryuk because Docker
  reported API client 1.32 below its minimum 1.40. This is unrelated to the
  relay correction.
