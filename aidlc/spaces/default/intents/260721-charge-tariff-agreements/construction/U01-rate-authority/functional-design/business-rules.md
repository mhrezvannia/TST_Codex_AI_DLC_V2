# Business Rules — U01 Rate Authority

## Rule Catalog

| ID | Rule | Enforcement | Failure |
|---|---|---|---|
| RATE-001 | A Rate has one stable ID and one immutable category/charge-code pair. | Domain constructor and database checks | 422 `RATE_CATEGORY_INVALID` |
| RATE-002 | Allowed pairs are BASE/OFR, SURCHARGE/BAF, and LOCAL/THC. | Reference validation plus stored code snapshot check | 422 field error |
| RATE-003 | Version numbers are positive, unique, and monotonically increasing per Rate; version IDs never change. | Stable-Rate row lock and unique constraint | 409 conflict |
| RATE-004 | At most one Draft may exist for a stable Rate. | Partial unique index and application guard | 409 `RATE_DRAFT_EXISTS` |
| RATE-005 | Only Draft fields are mutable. Approved rows and their audit evidence are immutable. | Domain transition, repository predicate, DB trigger/privilege test where practical | 422 `RATE_VERSION_IMMUTABLE` |
| RATE-006 | A successor source must be Approved and remains unchanged. | Domain transition and persistence diff test | 422 lifecycle error |
| RATE-007 | Unit rate is USD `BigDecimal`, non-negative, scale at most two, persisted at scale two. | Boundary type and DB check | 422 field error |
| RATE-008 | Basis is exactly `PER_CONTAINER`; currency is the active W0-02 USD identity/code. | Domain/reference validation and DB check | 422 field error |
| RATE-009 | `effectiveFrom` and `effectiveTo` are required inclusive dates and `effectiveTo >= effectiveFrom`. | Value object and DB check | 422 field error |
| RATE-010 | BASE and SURCHARGE require origin, destination, and equipment. | Domain and DB category check | 422 applicability error |
| RATE-011 | LOCAL requires origin and equipment, rejects destination, and persists destination as NULL. | API/domain validation and DB category check | 422 applicability error |
| RATE-012 | All supplied reference IDs must exist by exact canonical ID, be active, and satisfy typed set/code compatibility at save and approval time. | U01 typed checks over the existing reference-validation port seam and real HTTP adapter | 422 field outcome or 503 typed dependency error |
| RATE-013 | Approval requires exact Rate/version identity, Draft state, expected row version, complete applicability, and active references. | Application service and locked repository | 409 or 422 |
| RATE-014 | Approved windows may not overlap inclusively for the same normalized authority key. | Transaction advisory lock plus overlap query | 409 `RATE_AUTHORITY_CONFLICT` |
| RATE-015 | Concurrency may produce at most one Approved winner for a conflicting authority. | Same transaction lock, row lock, and state predicate | One success; loser 409 |
| RATE-016 | Draft/Approved are stored lifecycle states; Scheduled/Effective/Expired are derived from an explicit/echoed evaluation date. | Query read model | 400 invalid `asOf` |
| RATE-017 | Category/code cannot change in a successor. A different category/code is a new stable Rate. | Domain invariant | 422 |
| RATE-018 | No mutation trusts actor, capability, correlation, or commercial IDs solely from browser input. | Signed-session BFF plus service authorization/reference checks | 401/403/422 |
| RATE-019 | Every committed mutation retains actor, timestamp, correlation, stable Rate ID, version ID/number, action, and safe reason metadata. | Transactional rate activity | 500/rollback if audit write fails |
| RATE-020 | Commercial amounts and customer payloads are excluded from application logs and metric labels. | Logging/telemetry tests | Quality-gate failure |

## Decision Tables

### Category and applicability

| Category | Code | Origin | Destination | Equipment | Valid? |
|---|---|---:|---:|---:|---|
| BASE | OFR | yes | yes | yes | Yes |
| SURCHARGE | BAF | yes | yes | yes | Yes |
| LOCAL | THC | yes | absent | yes | Yes |
| LOCAL | THC | yes | present | yes | No: destination must be absent |
| BASE/SURCHARGE | matching code | yes | absent | yes | No: destination required |
| Any | mismatched code | any | any | any | No: category/code mismatch |

### Lifecycle command eligibility

| Current state | Edit | Approve | Create successor | Pricing eligibility |
|---|---:|---:|---:|---:|
| Draft | Yes | Yes if valid/non-overlapping | No | No |
| Approved/Scheduled | No | No | Yes if no Draft exists | No before effective date |
| Approved/Effective | No | No | Yes if no Draft exists | Yes for later U03/U04 consumers |
| Approved/Expired | No | No | Yes if no Draft exists | No after effective date |

Scheduled/Effective/Expired are derived presentations of the same stored Approved state.

### Error classification

| Error class | HTTP | Examples |
|---|---:|---|
| Malformed transport/query | 400 | invalid JSON/date/page/size |
| Missing authentication | 401 | no valid signed session/service identity |
| Authorization denial | 403 | reader attempts create/edit/approve |
| Missing entity | 404 | unknown stable Rate or version |
| State/concurrency conflict | 409 | stale row version, existing Draft, overlapping authority, competing winner |
| Semantic business validation | 422 | category/code mismatch, invalid lifecycle source, inactive reference, invalid money/window/applicability |
| Required dependency unavailable | 503 | reference validation cannot complete safely |

## Authorization Policy

U01 reuses the existing Charge `AuthorizationPort` method shape with one resource and five exact actions:

| Resource | Action | Operation | Existing Identity role grants |
|---|---|---|---|
| `charge-rates` | `read` | list/detail/history | `PRICING`, `FINANCE_READ` |
| `charge-rates` | `create` | create stable Rate and first Draft | `PRICING` |
| `charge-rates` | `update` | update the sole Draft | `PRICING` |
| `charge-rates` | `approve` | approve the sole Draft | `PRICING` |
| `charge-rates` | `create-successor` | create a Draft from Approved | `PRICING` |

The Identity catalog change is additive: it adds these permissions and action enum values `approve` and `create-successor`; it creates no new role. `FINANCE_READ` is the concrete read-only Charge Reader/Auditor mapping and receives no mutation or manual-case entitlement. A user without `charge-rates/read` receives 403 and no commercial record disclosure.

Non-local Rate wiring uses a fail-closed HTTP Identity adapter and accepts only an `ALLOW` response matching both resource and action. Local Rate wiring uses an exact subject-to-action map (`local.pricing.analyst` all five; `local.charge.reader` read only), requires correlation, and rejects every other subject. The current allow-any-nonblank Charge adapter remains isolated to its baseline agreement bean and is never wired to Rate endpoints. U01 owns service adapter/action enforcement; U02 owns signed-session subject/capability extraction and BFF forwarding. No browser actor, capability, or role field is accepted as authority.

## Pagination, Filter, and Date Rules

- Browser URL parameters are `q`, `category`, `lifecycle`, `asOf`, `originId`, `destinationId`, `equipmentTypeId`, `page`, and `size`.
- Empty values are omitted from the canonical URL. Unknown values return a recoverable filter error instead of being ignored.
- Browser page numbers are one-based. The BFF explicitly maps them to the existing zero-based service query convention.
- Page size is bounded to approved UI choices; requests outside the range return 400 rather than silently loading an unbounded table.
- Default ordering is latest update descending, then stable Rate ID ascending.
- `asOf` is ISO date; missing uses server UTC date. Every response echoes `evaluatedAsOf` so screenshots, tests, and readers know the basis.
- Lifecycle accepts only `DRAFT`, `SCHEDULED`, `EFFECTIVE`, or `EXPIRED`; absent is `ALL`. Filtering is existential across a stable Rate's version history, then returns the Rate once.
- Matching summary selection is exact: Draft for `DRAFT`; nearest future Approved for `SCHEDULED`; covering Approved for `EFFECTIVE`; most recently ended Approved for `EXPIRED`. Unfiltered selection prefers effective Approved, then Draft, nearest Scheduled, most recently Expired, then latest.
- `latestVersion` and `effectiveApprovedVersion` are independent response members. A Draft successor therefore cannot hide the Approved version that is effective on `evaluatedAsOf`.
- Row links carry an encoded safe return query. Save/cancel/detail navigation restores that exact list context.

## Persistence Constraints

V2 establishes, at minimum:

- primary keys for `charge_rates.rate_id` and `charge_rate_versions.version_id`;
- foreign key from version to stable Rate;
- unique `(rate_id, version_no)`;
- partial unique one-Draft-per-rate constraint;
- checks for lifecycle, category/code, basis, USD, non-negative two-decimal amount, inclusive date window, and category-specific destination nullability;
- indexes for list order/filter access and the Approved overlap candidate predicate;
- attributable activity records linked to both stable Rate and exact version.

Application validation supplies field-specific errors; database constraints are the final invariant guard. Constraint failures are translated to typed 409/422 envelopes rather than leaking SQL names.

## UI Business Rules

- One unified rate list serves all three categories; there are no three parallel page systems.
- Category controls form shape: destination is required for BASE/SURCHARGE and absent for LOCAL.
- Create/edit preserves entered values across 422/409/503, disables duplicate submission, focuses the error summary, and links errors to persistent labels.
- Approved content is read-only. Edit appears only for the sole Draft; successor appears only for Approved when no Draft exists.
- Approval confirmation names stable Rate, exact version, category/code, window, amount/basis, and immutability consequence.
- Status uses text/icon plus semantic tokens, never color alone.
- Tables have a caption/labelled scroll region, stable columns, keyboard-reachable row links, result count, and intentional narrow-width behavior.
- DS-02 async-combobox and DS-03 ribbon suppression remain W2-02 dependencies. Source/design intent does not turn those acceptance cells green.

## Scenario Invariants

1. Failed save or approval creates no Approved authority and no partial audit row.
2. Concurrent conflicting approvals leave exactly zero or one Approved winner, never two.
3. Successor creation does not mutate any prior value or evidence.
4. Restart and Flyway validation preserve all Rate/version identities.
5. A query at the first and last validity dates includes the Approved authority; the adjacent days do not.
6. LOCAL destination never survives transport validation into persistence.
7. Reader and denied states cannot reveal mutation controls; denied cannot reveal data.
8. No UI fallback or test fixture can be presented as a real live rate result in U06 acceptance.

## Upstream Coverage

These rules refine `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. They specifically operationalize FR-001 through FR-004, FR-101 through FR-108, FR-601 through FR-603, FR-606, and the relevant preservation constraints without extending U01 into pricing or agreement behavior.
