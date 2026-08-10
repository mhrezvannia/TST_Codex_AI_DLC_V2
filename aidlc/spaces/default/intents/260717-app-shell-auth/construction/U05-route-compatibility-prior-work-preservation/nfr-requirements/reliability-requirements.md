# Reliability Requirements - U05 Route Compatibility and Preservation

## Source Context

These reliability requirements consume U05 `business-logic-model.md`, U05 `business-rules.md`, `requirements.md`, and `technology-stack.md`. U05 must keep old Booking links reliable while preserving prior work.

## Reliability Requirements

| ID | Requirement | Verification |
| --- | --- | --- |
| REL-01 | `/bookings*` routes consistently land in canonical shell `/booking*` routes. | Route tests/live proof. |
| REL-02 | Compatibility preserves query parameters needed by Booking list navigation where safe. | Route tests. |
| REL-03 | Preserved Booking list/detail/create behavior still works inside shell. | Live proof. |
| REL-04 | Prior-work touch records include reason and targeted verification result. | Evidence review. |
| REL-05 | Runtime blockers are recorded honestly as W2-01 blockers. | Evidence review. |

## Recovery Behavior

- Broken compatibility mapping blocks U05 until fixed.
- Missing Booking detail data is treated as a data/setup issue, not route success.
- Prior-work regression blocks U05 unless explicitly justified and verified.

## Observability

Route evidence includes source route, target route, status/resolution mode, subject if authenticated, correlation id where relevant, and observed result.
