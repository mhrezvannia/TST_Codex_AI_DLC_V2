# Domain Entities - U06 Charge Agreements UI Workbench

## View Models

| View model | Fields |
| --- | --- |
| `AgreementListItem` | `id`, `agreementNumber`, `customerLabel`, `status`, `validFrom`, `validTo`, `tradeLaneLabel` |
| `AgreementDetailView` | Header, terms, activity, allowed actions. |
| `AgreementDraft` | Editable header and term rows plus expected version. |
| `TermDraft` | Charge code, basis, currency, amount, validity, notes. |
| `LookupDraft` | Customer, lane or origin/destination, commodity, effective date. |
| `LookupResultView` | Match status, agreement summary, terms, no-match reason. |

## State Relationships

`AgreementDraft` is initialized from detail for edit or blank defaults for create. `LookupDraft` is independent from editor draft to avoid losing form work during preview.

## Mapping

BFF clients map API DTOs to view models and provide reference labels where U07 data is available.

## Upstream Traceability

This artifact traces to the functional-design upstream inputs: unit-of-work, unit-of-work-story-map, requirements, components, component-methods, and services. The unit-specific design decisions above should be read against those approved inception artifacts.