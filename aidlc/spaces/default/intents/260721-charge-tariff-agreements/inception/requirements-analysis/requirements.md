# Requirements — W2-03 Charge Tariffs & Agreements

## Intent Analysis and Sources

W2-03 makes Charge the real, maintainable pricing authority for the smallest production-shaped liner case. A Pricing Analyst maintains approved OFR, BAF, and POL THC rate versions and an approved customer-agreement version; Booking receives, stores, and renders the exact itemised result, can retain a later reprice beside the prior quote, and projects a no-rate result as `MANUAL_PRICING_REQUIRED` without fabricated money.

These requirements refine the approved `intent-statement.md` and `scope-document.md` using the brownfield facts in `business-overview.md`, `architecture.md`, and `code-structure.md`, plus the affirmed delivery constraints in `team-practices.md`. The authoritative answers are in `requirements-analysis-questions.md`. Every intended W2-03 behavior below is new or extended work unless explicitly labelled as a preserved baseline seam.

The request is a **brownfield feature enhancement** with **multi-component, standard complexity**: Charge domain/API/persistence/UI, the bilateral pricing contract, Booking consumption/persistence/UI, and isolated live evidence all change together. It is not a generic revenue-management or shared-UI redesign.

## Requirement Conventions

- **Priority:** every requirement is Must Have because the approved scope defines one indivisible release; out-of-scope behavior is listed separately.
- **Verification:** each row states an observable pass/fail check. User-story Given/When/Then detail follows in the next stage.
- **Business date:** `dates.requestedDepartureDate` from `pricing.request`; no wall-clock substitution.
- **Validity:** existing inclusive `validFrom`/`validTo` date semantics are preserved.
- **Money:** USD, positive integer container quantity, two decimal places, HALF_UP per line, total of rounded lines.
- **Authority order:** one applicable approved customer-agreement version, else one complete approved tariff basis, else `NO_RATE`.

## Functional Requirements

### Reference, Identity, and Authorization

| ID | Requirement | Verification |
|---|---|---|
| FR-001 | Charge shall use stable W0-02/reference-service identities for `OFR`, `BAF`, `THC`, USD, customer/party, trade lane, origin/destination location, and equipment type; it shall not create a duplicate master-data authority. | Creating/updating a record with active reference IDs succeeds; unknown/inactive IDs fail with the standard semantic-validation envelope and no persisted commercial record. |
| FR-002 | Charge BFF commands shall derive the actor from the signed authenticated session and shall not accept a browser-supplied actor as authority. | A valid Pricing Analyst session reaches the service with its subject; spoofed/missing subject attempts are denied and audited. |
| FR-003 | A Pricing Analyst shall be authorized to list, create, edit Drafts, create successor versions, approve, suspend/expire where supported, and inspect manual-case evidence. | Each allowed command succeeds for the role; an authenticated user without the capability receives 403 with no mutation. |
| FR-004 | Every commercial mutation, approval, pricing request/result, repricing request/result, and manual-case creation shall retain actor/service identity, timestamp, correlation ID, and affected stable IDs/versions. | API/database/audit evidence can trace each live acceptance action end to end by correlation ID. |

### Rate Aggregates and Version Lifecycle

| ID | Requirement | Verification |
|---|---|---|
| FR-101 | Charge shall maintain distinct `BASE`, `SURCHARGE`, and `LOCAL` rate records using charge codes `OFR`, `BAF`, and `THC` respectively. | The Charge API/UI creates and lists one record in each category with the expected reference identities. |
| FR-102 | Each rate version shall have a stable rate ID, immutable version ID/number, category, charge-code ID, `PER_CONTAINER` basis, USD currency ID/code, unit rate, effective-from/to dates, applicability fields, lifecycle state, and audit metadata. | Reading a created version returns every field; database evidence links the same stable/version identities. |
| FR-103 | A rate version shall be editable only while Draft. Approval shall freeze its commercial fields; any correction shall create a successor Draft/version. | Update of a Draft succeeds; update/delete of an Approved version fails; successor creation leaves the prior version byte-for-byte unchanged. |
| FR-104 | Approved rate presentation shall derive Scheduled, Effective, or Expired from the inclusive effective window and the evaluated business date; Draft remains an explicit lifecycle state. | Boundary-date tests cover the day before, first day, last day, and day after the window. |
| FR-105 | BASE/OFR and SURCHARGE/BAF applicability shall match origin, destination, and equipment type. LOCAL/POL THC applicability shall match origin port and equipment type and shall not use destination as a discriminator. | The match matrix accepts exact OFR/BAF lane/equipment and origin/equipment THC; changed destination suppresses OFR/BAF but not an otherwise applicable POL THC. |
| FR-106 | Unit rate shall be non-negative USD with no more than two decimal places, and effective-to shall not precede effective-from. Quantity zero/negative and invalid reference combinations shall be rejected before approval/use. | Boundary validation tests pass and invalid data produces no Approved version. |
| FR-107 | Approval shall reject overlapping effective Approved authorities for the same standalone matching key. Concurrent approval attempts shall produce at most one usable authority. | Overlap and concurrency tests show one approval succeeds and the other receives a deterministic conflict/validation result. |
| FR-108 | Rate history APIs/UI shall show every Draft/Approved/superseded or expired version without rewriting earlier values or their audit evidence. | After a successor is approved, both versions remain addressable and display their original values and dates. |

### Customer-Agreement Versions

| ID | Requirement | Verification |
|---|---|---|
| FR-201 | Charge shall create a Draft customer-agreement version with stable agreement identity, immutable version identity/number, customer, lane/origin/destination, equipment, inclusive validity window, lifecycle state, and audit metadata. | API/UI/database views agree on the stable and version identities and all matching fields. |
| FR-202 | A Draft agreement version shall link the exact approved rate-version identities required for this slice: one OFR BASE, one BAF SURCHARGE, and one POL THC LOCAL version. | Approval/read evidence exposes all three linked version IDs and rejects missing, duplicate-category, Draft, expired-for-window, or incompatible links. |
| FR-203 | Agreement approval shall validate customer/reference identities, applicability compatibility, effective coverage, complete category set, and non-overlap with another Approved agreement authority for the same customer/matching key/date. | Each invalid combination fails without partial approval; a complete unique agreement becomes Approved. |
| FR-204 | Approved agreement versions shall be immutable. A commercial change shall create and approve a successor agreement version that may link successor rate versions while retaining the prior version. | Attempts to edit Approved data fail; old and new approved versions remain addressable and attributable. |
| FR-205 | Existing suspension and expiry behavior shall remain available and shall remove a version from new effective pricing without deleting its prior quote/audit history. | Suspended/expired versions do not resolve for a new request, while historical snapshots still resolve their stored attribution. |

### Authority Resolution and Calculation

| ID | Requirement | Verification |
|---|---|---|
| FR-301 | Charge shall evaluate authority using `dates.requestedDepartureDate`; a missing, malformed, or semantically invalid date shall return `PRICING_BAD_REQUEST` or `PRICING_VALIDATION` as applicable and shall never use `LocalDate.now()` as fallback. | Clock-varied tests return identical results for the same request date; missing/invalid date produces no price. |
| FR-302 | Charge shall first resolve exactly one applicable Approved customer-agreement version; only when none applies shall it resolve a complete Approved tariff basis. | Matching tests prove agreement precedence and tariff fallback with identical request context. |
| FR-303 | Agreement-basis pricing shall use only the exact rate versions linked by the selected agreement version. Tariff-basis pricing shall require one unique effective OFR, BAF, and POL THC version. | Result attribution equals the selected links; a missing tariff category produces no partial result. |
| FR-304 | Each line amount shall equal unit rate × positive integer equipment quantity, rounded HALF_UP to two decimals. Total shall equal the sum of the rounded line amounts and use USD. | Worked examples for quantities 1 and >1 match API, database snapshot, and UI formatting exactly. |
| FR-305 | The thin-slice successful result shall contain exactly three itemised lines—OFR/BASE, BAF/SURCHARGE, THC/LOCAL—when all required authorities are present. | Known-rate live proof compares stored rates to all three response/snapshot/UI lines and total. |
| FR-306 | Pricing shall be all-or-nothing: Charge and Booking shall never persist or display a partial automatic total when any required authority/line is absent or ambiguous. | Missing/ambiguous-category tests return no priced snapshot and no fabricated/zero line. |
| FR-307 | Residual runtime ambiguity from legacy/concurrent data shall persist an OPEN manual case and return manual-pricing semantics distinct from a successful price; approval guards remain the primary prevention. | Injected ambiguity produces one manual case, no priced result, and a deterministic validation reason. |

### Canonical Pricing Contract and Failure Semantics

| ID | Requirement | Verification |
|---|---|---|
| FR-401 | `contracts/openapi/pricing.v1.yaml` and `POST /pricing-requests` with the existing media type shall remain the sole canonical booking-time pricing authority. Divergent legacy quote paths shall be marked non-authoritative and shall not gain new W2-03 behavior. | Contract catalog/docs identify one authority; provider/consumer verification calls only `/pricing-requests`. |
| FR-402 | The successful response shall additively expose each line's charge code, category, basis, quantity, unit rate, amount, currency, and source rate-version identity, plus total, `pricingBasis`, `pricingRef`, agreement-version attribution when applicable, request/Booking reference, and correlation ID. | OpenAPI/example/provider/consumer tests prove all fields and preserve existing response compatibility. |
| FR-403 | Additive pricing contract changes shall receive explicit Charge-provider and Booking-consumer review and synchronized OpenAPI, example, provider verification, and consumer/Pact evidence. | Merge evidence names both owners/roles and every executable artifact passes against the same example. |
| FR-404 | When neither an Approved agreement nor complete tariff basis resolves, Charge shall persist one idempotent OPEN manual case and return HTTP 404 standard envelope code `NO_RATE`; Booking shall project exact state `MANUAL_PRICING_REQUIRED`. | Replayed identical requests return the same terminal outcome without duplicate cases; Booking displays the state and reason with no total. |
| FR-405 | When multiple authorities remain despite approval guards, Charge shall persist one OPEN manual case and return HTTP 422 `PRICING_VALIDATION` with an ambiguity reason; Booking shall project `MANUAL_PRICING_REQUIRED` without treating the condition as `NO_RATE`. | Contract/integration tests distinguish ambiguity from no-rate while producing the same safe operator state. |
| FR-406 | Timeout, 503, circuit-open, denied, malformed, validation, idempotency-conflict, and in-progress semantics from the bilateral contract shall remain distinct. They shall not be rewritten as `NO_RATE`, automatic success, or a real price. | Consumer tests assert status/code/retry/manual behavior for every preserved path. |
| FR-407 | Idempotency key shall remain `bookingRef:amendmentSeq`; identical key/body shall replay the terminal result, a conflicting body shall return conflict, and a live in-progress claim shall return the existing retry guidance. | Concurrency/replay tests and live evidence show deterministic outcomes and no duplicate snapshots/cases. |

### Booking Consumption, Snapshot History, and Repricing

| ID | Requirement | Verification |
|---|---|---|
| FR-501 | Booking shall invoke Charge only through its existing pricing port/client and authenticated service boundary; it shall not read Charge persistence or substitute fixture/hardcoded lines. | Call tracing/live correlation proves BFF → Booking → Charge; disabling Charge prevents a fake success. |
| FR-502 | Booking shall persist a typed immutable snapshot containing the complete response itemisation, total, pricing basis/reference, source versions, requested-departure date, amendment sequence/revision, correlation ID, and pricing timestamp. | Stored and returned snapshot matches the provider response field-for-field. |
| FR-503 | Booking shall continue to decode and render pre-W2-03 flattened pricing snapshots without destructive migration or data loss. | Existing snapshot fixtures/rows load before and after migration; new snapshots use the typed representation. |
| FR-504 | A Booking amendment that changes any `pricing.request` field shall advance amendment sequence and make an explicit Reprice command available. A non-pricing change shall not trigger/request a new price. | Paired amendment tests show one generates a new request and one generates none. |
| FR-505 | Repricing shall use the next revision-aware idempotency identity and append a new immutable snapshot; it shall never overwrite or relabel a prior snapshot. | Prior/current selector/API evidence shows two distinct snapshots and unchanged first-snapshot values. |
| FR-506 | For agreement-basis repricing against changed rates, the selected requested-departure date and approved successor agreement version shall determine the successor linked rate versions. | A live amendment into the successor effective window yields the changed line/version while retaining the original snapshot. |
| FR-507 | `MANUAL_PRICING_REQUIRED` shall block confirmation as an automatic price, retain reason/request/correlation evidence, and expose no fabricated total. W2-03 shall not add manual quote entry or case resolution. | Booking cannot confirm through the automatic path; UI/API shows the manual evidence only. |

### Charge-Owned and Booking-Visible UI

| ID | Requirement | Verification |
|---|---|---|
| FR-601 | Charge shall replace the disabled root workbench with stable routes for agreement list/create/detail/edit, unified rate list/create/detail, and `/charge-agreements/manual-pricing`, as defined by the Charge page record. | Direct navigation, reload, browser back/forward, and shared links retain record/filter context. |
| FR-602 | Agreement and rate pages shall support list/search/filter, Draft creation/edit, version history/detail, permitted approval/lifecycle actions, applicable-rate visibility, and audit/provenance evidence without modifying shared shell/navigation ownership. | Playwright completes the analyst journey using real API data and detects no hardcoded result. |
| FR-603 | The unified rate list shall make BASE/OFR, SURCHARGE/BAF, and LOCAL/POL THC category/applicability differences visible without creating three duplicate page systems. | Filtered rows/forms show lane+equipment for OFR/BAF and origin+equipment for THC. |
| FR-604 | Manual-pricing UI shall expose an evidence queue/detail view for OPEN cases with Booking/request, reason, context, correlation, and timestamps; assignment, manual quote, approval, closure, and resolution controls shall not be present. | No-rate live case appears once and has no out-of-scope workflow actions. |
| FR-605 | The existing Booking pricing region shall render ordered line breakdown, quantity, unit rate, amount, currency, total, basis/reference, version attribution, and prior/current snapshots; it shall render `MANUAL_PRICING_REQUIRED` as an actionable exception state. | Playwright verifies known-rate, reprice history, and no-rate states on Booking detail. |
| FR-606 | Every changed UI route shall provide loading/skeleton, empty, validation, command-in-progress, success, error, denied, and manual/no-rate states; focus and live-region behavior shall make async results perceivable. | Component/browser tests reach each state and assert focus/announcement behavior. |

### Evidence and Preservation

| ID | Requirement | Verification |
|---|---|---|
| FR-701 | Database changes shall use ordered additive Flyway migrations and shall prove upgrade of existing baseline data, deterministic backfill, restart, and documented restore or forward-repair behavior without destructive reset. | Migration suite runs against baseline-shaped data and survives application restart. |
| FR-702 | W2-03 shall preserve W0-01, W0-02, W1-01, W2-01, and W2-02 contracts/behavior/evidence; the original W1 blocked/waived record shall remain explicit and separate from any later verified proof. | Regression suite and evidence diff show no rewritten historical manifest/waiver. |
| FR-703 | Live acceptance shall use only `scripts/wave-a-compose.mjs` and Compose project `linercore-wave-a`; `npm run demo:guard` shall run before and after, and port 8088/manager project shall not be targeted or mutated. | Acceptance manifest records wrapper/project/ports plus both guard outcomes. |
| FR-704 | Live proof shall cover known agreement price, tariff fallback, successor-version reprice, no-rate/manual case, Booking-visible breakdown/history, and required API/database correlation evidence. | One evidence manifest links every scenario to API, DB, UI, and correlation artifacts. |
| FR-705 | Playwright shall capture Charge and Booking workflows at 375, 768, 1024, and 1440 px in light and dark themes, including keyboard/focus and required async/error/denied/manual states. | Stored screenshots/traces and automated assertions cover every matrix cell or explicitly fail the gate. |
| FR-706 | `aidlc-audit` and `erp-fidelity-audit` shall both exit zero against the observed W2-03 live evidence before release completion. | Captured commands, exit codes, and reports are green and reference the new W2-03 evidence path. |

## Non-Functional Requirements

| ID | Attribute | Requirement | Verification |
|---|---|---|---|
| NFR-001 | Performance | Warm known-rate and no-rate calls on the isolated local acceptance stack shall meet provisional p99 ≤800 ms over at least 100 measured post-warm-up requests; host specification, concurrency, sample count, and raw timings shall be recorded. This is not a production SLO. | Evidence calculates p99 from retained raw samples and states the environment. |
| NFR-002 | Reliability | Pricing and manual-case completion shall be atomic and idempotent; process restart shall not duplicate, lose, or partially complete terminal results. | Fault/restart tests cover claim takeover, winning completion, snapshot append, and manual-case deduplication. |
| NFR-003 | Data integrity | Approved rate/agreement versions and Booking pricing snapshots shall be immutable and attributable; monetary values shall remain exact decimal USD values through storage, JSON, and UI. | Hash/value comparisons before/after successor and restart prove no mutation or floating-point drift. |
| NFR-004 | Security | Human actions shall require authenticated session-derived subject and least-privilege Charge capabilities; service calls shall retain existing service identity/authorization behavior; non-local bypass/secret controls shall fail closed. | Allowed/denied/spoofed/non-local tests and audit rows pass. |
| NFR-005 | Compatibility | All public contract/schema changes shall be backward-compatible and additive within v1; old Booking snapshots and existing W0/W1/W2 consumers shall remain readable/runnable. | Provider/consumer, migration, and regression suites pass against old and new fixtures. |
| NFR-006 | Accessibility | Changed Charge/Booking UI shall meet WCAG 2.1 AA for keyboard access, visible focus, semantics, labels, contrast through shared tokens, error association, and live status announcements. | Automated accessibility checks plus keyboard Playwright evidence report no critical/serious violations. |
| NFR-007 | Responsive usability | Changed views shall remain usable without hidden primary actions at 375, 768, 1024, and 1440 px; dense tables may use labelled horizontal overflow per the LinerCore contract. | Visual/interaction evidence passes at all four widths in both themes. |
| NFR-008 | Testability | Changed Charge and Booking code shall achieve ≥80% line coverage, while all required domain, migration, contract, integration, UI, browser, and live tests remain blocking. | Coverage reports and quality-gate evidence meet the threshold and show Charge lint/build included. |
| NFR-009 | Observability | Pricing logs/metrics shall expose correlation-safe request outcome, latency, basis type, and manual-fallback counts without customer/commercial secrets; existing trace context shall propagate across Booking and Charge. | Log/metric/trace evidence correlates known/no-rate calls and redaction tests find no prohibited payload values. |
| NFR-010 | Maintainability | W2-03 shall preserve ports-and-adapters dependencies, service-owned databases, strict TypeScript, and Charge-local UI composition; no new generic pricing service or shared design-system abstraction shall be introduced. | Dependency/diff checks and architecture tests show no forbidden inward/cross-database/shared-UI change. |

## Constraints

- Branch: `intent/W2-03-charge-tariffs-and-agreements`, common Wave A baseline `c2f13dd`, integration base `c96b5b3`, program merge protocol through `integ/main-reconciled`.
- Charge owns rates, agreement versions, matching/calculation, and manual cases; Booking owns booking state, snapshots, and Booking page rendering.
- W2-03 may change Charge pages and the minimum existing Booking pricing region only; it may not redesign `packages/ui`, shared shell/navigation/auth, typography, palette, master tokens, or non-Charge pages.
- UI work must follow `ui-ux-pro-max`, `design-system/linercore/MASTER.md`, `SESSION-PROMPT.md`, and only `design-system/linercore/pages/charge-and-agreements.md` for Charge additions.
- Flat per-container USD only; commodity, weight, reefer/DG, multi-leg, FX/tax, D&D, invoicing, settlement, optimization, public/spot products, external provider integration, and cloud deployment remain excluded.
- Canonical execution uses Graphify/codebase-memory first, RTK where available, the isolated Wave A wrapper, pre/post demo guards, Playwright, and both required audits.

## Assumptions and Validation Owners

| ID | Assumption | Status / owner |
|---|---|---|
| A-001 | W0-02 reference APIs/IDs for OFR, BAF, THC, USD, equipment, locations, lanes, and customers remain available and compatible. | Unvalidated until live acceptance; Charge/Reference Data contract owner. |
| A-002 | W1-01 Booking pricing port/snapshot path and W2-01 authenticated actor propagation remain usable on this baseline. | Source-verified, runtime-unvalidated here; Booking/Auth owners. |
| A-003 | A Docker-capable authorized environment will be available for isolated acceptance without touching the manager demo. | Open release dependency; release-review owner. |
| A-004 | The provisional local p99 target is useful for measurement but is not an approved production SLO. | Confirmed for W2-03; Product/Operations revisit after measurements. |
| A-005 | No production retention/residency/certification rule supplied here requires deletion or archival behavior in this feature. | Open before production promotion; Compliance owner. |

## Out of Scope

- Full manual-pricing assignment, manual quote entry, approval, resolution, or closure workflow.
- D&D rule/rate/pricing behavior, even where existing pricing contracts contain preserved D&D fields.
- Commodity/weight/volume/distance, reefer/DG, multi-leg/transshipment, variable/floating/indexed rates, rebates, optimizer/yield logic, public tariff distribution, spot marketplace, and customer self-service.
- FX conversion, taxes, invoicing, accounting, settlement, and payments.
- New service boundaries, shared databases, cross-module SQL, micro-frontend host, identity mechanism, shared component library, or global UI redesign.
- Repository-wide DevSecOps modernization, AWS/cloud topology, production deployment pipeline, staffing plan, funding, or release date.

## Open Questions Carried Forward

- Confirm the named/system-assigned Construction owners, review independence, capacity, and Docker acceptance window before delivery scheduling/release execution.
- Approve a production pricing SLO only after measured local/staging evidence; p99 ≤800 ms is provisional for this intent.
- Confirm production data retention, residency, certification, backup, and recovery obligations before production promotion.
- Application Design must select the additive immutable-version schema, backward-compatible typed Booking snapshot representation, stable Charge edge mount, and exact additive JSON field names without changing the requirements above.

## Traceability Summary

| Requirement group | Primary source | Downstream design | Verification status |
|---|---|---|---|
| FR-001–FR-004 | `intent-statement.md`, `scope-document.md`, `team-practices.md` | Pending Application Design | Defined; tests pending |
| FR-101–FR-205 | `intent-statement.md`, `scope-document.md`, `business-overview.md` | Pending Functional/Application Design | Defined; tests pending |
| FR-301–FR-407 | bilateral contract decisions, `architecture.md`, requirements answers | Pending Application Design | Defined; contract tests pending |
| FR-501–FR-507 | `business-overview.md`, `code-structure.md`, `scope-document.md` | Pending Booking design | Defined; integration tests pending |
| FR-601–FR-606 | `intent-statement.md`, Charge page record, `team-practices.md` | Pending Refined Mockups/Application Design | Defined; Playwright pending |
| FR-701–FR-706 | `scope-document.md`, `team-practices.md` | Pending Units/Delivery Planning | Defined; live evidence pending |
| NFR-001–NFR-010 | `architecture.md`, `code-structure.md`, `team-practices.md` | Pending NFR/Application Design | Quantified where approved; execution pending |

## Review

Verdict: READY

1. Traceability is complete and testable: stable requirement IDs map the approved intent and scope through brownfield `business-overview.md`, `architecture.md`, `code-structure.md`, and `team-practices.md`, with observable verification criteria and an explicit downstream traceability summary.
2. The W2-03 vertical boundary is preserved: OFR/BAF/POL THC, immutable approved agreement/rate versions, real itemised Booking snapshots, revision-aware repricing, and no-rate/manual evidence are required together, while D&D, commodity/weight dimensions, full manual quoting, and shared-shell/design-system redesign remain excluded.
3. Contract and manual outcomes remain distinct and canonical: `/pricing-requests` is authoritative; `NO_RATE` is HTTP 404, residual ambiguity is HTTP 422 `PRICING_VALIDATION`, transient/denied/idempotency paths are not relabelled as rates, and Booking safely projects the required manual state without fabricated or partial money.
4. Prior-wave and release evidence is honest: W0/W1/W2 preservation is explicit, the W1 blocked/waived history cannot be rewritten as PASS, and Docker/Compose, demo guards, Playwright, live correlation, and both audits remain blocking release evidence rather than assumed success.
5. Declared `required-sections` and `upstream-coverage` sensors passed for both `requirements.md` and `requirements-analysis-questions.md`.
