# Business Rules - dnd-safe-attempts-evidence

## Source authority

Rules refine approved `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, Application Design `components.md`, `component-methods.md`, and `services.md`. U04 cannot alter U01's signed schema or U03's success calculation.

## Transport, identity and authorization rules

| ID | Rule |
| --- | --- |
| U04-R01 | Filter path coverage includes exact POST `/pricing-requests`, `/dnd-pricing-requests` and D&D admin descendants without intercepting unrelated routes. |
| U04-R02 | Spoof rejection precedes service authentication; authentication precedes correlation; all precede controller parsing. |
| U04-R03 | Controller media/key/body validation precedes application authorization. |
| U04-R04 | Provider uses `charge-agreement:price`; admin/evidence uses action-specific `charge-rates` decisions. |
| U04-R05 | Denial discloses no commercial fact, result count, attempt identity or relationship identity. |

## Idempotency and concurrency rules

| ID | Rule |
| --- | --- |
| U04-R06 | Namespace, canonical bilateral key and canonical fingerprint are distinct concepts and are always compared. |
| U04-R07 | Identical completed fingerprint replays exact stored bytes; different fingerprint conflicts. |
| U04-R08 | A live in-progress owner returns `PRICING_IN_PROGRESS`; only database-time expiry permits takeover. |
| U04-R09 | Completion/release requires matching owner token and state; stale work never completes or deletes winner state. |
| U04-R10 | Handled post-claim failure uses atomic owner-fenced release-plus-final-evidence; a lost fence writes neither, classifies the winner first, then records only the disposition actually returned. |
| U04-R11 | Crash recovery uses lease/takeover; handled failure must not masquerade as a crash-held lease. |
| U04-R12 | No failed, conflicting, in-progress or unavailable attempt creates a charge result or partial line. |

## Evidence rules

| ID | Rule |
| --- | --- |
| U04-R13 | Every evidence record has unique attempt id, outcome/code/status, correlation where available and bounded request identity. |
| U04-R14 | Terms, source and calculation ids are nullable and populated only when actually resolved. |
| U04-R15 | Raw request payloads, service tokens/secrets and unbounded commercial ids are not stored/logged as primary evidence or metric labels. |
| U04-R16 | Search is bounded/paginated and authorised before query; unique attempt lookup works with null terms id. |
| U04-R17 | Primary audit-store failure is an explicit precedence exception: roll back owned work, return `503`, emit one bounded high-severity structured fallback log and do not recursively audit that 503. Filter rejection preserves its required status using the same fallback channel. |
| U04-R18 | Metrics use bounded operation/outcome/rule-type/replay labels only. |

## Public error mapping

| HTTP | Code | Meaning |
| --- | --- | --- |
| 400 | `PRICING_IDENTITY_SPOOF_REJECTED`, `PRICING_CORRELATION_INVALID`, `PRICING_BAD_REQUEST` | Ordered filter/transport failures |
| 401 | `PRICING_SERVICE_IDENTITY_REQUIRED` | Trusted service authentication absent/invalid |
| 403 | `PRICING_FORBIDDEN` | Valid identity lacks provider capability |
| 404 | `NO_RATE` | Exact basis/rate/applicability evidence absent or mismatched |
| 409 | `IDEMPOTENCY_CONFLICT`, `PRICING_IN_PROGRESS` | Fingerprint conflict or live ownership |
| 422 | `PRICING_VALIDATION` | Qualified movement or semantic violation |
| 503 | `PRICING_UNAVAILABLE` | Required dependency/persistence/evidence unavailable |

No generic fallback may collapse these meanings.

## UI rules

- Evidence remains secondary to business terms and is rendered through existing authorised detail/audit composition.
- Every disposition has explicit text, correlation and only applicable facts; missing source ids are absent, not fabricated.
- Denied and unavailable are distinct. Denied offers no Retry that could reveal existence; unavailable may retry the scoped provider.
- Zero, positive, replay, no-rate, validation, conflict, in-progress and unavailable meanings never rely on color alone.
- No browser action submits D&D evaluation in W3-01.
- Null-terms evidence is navigable at `/charge-agreements/dnd/audit`, linked from the D&D terms list and correlation/attempt links; it shares the authenticated Charge shell and exposes search/list/detail only.

## General audit query rules

- Exact query names are `attemptId`, `correlationId`, `bookingRef`, `equipmentId`, `closingMovementEventId`, `outcome`, `occurredFrom`, `occurredTo`, `dndTermsId`, `page`, `size`, `sort`.
- Require `attemptId`, `correlationId`, `dndTermsId`, the complete booking/equipment/closing tuple, or a complete maximum-31-day time range. Outcome alone is insufficient.
- `page` defaults 1; `size` is 25/50; `sort` is `occurredAt:desc|asc` plus attempt-id tie-breaker. Unknown/duplicate/incompatible values are `400 DND_AUDIT_QUERY_INVALID`.
- Exact attempt miss is `404 DND_ATTEMPT_NOT_FOUND`; valid list miss is a 200 empty page. Denial runs no query/count.
- Page items use the ten discriminators and allowed-null matrix defined in `business-logic-model.md`; BFF and UI must exhaustively map them.

## Acceptance prohibitions

Do not mark PASS from mocked filters, unit races, screenshots, raw audit rows or containers merely starting. U04 requires running-stack exact responses, authorised/null-terms lookups and database assertions showing no failed/duplicate calculation.
