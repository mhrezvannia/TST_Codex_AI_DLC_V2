# Unit of Work Story Map - W3-01 D&D Rules and Rates

## Source authority and mapping semantics

This mapping traces approved `stories.md` and `requirements.md` through the unit boundaries derived from Application Design `components.md`, `component-methods.md`, `services.md`, `component-dependency.md`, and `decisions.md`. Unit names and responsibilities are defined in `unit-of-work.md`; hard topology is defined in `unit-of-work-dependency.md`.

A story may span several units because each INVEST outcome crosses contracts, persistence, application, UI or verification boundaries. `Primary` means the unit implements core story behavior; `Supporting` means it supplies a prerequisite or presentation/verification surface. This map does not choose a Bolt or cross-unit build order. The numbered activities inside a unit are internal implementation/test coherence only.

## Story-to-unit matrix

| Unit | US-01 Author terms | US-02 Govern versions | US-03 Calculate snapshot | US-04 Handle attempts | Intent verification |
| --- | --- | --- | --- | --- | --- |
| `pricing-contract-evolution` | - | Supporting (AC5) | Supporting | Supporting | RV-05 contract/fixture/signoff producer |
| `charge-dnd-persistence-foundation` | Supporting | Supporting | Supporting | Supporting | RV-01/RV-05 support |
| `reference-location-timezones` | Supporting | - | Supporting | Supporting unavailability cases | RV-02 support |
| `ui-platform-prerequisites` | Supporting (AC4) | Supporting (AC1/AC4) | - | - | RV-02 support |
| `dnd-terms-administration` | Primary | Primary | Supporting exact version/applicability | Supporting audit/query authority | AC-01/AC-02/AC-08/AC-10 support |
| `dnd-pricing-provider` | - | Supporting historical lineage | Primary | Primary | AC-03-AC-09 primary |
| `standard-pricing-dnd-enrichment` | - | Primary for AC5 | Supporting successor snapshot | Supporting unavailable/replay preservation | RV-05 runtime/replay evidence contributor; not fixture/signoff owner |
| `charge-dnd-ui-bff` | Primary UI | Primary UI | - | Supporting authorised audit views | AC-10/RV-02 primary |
| `w3-01-live-acceptance` | Verification | Verification | Verification | Verification | AC-01-AC-11 executor; RV-01-RV-05 verifier/collector |

Every story is assigned to at least one primary behavior unit and the acceptance unit. Every unit has at least one story or explicit intent-level verification responsibility.

## US-01 - Author deterministic D&D terms

**Requirements:** FR-01, FR-02, FR-09, FR-12; NFR-03, NFR-06.

| Acceptance responsibility | Implementing units |
| --- | --- |
| Fixed rule types, DCSA pair and derived port side | `dnd-terms-administration`, presented by `charge-dnd-ui-bff` |
| Exact applicability/terms persistence and stable detail retrieval | `charge-dnd-persistence-foundation`, `reference-location-timezones`, `dnd-terms-administration`, `charge-dnd-ui-bff` |
| Negative/reference/overlap validation with retained inputs | `dnd-terms-administration`, `charge-dnd-ui-bff` |
| Loading/empty/denied/error/success, keyboard, LinerCore and breakpoints | `ui-platform-prerequisites`, `charge-dnd-ui-bff` |
| Live rule maintenance and audit proof | `w3-01-live-acceptance` |

The behavior is complete only when Charge domain/API and UI evidence agree on derived fields, errors, actions and version identity.

## US-02 - Govern immutable commercial versions

**Requirements:** FR-03, FR-10, FR-12; NFR-02, NFR-07; FR-11 via AC5/RV-05.

| Acceptance responsibility | Implementing units |
| --- | --- |
| Immutable approval and successor-only change | `charge-dnd-persistence-foundation`, `dnd-terms-administration`, `charge-dnd-ui-bff` |
| Denied mutation plus attributable lifecycle audit | `dnd-terms-administration`, `charge-dnd-persistence-foundation`, `charge-dnd-ui-bff` |
| Historical versus successor exact rate linkage | `dnd-terms-administration`, `dnd-pricing-provider`, `standard-pricing-dnd-enrichment` |
| List/detail/history lineage and non-color status/action meanings | `dnd-terms-administration`, `ui-platform-prerequisites`, `charge-dnd-ui-bff` |
| Metadata-only `applicableDndRuleTypes` | `pricing-contract-evolution`, `standard-pricing-dnd-enrichment` |
| Bilateral fixture signoff | `pricing-contract-evolution` produces the signed manifest; `w3-01-live-acceptance` verifies and collects it |
| Live successor and W2 runtime compatibility | `standard-pricing-dnd-enrichment` produces focused runtime/replay regression evidence; `w3-01-live-acceptance` verifies and collects it |

No unit may make an Approved version editable or silently map an old snapshot to a newer version.

## US-03 - Calculate an exact echoed pricing snapshot

**Requirements:** FR-04, FR-05, FR-07, FR-10; NFR-01, NFR-02.

| Acceptance responsibility | Implementing units |
| --- | --- |
| Exact echoed request/result contract | `pricing-contract-evolution` |
| Immutable Standard receipt and preserved basis-version evidence | `charge-dnd-persistence-foundation`, `standard-pricing-dnd-enrichment` |
| Exact Approved terms/version lookup | `dnd-terms-administration`, `dnd-pricing-provider` |
| IANA port timezone and local-date boundary | `reference-location-timezones`, `dnd-pricing-provider` |
| Zero/within-free/non-zero pure calculation and source evidence | `dnd-pricing-provider` |
| Historical/successor behavior | `standard-pricing-dnd-enrichment`, `dnd-terms-administration`, `dnd-pricing-provider` |
| Warm-local p99 and live numeric/timezone proof | `w3-01-live-acceptance` |

The provider unit owns the calculation outcome; it consumes, but does not redefine, contract, persistence, terms or timezone authority.

## US-04 - Handle evaluation attempts safely

**Requirements:** FR-06, FR-08, FR-12; NFR-02, NFR-03, NFR-04.

| Acceptance responsibility | Implementing units |
| --- | --- |
| Exact filter/controller/application error precedence and shapes | `pricing-contract-evolution`, `dnd-pricing-provider` |
| Namespaced claim/replay/conflict/in-progress/takeover/release | `charge-dnd-persistence-foundation`, `dnd-pricing-provider` |
| Standard enrichment handled-release behavior | `charge-dnd-persistence-foundation`, `standard-pricing-dnd-enrichment` |
| Disposition-specific durable evidence, including nullable terms/source ids | `charge-dnd-persistence-foundation`, `dnd-pricing-provider` |
| Authorised bounded attempt/correlation/business-identity audit views | `dnd-terms-administration`, `dnd-pricing-provider`, `charge-dnd-ui-bff` |
| Error/idempotency/concurrency/security/audit live matrix | `w3-01-live-acceptance` |

No error disposition may persist a failed calculation, fabricate source ids, expose secrets/raw payloads, or leave a handled owned claim falsely live.

## Within-unit implementation coherence

These sequences are internal to each unit; they are not a sequence between units or a Delivery Planning recommendation.

| Unit | Internal coherent sequence |
| --- | --- |
| `pricing-contract-evolution` | 1. lock exact schema/error/header definitions; 2. regenerate provider/consumer types; 3. update fixtures; 4. run W2 compatibility; 5. record owner signoff |
| `charge-dnd-persistence-foundation` | 1. migration/legacy preconditions; 2. domain row mappings and repositories; 3. locking/fencing/release; 4. attempt indexes/query; 5. upgrade/concurrency/restart regression |
| `reference-location-timezones` | 1. optional attribute schema; 2. IANA validation; 3. seed backfill; 4. Charge adapter/timeouts; 5. legacy/boundary/unavailable tests |
| `ui-platform-prerequisites` | 1. shell API/landmark seam; 2. Dialog description seam; 3. keyboard/focus tests; 4. publish merged package revision |
| `dnd-terms-administration` | 1. aggregate/value types; 2. lifecycle/overlap application services; 3. authorization/activity; 4. REST/list/version/relationship queries; 5. domain/application/API tests |
| `dnd-pricing-provider` | 1. transport/filter/auth contract; 2. exact evidence/terms resolution; 3. pure calculator; 4. receipt/evidence orchestration; 5. error/idempotency/performance tests |
| `standard-pricing-dnd-enrichment` | 1. consume generated contract types/fixtures; 2. exact trigger query and result/renderer evidence; 3. Standard completion/release; 4. replay invariance; 5. focused `/pricing-requests` runtime regression evidence |
| `charge-dnd-ui-bff` | 1. typed BFF states/actions; 2. list/detail/AgreementVersion routes; 3. form/approval/history interactions; 4. scoped/error/a11y behavior; 5. responsive light/dark Playwright |
| `w3-01-live-acceptance` | 1. assemble green unit evidence; 2. run isolated Compose API/UI flows; 3. measure p99/coverage/security; 4. verify and collect the already signed fixture manifest and recorded owner decisions; 5. run both exit audits and publish evidence pack |

## Requirements and acceptance coverage

| Requirement/verification group | Owning units |
| --- | --- |
| FR-01-FR-03, FR-09 | `dnd-terms-administration`, `charge-dnd-ui-bff`, supported by persistence/Reference/UI platform |
| FR-04-FR-08, FR-10 | `dnd-pricing-provider`, supported by contract, persistence, terms, Reference and enrichment |
| FR-11 | `pricing-contract-evolution`, `standard-pricing-dnd-enrichment`, `w3-01-live-acceptance` |
| FR-12 | administration/provider/persistence/UI plus `w3-01-live-acceptance` |
| NFR-01 | provider harness and `w3-01-live-acceptance` owner decision |
| NFR-02 | persistence, terms, provider, enrichment and restart/live evidence |
| NFR-03 | terms/provider authorization, filter coverage, UI no-disclosure and security gate |
| NFR-04 | persistence attempt evidence, provider telemetry and authorised UI query |
| NFR-05 | focused tests in every touched-code unit plus consolidated changed-line report |
| NFR-06 | `ui-platform-prerequisites`, `charge-dnd-ui-bff`, live Playwright/fidelity evidence |
| NFR-07 | contract evolution owns schema/generated-fixture compatibility and signoff; persistence owns migration compatibility; enrichment owns Standard runtime/replay regression; acceptance verifies and collects each attributable output |
| AC-01-AC-02 | terms/persistence/Reference/UI and live acceptance |
| AC-03-AC-05 | provider/Reference and live acceptance |
| AC-06-AC-09 | contract/persistence/provider/enrichment and live acceptance |
| AC-10 | terms/UI platform/UI BFF and live acceptance |
| AC-11, RV-01-RV-05 | `w3-01-live-acceptance`, consuming attributable evidence from every unit |

## Coverage verification

- All four approved user stories have primary behavior units, supporting prerequisite/presentation units and live acceptance coverage.
- All twelve functional requirements, seven NFRs, eleven live acceptance criteria and five intent-level release verifications map to at least one accountable unit.
- All nine units have story or explicit verification coverage; no orphan unit exists.
- Cross-cutting W2 preservation, authorization, audit, accessibility, performance, security and fidelity obligations remain visible rather than being hidden inside a generic integration unit.
- Booking runtime triggering and CMM integration remain unmapped because they are explicitly out of W3-01 scope.
