# Business Rules — U03 Agreement Authority

## Rule Catalog

| ID | Rule |
|---|---|
| AGR-001 | `agreementId`, `agreementVersionId`, and positive `versionNo` are distinct immutable identities; `rowVersion` is optimistic concurrency only. |
| AGR-002 | A stable Agreement has at most one W2 Draft and any number of immutable-numbered historical versions. |
| AGR-003 | Every persisted W2 Draft contains active customer/lane/origin/destination/equipment identities, an ordered inclusive validity window, and exactly three exact linked RateVersions. |
| AGR-004 | Links contain exactly one BASE/OFR, one SURCHARGE/BAF, and one LOCAL/THC; IDs are distinct and linked RateVersions are Approved. |
| AGR-005 | BASE and SURCHARGE links match agreement origin, destination, and equipment; LOCAL matches origin and equipment and has no destination discriminator. All cover the complete agreement window. |
| AGR-006 | Commodity is legacy-readable only and cannot be a W2 input, match, overlap, approval, list authority, or pricing discriminator. |
| AGR-007 | Only Draft commercial fields/links may change; one complete update increments row version once and requires a reason. |
| AGR-008 | Only an Approved W2 version may seed a successor; the source and its links/activity are unchanged and an existing Draft blocks creation. |
| AGR-009 | Only Draft may approve; only Approved may suspend/expire; Suspended/Expired are terminal in this slice. |
| AGR-010 | Approval requires complete revalidation and rejects inclusive overlap for customer+lane+origin+destination+equipment under the repository advisory lock. |
| AGR-011 | Approval never implicitly retires another authority. An overlapping prior version must be explicitly suspended/expired or windows made non-overlapping. |
| AGR-012 | Suspend/expire changes lifecycle and row version only; frozen commercial snapshot and links remain unchanged. |
| AGR-013 | LEGACY versions remain readable through the default legacy contract and vendor administrative history, but are explicitly noneligible/read-only and never approval or pricing candidates. |
| AGR-014 | Every successful mutation commits version/header/link state, append-only activity, and outbox evidence atomically with actor/time/correlation. |
| AGR-015 | Service authorization is fail-closed and exact for resource `charge-agreements`; browser actor fields never provide authority. |
| AGR-016 | Agreement pages and APIs disclose manual-case data only through U04's separately protected manual capability; agreement read never implies it. |

## Link Compatibility Decision Table

| Link | Required rate identity | Match fields | Coverage/status |
|---|---|---|---|
| BASE | category BASE, code OFR | origin + destination + equipment | Approved and `rate.from <= agreement.from`, `rate.to >= agreement.to` |
| SURCHARGE | category SURCHARGE, code BAF | origin + destination + equipment | Approved and full inclusive coverage |
| LOCAL | category LOCAL, code THC | origin + equipment; stored rate destination must be NULL | Approved and full inclusive coverage |

Trade lane is an Agreement authority-key/reference field but rate applicability follows the U01 category rules above. Customer never belongs to a standalone RateVersion. Duplicate version IDs or a category mismatch fail the entire command.

## Lifecycle and Successor Matrix

| Current exact version | Edit | Approve | Create successor | Suspend | Expire |
|---|---|---|---|---|---|
| DRAFT | allowed with expected row version | allowed after all checks | denied | denied | denied |
| APPROVED | denied | denied | allowed if no existing Draft | allowed | allowed |
| SUSPENDED | denied | denied | denied | denied | denied |
| EXPIRED | denied | denied | denied | denied | denied |
| LEGACY | denied | denied | denied | denied | denied |

Creating a successor does not change the source lifecycle. If its window overlaps any existing Approved authority, later approval returns conflict. Dates do not automatically mutate lifecycle.

## Authorization Matrix

| Operation | Resource/action | Service and UI rule |
|---|---|---|
| list/detail/history | `charge-agreements:read` | authorize before lookup/not-found; reader sees no mutation controls |
| create | `charge-agreements:create` | Pricing Analyst grant; exact signed subject |
| edit Draft | `charge-agreements:update` | capability plus Draft and expected row version |
| approve | `charge-agreements:approve` | distinct approval action; no role-name shortcut |
| successor | `charge-agreements:create-successor` | exact Approved source; no generic manage action |
| suspend | `charge-agreements:suspend` | exact Approved version and reason |
| expire | `charge-agreements:expire` | exact Approved version and reason |

U02 enforces the matching session permission for pages/BFF calls. U03 independently asks Identity through `AuthorizationPort`; either denial stops before protected persistence access.

## Search and Selection Rules

- Vendor-media W2 query fields are `customerId`, `tradeLaneId`, `lifecycle` (including `LEGACY` for history), `validOn`, `page`, and `size`; all other parameters are rejected in that dialect. Default-media legacy queries preserve `commodityId`, `status`, `includeInactive`, and accepted-but-ignored `actor` without reinterpreting them as W2 fields.
- `validOn` uses inclusive version validity and never defaults from the wall clock.
- A stable Agreement is included if at least one version satisfies all supplied version filters.
- With lifecycle filter, the selected summary is greatest matching `versionNo`, except the unique Draft is selected directly. With no lifecycle, priority is Draft, greatest W2 version, then LEGACY.
- `approvedVersion` is returned separately as the greatest Approved version containing supplied `validOn`, or greatest Approved when no date is supplied; otherwise it is NULL.
- Sort is `agreementNumber ASC, agreementId ASC`; service page is zero-based, UI page is one-based, size is 1–100, and totals are stable under the same transaction/query snapshot.
- Detail version selection uses exact `?version=<agreementVersionId>`; invalid/missing selected version returns safe 404 after authorization, not a fallback to another version.

## Validation and Failure Rules

| Condition | HTTP/code class | Mutation |
|---|---|---|
| malformed JSON/path/query/date or missing required field | 400 | none |
| denied subject/action | 403 | none; safe audit only |
| authorized Agreement/version absent | 404 | none |
| stale row version, existing Draft, precommitted/inclusive overlap, concurrent winner | 409 | none |
| wrong lifecycle, invalid window, reference inactive/unknown, link missing/duplicate/wrong category/status/coverage/applicability | 422 | none |
| Identity/Reference Data required dependency unavailable or malformed | 503 | none |

Conflict responses include stable machine codes such as `AGREEMENT_STALE_VERSION`, `AGREEMENT_DRAFT_EXISTS`, and `AGREEMENT_AUTHORITY_CONFLICT`. Semantic errors use field paths and safe codes without exposing unauthorized records. Correlation is present in every response.

## Audit and Event Rules

- Activity actions are exactly `CREATED`, `DRAFT_UPDATED`, `SUCCESSOR_CREATED`, `APPROVED`, `SUSPENDED`, and `EXPIRED`.
- All except CREATED require a trimmed nonblank reason up to 512 characters. UI labels reason as required for these commands.
- Activity ordering is `occurredAt ASC, activityId ASC`; it is append-only and contains no copied customer/commercial payload.
- The corresponding outbox event is stored in the same transaction. Production/JDBC configuration cannot bypass the outbox or publish before commit.
- Event mapping preserves the five existing event types. `charge-agreement.updated` carries additive `lifecycleAction=DRAFT_UPDATED|SUCCESSOR_CREATED`; the other action maps to its same-named lifecycle event.
- Avro `ChargeAgreementLifecycle` 1.1.0 retains every 1.0.0 field/type and adds nullable/default-null exact version ID/number, authority model, source version, and lifecycle action. Schema subjects and topic are unchanged.
- W2 dedupe is `agreementId:agreementVersionId:resultingRowVersion:eventType`; Kafka record key is stable agreement ID. Command methods enqueue through the same transaction-bound Charge datasource and never publish inline.
- Logs/metrics may include correlation, action, lifecycle, and stable/version IDs; they exclude customer names/IDs, lane/location/equipment values, linked rate IDs, dates, and money.

## REST Compatibility Rules

- Default `application/json` selects the existing legacy DTO/query/response contract; vendor `application/vnd.linercore.charge-agreement-v2+json` selects the W2 aggregate/version contract. Mutation content and response accept must agree.
- Legacy adapters query only header `authority_model=LEGACY`. Vendor read adapters return a discriminated W2 or read-only LEGACY history view; vendor command/candidate adapters require `W2_VERSIONED`. No 404/validation/denial falls through between media dialects.
- Existing legacy `actor` query/body properties remain parseable but are ignored as authority/provenance; the same trusted subject requirement applies. Missing trusted identity fails closed.
- Default-media `/active-lookup` remains legacy-compatible. U04 uses the internal W2 candidate port, not that route.
- W2 BFF always supplies vendor media. Unsupported mutation/response media returns 415/406; mixed query grammars return 400 without partial interpretation.
- Pre-W2 legacy request/response/event fixtures and new W2 fixtures are separate blocking suites.

## Scenario Invariants

- No command can leave a W2 Draft with fewer/more than three link rows.
- No successful approval can leave two usable W2 Approved versions for the same match key on an overlapping inclusive date.
- Successor creation and rejected approval preserve the source commercial snapshot and links byte-for-byte.
- Suspension/expiry cannot erase a version, its links, activity, outbox provenance, or Booking's stored attribution.
- A legacy row can be displayed but cannot be converted in place into W2 authority.
- A W2 header cannot appear in any legacy search/detail/active-lookup result even though its V1 projection remains write-once.
- A committed W2 mutation always has exactly one pending outbox row; a failed enqueue leaves no commercial/activity write.
- No Charge page writes shared shell/navigation/typography/palette or `packages/ui`, and no test targets manager port 8088.

## Upstream Coverage

These rules consume `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. They bind the U03 exact-link, approval, concurrency, successor, lifecycle, authorization, provenance, accessible-page, and compatibility constraints without absorbing U04 pricing/manual behavior or U05 Booking behavior.
