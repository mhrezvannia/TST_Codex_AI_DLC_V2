# Component Dependency - W3-01 D&D Rules and Rates

## Traceability basis

Dependencies implement [requirements.md](../requirements-analysis/requirements.md) and [stories.md](../user-stories/stories.md) while respecting [architecture.md](../../../../codekb/TST_Codex_W3-01/architecture.md), [component-inventory.md](../../../../codekb/TST_Codex_W3-01/component-inventory.md), and [team-practices.md](../practices-discovery/team-practices.md). UI edges are constrained by the approved [design-system-mapping.md](../refined-mockups/design-system-mapping.md). An arrow means the source may depend on the target; reverse dependencies are prohibited unless listed.

## Dependency diagram

```mermaid
flowchart LR
    UI[Charge D&D Pages] --> BFF[Charge D&D BFF]
    BFF --> API[Charge REST Adapters]
    API --> TA[DndTermsApplicationService]
    API --> PA[DndPricingApplicationService]
    API --> W2[Existing PricingApplicationService]
    TA --> AGG[DndTerms Aggregate]
    TA --> TR[DndTermsRepository]
    TA --> VR[DndReferenceValidationPort]
    TA --> RAZ[RateAuthorizationPort]
    PA --> AGG
    PA --> CALC[DndCalculator]
    PA --> TR
    PA --> RR[DndPricingReceiptRepository]
    PA --> PE[DndPricingBasisEvidencePort]
    PA --> TZ[PortTimeZoneProvider]
    PA --> PAZ[W2 AuthorizationPort]
    PA --> AE[DndEvaluationEvidenceRepository]
    W2 --> TM[DndTriggerMetadataResolver]
    TM --> TR
    TR --> DB[(Charge PostgreSQL)]
    RR --> DB
    AE --> DB
    VR --> REF[Reference Data Service]
    TZ --> REF
    PE --> DB
    PE --> AUTHORITY[Preserved exact Agreement/Rate versions]
    UI --> ERPUI[@erp/ui and PlatformShell]
```

Text fallback: the browser depends on the Charge BFF, which depends on Charge APIs. Terms and pricing application services depend inward on the D&D domain and outward through ports. Only JDBC adapters touch Charge PostgreSQL. Only HTTP adapters contact Reference Data/Identity. The UI consumes, but does not fork, the shared shell and primitives.

## Dependency matrix

| Component | D&D domain | Charge DB | Identity | Reference Data | W2 authority | `@erp/ui` | Booking/CMM |
| --- | --- | --- | --- | --- | --- | --- | --- |
| D&D pages | via BFF | no | session via BFF | options via BFF | display only | yes | no |
| Charge D&D BFF | via REST | no | existing server auth | via Charge/admin option API | no direct access | server composition | no |
| REST adapters | app services | no | transport evidence | no direct access | no direct access | no | consumer fixture only |
| `DndTermsApplicationService` | yes | repository port | `charge-rates` authorization port | validation port | exact basis validation metadata | no | no |
| `DndPricingApplicationService` | yes | repository ports | W2 `charge-agreement:price` authorization port | timezone/reference ports | exact receipt-evidence port | no | no runtime edge |
| `DndTriggerMetadataResolver` | fixed bounds | through terms port | no | no | already-resolved fresh authority | no | enriches Booking response only |
| Existing `PricingApplicationService` | trigger resolver | Standard receipt claim/release/completion | existing W2 provider authorization | no | existing current authority | no | existing Booking provider contract |
| `DndPricingBasisEvidencePort` adapter | no | exact Standard receipt plus version tables | no | no | validates preserved evidence only | no | no |
| `DndEvaluationEvidenceRepository` | typed evidence | Charge-owned attempt table | read authorization in query service | no | records ids only when present | no | no |
| `DndCalculator` | value types only | no | no | no | no | no | no |
| JDBC adapters | reconstruct domain | Charge-owned only | no | no | Charge-owned tables only | no | no |
| Reference adapters | no | no | existing service identity | synchronous REST | no | no | no |

## Data flow - terms lifecycle

1. The server-rendered page/BFF obtains permissions and reference options.
2. A feature-local form sends a command with subject/correlation and expected row version.
3. `DndTermsApplicationService` authorizes `charge-rates:<action>` before validation/persistence.
4. Reference identifiers and the exact basis version are validated through ports.
5. The aggregate derives movement bounds/side and enforces Draft lifecycle invariants.
6. The JDBC repository writes version plus activity in one transaction.
7. Approval acquires a transaction-scoped PostgreSQL advisory lock from the full canonical applicability key, then checks inclusive date overlap before immutably approving.
8. The returned view includes server-derived actions; the browser never infers permission from status alone.

## Data flow - pricing evaluation

1. The transport adapter validates syntax and forwards the complete D&D request.
2. The application service derives the tuple key and canonical fingerprint.
3. The `DND_PRICING` receipt adapter determines replay/conflict/in-progress/owner using database time.
4. `DndPricingBasisEvidencePort` loads the immutable `STANDARD_PRICING` terminal receipt by echoed `pricingRequestId` and validates complete basis/reference/version/effective-date/source evidence without current selection.
5. `DndTermsRepository.findExactApproved` resolves only the exact preserved D&D version/applicability.
6. `PortTimeZoneProvider` resolves active Reference Data `LOCATION.timeZoneId` and validates it as IANA.
7. The pure calculator produces the zero/non-zero line and source evidence.
8. Fenced completion persists exact terminal bytes plus success evidence in one transaction. Handled failures append evidence and owner-fenced release the claim before response.

No path reads a newer version as fallback. No path asks Container Movement for facts. No path writes Booking data.

Fresh booking-time pricing has one additional inward edge: after the existing resolver selects `ResolvedPricingAuthority`, `DndTriggerMetadataResolver` queries exact applicable Approved D&D terms and enriches the not-yet-rendered `PricingResult` with structured trigger metadata, basis-version id, and effective date. The renderer then stores those immutable bytes in the Standard receipt. If enrichment fails after claim ownership, `PricingApplicationService` invokes owner-fenced `PricingRequestRepository.releaseOwned` in `STANDARD_PRICING`; a lost release reclassifies the winner. Replay bypasses the resolver, while crashes retain lease takeover.

## Shared resources and contention

| Resource | Users | Protection |
| --- | --- | --- |
| Charge PostgreSQL | W2 pricing, D&D terms, D&D receipts | Namespace-qualified receipt keys; transactions; approval lock; optimistic row version |
| `pricing_requests` | W2-03 standard pricing and W3-01 D&D | every query/update is namespace-qualified; partial W2 amendment uniqueness and D&D booking/equipment/event uniqueness are both preserved |
| `dnd_pricing_attempts` | Provider write path and authorised D&D detail/audit query | append-only in W3-01; success atomic with receipt; unique attempt plus correlation/business-identity/outcome/nullable-terms indexes; denied query returns no count/data |
| Reference Data HTTP capacity | Charge terms validation and timezone resolution | bounded timeouts; no retry storm; fail closed |
| Identity HTTP capacity | Charge admin lifecycle and provider price authorization | existing fail-closed adapter policy |
| `@erp/ui` | all modules | platform ownership; versioned shared package; no Charge-local shell/primitives |
| `pricing.v1.yaml` | Charge provider, Booking consumer | additive generation and dual-owner fixtures |

## Failure isolation

- Reference Data or Identity unavailability cannot be converted to `NO_RATE` or cached guesses; it returns the approved unavailable status.
- A receipt conflict/in-progress stops before reference calls or calculation.
- A handled post-claim failure appends evidence and releases the owned claim; a crash relies on lease expiry/takeover.
- A handled fresh Standard-pricing enrichment failure releases only the owned `STANDARD_PRICING` claim; existing W2 replay/conflict/success and crash lease behavior remain unchanged.
- A stale completion owner cannot publish its calculated bytes.
- An overlap conflict leaves the Draft and user-entered data intact.
- UI BFF failure renders the approved scoped or route-level error state without changing shell ownership.
- Shared UI blockers are explicit dependencies, not duplicated local components.
- AgreementVersion relationship denial discloses no D&D count or identifier; scoped unavailability leaves Agreement facts intact.
- Existing W2-03 rows, serializers, API operations, and fixtures are isolated by default namespace and regression gates.

## Dependency constraints for later design

Functional/NFR/Infrastructure Design must preserve these rules:

1. Domain modules import no Spring, JDBC, HTTP, Next.js, or shared persistence code.
2. Charge owns all D&D tables and never reads Reference Data/Booking/CMM databases.
3. Network calls do not occur while holding the terms approval lock or receipt completion transaction.
4. D&D response persistence is immutable and namespace-qualified.
5. Booking integration remains fixture-only in W3-01.
6. UI implementation composes the existing shared shell; platform gaps require upstream delivery or a recorded blocker.
7. The current-authority `PricingAuthoritySnapshotPort` is never called by D&D historical validation.
8. Security filters explicitly cover `/dnd-pricing-requests` and `/api/charge-dnd-terms/**`.
9. D&D audit evidence is retrievable without a terms id through bounded attempt/correlation/business-identity queries, and missing disposition-specific source fields are never fabricated.
