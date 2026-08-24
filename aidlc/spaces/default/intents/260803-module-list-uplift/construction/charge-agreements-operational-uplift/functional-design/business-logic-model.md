# Business Logic Model - U03 Charge Agreements Operational Uplift

## Source Alignment

This design implements U03 from `unit-of-work.md`, its US-007, US-008, US-009, US-010, and US-015 assignments in `unit-of-work-story-map.md`, and `requirements.md`. It refines the approved boundaries in `components.md`, the public seams in `component-methods.md`, and the deployment/ownership model in `services.md`. Binding UI authority is the approved W4 requirements and security/accessibility contract, LinerCore MASTER and executable `@erp/ui`, the `charge-and-agreements.md` page contract, the reviewed Charge uplift, then advisory UI/UX Pro Max output. No new service, database, cache, Kafka topic, shell, theme, or shared-component fork is introduced.

The answered `functional-design-questions.md` selects the strict BFF query contract (Q1), no new persistence (Q2), the bounded `ChargeReferenceOptionsPort` (Q3), provider-truth detail with honest BLOCKED D&D (Q4), reauthorized commands carrying version and replay evidence (Q5), one exhaustive Charge-local result union (Q6), independently contract-test-gated queue segments with read-only manual evidence (Q7), region-scoped degradation without fabrication (Q8), one `PlatformShell` over shared primitives (Q9), and the full live evidence bar with blocked capabilities absent rather than simulated (Q10).

## Brownfield Baseline and Required Corrections

Indexed source confirms that Agreement, rate-version, manual-evidence, and lifecycle routes already exist, that the bounded `proxyReferenceOptions` seam exists, and that Charge commands already derive a replay key when a validated client request ID is present. It also confirms the gaps U03 must correct:

- the current Agreement list contract uses a `lifecycle` query key and omits the approved W4 keys `customerId`, `tradeLaneId`, `commodityId`, `status`, `validOn`, and `includeInactive`; the BFF/provider query-key mismatch recorded in `requirements.md` Open Question 2 is closed by this unit, not deferred;
- no `listApprovalCandidates` implementation resolves in source even though `component-methods.md` declares it, so both Approval Queue segments start unadmitted;
- current route responses do not expose the complete approved mutation disposition set, so accepted-but-unconfirmed and unknown-outcome states are not representable today;
- the program backlog records W3-01 as ready to start rather than closed, so no D&D provider evidence is available to consume.

These are brownfield correction points. They authorize no change to Charge provider ownership, no new capability, and no synthesized domain fact.

## Agreement List Workflow

U03 applies one request pipeline before any Charge provider access: authenticated session, current-request `charge-agreements:read` decision, strict query parsing, then provider call.

1. Resolve the canonical URL `/charge-agreements`. Legacy Charge paths follow the approved four 308 mappings in `requirements.md`; every other alleged legacy path returns 404.
2. Reauthorize `charge-agreements:read` for this request. `denied` and Identity outage terminate before any Charge or Reference call.
3. Parse the query strictly. Duplicate, unknown, malformed, or overlong keys return `invalid-query` / HTTP 400 before provider access. The accepted set is exactly `customerId`, `tradeLaneId`, `commodityId`, `status`, `validOn`, `includeInactive`, one-based `page`, and `size` in {25, 50, 100}, plus bounded `focus` for return context.
4. Adapt `status` explicitly onto the verified provider vocabulary inside the BFF. The adaptation is a named, contract-tested mapping table, never a silent rename and never a browser-supplied provider value. `validOn` is an ISO date; `includeInactive` is a boolean.
5. Convert one-based browser paging to provider zero-based paging in the BFF alone.
6. Request the provider Agreement page in its fixed order — agreement number ascending, then ID ascending. No user-selectable sort, generic `q`, or origin/destination/equipment filter exists at any layer.
7. Translate the provider page into a typed `AgreementPageVm` with labelled columns: agreement number, customer, coverage, status, version, validity. Counts render only from provider total evidence.
8. Resolve customer/trade-lane/commodity labels through the bounded Reference option port. An unresolved label renders the safe raw authorized ID plus `Label unavailable`; it never blocks the identity link or the row.
9. Map `ok`, `invalid-query`, `not-found`, `denied`, authorized `stale`, and `unavailable` exhaustively into the eight list states of FR-010.

True empty means the provider returned no Agreements for an unfiltered read. Filtered empty is used only when at least one supported filter is active and the provider response establishes the distinction. Client-side filtering, sorting, or page merging is prohibited at every layer.

## Reference Option Resolution Workflow

Charge resolves canonical options only through `ChargeReferenceOptionsPort`. The browser calls `GET /charge-agreements/api/reference-options` with exactly one `domain` (`agreements` or `rates`), exactly one `kind`, and optionally one trimmed `q` of at most 128 characters. Duplicate or unknown keys return `invalid-query` / HTTP 400 without any provider call.

The Charge BFF then requires `charge-agreements:read` or `charge-rates:read` according to `domain` for the current request, and calls `GET /reference-sets/{mappedSet}/records?includeInactive=false&page=0&size=50` using the existing fixed Reference service credential and a trusted correlation header. The result is at most 50 ACTIVE `{id, code?, label}` options.

Four outcomes stay distinct and are never collapsed: `invalid-query` (rejected before the provider call), `denied` (Charge read capability refused), `unavailable` (Reference outage or malformed payload), and a successful empty list (no ACTIVE match). Read surfaces degrade to safe raw authorized IDs with `Label unavailable`. Create, edit, and bind actions that require canonical validation become unavailable with a precise reason while options cannot be verified — they are never enabled against free-text labels. No Reference app import, shared SQL, cache authority, or broad client merge exists.

## Agreement Detail and Tab Workflow

Detail resolves by stable `agreementId` only. Tabs are presentation state carried in the URL, not query authority; an unsupported tab value normalizes to Summary by replace navigation without changing record identity.

| Tab | Authoritative source | U03 behaviour |
| --- | --- | --- |
| Summary | Provider Agreement detail | Customer, coverage, validity, lifecycle, version, and provider-backed pricing evidence; agreement number, agreement ID, and version render as visibly distinct facts |
| Rates | Provider-bound rate versions | Exact bound Freight, Surcharge, and Local versions with amount, ISO 4217 currency, basis, and scope; links target the exact immutable provider rate ID and version |
| D&D | W3-01 provider contract | Not integrated. The region renders the honest BLOCKED state with owner and evidence path; no rule, value, or term is derived from rate rows |
| Status history | Provider lifecycle events | Provider-ordered lifecycle, version, and approval events with actor, time, and reason where supplied; approved history is immutable |

Three identity rules are invariant. Current Agreement ID, current version, and row version remain distinct values and are never substituted for one another. `agreementVersionId` is never treated as `agreementId`. Agreement-to-Booking remains absent — no link, no disabled placeholder, no reverse search by customer, lane, or label — until the additive identifier described in the `requirements.md` Cross-Link Direction Matrix is approved and evidenced; the reserved region shows `Related bookings unavailable`.

Supporting rate-version navigation (US-015) opens `/charge-agreements/rates/[rateId]` at the provider's exact stable rate ID and version, carrying validated Agreement return context. A newer current rate is never substituted for the bound version.

## Command Workflow — Create, Edit, Successor, Approve, Suspend, Expire

Every command follows the same sequence; only its capability, precondition set, and confirmation copy differ.

1. Reauthorize the exact capability for this command on this request: `charge-agreements:create`, `:update`, `:create-successor`, `:approve`, `:suspend`, or `:expire`. A prior page decision, a visible button, or a browser-supplied role label is never command authority.
2. Validate the provider lifecycle preconditions for the current Agreement state. An action whose precondition the provider does not satisfy is absent, not disabled-and-clickable.
3. Carry current evidence: Agreement ID, the exact version read with the draft, and the row version. Constants, latest-version substitution, and browser-generated versions are rejected at the BFF boundary.
4. Derive the replay key server-side from a bounded, validated client request ID, using the existing Charge command behaviour. The browser never supplies the replay key itself.
5. Block duplicate submission while pending. A second activation produces no second provider request.
6. Show a consequence-specific confirmation where the action is irreversible or destructive — approve, suspend, and expire — using the shared Dialog through the narrow Charge lifecycle composition, capturing a reason where the provider requires one.
7. Preserve immutable approved history. `createSuccessor` produces a new Draft; it never rewrites, reopens, or mutates an approved version in place.
8. Perform an authoritative detail re-read after provider acceptance. Only an `ok` re-read produces confirmed success, announcement, and navigation.

If provider acceptance is known but the authoritative re-read fails, the UI reports the action as accepted with confirmation unavailable, retains the stable Agreement ID and safe reference, and offers Re-read. It never renders submitted input as provider truth and never announces success from the submitted command alone.

## Mutation Outcome Decision Model

U03 defines one exhaustive Charge-local result and transport union. Upstream `MutationResult<T>` cannot represent known acceptance without an authoritative `T`; this local refinement follows the precedent already approved for U02 and alters no other domain's contract.

| Disposition | Meaning | UI / recovery | Retry rule |
| --- | --- | --- | --- |
| `accepted-confirmed` | Provider accepted and the authoritative detail re-read returned `ok` | 200; detail value, agreementId, new version, reference | Not applicable |
| `accepted-unconfirmed` | Acceptance is known but confirmation read is denied, unavailable, or not yet visible | 202; agreementId, optional persisted version, reference, recovery `REFETCH`; never carries submitted draft as truth | Reauthorize and re-read only |
| `validation` | Command rejected with field or general issues | 422; retain draft, error summary linked to persistent labels, replacement replay key | User correction; new authorization on submit |
| `conflict` | Expected version or row version is no longer current, or a provider lifecycle precondition rejected the transition | 409; retain draft, show current lifecycle and required next state, provider code, reference | Explicit reconcile only |
| `denied` | Current command authorization refused | 403; retain draft, remove the command, concise reason with no capability detail | No automatic retry |
| `not-found` | Agreement or version identity no longer resolves | 404; retain safe draft evidence, canonical list recovery target | Re-read or navigate; never implicitly create |
| `unavailable-known-no-mutation` | Evidence proves Identity or the Charge provider did not accept the command | 503 before dispatch, 502 for known provider rejection or protocol failure; reference, retry `RESUBMIT` | User-triggered retry with reauthorization |
| `unavailable-unknown-outcome` | Timeout or disconnect after dispatch | 503/504; agreementId, expected version, reference, recovery `REFETCH` | Mandatory authoritative re-read before any retry |
| `unexpected` | BFF invariant failure, or malformed / unmapped provider response | 500 with boundary `BFF`; 502 with boundary `PROVIDER_PROTOCOL`; safe reference | No blind replay |

Every Charge API route and reducer switches exhaustively over this union. Form and dialog context, entered values, and focus are retained on `validation`, `conflict`, `denied`, both `unavailable` branches, and `unexpected`. Only safe reference evidence — correlation, provider reference, version — is exposed; raw transport and payload evidence stays in a collapsed, access-appropriate disclosure.

## Unknown-Outcome Recovery Algorithm

1. Freeze the submitted draft, the exact Agreement and version identity, and the safe correlation/reference. The server-derived replay key remains bound to the original attempt.
2. Announce the result as unknown — neither succeeded nor failed. No optimistic lifecycle advancement occurs at any layer.
3. Reauthorize read, then re-read the exact Agreement by stable ID.
4. Compare the authoritative version and lifecycle against the pre-command snapshot and the submitted intent. An observed transition returns `accepted-confirmed` built from the re-read value.
5. An unchanged authoritative state permits an explicit user-triggered retry, which reuses the original replay key so the provider's idempotency makes the retry duplicate-safe. A changed state that does not match the submitted intent is `conflict` and is never overwritten.
6. If the re-read itself is denied or unavailable, remain in `accepted-unconfirmed`/`unavailable-unknown-outcome` with mutation disabled and surface reference guidance. Indeterminate never becomes success.

## Approval Queue and Manual Pricing Evidence Workflow

The Agreement and Rate queue segments are admitted independently. A segment renders only after its own server-side Draft/pending filter plus bounded page/size contract tests pass against the provider and the exact read capability is verified. An unadmitted segment is unavailable with owner and evidence path. No client download-and-merge, no client filter, and no bulk approval exists in any state. Because no `listApprovalCandidates` implementation resolves in current source, both segments begin unadmitted and are opened only by evidenced contract tests.

Manual-pricing evidence requires `charge-manual-cases:read` and shows provider OPEN evidence only, ordered by the provider's stable most-recent order, with the supported `reasonCode`, `bookingRef`, `openedFrom`, `openedTo`, page, and size 25. `MANUAL_PRICING_REQUIRED` remains evidence, never a zero price. No resolve, close, assign, reprice, manual-amount, or approval control exists — not even disabled.

## Degradation, Denial, and Partial-Failure Workflow

Authorization is always evaluated fresh for the current request. `denied` and Identity outage both stop before any Charge or Reference call; Identity outage maps to retryable `unavailable` / HTTP 503 with zero provider calls and no data flash.

Last-known business truth renders only when the owning provider returns the value together with source and `dataUpdatedAt` under current authorization. In that state every freshness-dependent command is disabled with a precise reason. Browser memory, fixtures, local storage, and cached authorization are never fallback truth.

Partial failure is scoped to the owning region, bounded by what the declared seams actually make separable. `getAgreement` is one atomic provider read, and the current provider detail payload carries Summary facts, versions, and lifecycle `activity` together. Status history therefore shares Summary's read result and can only fail jointly with it; U03 does not claim a "Summary ok, History unavailable" state and does not invent an independent history endpoint to manufacture one. What is genuinely separable is separable: each bound rate version resolves through its own `getRateVersion` call, Reference labels resolve through the bounded option port, and D&D has no seam at all while W3-01 is open. Those three regions render their own failure state with a Retry whose ownership is exact, while verified Agreement Summary truth, the selected tab, and the list return context remain intact.

Partial history is a distinct and supported case: when the provider returns detail whose `activity` evidence is incomplete or absent, the Status history panel says so from that provider-signalled condition rather than from a separate transport failure. A dependency failure never blanks the record and never fabricates completeness — an unavailable region says what is unavailable and who owns it. An independently callable history read would be an additive public contract change and is therefore out of U03's boundary; it may be proposed through the approved Application Design change-control path if a future need justifies it.

## Data Transformations

- Route parser: raw path/query to validated stable identifiers plus normalized one-based query; duplicate/unknown keys fail closed before provider access.
- Status adapter: W4 lifecycle vocabulary to verified provider vocabulary, as an explicit contract-tested mapping.
- Page adapter: one-based browser page to provider zero-based page, inside the BFF only.
- Agreement adapter: provider Agreement page/detail, version, rate bindings, and history to labelled typed view models.
- Reference option adapter: bounded active Reference records to at most 50 typed `{id, code?, label}` options, with the four distinct failure outcomes preserved.
- Command normalizer: labelled form values to an allow-listed provider command; no actor, capability, correlation authority, or browser-supplied version is injected.
- Outcome reducer: policy, transport, provider, and re-read results to exactly one terminal disposition in the union above.
- Safe return policy: validated Charge-relative list context to detail/tab navigation and focus restoration.

## Scenario and Requirement Coverage

| Scenario | Story / requirements | Required proof |
| --- | --- | --- |
| Aligned Agreement list, filters, page, refresh | US-007; FR-002, FR-005, FR-009, FR-010, FR-015, FR-016, FR-017 | Approved key allow-list, duplicate/unknown-key 400 without provider call, fixed order, URL survival |
| Agreement detail, versions, rates, history | US-008, US-015; FR-005, FR-011 | Provider-backed tabs, distinct agreement/version/row version, exact immutable rate-version navigation |
| Honest D&D and relationship absence | US-008; FR-014 | BLOCKED D&D region with owner/evidence; Agreement-to-Booking absent, never guessed |
| Lifecycle, successor, and version commands | US-009; FR-006, FR-012, FR-013 | Action-specific ALLOW, provider preconditions, immutable approved history, authoritative re-read |
| Mutation outcome matrix | US-009; FR-011, FR-013; NFR-005 | Exhaustive union, retained context/focus, duplicate-submit prevention, no false success |
| Queue and manual evidence | US-010; FR-009, FR-012 | Independently admitted segments, no client merge, read-only OPEN evidence, no resolution control |
| Reference option failure matrix | US-007, US-009; FR-019, FR-021 | Invalid/denied/unavailable/empty distinct, cardinality bound, raw-ID read fallback, action unavailability |
| Denied, stale, partial, dependency failure | US-008, US-010; FR-019, FR-020, FR-021 | Zero provider call on policy failure, source/time evidence, region-scoped Retry ownership |
| Shared shell and navigation grammar | US-007-US-010, US-015; FR-001, FR-022 | Exactly one W2-02 `PlatformShell`, shared tokens and `@erp/ui`, no local fork |
| Unit quality contribution | NFR-001, NFR-002, NFR-003, NFR-004, NFR-005, NFR-009, NFR-010, NFR-011, NFR-012 | Five widths, two themes, keyboard/screen-reader/reduced-motion/zoom, warmed 10-user route/BFF sample, live Compose evidence |
| Intent-exit quality verdict | NFR-006, NFR-007, NFR-008 | Changed-frontend coverage, combined blocking gates, bounded W4 security aggregation at intent exit |

## Completion Boundary

U03 closes only on the running `linercore-wave-a` stack with persisted Charge fixtures and real Identity decisions, exercised by both Pricing Analyst and Charge Reader fixtures against the same Agreement truth. Evidence must cover the provider-aligned list/detail/Rates/history reads; exact rate-version navigation; legal lifecycle and successor success, validation, denial, policy rejection, stale conflict, duplicate submit, unknown outcome, and authoritative re-read; read-only OPEN manual evidence; the full Reference-option invalid/denied/empty/unavailable/cardinality matrix; truthful D&D and queue-segment unavailability; the four approved Charge 308 redirects and the 404 matrix; five widths and two themes; keyboard, screen-reader, reduced-motion, and zoom behaviour; and a documented warmed ten-user route/BFF sample recording the NFR-001 method and both p95 thresholds.

Blocked Booking, D&D, and queue capabilities remain absent, not simulated. Static scans, source inspection, mockups, screenshots, container startup, or unit tests alone are never PASS.

## Review Resolution - Iteration 1

1. **Status History region independence corrected to the seam that exists.** The design no longer claims a "Summary ok, History unavailable" state. Status history is stated throughout as a projection of the one atomic `getAgreement` payload that also carries Summary, sharing its read result. Genuine independence is retained only where a separate seam exists: per-bound-version `getRateVersion` calls, the bounded Reference option port, and the seam-less D&D region. Incomplete or absent provider `activity` is now modelled as a provider-signalled partial-history condition inside an otherwise authoritative detail, not a second transport result. An independently callable history read is explicitly named as an additive public contract change outside U03's boundary. Updated: `business-logic-model.md` degradation workflow, `business-rules.md` BR3-046 plus new BR3-047, `domain-entities.md` Read Result and Region Model (now a seam table) and its `StatusHistoryVm` row, and `frontend-components.md` route table, detail composition table, and outcome mapping.

2. **The view-model extension is now explicitly authorized and enumerated.** `domain-entities.md`'s Contract Fidelity Check adds a fourth entry naming exactly which fields extend `AgreementRowVm` (`tradeLaneId`, `commodityId`, `validFrom`, optional `validTo`), `AgreementDetailVm` (the same validity fields plus row version and the `StatusHistoryVm` projection), `RateRowVm` (`amount`, ISO 4217 `currency`, `basis`, `scope`), and `RateDetailVm` (those four plus validity). It records that every added field is already provider-owned per the `requirements.md` Data & Standards Alignment row for Charge Agreements, and that these are BFF view-model extensions inside the existing `ChargeAgreementsBff` seams — no provider contract, endpoint, media type, or persistence change, and no field renamed, recomputed, defaulted, or derived in the UI. The `coverage` column is clarified as a rendering of trade-lane and commodity labels rather than a stored provider field.

## Review - Iteration 1

**Verdict: NOT-READY**

### Validation evidence

- Read the Stage 3.1 definition (`.codex/aidlc-common/stages/construction/functional-design.md`), the answered `functional-design-questions.md` (all ten guided "A" answers), and all four produced artifacts in full as one contract.
- Cross-checked against upstream authority: `unit-of-work.md` (U03 boundary, non-responsibilities, Definition of Done), `unit-of-work-story-map.md` (US-007/008/009/010/015 allocation and the requirement-to-unit ledger), `requirements.md` (FR-001..FR-022, NFR-001..NFR-012, Provider Capability and Action Matrix, Legacy Route Retirement Matrix, Cross-Link Direction Matrix), and the Application Design `components.md`/`component-methods.md`/`services.md`. Also compared shape and depth against the READY U02 peer precedent (`construction/reference-data-operational-completion/functional-design/*.md`).
- Ran the two applicable deterministic sensors for all four artifacts via `bun .codex/tools/aidlc-sensor.ts fire <id> --stage functional-design --output-path <file>`:
  - `required-sections`: `SENSOR_PASSED` for all four files (confirmed in the audit log at `aidlc/spaces/default/intents/260803-module-list-uplift/audit/git-ae-srv-rdt1-5bc6e1ea2b05.md`).
  - `upstream-coverage`: `SENSOR_PASSED` for all four files, and non-vacuous here — this stage's `consumes:` list is populated (unlike the U02 precedent, whose sensor run resolved `consumes: []`), so this is genuine evidence that every declared upstream artifact is referenced in prose.
  - `linter` / `type-check`: not applicable. None of the four artifacts contain fenced ```ts```/```js```/```tsx``` code blocks (only one ```text``` component-tree block in `frontend-components.md`), so neither sensor's glob (`**/*.{ts,js}`, `**/*.{ts,tsx}`) matches.
- Spot-checked load-bearing factual claims against the live repository (not just the design's own narrative), all confirmed accurate:
  - The current Agreement list genuinely uses a `lifecycle` filter key and omits `commodityId`/`status`/`includeInactive` — confirmed in `apps/charge-agreements/lib/agreements.ts` (`canonicalAgreementSearchParams`) and `apps/charge-agreements/app/AgreementList.tsx`.
  - `proxyReferenceOptions` (`apps/charge-agreements/lib/bff/reference-options.ts`) matches the FD's described bounded seam exactly: single `domain`/`kind`/optional `q` (128-char cap), Reference call at `page=0&size=50`, ≤50 ACTIVE options, four distinct failure outcomes.
  - No `listApprovalCandidates` implementation or `/approvals` route exists anywhere in `apps/charge-agreements` (full-repo grep) — the FD's claim that both queue segments "start unadmitted" is accurate, and the `/charge-agreements/approvals` route itself is legitimately pre-authorized by `application-design-questions.md` Q5 and `decisions.md` ADR-006, not a fabrication.
  - Replay-key derivation from a validated client request ID already exists (`apps/charge-agreements/lib/bff/replay-key.ts`, `proxy-charge.ts`), and `expectedRowVersion` already flows on the wire for Agreement commands (`lib/agreement-client.ts`, `lib/bff/policies.ts` `AGREEMENT_BODY_FIELDS`), so the FD's version/row-version propagation requirement is achievable from existing seams, not invented.
- Confirmed `business-rules.md`'s closing FR/NFR/story coverage paragraph matches the requirement-to-unit ledger in `unit-of-work-story-map.md` exactly: FR-001, FR-002, FR-005, FR-006, FR-009 through FR-017, FR-019 through FR-022, and NFR-001 through NFR-005/NFR-009 through NFR-012 are primary/shared to U03; NFR-006 through NFR-008 are correctly deferred to intent exit; FR-003/FR-004/FR-007/FR-008/FR-018 (Reference/CMM-owned) are correctly excluded.
- Confirmed every capability `requirements.md`/`unit-of-work.md` mark BLOCKED for U03 (D&D while W3-01 is open, both Agreement<->Booking directions, generic search/sort and origin/destination/equipment Agreement filters, manual-pricing resolution, bulk/client-merged approval queue) is rendered consistently absent/BLOCKED across all four artifacts, with no fabricated value, rule, or control anywhere — including the D&D `not-integrated` stub and the `Related bookings unavailable` text.

### Blocking findings

1. **The mandated "independent per-region read result" for the Status History region has no underlying seam, and contradicts the actual single-call detail contract.** `domain-entities.md`'s Read Result and Region Model states "Summary, Rates, D&D, Status history, and Reference labels each carry their own read result, so one region's `unavailable` coexists with another region's `ok`," and `frontend-components.md`'s Detail Composition table requires History to have its own "Panel-scoped FailureState; partial history never blanks other tabs" (also `business-rules.md` BR3-046). But `component-methods.md`'s only declared read seam for Agreement detail — `getAgreement(context, agreementId, tab): Promise<ReadResult<AgreementDetailVm>>` — returns one `AgreementDetailVm` with no history/activity field at all, and the live source confirms Summary and history are the same atomic response today: `apps/charge-agreements/app/api/agreements/[agreementId]/route.ts` forwards a single provider `GET` through `AGREEMENT_POLICIES.detail`, whose `agreementDetailSchema` (`apps/charge-agreements/lib/agreements.ts`) bundles `selectedVersion`, `versions`, and `activity` together, rendered in one pass by `AgreementDetailView.tsx`. No artifact declares or specifies a seam that can fetch Status History independently of Summary (route, request shape, and failure semantics are all absent), so "Summary ok, History unavailable" is not achievable without inventing a new BFF/provider endpoint from scratch. Resolve by either (a) naming and fully specifying the new independently-callable history/activity read (route, query shape, `ReadResult<StatusHistoryVm>`, and how it composes with `getAgreement`) and carrying it through the approved Application Design change-control path, or (b) correcting the Region Model, BR3-046, and the Detail Composition table to state truthfully that Status History shares Summary's read result and can only fail jointly with it, since both are already sourced from the one existing `getAgreement`/provider detail call.

2. **`AgreementRowVm`/`AgreementDetailVm`/`RateRowVm`/`RateDetailVm` as declared in `component-methods.md` cannot produce the columns the FD's own UI and domain models require, and the "Contract Fidelity Check" section in `domain-entities.md` does not name or authorize the needed extension.** `frontend-components.md`'s list composition and `domain-entities.md`'s `AgreementPageVm` both require "coverage" and "validity" columns, but the declared `AgreementRowVm` carries only `{id, agreementNumber, customerId, status, version}` — no trade lane, commodity, or validity fields. Likewise the Rates panel requires "amount, ISO 4217 currency, basis, and scope," while the declared `RateRowVm`/`RateDetailVm` carry only `{id, version, category, lifecycle}` plus `agreementId`/`history`. `domain-entities.md`'s Field-Level Schema table does supply the missing field names and sources, but the Contract Fidelity Check section — the one place responsible for reconciling declared seams against what U03 needs — names only three source corrections (the `lifecycle` key, the missing `listApprovalCandidates` implementation, the non-exhaustive result mapping) and is silent on this VM-shape gap, leaving it ambiguous whether extending these interfaces is an authorized U03 refinement or an unreviewed contract change. Add an explicit statement, parallel to the existing three, naming exactly which fields extend `AgreementRowVm`, `AgreementDetailVm`, `RateRowVm`, and `RateDetailVm`, so the fidelity check is complete and a developer is not left inferring which interface changes are in scope.

## Review - Iteration 2

**Verdict: NOT-READY**

### Validation evidence

- Re-read all four U03 artifacts in full, starting from the new "## Review Resolution - Iteration 1" section, to verify both Iteration-1 findings against the rewritten text, not just the coordinator's summary of them.
- Re-ran both applicable deterministic sensors against all four (now-changed) artifacts via `bun .codex/tools/aidlc-sensor.ts fire <id> --stage functional-design --output-path <file>`: `required-sections` and `upstream-coverage` both returned `SENSOR_PASSED` for all four files again (confirmed in the same audit log). `linter`/`type-check` remain not applicable — no fenced `ts`/`js`/`tsx` blocks were added.
- Confirmed Finding 1 (Status History independence) is substantively resolved and consistent across three of the four files: `business-logic-model.md`'s rewritten "Degradation, Denial, and Partial-Failure Workflow," `business-rules.md`'s rewritten BR3-046 plus new BR3-047, `domain-entities.md`'s new seam table in "Read Result and Region Model," and `frontend-components.md`'s route table, Detail Composition table (now with a Source seam column), and Outcome-to-Component Mapping row all state the same corrected rule: Summary and Status history share the one atomic `getAgreement` read and its `ReadResult`, while Rates (`getRateVersion` per bound version), Reference labels (`ChargeReferenceOptionsPort`), and D&D (no seam) are genuinely independent. This is option (b) from the Iteration-1 finding and it is truthful against the live source (confirmed again: `apps/charge-agreements/app/api/agreements/[agreementId]/route.ts` still forwards one atomic provider `GET`, and `agreementDetailSchema` still bundles `selectedVersion`/`versions`/`activity` in one payload).
- Found one leftover instance where the pre-fix claim was not updated: `domain-entities.md`'s "View-State Derivation" section (the paragraph beginning "Read page state derives exhaustively...") still reads "Detail page state derives from Summary truth plus **independently resolved** Rates, D&D, **Status history**, and label regions" — this directly restates the claim the fix retracted everywhere else, inside the very file that now also contains the corrected Region Model table 40-odd lines above it. This is exactly the kind of leftover contradiction the coordinator asked me to rule out, and I found this one instance (checked all four files line by line for the phrase "independent"/"independently" against "Status history" or "History"; no other instance survives).
- Verified Finding 2's enumerated VM extensions against the live schemas, per the coordinator's request to confirm they are "genuinely satisfiable from provider-owned fields in the live source":
  - `AgreementRowVm`/`AgreementDetailVm` additions (`tradeLaneId`, `commodityId`, `validFrom`, optional `validTo`, row version) — confirmed present verbatim on `agreementVersionSchema` in `apps/charge-agreements/lib/agreements.ts` (`tradeLaneId`, `customerId`, `validFrom`, `validTo`, `rowVersion`). Satisfiable, correctly named.
  - `RateRowVm`/`RateDetailVm` additions — checked against `rateVersionSchema` in `apps/charge-agreements/lib/rates.ts`. `amount` (`unitRate`), `currency`, and `basis` are present and correctly identified as provider-owned. But the Contract Fidelity Check states `RateDetailVm` (and `RateRowVm`, by the same bullet) also adds "`validFrom` and optional `validTo`" — the live Rate schema has no `validFrom`/`validTo` field; its canonical validity fields are named `effectiveFrom`/`effectiveTo`. The same bullet also lists `scope` as an added Rate field with no literal `scope` property anywhere in `rateVersionSchema` (it would have to be composed from `originLocationId`/`destinationLocationId`/`equipmentTypeId`, the same kind of derived/rendered label the fix explicitly called out for the Agreement `coverage` column — but did not call out here).
- Confirmed nothing else regressed: FR/NFR/story coverage paragraphs, the BLOCKED-capability set (D&D, both Agreement<->Booking directions, generic search/sort, manual-pricing resolution, bulk/client-merged queue), and the `/charge-agreements/approvals` route remain unchanged and consistent with `unit-of-work-story-map.md`'s ledger and `requirements.md`.
- Noted per the coordinator's message: `reviewer_max_iterations: 2` for this stage, so this is the final independent verdict for this Bolt; no further automated review iteration is expected.

### Remaining blocking findings

1. **A leftover sentence in `domain-entities.md`'s "View-State Derivation" section still asserts the retracted independent-History claim.** It reads "Detail page state derives from Summary truth plus independently resolved Rates, D&D, Status history, and label regions," directly contradicting the same file's corrected "Read Result and Region Model" seam table (which states Summary and Status history share one `ReadResult<AgreementDetailVm>`), BR3-047, and the corrected `frontend-components.md` Detail Composition table. A developer reading this section in isolation would re-derive the incorrect (already-retracted) architecture. Resolve by rewording this sentence to match the corrected model, e.g. "Detail page state derives from the shared Summary/Status-history read plus independently resolved Rates, D&D, and label regions."

2. **The Rate view-model extension names the wrong canonical field, and the Contract Fidelity Check's own "no field is renamed" claim is false for it.** The Contract Fidelity Check states `RateDetailVm`/`RateRowVm` add "`validFrom` and optional `validTo`," but the live Charge Rate schema (`apps/charge-agreements/lib/rates.ts`, `rateVersionSchema`) names these fields `effectiveFrom`/`effectiveTo` — a different canonical name than the Agreement side's genuinely-named `validFrom`/`validTo` (`agreementVersionSchema`). Building `RateDetailVm.validFrom` as specified would rename a canonical Charge Rate field, which both this same bullet ("no field is renamed") and `requirements.md`'s Data & Standards Alignment note ("No W4 frontend may rename a canonical contract field") explicitly forbid. The same bullet also lists `scope` as an added Rate field with no literal counterpart in `rateVersionSchema` (it is, at best, a rendered label over `originLocationId`/`destinationLocationId`/`equipmentTypeId`), but — unlike the Agreement-side `coverage` column, which the fix explicitly clarifies as "rendered from the trade-lane and commodity labels, not stored as a separate provider field" — no equivalent clarification exists for `scope`. Resolve by correcting the Rate bullet to name `effectiveFrom`/optional `effectiveTo` (not `validFrom`/`validTo`) as the added validity fields, and add the same "rendered, not stored" clarification for `scope` that already exists for `coverage`.

## Review Resolution - Iteration 2

Both Iteration-2 findings were verified against the live Charge schemas and corrected. `reviewer_max_iterations = 2` is exhausted, so these corrections are validated by the deterministic `required-sections` / `upstream-coverage` sensors and by direct source verification, and are presented transparently at the human gate; no third review is claimed.

1. **The leftover independent-History assertion is removed.** `domain-entities.md`'s "View-State Derivation" section now reads that detail page state derives from the one atomic `getAgreement` result — carrying both Summary truth and the `StatusHistoryVm` projection — plus the independently resolved bound rate versions and Reference labels, and the statically not-integrated D&D region. A full-text sweep of all four artifacts confirms no surviving claim of independent Status-history failure; the only remaining occurrences of that wording are inside the reviewer's own recorded findings, which are the historical record and are left intact.

2. **The Rate view-model extension now uses canonical Rate field names.** Verified directly against `rateVersionSchema` in `apps/charge-agreements/lib/rates.ts`: rate validity is `effectiveFrom` / `effectiveTo`, the money field is `unitRate` with `currency` and `currencyId`, `basis` is a literal field, and there is no stored `scope` property. The Contract Fidelity Check bullet now names `unitRate`, `currency` (with `currencyId`), `basis`, and the scope identifiers `originLocationId`, nullable `destinationLocationId`, and `equipmentTypeId` for `RateRowVm`, and adds `effectiveFrom` / `effectiveTo` for `RateDetailVm`, stating explicitly that the Agreement-side `validFrom` / `validTo` names are not reused for rates. `scope` now carries the same "rendered, not stored" clarification that `coverage` already had. The Field-Level Schema table was corrected in the same way: separate rows now give the canonical names for rate validity, unit rate and currency, basis, and the three scope identifiers.

Two Agreement-side details were confirmed correct while verifying: `agreementVersionSchema` genuinely names `validFrom` / `validTo` and `rowVersion`, and `commodityId` is nullable — the latter is now reflected in the extension bullet.
