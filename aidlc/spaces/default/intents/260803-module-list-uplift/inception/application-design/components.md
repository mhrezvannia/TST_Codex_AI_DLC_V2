# Components - W4-01 Module List-Detail Uplift

## Sources and Boundary Rules

This design implements approved `requirements.md` and `stories.md`, preserves `architecture.md` and `component-inventory.md`, follows `team-practices.md`, and binds the approved Refined Mockups. It extends verified brownfield owners and adds one CMM frontend deployable. It adds no backend service, database, Kafka topic, AWS resource, domain-local shell/theme, or `@erp/ui` fork.

Domain apps own routes, BFF adapters, view models, and domain page composition. W2-02 owns the only shell implementation, route registry, tokens, auth/session plumbing, and shared UI. Backend services remain systems of record for their bounded contexts and databases.

## Component Catalog

| Component | Owner | Responsibility | Explicit non-responsibility |
| --- | --- | --- | --- |
| `PlatformShell` + route registry | W2-02 platform | One shared rail/top bar/mobile nav/skip link/theme/session/navigation API consumed by every canonical app | Domain data, BFF/provider calls, business authorization |
| Nginx canonical mounts | Platform/operations | Prefix-to-app routing, full URI/asset preservation, standard forwarded headers, trust-header stripping | React/HTML composition, session/policy decisions |
| `apps/shell` home/Booking | Platform + Booking composition owner | Home and canonical `/booking/[bookingId]`, including exact Booking-to-Journey relationship region | Reference/Charge/CMM page ownership; `/apps/booking` migration |
| Reference routes/BFF | Reference Data | Stable set/list/detail/create/edit, provider allow-lists and view models | Search/sort/lifecycle actions without contracts |
| Charge routes/BFF | Charge Agreements | Agreement/rate/manual evidence, exact actions, conditional Approval Queue, Reference option adapter | Client-merged queue, manual resolution, Booking ownership |
| `apps/container-movement` | Container Movement | New CMM list/detail/capture routes, BFF, view models, shared-shell root layout | Local shell/theme/auth, Journey creation/correction, Booking detail |
| CMM v2 controller/assertion adapter | Container Movement service | Verified subject, trusted idempotency/correlation, v2 reads/capture mapping | Browser authority, direct public service exposure |
| CMM `timelineV1` normalizer | Container Movement service | Deterministic expected/history sequence and evidence | UI layout, received/source facts not owned by Journey state |
| Identity policy | Identity | Current-request exact read/action decisions | Cached/stale authorization |
| Reference option port | Reference Data | Bounded authorized active location/reference options | App-to-app imports or shared mutable catalog |
| Existing service stores/outboxes/consumers | Service owners | Owned aggregates, idempotency receipts, outboxes and projections | Cross-service SQL or new W4 topic |

## Implementable Single-Shell Composition

The edge does not wrap independent Next.js HTML. Instead, every canonical deployable renders the same W2-02-owned `PlatformShell` API at its root layout. `apps/shell` replaces `ShellFrame`; Reference and Charge replace their title-derived local shell calls; new CMM consumes the same export from first implementation. Thus there is one shell implementation/configuration even though separate Next processes render it for their own routes.

Reference, Charge, and CMM use Next `basePath` values matching their canonical prefixes; Nginx preserves the full URI and assets under `/<prefix>/_next/*`. A host-wide session cookie uses `Path=/`. The edge forwards Cookie/Host/forwarded scheme and a server-generated correlation ID, while stripping inbound actor/service/assertion trust headers. Direct navigation and refresh are ordinary full-document requests to the owning app and still produce the shared shell.

Exact mounts are `/` and `/booking*` to `apps/shell`, `/reference-data*` to Reference, `/charge-agreements*` to Charge, and `/container-movement*` to CMM. Module roots return 200. Only the four requirements-approved Charge routes redirect 308; malformed/unknown paths return 404 and CMM has no legacy redirect.

## Public Contract Closure

`component-methods.md` defines every named public type, capability, result discriminator, safe-return allow-list, BFF method, media/header mapping, and transport outcome. Key rules are:

- every BFF read returns `ReadResult<T>` and every command returns `MutationResult<T>`;
- proposed CMM permissions are `container-movement:read` and `container-movement:capture`, blocked until Identity registration/tests;
- Charge uses `charge-agreements:*`, `charge-rates:*`, and `charge-manual-cases:read`; the shell's current singular Charge spelling is a platform correction, not a second alias;
- same-module return targets are relative, prefix-bound, length-bounded, and query allow-listed; Booking/Journey cross-links use a signed subject/source/target-bound origin token with canonical fallback;
- invalid or duplicate read-query keys return typed `invalid-query`/HTTP 400 before any provider call;
- CMM v2 receives a signed subject assertion, header idempotency/correlation, and no browser actor/idempotency/correlation body fields;
- Charge-to-Reference active option lookup has a typed query/result/port and exact browser/provider endpoint, auth, correlation, cardinality, and failure mapping;
- every public edge location applies the exact eleven-header clear list and five trusted replacement rules declared in `component-methods.md`;
- Approval Queue segments exist only after both corresponding server Draft/pending filters and pagination pass.

## CMM Timeline and Capture Decision

The existing default Journey response remains compatible. The CMM BFF requests `application/vnd.linercore.container-journey-v2+json`, whose required `timelineV1` is produced by the service. The normalizer maps `GTOT|ACT_GTOT`, `ACT_LOAD`, `ACT_DISC`, and `ACT_GTIN` to GTOT/LOAD/DISC/GTIN; retains every accepted history record; preserves repeated legacy records; represents unsupported legacy evidence as `OTHER`; and emits planned canonical stages only when not recorded.

LOAD/DISC expected locations come from provider expected movements; GTOT inherits LOAD location and GTIN inherits DISC location. Recorded items carry occurrence, actual location, event ID, correlation, validation outcome, and ordering basis. Received time and source stay absent because current Journey state does not own them. The BFF/browser never merges, deduplicates, calculates next move, or invents lifecycle.

After action authorization, the BFF creates a signed short-lived capture-attempt token containing a server random idempotency key and binding it to subject, journey, provider `updatedAt`, and action. The browser echoes only the opaque token plus event code/location/occurrence. Definitive validation/conflict issues a replacement token; unknown outcome retains the original and requires authoritative re-read before retry.

## Booking and Cross-Module Ownership

Source inspection establishes `apps/shell/app/booking/[bookingId]/page.tsx` as the canonical `/booking/[bookingId]` composition. The Booking-to-Journey adapter is added beside that page and its shell Booking client, not to `apps/booking`. It authorizes and calls CMM v2 by exact `bookingId`; present, not-created, denied, and unavailable remain distinct.

Journey-to-Booking links to exact `/booking/[bookingId]`. Agreement-to-Booking and Booking-to-Agreement remain blocked by the requirements matrix. Charge supporting rate-version evidence uses exact provider IDs. No domain app imports another domain app's React components.

## Event Choreography and Failure Containment

Booking and CMM publishers have durable outbox retry/permanent dispositions. CMM consumes Booking confirmation idempotently with revision guards; Booking consumes movement status with durable event receipts, duplicate suppression, and stale projection rules.

The listener factories have no verified bounded retry, poison-message handler, DLQ, or replay contract. W4 adds no topic, so this is a named service/platform BLOCKED dependency. Under current behavior one poison record can block its partition; other partitions, synchronous module reads, owning aggregate truth, and direct relationship lookup remain available. CMM persistence, publication, delivery, and Booking application are always separate truths.

## Data, Degradation, and UI Ownership

- Identity, Reference, Charge, Booking, and CMM retain separate PostgreSQL ownership.
- W4 adds no cache or BFF persistence; last-known facts require provider source/time and current authorization.
- Raw authorized IDs may survive label outage, but capture needing active Reference validation is disabled.
- CMM capture remains a CMM aggregate command; Booking learns status through existing events.
- Shared UI gaps remain W2-02 dependencies. Domains may compose semantic markup with shared tokens but may not fork general primitives.
- All user-facing errors are typed, safe, actionable, correlation-bearing where supplied, and keep technical evidence collapsed/access-appropriate.

## Functional Requirement Trace Matrix

| Requirement | Component | Method/contract + ADR | Blocker/dependency | Verification seam |
| --- | --- | --- | --- | --- |
| FR-001 | shared shell/registry, mounts | `PlatformShellProps`, registry; ADR-002/008 | W2-02 shared release | one shell implementation/landmark/nav across prefixes |
| FR-002 | mounts + domain routes | basePath/mount contract; ADR-002/003 | CMM app/mount | direct load/refresh exact seven URLs |
| FR-003 | Reference app/BFF | Reference read VMs/methods; ADR-001 | provider history required | set-list-detail values/history tests |
| FR-004 | Reference BFF/Identity | exact create/update capabilities; ADR-004/006 | lifecycle actions blocked until exact policy | read-only/action-specific tests |
| FR-005 | Charge app/BFF | Agreement detail/tabs/rate IDs; ADR-001 | D&D field mapping if absent | provider-backed tab/detail tests |
| FR-006 | Charge BFF | lifecycle/version commands; ADR-006 | provider preconditions | immutable history + legal-action tests |
| FR-007 | CMM app/provider | `JourneyProviderV2.timelineV1`; ADR-003/005 | app and v2 contract | recent/detail/timeline/Booking live tests |
| FR-008 | CMM capture/provider | signed attempt + `MutationResult`; ADR-004/005/009 | CMM capability/assertion | accepted/duplicate/sequence/pending tests |
| FR-009 | all list BFFs | exact query types plus `invalid-query`; ADR-006 | unsupported controls stay blocked | duplicate/unknown-key 400 without provider call, plus refresh tests |
| FR-010 | domain route state boundaries | `ReadResult<T>`; ADR-007 | trustworthy stale facts only | eight list-state fixtures |
| FR-011 | detail/action boundaries | read/mutation discriminators; ADR-004/007 | provider-specific state fixtures | detail outcome/context tests |
| FR-012 | registry + BFF policy | capability union/PolicyDecision; ADR-002/004 | exact CMM capability | hidden nav, denied deep link, read-only tests |
| FR-013 | mutation forms/BFF | attempt token + MutationResult; ADR-004/005 | shared form/focus primitive if missing | duplicate-submit, retain/focus/announce tests |
| FR-014 | shell Booking + CMM links | relationship BFF/exact href; ADR-001/003 | Agreement directions remain blocked | present/absent/denied/degraded link tests |
| FR-015 | route + safe-return policy | list return plus signed cross-module origin; ADR-002/008 | provider-supported context only | share/Back/filter/page/focus and invalid-origin fallback tests |
| FR-016 | safe-return policy | explicit rejection grammar; ADR-008 | none | malicious return-target matrix |
| FR-017 | Reference/Charge routes | exact retirement matrix; ADR-002 | only four Charge mappings | 200/308/404 route tests |
| FR-018 | CMM mount | first canonical entry; ADR-003 | frontend absent until built | assert no CMM compatibility redirect |
| FR-019 | provider/BFF degradation | stale `ReadResult`; ADR-007 | provider persistence/source/time | independent dependency-outage tests |
| FR-020 | Identity/BFF | current request policy; ADR-004/007 | Identity availability | no cached ALLOW/provider-call-on-deny tests |
| FR-021 | error/evidence boundary | result/reference transport map; ADR-004/009 | provider reference when supplied | safe primary/collapsed evidence tests |
| FR-022 | shared shell/`@erp/ui` | shared implementation; ADR-002/008 | W2-02 release | cross-module grammar and no-fork audit |

## Non-Functional Requirement Trace Matrix

| Requirement | Component | Contract/ADR | Blocker/dependency | Verification seam |
| --- | --- | --- | --- | --- |
| NFR-001 | BFFs/local topology | synchronous paths; ADR-001 | live fixture/host | documented 10-user p95 run |
| NFR-002 | shared shell/domain pages | one landmark/focus grammar; ADR-002/008 | missing shared behavior blocks | automated/manual WCAG matrix |
| NFR-003 | shared responsive primitives | Refined Mockup contracts; ADR-008 | none beyond shared release | five widths, themes, zoom/overflow |
| NFR-004 | session/Identity/BFF/assertion | trusted-boundary contract; ADR-004 | CMM assertion/capability | spoof/no-flash/no-direct-DB tests |
| NFR-005 | read/mutation boundaries | typed recovery/attempt token; ADR-005/007/009 | truthful provider fixtures | preserved context/no silent advance |
| NFR-006 | changed frontends | repository coverage gate | changed-code set/tool pin | executable line coverage >=80% |
| NFR-007 | all W4 components | gate/evidence contract | live stack/audits | blocking test/type/lint/build/route/UI audits |
| NFR-008 | W4 security aggregation | bounded touched-path gate | `u02-security` or equivalent | executed blocking report |
| NFR-009 | ownership/package boundaries | ADR-001/002/008 | no local fork | strict TS/lint/import architecture checks |
| NFR-010 | BFF/provider/event boundaries | result/correlation semantics; ADR-004/009 | provider evidence | typed bounded logs/UI references |
| NFR-011 | evidence registry | explicit PASS/BLOCKED semantics | poison/replay/shared/runtime gaps | no static-to-live promotion audit |
| NFR-012 | Compose/edge/apps | local-only topology; ADR-001/003 | manager-demo guard | approved wrapper pre/post evidence |

## User Story Trace Matrix

| Story | Component | Method/contract + ADR | Blocker/dependency | Verification seam |
| --- | --- | --- | --- | --- |
| US-001 | shell registry/Identity | visible routes + PolicyDecision; ADR-002/004 | CMM permission | permitted nav + denied deep link |
| US-002 | mounts/safe return | registry/return policy; ADR-002/008 | CMM mount | refresh, Back, redirect/404 matrix |
| US-003 | Reference list | `listSets/listRecords`; ADR-006 | search/sort blocked | provider controls only |
| US-004 | Reference detail | `getRecord`; ADR-001 | provider history | stable ID + summary/attributes/history |
| US-005 | Reference mutations | create/update MutationResult; ADR-004/006 | lifecycle actions blocked | validation/version/reauthorize/refetch |
| US-006 | Reference degradation | ReadResult/stale; ADR-007 | trustworthy persisted facts | outage/retry/no fabrication |
| US-007 | Agreement list | `listAgreements`; ADR-006 | query mismatch must close | exact provider filters/refresh |
| US-008 | Agreement detail | `getAgreement`; ADR-001/006 | D&D evidence if absent | tabs/version/rate/history truth |
| US-009 | Charge mutations | lifecycle/successor methods; ADR-004/006 | provider legal transitions | action capabilities/conflicts/history |
| US-010 | Approval/manual evidence | queue/manual reads; ADR-006 | both queue segments conditional | no client merge/no resolution action |
| US-011 | CMM recent list | `listRecent`; ADR-003/006 | app/mount/capability | bounded limit/fixed order/no fake controls |
| US-012 | CMM detail | v2 timeline + exact Booking; ADR-005 | v2 provider contract | all evidence/order/link states |
| US-013 | CMM capture | attempt/assertion/MutationResult; ADR-004/005/009 | capability/assertion | accepted/rejected/unknown no optimism |
| US-014 | shell Booking relationship | `resolveForBooking`; ADR-001/003 | shell client + CMM v2 | present/not-created/denied/degraded |
| US-015 | Charge rate evidence | exact rate version methods/IDs; ADR-006 | provider stable parent/evidence | exact supporting version navigation |

## Review Notes

Implementation remains BLOCKED on the shared W2-02 shell/registry release, CMM app/mount and exact Identity capability registration, CMM v2 producer/consumer contract, provider-tested Approval Queue filters, any missing shared primitives, poison/replay ownership evidence, and live integrated acceptance. Each blocker has an owner and verification seam; none permits a shell/theme/component fork or fabricated behavior.

## Review - Iteration 1

**Verdict: NOT-READY**

The independent reviewer found six issues: the original one-shell edge model lacked an implementable document-composition mechanism; public types/results were undefined or inconsistent; the CMM timeline/identity/idempotency seam deferred required decisions; canonical Booking ownership conflicted with source; traceability used blanket ranges; and the Booking/CMM event loop lacked cited replay/poison/blast-radius evidence. Structural sensor equivalents passed but did not cure those architecture gaps.

## Review Resolution - Iteration 1

The revision resolves those findings as follows:

1. ADR-002 now uses federated route ownership with one shared shell implementation rendered by every app; exact base paths, assets, cookies, forwarded/stripped headers, direct refresh, and W2-02 consumer changes are specified.
2. `component-methods.md` now declares capabilities, all signature types, safe-return grammar, consistent read/mutation discriminators, transport mappings, Charge-to-Reference communication, and server-issued capture idempotency.
3. ADR-005 and the v2 contract settle endpoint media negotiation, deterministic timeline merge/repetition/legacy semantics, evidence availability, subject assertion, and capture headers.
4. Canonical Booking ownership is fixed at `apps/shell/app/booking/[bookingId]`; W4 does not assign the relationship to `apps/booking`.
5. This artifact maps every FR, NFR, and user story individually to components, contracts/ADRs, blockers, and verification seams.
6. Event controls are cited from verified source behavior; missing listener poison/DLQ/replay controls and their partition blast radius are explicitly BLOCKED rather than claimed as existing.

## Review - Iteration 2

**Verdict: NOT-READY**

The revision resolves the shell-rendering topology, canonical Booking owner, CMM v2 timeline/capture contract, Approval Queue admission rule, per-ID trace tables, and event-loop disclosure. Four implementation-significant contract gaps remain:

1. **Booking return context is not representable.** `SafeReturnPolicy.parse` accepts only `reference | charge | cmm`, and its allow-lists contain no Booking origin, while US-012 and US-014 require validated bounded navigation in both Journey-to-Booking and Booking-to-Journey directions. `BookingJourneyRelationshipValue.href` is only an unconstrained string. Add an exact Booking origin schema (or signed bounded origin token), canonical `/booking/[bookingId]` validation, allowed focus/query fields, fallback behavior, and its use/tests in both directions.
2. **The cataloged Charge-to-Reference port has no public interface.** The artifacts say this is an explicit bounded service contract, but `component-methods.md` declares no option query/result/port method and no exact endpoint/media/auth/correlation/cardinality/failure mapping. Bind the verified existing `proxyReferenceOptions` seam explicitly or define the additive replacement so Charge and Reference owners can implement and contract-test the same call shape without guessing.
3. **Invalid read input has no declared result.** All public reads are said to return `ReadResult<T>`, but that union and the transport table have no invalid-query/validation branch even though unknown or duplicate query keys must be rejected. Add the discriminator and HTTP mapping, or explicitly place parsing before the BFF boundary and declare that parser contract.
4. **Trust-header stripping is not yet an executable edge rule.** The design names wildcard families such as `X-Actor-*` and other trust headers but does not choose an allow-list mechanism or enumerate exact headers; stock Nginx cannot implement wildcard `proxy_set_header` removal. Specify `proxy_pass_request_headers off` plus the complete re-added header set, or enumerate every stripped header and overwrite rules, including edge-generated correlation behavior.

Validation: the Bun sensor commands still fail before content evaluation with Windows `EPERM` while reading the TypeScript sensor files. Independent equivalents pass after inspecting the sensor implementations: every produced artifact has at least two H2 sections and references all declared upstream artifacts; the design contains all 34 approved FR/NFR IDs and all 15 story IDs; and ADR-001 through ADR-009 all resolve. Source inspection corroborates the canonical `apps/shell/app/booking/[bookingId]` owner, existing Charge base path, CMM/Booking consumer idempotency and stale guards, concurrency-only listener factories, and the absence of explicit retry/DLQ/replay configuration. The EPERM is infrastructure-only; it does not clear the four content findings above.

## Review Resolution - Gate Revision 1

The human selected Request changes after reviewer iterations were exhausted. The lead resolved the four iteration-2 findings without invoking an unauthorized third reviewer:

1. `SafeReturnPolicy` now supports Booking list context and signed Booking/Journey cross-module origin tokens with exact subject/source/target/expiry binding, canonical href validation, and fallback.
2. `ChargeReferenceOptionsPort` now declares exact query/result types, browser and provider endpoints, capability/auth/correlation rules, 50-item bound, and failure mapping.
3. `ReadResult<T>` and the transport table now include `invalid-query`/HTTP 400, with duplicate/unknown keys blocked before provider access.
4. Every public Nginx location now clears an exact eleven-header trust list and then sets five trusted edge values; internal BFF service calls bypass the public header policy.

All four corrections are covered by updated dependency and trace verification seams. The reviewer verdict remains the historical final independent verdict because `reviewer_max_iterations=2`; the corrected artifacts return to the human gate for final judgement.
