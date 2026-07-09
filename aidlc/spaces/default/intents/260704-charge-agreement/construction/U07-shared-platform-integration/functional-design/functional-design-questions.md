# Functional Design Questions - U07 Shared Platform Integration

## Answers

| Question | Answer |
| --- | --- |
| Which reference sets are used? | Customers, charge codes, currencies, commodities, locations, and trade lanes. |
| Where does integration occur? | UI/BFF loads selector data and backend validates stable IDs through a reference-data port. |
| Can Charge Agreement mutate reference data? | No, it consumes reference records only. |
| What happens when reference data is unavailable? | UI shows non-destructive error; backend returns validation or upstream-unavailable responses. |

## Source Alignment

Answered from `requirements.md`, `components.md`, `services.md`, `mockups.md`, and `unit-of-work.md`.
