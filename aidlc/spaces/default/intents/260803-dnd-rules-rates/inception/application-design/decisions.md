# Architecture Decisions - W3-01 D&D Rules and Rates

## Traceability basis

These ADRs resolve the questions recorded in [application-design-questions.md](application-design-questions.md) and implement [requirements.md](../requirements-analysis/requirements.md), [stories.md](../user-stories/stories.md), and [team-practices.md](../practices-discovery/team-practices.md). Brownfield constraints come from [architecture.md](../../../../codekb/TST_Codex_W3-01/architecture.md) and [component-inventory.md](../../../../codekb/TST_Codex_W3-01/component-inventory.md); UI constraints come from the approved [design-system-mapping.md](../refined-mockups/design-system-mapping.md).

## ADR-001 - Dedicated versioned D&D aggregate

**Status:** Proposed for Application Design approval

**Context:** D&D shares lifecycle ideas with W2-03 Rate, but adds fixed movement bounds, port side, free days, exact basis snapshots, and historical evaluation semantics. The legacy three-field `DndRule` cannot meet FR-01 through FR-04.

**Options:**

- A - Dedicated `DndTerms`: cohesive invariants, protects W2-03, moderate additive code, easy-to-moderate reversal.
- B - Extend generic `Rate`: less initial code, but couples unlike applicability/authority models and makes compatibility risk high; hard to reverse after data exists.
- C - Expand legacy `DndRule`: smallest diff, but cannot represent required lifecycle/lineage and is not viable.

**Decision:** Option A, as answered in Q1. Pattern lifecycle and repository behavior after W2-03 without inheritance or shared aggregate mutation.

**Consequences:** New aggregate/version/activity tables and services are required. Some lifecycle code is intentionally parallel. W2-03 models and contracts stay stable.

**Alternatives rejected:** B risks contract and domain erosion; C fails approved requirements.

**Reversibility:** Moderate before persisted D&D data; locked-in migration/data conversion after live use.

## ADR-002 - Extend the existing Charge deployable

**Status:** Proposed for approval

**Context:** Charge already owns agreements, rates, pricing authority, identity seams, PostgreSQL, BFF, and UI. D&D is commercial charge logic.

**Decision:** Add components to `charge-agreement-service` and `apps/charge-agreements`. Do not add a D&D microservice, AWS resource, shared database, event topic, or direct CMM consumer.

**Consequences:** Strong local transactions and reuse of operational controls; Charge grows but remains cohesive. Scaling is the existing Charge replica model.

**Alternatives rejected:** A new service adds distributed consistency, deployment, identity, observability, and ownership cost with no approved independence requirement. CMM placement violates domain ownership.

**Reversibility:** Moderate; clean ports and tables permit later extraction, but no extraction is justified now.

## ADR-003 - Exact echoed snapshot, never re-selection

**Status:** Proposed for approval

**Context:** FR-04/FR-10 require historical reproducibility across newer Agreement/Tariff and D&D versions.

**Decision:** Require echoed `pricingRequestId`, basis/reference/version/effective-date and applicability. Fresh W2 completion stores typed immutable POL/POD, trade-lane, equipment-type, and effective-date evidence beside the terminal bytes. A distinct `DndPricingBasisEvidencePort` loads that `STANDARD_PRICING` receipt and preserved exact Agreement/Rate versions. Never reuse the current-selection `PricingAuthoritySnapshotPort`. After comparing every echoed value, resolve the exact Approved D&D version. No agreement-first selection, latest-version lookup, inferred applicability, or silent upgrade is allowed. A pre-W3 receipt missing complete evidence returns `NO_RATE` rather than being reconstructed.

**Consequences:** Requests are larger and validation is strict; results are reproducible and attributable. Unknown/inactive/mismatched evidence uniformly returns `404 NO_RATE`.

**Alternatives rejected:** Re-running current pricing authority is simpler but changes historical outcomes. Partial inference is operationally convenient but produces guessed charges.

**Reversibility:** Locked by the bilateral contract and audit expectations.

## ADR-004 - Reference Data owns port timezone

**Status:** Proposed for approval

**Context:** Port-local dates require an IANA timezone. Port metadata already belongs to Reference Data.

**Options:**

- A - `LOCATION.attributes.timeZoneId` plus Charge `PortTimeZoneProvider`: single authority, existing seam, synchronous dependency, easy adapter replacement.
- B - Copy timezone onto every terms version: calculation isolation but duplicated authority and refresh ambiguity.
- C - Charge-local port map: fewer calls but creates a second master.

**Decision:** Option A, as answered in Q3. `timeZoneId` remains optional for legacy LOCATION compatibility; when present Reference Data validates IANA syntax. W3-01 backfills `SGSIN=Asia/Singapore` and `NLRTM=Europe/Amsterdam`. D&D approval requires it; Charge resolves it with existing service credentials, 250/500 ms connect/response timeouts, no retry/cache/guess, and validates again at its adapter boundary.

**Consequences:** Evaluation depends on Reference Data availability unless a separately approved bounded cache is designed later. No holiday data is introduced.

**Alternatives rejected:** B and C violate data ownership and create drift.

**Reversibility:** Easy at the port adapter; the ownership decision is intentionally stable.

## ADR-005 - Namespaced reuse of the pricing receipt pattern

**Status:** Proposed for approval

**Context:** FR-08 needs durable concurrency, replay, and fenced completion. Existing `pricing_requests` provides database-time leases and terminal byte replay, but its W2-03 identities and uniqueness cannot be conflated with many D&D events per booking.

**Options:**

- A - Extend the store with `operation_namespace`, keeping W2 methods in `STANDARD_PRICING` and D&D in `DND_PRICING`: reuses proven semantics, additive migration, moderate schema risk.
- B - Entirely separate receipt mechanism/table: strong physical isolation but duplicates subtle ownership/fencing logic.
- C - In-memory dedupe: cannot survive restart and is not viable.

**Decision:** Option A, as answered in Q4. Preserve W2 serialization and existing repository operations; make existing W2 SQL explicitly qualify `STANDARD_PRICING`; expose a D&D-specific port backed by the same generalized JDBC receipt implementation. The migration atomically replaces the global primary/unique/terminal constraints with namespace-aware identities and terminal shapes. D&D adds owner-fenced `releaseOwned` for every handled post-claim error. The existing Standard `PricingRequestRepository` gains the same fenced release operation solely for handled W3 metadata-enrichment failures after claim ownership. Process crashes remain takeover-by-lease in both namespaces.

**Consequences:** Migration must preserve legacy primary/unique behavior and tests. D&D can store several event closures per booking without colliding with W2 amendment identity. A handled Standard enrichment failure permits immediate retry instead of leaving a false live claim; W2 success/replay/conflict/crash regression fixtures remain binding.

**Alternatives rejected:** B duplicates safety-critical logic; C fails reliability.

**Reversibility:** Moderate before D&D receipts; difficult after persisted namespaced data.

## ADR-006 - Additive `pricing.v1` contract

**Status:** Proposed for approval

**Context:** W2-03 is approved and has Booking consumer fixtures. W3-01 needs a new provider operation and trigger metadata but does not own Booking runtime wiring.

**Decision:** Keep the already-required `applicableDndRuleTypes` property and replace the runtime `List<String>` placeholder with its existing structured OpenAPI item. A new `DndTriggerMetadataResolver` enriches only fresh booking-time pricing before terminal rendering. A handled enrichment failure owner-fenced releases the `STANDARD_PRICING` claim before returning unavailable; a crash retains lease takeover. Add backward-compatible `pricingBasisVersionId` and `pricingEffectiveDate` provider fields, plus additive exact `pricing.dnd-request/result` schemas and `POST /dnd-pricing-requests`. Do not remove, rename, or change an existing W2-03 required field. Require regenerated provider/consumer fixtures and dual owner signoff.

**Consequences:** New W2 successes contain immutable trigger/version evidence and replays never drift. Legacy consumers remain compatible. Booking gains compile/fixture awareness but no runtime trigger in this intent.

**Alternatives rejected:** A v2 replacement creates unnecessary migration; changing `/pricing-requests` semantics risks W2-03 behavior; embedding rates/free days in trigger metadata leaks Charge authority.

**Reversibility:** Additions can be deprecated later but not silently removed once consumers sign.

## ADR-007 - Reuse `charge-rates` capabilities

**Status:** Proposed for approval

**Context:** W2-03 already establishes least-privilege read/create/update/approve/create-successor permissions for commercial rates.

**Decision:** Protect D&D admin operations with the same `charge-rates` read/create/update/approve/create-successor family. Protect D&D provider calculation with the existing W2-03 `charge-agreement:price` service-subject decision. Reuse the established subject/correlation/service identity boundary; do not invent a new `evaluate` action.

**Consequences:** No entitlement migration or seed expansion to a second resource. D&D cannot be delegated separately in W3-01.

**Alternatives rejected:** A new `dnd-terms` resource adds identity/policy/signoff scope without an approved business need.

**Reversibility:** Easy-to-moderate if future governance requires finer separation.

## ADR-008 - Combined stable Charge route family

**Status:** Proposed for approval

**Context:** Approved Requirements, User Stories, and Refined Mockups treat rule and flat rate as one governed commercial object.

**Decision:** Use `/charge-agreements/dnd/terms`, `/new`, `/[dndTermsId]`, edit through `?mode=edit`, and `/successor`, as answered in Q5. Server-render route compositions use Charge-local BFF functions and feature-local interactive islands.

**Consequences:** One resource identity and lifecycle flow; no calculation preview. URLs remain stable across responsive layouts.

**Alternatives rejected:** Split rule/rate routes duplicate lifecycle; `/rates?kind=dnd` hides D&D semantics and couples the generic surface.

**Reversibility:** Moderate after bookmarks/tests exist.

## ADR-009 - Shared LinerCore shell remains platform-owned

**Status:** Proposed for approval with upstream blockers

**Context:** NFR-06 and the approved Refined Mockups require the one shared shell and `@erp/ui`. Indexed source shows missing/incorrect shared seams for rail membership/order, skip/main navigation, generic notices, scoped failures, D&D status tones, and dialog descriptions.

**Decision:** W3-01 composes shared components and adds only D&D page/form/list/detail components. Generic `StatusStrip`, explicit-tone `Badge`, and section-safe markup are available feature compositions. W2-02 exclusively owns `packages/ui` and the shared shell and must deliver two baseline dependencies before the Charge frontend Bolt: `PlatformShell` explicit module/canonical rail/shared skip-main, and `Dialog` description association. W4-01 owns only its Reference Data page work. Package tests gate each dependency; Delivery Planning records the merged workspace revision; W3-01 route Playwright proves consumption. No local shell/dialog/token/font/color fork is allowed.

**Consequences:** Visual coherence and ownership stay intact. The delivery DAG has explicit platform-first Bolts instead of an unowned acceptance waiver.

**Alternatives rejected:** Local shell/primitives would pass one page while fragmenting the product and violating W2-02 ownership.

**Reversibility:** Easy for feature composition; shared changes remain owned by the platform team.

## ADR-010 - Calendar-day calculation is pure and timezone-explicit

**Status:** Proposed for approval

**Context:** FR-05 pins a port-local epoch-day formula and forbids working-day/holiday logic.

**Decision:** Resolve a valid `ZoneId`, convert both instants to local dates, apply the exact max formulas, and multiply one flat daily rate. Return zero lines explicitly. Persist timezone and source-version evidence in the result.

**Consequences:** DST clock-hour length is irrelevant; same local date is zero; weekends/holidays are ordinary. Tiering and calendars cannot leak into W3-01.

**Alternatives rejected:** UTC-day differences and duration/24 calculations produce wrong boundary behavior; holiday libraries are out of scope.

**Reversibility:** Locked by the approved bilateral formula.

## ADR-011 - Serialize overlap approval by full applicability key

**Status:** Proposed for approval

**Context:** Locking one aggregate cannot prevent two different aggregates from concurrently approving the same empty applicability/window space.

**Decision:** In the approval transaction, acquire `pg_advisory_xact_lock(hashtextextended(canonicalApplicabilityKey,0))`, where the key length-prefixes basis, basis-version id, rule type, side, port, trade lane, and equipment type. Then query Approved rows with inclusive `daterange(...,'[]')` overlap before update/activity append. Hash collisions only over-serialize. Map a conflict to `422 DND_TERMS_OVERLAP` with effective-window field errors and authorised conflict identity.

**Consequences:** Approval is concurrency-safe without a new PostgreSQL extension. Unrelated keys proceed concurrently; same-key approval serializes.

**Alternatives rejected:** Aggregate locks and preflight queries admit phantom conflicts; a `btree_gist` exclusion constraint is viable but adds extension/schema complexity not otherwise needed.

**Reversibility:** Easy to replace behind the repository transaction contract.

## ADR-012 - Durable D&D evaluation evidence inside Charge

**Status:** Proposed for approval

**Context:** Charge has durable lifecycle activity patterns but no generic evaluation-audit port satisfying US-04 AC3.

**Decision:** Add append-only `dnd_pricing_attempts` and `DndEvaluationEvidenceRepository`. Store bounded disposition-specific columns, never raw payload/service tokens. Terms/source ids are nullable by disposition. Give every row a unique attempt id and provide authorised, bounded retrieval by attempt, correlation, booking/equipment/closing-event identity, outcome/time, or terms id, with supporting indexes. Commit new-success evidence atomically with receipt completion; append replay/rejection evidence before response; authorise queries with `charge-rates:read` and disclose no denied count. Application audit failure becomes `503 PRICING_UNAVAILABLE`; filter rejection keeps its required status and writes a bounded high-severity fallback log if the store is unavailable. W3-01 adds no purge; retention follows Charge business records pending later policy.

**Consequences:** Acceptance evidence is durable and queryable even for pre-resolution authentication, malformed, conflict, and no-rate attempts without inventing an external service. The provider database path gains one bounded append per attempt and bounded indexed audit searches.

**Alternatives rejected:** Log-only evidence is not durable/queryable enough; an external audit service is outside approved topology.

**Reversibility:** Moderate after evidence rows exist.

## Gate decisions and unresolved items

All architecture-choice questions Q1-Q5 already have explicit Option A answers and no contradiction. Application Design approval accepts ADR-001 through ADR-012 together. The remaining items are delivery dependencies, not architecture ambiguity:

1. ADR-009 platform-first Bolts must be scheduled and merged before the dependent Charge frontend Bolt.
2. The required security-scanner gate must actually run or receive an approved policy resolution; absence is not green.
3. The provisional warm-local p99 target requires measured owner acceptance/revision.
4. Charge and Booking owners must sign the regenerated additive fixtures before release.

## Architecture review

The mandatory architecture review completed its two permitted iterations.

- **Iteration 1 - NOT READY:** identified missing exact W2 receipt evidence/enrichment integration, incompatible current-authority port reuse, incomplete receipt migration and release semantics, incomplete provider/security/UI contracts, and an unsupported audit boundary.
- **Iteration 2 - READY:** verified the corrected exact Standard receipt evidence, distinct historical-validation port, namespace migration and owner fencing in both namespaces, provider schema and filter precedence, AgreementVersion/list/history/BFF contracts, durable queryable attempt evidence, timezone failure posture, and exclusive W2-02 shared-shell ownership.

No implementation-blocking ambiguity or cross-document contradiction remains. The review verdict covers ADR-001 through ADR-012 and all five Application Design artifacts.
