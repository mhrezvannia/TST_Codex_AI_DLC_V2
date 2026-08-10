# Business Rules - dnd-version-trigger-governance

## Source authority

Rules refine approved `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, Application Design `components.md`, `component-methods.md`, and `services.md`. U01 owns schema/contract/fixtures/signoff and the minimum representative fresh-pricing enrichment path required by its live DoD; U02 owns complete lifecycle and fresh-pricing breadth/failure/replay behavior.

## Lifecycle and overlap rules

| ID | Rule |
| --- | --- |
| U02-R01 | Only the current Draft can be revised; every mutation requires the expected row version. |
| U02-R02 | Approved versions are immutable in domain, repository, API and UI. |
| U02-R03 | Approval overlap key is basis, basis-version id, rule type, derived side, port, trade lane and equipment type. |
| U02-R04 | Effective windows are inclusive; overlap is checked under the canonical transaction-scoped lock. |
| U02-R05 | A successor is a new Draft linked to one Approved predecessor; the source never changes. |
| U02-R06 | At most one Draft exists per aggregate. Effective dates and change reason for a successor are explicit, not inferred. |
| U02-R07 | Historical versions remain directly addressable and must belong to the requested aggregate. |
| U02-R08 | Every lifecycle command appends attributable bounded activity in the same transaction as the state change. |

## Trigger metadata rules

| ID | Rule |
| --- | --- |
| U02-R09 | Existing W2 authority selection completes before D&D metadata resolution; D&D never selects authority. |
| U02-R10 | Fresh results set `pricingBasisVersionId` and `pricingEffectiveDate` all-or-none with structured trigger items. |
| U02-R11 | Trigger match uses exact basis/version/effective date, derived-side port, trade lane and equipment type. |
| U02-R12 | Each trigger item contains only rule type and fixed start/end code/qualifier evidence; free days/rates are forbidden. |
| U02-R13 | Ordering is deterministic and at most one item exists per fixed rule type. |
| U02-R14 | No match is a successful empty trigger list; duplicate applicable authority or repository unavailability is `PRICING_UNAVAILABLE`. |
| U02-R15 | Exact stored replay bypasses metadata resolution and remains byte-identical after terms change. |
| U02-R16 | Handled fresh enrichment failure releases only the owned `STANDARD_PRICING` in-progress claim; a lost release reclassifies the winner. |

## Relationship and authorization rules

- Admin actions use the existing `charge-rates` capability family with action-specific server decisions.
- Relationship lookup authorizes before query. Denial exposes no D&D count, identity or link.
- AgreementVersion relationship is read-only and cannot approve, edit or create from inside Agreement detail.
- Empty and unavailable are distinct; unavailable preserves already-authorised Agreement facts and a bounded correlation id.
- Browser/BFF never supplies authority or capability truth.

## UI behavior rules

- List query parameters remain `q`, `ruleType`, `port`, `lifecycle`, `effectiveState`, `sort`, `page`, `size`; unknown/duplicate inputs normalize to safe defaults.
- History identifies selected/current/predecessor/successor with text, not color alone.
- Draft actions are Edit and Review/Approve when allowed. Approved action is Create successor; Edit/Save are absent.
- Approval uses the shared Dialog only after W2-02's accessible description seam is merged and tested.
- Conflict/overlap keeps form values and offers correction, reload/review or an authorised conflict link; it never retries an irreversible command automatically.

## Ownership prohibitions

U02 must not alter U01 migration ordering, regenerate signed fixtures, create a second signoff, add free-time/rate fields to W2 trigger metadata, re-enrich replays, fork `packages/ui`, or create a second approval path.
