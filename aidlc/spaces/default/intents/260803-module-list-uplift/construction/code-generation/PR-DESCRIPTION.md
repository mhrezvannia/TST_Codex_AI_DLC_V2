# PR description — paste into GitHub

**Open at:**
https://github.com/mhrezvannia/TST_Codex_AI_DLC_V2/compare/enterprise/linercore...intent/W4-01-module-list-detail-uplift

**Suggested title:** `W4-01: Construction design through 3.4, security fix, and W2-02 shell blocker`

**Suggest opening as a draft** — one change below has an outstanding verification step.

---

## Summary

W4-01 Module List-Detail Uplift ran Construction stages 3.1–3.4 across all four units and then **halted at Code Generation**, blocked on the W2-02 shared shell. No application feature code was written. This PR carries the design record, three engine fixes, one security fix, two infrastructure changes, and the escalation.

## Why Construction stopped

`packages/ui` exports `PlatformShell({title, children, journeyStage})`, which picks its active rail by string-matching the title over a hardcoded module list. The approved design consumes `PlatformShellProps` with `session` (including `permissions`), `activeModule`, `breadcrumbs`, and a route registry exposing `visibleRoutes(capabilities)`.

The consequence is blocking rather than cosmetic: a hardcoded rail **cannot hide a module from a user without capability for it**, which is FR-012 and US-001 — the two stories U01 exists to prove. `unit-of-work.md` keeps U01 BLOCKED in exactly this case and prohibits a local compatibility shell; NFR-009 prohibits a fork. Both workarounds are closed by approved constraints.

See `construction/code-generation/W2-02-SHELL-ESCALATION.md`.

## Commits

| Commit | What |
|---|---|
| `cab9764` | **Engine fixes** — the §13 learnings ritual silently no-opped on every stage (two independent path/parsing bugs); `report --result` without `--stage` could approve a gate the human never saw |
| `bb8274c` | **Security fix** — four fail-open authorization paths in Reference Data |
| `9f4d7b6` | **Infra** — edge trusted-header policy; `apps-reference-data` healthcheck |
| `50d8f9b` | **Design record** — 68 artifacts, stages 3.1–3.4, plus the blocker |
| `3b6baba` | Short-form W2-02 message |

## The security fix — please review closely

`resolveReferenceDataPermissions` returned `canRead: true` in **every** branch, so read access was never denied under any circumstance:

- the Identity token came from browser-suppliable `authorization` / `x-token-reference` headers
- with no token it returned `canRead: true` with no Identity call at all
- on an explicit Identity **`DENY`** it still returned `canRead: true`, assigning the decision to `canWrite`
- `correlationIdFrom` trusted an unvalidated inbound `x-correlation-id`

Now: subject from the signed session via `sessionFromRequest` (matching `apps/charge-agreements`), token from server-side config only, the Identity decision governing both flags, and a bounded correlation pattern. Five regression tests added — there were none before, which is how this survived.

**Behaviour change:** an unauthenticated request, an unconfigured token, or an Identity `DENY` now denies instead of granting read. The env-gated local bypass is untouched (it already requires a non-production profile plus an explicit flag).

## Verification

| Check | Result |
|---|---|
| `reference-data` suite | 24/24 pass, including the 5 new tests |
| Full monorepo suite | 346 passed, 0 failed |
| `tsc --noEmit` | clean |
| `eslint` | clean |
| **`nginx -t`** | **NOT RUN** — no container runtime available |

The 49 "failed files" in a full run are collection-time throws in env-gated orchestrated suites (`W2_02_FIXTURE_MANIFEST`, run identity, control token); none is app-level.

## Please note

- The **Nginx header policy is structurally verified only.** Someone with a container runtime should run `nginx -t` before merge.
- It is applied to the **Reference and Charge locations only.** Booking and shell read `idempotency-key` from the inbound request, which the policy clears — extending it there would break Booking's mutation idempotency. Documented in `default.conf`.
- The `.codex/tools` fixes are **packaged-core, shared across harnesses** — they should go upstream rather than living only in this tree.
- Construction ran **stage-major** (all units through a stage, one gate) rather than `bolt-plan.md`'s Bolt-major B01-before-B02. That is the engine's documented behaviour; the deviation was accepted by explicit decision for design stages only, and is recorded as a Change Request in the audit shard.

## Findings for other owners

1. **Booking / shell** read `idempotency-key` from the inbound request (`bookings.ts:532`, `booking-client.ts:252`).
2. **Reference workbench** issues root-absolute `fetch("/api/…")` calls with no matching Nginx location, so through the canonical edge they reach `apps-shell`, not Reference.

Both pre-date W4-01.
