# Functional Design Questions - U09 Booking Handoff Contract

## Answers

| Question | Answer |
| --- | --- |
| What does Booking need? | Active agreement lookup by customer and shipment context. |
| What is the no-match contract? | HTTP success with `matched=false` and a reason, not a server error. |
| Can Booking read Charge Agreement tables? | No, it must use the REST contract. |
| What examples are required? | Match, no-match, inactive status exclusion, and invalid query. |

## Source Alignment

Answered from `requirements.md`, `stories.md`, `component-methods.md`, `services.md`, and `unit-of-work-story-map.md`.
