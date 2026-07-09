# Functional Design Questions - U02 Agreement Domain Model

## Answers

| Question | Answer |
| --- | --- |
| What aggregate owns lifecycle? | `CustomerAgreement` owns header, status, terms, version, and activity metadata. |
| Which statuses exist in MVP? | `DRAFT`, `APPROVED`, `SUSPENDED`, `EXPIRED`. |
| What validates terms? | Positive amount, required reference IDs, basis, currency, and dates inside agreement validity. |
| Can non-draft agreements be edited? | Header and terms are editable only in Draft for MVP. |

## Source Alignment

Answered from `requirements.md`, `stories.md`, `component-methods.md`, `unit-of-work.md`, and `unit-of-work-story-map.md`.
