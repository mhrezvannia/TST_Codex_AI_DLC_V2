# Reliability Requirements - U02 Booking Create Allow

## Source Context

These reliability requirements consume U02 `business-logic-model.md`, U02 `business-rules.md`, `requirements.md`, and `technology-stack.md`. U02 must either create and retrieve a Booking safely or fail closed without mutation.

## Reliability Requirements

| ID | Requirement | Verification |
| --- | --- | --- |
| REL-01 | identity-service deny/error/timeout prevents Booking create and returns a controlled shell/BFF error with correlation id. | Negative integration tests. |
| REL-02 | Successful create returns a stable booking id/reference that can be loaded at `/booking/[id]`. | Live proof. |
| REL-03 | Duplicate create attempts respect existing idempotency semantics. | BFF/backend test. |
| REL-04 | Seed/catalog setup is deterministic and repeatable for local proof. | Seed validation and live login evidence. |
| REL-05 | Runtime blockers are recorded honestly as W2-01 blockers, not converted to PASS through tests. | Evidence review. |

## Recovery Behavior

- User-correctable validation errors remain in the create form.
- Authorization failures render denied/error state and do not retry as another subject.
- Service unavailability returns recoverable error with correlation id.
- Partial create without retrievable detail fails U02 acceptance and requires repair or blocker record.

## Durability

U02 uses existing booking-service persistence. Evidence must prove created-state survival long enough for `/booking/[id]` retrieval in the live proof; it must not claim disaster recovery or zero data loss beyond existing local volume behavior.
