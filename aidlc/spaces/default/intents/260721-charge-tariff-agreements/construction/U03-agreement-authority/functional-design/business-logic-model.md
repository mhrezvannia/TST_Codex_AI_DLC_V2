# Business Logic Model — U03 Agreement Authority

## Purpose and Boundary

U03 replaces the brownfield one-row `CustomerAgreement` mutation model with a stable Agreement and immutable commercial AgreementVersion history. It consumes the U01-owned V3 schema and exact Approved RateVersions, plus the U02 route/BFF/session boundary. It owns agreement domain behavior, repository mapping, REST contracts, Charge agreement pages, and compatibility reads. It does not author migration files, calculate prices, create manual cases, change Booking, or redesign shared UI.

The baseline service remains useful only as a compatibility seam: its current `CustomerAgreement` record, snapshot-upsert repository, `manage/approve/status` authorization actions, untyped reference list, browser actor defaults, and `local-correlation` fallback are not W2 authority and are replaced for W2 commands.

## Create Stable Agreement and First Draft

`createAgreement(command, subject, correlationId)` performs one transaction:

1. authorize `charge-agreements:create` through the fail-closed Identity-backed port;
2. validate shape, nonblank reason if supplied, inclusive window, and five typed active references: `PARTY_CUSTOMER`, `TRADE_LANE`, `LOCATION` origin, `LOCATION` destination, and `EQUIPMENT_TYPE`;
3. reject browser actor/capability/service-identity fields and ignore display labels as authority;
4. resolve the three distinct exact RateVersion IDs from Charge persistence and validate BASE/OFR, SURCHARGE/BAF, and LOCAL/THC category/code, Approved lifecycle, coverage of the entire agreement window, and applicability compatibility;
5. create the stable `charge_agreements` header with immutable generated `agreementId`, submitted `agreementNumber`, and `authority_model='W2_VERSIONED'`; to satisfy the V1 shape exactly once, its non-authoritative compatibility projection copies the first Draft's customer/lane/window, stores `commodity_id=NULL`, `status='DRAFT'`, `version=1`, creation actor/time, and a stable-header snapshot, and no later W2 command reads or updates those projection fields;
6. create generated `agreementVersionId`, `versionNo=1`, `rowVersion=0`, `authorityModel=W2_VERSIONED`, `lifecycle=DRAFT`, structured fields, canonical Draft snapshot, and exactly three link rows;
7. append `CREATED` activity and an additive `charge-agreement.created` outbox event carrying stable/version identities and correlation; and
8. return the committed detail view.

Any authorization, reference, rate-link, insert, activity, or outbox failure rolls back the complete command. A generated command correlation is never `local-correlation`.

## Update Draft

`updateAgreementDraft(agreementId, agreementVersionId, expectedRowVersion, command, subject, correlationId)` authorizes `charge-agreements:update`, locks/reloads the exact version, and requires it to be the stable Agreement's sole W2 Draft. It validates the complete replacement fields and three links before mutation.

The repository performs `UPDATE ... WHERE agreement_version_id=? AND lifecycle='DRAFT' AND row_version=?`. A zero row count is re-read and mapped to missing, non-Draft, or stale conflict. On success it replaces the three Draft link rows in the same transaction, increments `rowVersion` once for the whole command, updates Draft-only audit columns/snapshot, appends one `DRAFT_UPDATED` activity with required reason, and enqueues one update event. Stable/version IDs, version number, agreement number, authority model, and source version never change.

## Create Successor Draft

`createAgreementSuccessor(agreementId, sourceVersionId, commandOverrides, subject, correlationId)` authorizes `charge-agreements:create-successor` and requires the exact source to be W2 Approved. Under a stable-header `SELECT ... FOR UPDATE`, it rejects an existing Draft, allocates `max(all version_no)+1`, creates a generated version ID, and copies source commercial fields plus exact three links before applying a complete validated override.

The source row, source snapshot, source links, and source activity are never written. The successor stores `source_version_id`, starts as Draft at `rowVersion=0`, and appends `SUCCESSOR_CREATED` activity naming the new version without copying the source's activity list. Suspended, Expired, Draft, and LEGACY versions cannot seed a successor.

## Approve Draft Under Authority Lock

`approveAgreement(agreementId, agreementVersionId, expectedRowVersion, reason, subject, correlationId)` authorizes `charge-agreements:approve`, requires a nonblank reason, and delegates the entire mutation to `AgreementRepository.approveUnderLock`:

1. derive the canonical length-prefixed key from customer, lane, origin, destination, and equipment stable IDs; legacy commodity is excluded;
2. acquire `pg_advisory_xact_lock(hashtextextended(key,0))`;
3. lock/reload the exact Draft and verify expected row version;
4. revalidate typed references and reload all three linked RateVersions after the lock;
5. require exactly one distinct Approved BASE/OFR, SURCHARGE/BAF, and LOCAL/THC version, full inclusive coverage, and exact applicability;
6. query another W2 Approved version with the same match key and `existing.valid_from <= draft.valid_to AND existing.valid_to >= draft.valid_from`, excluding only the exact Draft ID; and
7. if none exists, set lifecycle Approved, increment row version, set approval actor/time, freeze the canonical commercial snapshot/links, append activity, and enqueue the approval event atomically.

The lock is mandatory for every agreement approval writer. Approval never suspends/expires/relinks an existing authority. Existing/precommitted overlap, stale row version, an already-created Draft winner, or a concurrent winner maps to 409. Invalid lifecycle, reference, category/code, coverage, or applicability maps to 422. No failure writes activity/event state.

## Suspend or Expire

The preserved `POST /api/charge-agreements/{agreementId}/suspend` and `/expire` commands authorize their exact actions and require `agreementVersionId`, expected row version, and a nonblank reason. Only W2 Approved may transition. Suspended and Expired are terminal and excluded immediately from new agreement resolution; no automatic date-based transition, resume, reapprove, or delete exists.

The transition does not rewrite commercial fields, frozen snapshot, or links. It increments row version, changes structured lifecycle, appends `SUSPENDED` or `EXPIRED` activity, and enqueues the matching event in one transaction. Historical Booking snapshots remain independently addressable by stored version IDs.

## Search and Detail

`searchAgreements` returns one stable Agreement summary per row for vendor-media administration, deterministic by `agreementNumber ASC, agreementId ASC`, with zero-based service pagination. Accepted W2 filters are exact `customerId`, `tradeLaneId`, `lifecycle` (`DRAFT|APPROVED|SUSPENDED|EXPIRED|LEGACY`), optional inclusive `validOn`, zero-based `page`, and `size` 1–100. Blank values normalize to absent; parameters outside the selected W2 dialect, malformed dates/enums, negative page, and invalid size are 400. LEGACY headers/versions may enter this read model only as explicitly `authorityModel=LEGACY`, `w2AuthorityEligible=false`, read-only history; they never enter approval overlap or pricing candidate results.

For a W2 header, inclusion means at least one W2 version satisfies every supplied version filter; selected summary is the sole Draft when matching, otherwise greatest matching W2 version. For a LEGACY header, only its deterministic LEGACY history is considered and `lifecycle=LEGACY` is the only lifecycle match. With no lifecycle filter, selection is Draft, greatest W2, or deterministic LEGACY according to header model. The response exposes a separate Approved version only for W2: greatest Approved containing supplied `validOn`, or greatest Approved when no date is supplied; otherwise NULL. No server clock is used.

`agreementDetail` authorizes read before lookup and returns a discriminated vendor-media view. W2 headers expose W2 versions ordered `versionNo DESC`, exact links, append-only activity, capability flags, and Draft/greatest-W2 selection. LEGACY headers expose deterministic LEGACY versions/history, existing terms/activity as read-only compatibility evidence, empty W2 links/capabilities, and explicit `w2AuthorityEligible=false`; they cannot be selected by approval/pricing repositories. `?version=` always selects an exact version within the same stable header. Linked labels are presentation enrichment; stored IDs remain authority.

## Published REST Compatibility and Reader Cutover

Existing administration paths remain, but media type selects one complete dialect instead of guessing from fields:

- default/legacy media is the current `application/json`; it preserves the existing search grammar (`customerId`, `tradeLaneId`, `commodityId`, `status`, `validOn`, `includeInactive`, `page`, `size`, and accepted-but-nonauthoritative `actor`), current request/response records including terms, query `version`, and `/active-lookup` response semantics;
- W2 media is `application/vnd.linercore.charge-agreement-v2+json`; the U02 BFF always sends this exact `Accept` and mutation `Content-Type`. It uses the W2 filters/aggregate response and complete version/link commands in this design;
- unsupported media is 415 for mutation or 406 for response negotiation. Unknown parameters are rejected only within the selected dialect; a legacy parameter never causes a W2 semantic reinterpretation.

The controller delegates to two explicit adapters. `LegacyAgreementApiAdapter` uses only `charge_agreements.authority_model='LEGACY'`, existing legacy terms, and the old DTO shapes. It excludes every W2 header from legacy search/detail/active lookup, so the W2 header's intentionally write-once projection can never appear as stale Draft authority. Legacy create/update plus the exact published `POST /api/charge-agreements/{id}/approve?version=`, `/{id}/suspend?version=`, and `/{id}/expire?version=` routes continue for preservation, but require the same trusted internal subject: accepted legacy `actor` query/body fields are ignored, never echoed as provenance, and do not authorize. Each post-V3 legacy mutation also inserts the resulting deterministic LEGACY version-history mirror without making it W2-eligible; legacy response bytes/semantics remain otherwise unchanged.

`W2AgreementApiAdapter` read methods dual-read both header models into the discriminated administrative/history view above; every command and candidate method requires `authority_model='W2_VERSIONED'`. Its exact routes are the existing `GET/POST /api/charge-agreements`, `GET/PUT /api/charge-agreements/{agreementId}`, additive `POST /{id}/versions` and `POST /{id}/versions/{versionId}/approve`, plus preserved `POST /{id}/suspend|expire`; the media type makes overlapping root paths unambiguous. W2 PUT carries exact `agreementVersionId` and expected row version in the body. W2 suspend/expire preserve query `version` as expected row version and add exact `agreementVersionId` plus reason in the vendor body. A vendor mutation against LEGACY returns 422 `LEGACY_AGREEMENT_READ_ONLY`. `/active-lookup` default remains legacy; U04 consumes the W2-only internal candidate repository and never overloads that legacy endpoint.

Contract tests run the pre-W2 legacy fixtures against default media byte-for-byte, prove legacy actor spoofing is ignored/denied safely, and separately prove every W2 BFF request carries the vendor media. No handler falls through from one adapter to the other on 404, validation, or denial.

## Transactional Outbox and Event Compatibility

U03 keeps the five published event types and topics: create → `charge-agreement.created`; Draft update and successor creation → `charge-agreement.updated`; approval → `charge-agreement.approved`; suspend → `charge-agreement.suspended`; expire → `charge-agreement.expired`. Successor is distinguished by additive `lifecycleAction=SUCCESSOR_CREATED`, not a new event type.

The existing `ChargeAgreementLifecycle` Avro record evolves compatibly from `1.0.0` to `1.1.0`: all ten old fields and types remain. Nullable/default-null fields are added for `agreementVersionId`, `agreementVersionNo`, `authorityModel`, `sourceAgreementVersionId`, and `lifecycleAction`. For W2, legacy field `agreementVersion` retains its optimistic-version meaning and equals the resulting `rowVersion`; the additive `agreementVersionNo` carries immutable history order. Payloads contain no customer, match, linked-rate, date, or money values. Schema subjects remain `<eventType>-value`; registry compatibility plus old/new serde fixtures are blocking.

The W2 deduplication key is `agreementId:agreementVersionId:resultingRowVersion:eventType` and the Kafka record key remains stable `agreementId`. `eventId`, source, UTC occurrence, correlation, lifecycle/status, exact version identity/number, authority model, source version, and lifecycle action are written into the existing outbox snapshot. The mapper sets additive fields only when present/schema-supported, so retained 1.0.0 legacy events still publish.

Every W2 application mutation is one Spring `@Transactional` method over the Charge datasource. The new JDBC aggregate repository, activity insert, and existing `JdbcOutboxRepository.enqueue` use the same transaction-bound datasource/JdbcTemplate; enqueue occurs before method return and no publisher is called in the command transaction. Any outbox insert failure rolls back header/version/link/activity changes. Non-local/JDBC startup fails if the outbox repository is absent; the existing relay claims/publishes only after commit and its retry state never changes commercial rows. Direct/noop publication is allowed only in isolated unit adapters and is never acceptance evidence.

## Authorization, Reference, and Failure Adapters

- The service resource is exactly `charge-agreements`; actions are `read`, `create`, `update`, `approve`, `create-successor`, `suspend`, and `expire`. BFF capability checks improve UX but never replace service authorization.
- The U03 controller accepts a signed/internal actor header produced by U02 or the established service principal. It removes `actor` query defaults and `actorSubjectId` request fields. Missing/untrusted identity fails closed.
- Typed Reference Data checks carry field path, exact set, stable ID, and correlation. Unknown/inactive/mismatched references are 422; timeout/unavailable/malformed provider responses are 503. No local permissive validator is wired to W2 commands.
- Link validation is service-owned against U01 RateVersion persistence. A missing/unusable supplied link is a semantic 422 without confirming unauthorized cross-record details.
- HTTP mapping is: 400 malformed/query; 401 only at browser BFF; 403 denied; 404 missing Agreement/version on an authorized read; 409 stale/one-Draft/overlap/concurrency; 422 lifecycle/reference/link/window/applicability; 503 required dependency unavailable. Every envelope retains U02 correlation.

## Observable Scenarios

- Create returns one stable Agreement, Draft v1, exactly three exact Approved links, activity, and outbox evidence with the same correlation.
- Unknown/inactive references, wrong rate category/code, Draft rate, duplicate category/rate, uncovered window, incompatible destination/equipment/locality, or partial links leave no stable/version/link/activity/event residue.
- Draft update changes only the exact Draft and fails deterministically on stale version.
- Successor v2 copies exact v1 values/links and leaves v1 byte-for-byte commercial authority unchanged; optional overrides are validated as a complete Draft.
- Approval succeeds for one unique key/window and rejects inclusive boundary overlap and concurrent winners.
- Overlapping successor approval fails until the prior Approved version is explicitly suspended/expired or its window no longer overlaps; approval has no hidden replacement.
- Suspend/expire excludes a version from new resolution while detail/history, stored links, audit, and Booking attribution remain readable.
- Legacy rows appear as LEGACY history but never match W2 approval overlap or pricing resolution.
- Default-media legacy search/detail/active-lookup never returns W2 headers; vendor-media administration can dual-read LEGACY as explicitly noneligible history but never uses stale W2 projection columns.
- Existing 1.0.0 lifecycle events remain consumable; each W2 mutation stores one compatible 1.1.0 outbox event in the same database transaction.
- Read-only users see pages/history without mutation actions; spoofed actor and denied mutations produce no write.

## Architecture Review — Iteration 1

The mandatory reviewer verdict was **NOT-READY** and remains part of the record. Its blockers were: contradictory legacy/W2 REST grammar on shared paths; a write-once V1 header projection visible to surviving legacy readers; and an asserted but unspecified transactional outbox/event contract. This revision resolves them with explicit media-type-selected adapters and fixtures, a V3 `authority_model` header discriminator plus complete reader cutover, and exact event mapping/schema/deduplication/transaction wiring. The reviewer's remaining list-selection note is also resolved by making `approvedVersion` honor supplied `validOn`.

### Architecture Review — Iteration 2

The final permitted reviewer verdict was **NOT-READY** and remains explicit. It found one cross-unit contradiction: U02 fixed all backend Charge requests to JSON while U03 requires the Agreement vendor media, which would select the wrong adapter. It otherwise confirmed that the V3 discriminator/reader cutover and lifecycle-event/outbox corrections materially resolved iteration-1 blockers. Its nonblocking request to name the exact legacy approval route is addressed above.

### Lead Consistency Check After Review Limit

No third READY review is claimed. The cross-unit blocker is corrected in U02's owning artifacts: `ChargeRoutePolicy` now includes compile-time backend Accept/Content-Type, defaults other Charge calls to JSON, and overrides every U03 Agreement administration policy with exact `application/vnd.linercore.charge-agreement-v2+json`; browser headers cannot select media. U03 and U02 now agree on inbound browser JSON, outbound Agreement vendor media, explicit JSON-only LEGACY policies, actor handling, and route-handler contract tests. The correction changes no route, capability, timeout, shared UI, or manager/live evidence claim. With the configured review limit exhausted, the lead records this consistency result while preserving both NOT-READY verdicts; workflow advancement is a gate decision, not a rewritten PASS.

## Upstream Coverage

This model directly consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. It realizes US-01/US-04/US-05 plus FR-001–FR-004, FR-201–FR-205, FR-601/FR-602/FR-606, and the U03 support seams for agreement-first pricing, while preserving U01 migration ownership, U02 BFF ownership, U04 pricing ownership, the historical W1 waiver, and pending DS/live acceptance dependencies.
