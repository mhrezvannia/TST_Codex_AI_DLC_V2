# Team Assessment - W2-04

## Basis

The role plan supports `scope-document.md` and `intent-backlog.md` under the
conditions in `feasibility-assessment.md`. No named people, headcount,
utilization, location, timezone, or fixed availability is asserted.

## Recommended topology

Use one stream-aligned W2-04 intent mob accountable for the complete journey.
Rotate driver and navigator roles; apply domain, Booking-contract, UX,
security, quality, platform, and release-review hats at the relevant seams.
This avoids horizontal handoffs while retaining producer/consumer and shared-UI
ownership.

## Availability and capacity

Required commitments are an intent driver, a domain/application navigator,
Booking consumer reviewer, Container Movement UI/UX reviewer, quality/release
reviewer, and platform/security review as needed. Availability is a dependency
to confirm at delivery planning. The serialized Wave A stack slot and W2-02
merge are capacity constraints, not assumptions.

## Gap assessment

The repository demonstrates the required Java/Spring, PostgreSQL, Kafka/Avro,
Next.js/TypeScript, Playwright, Compose, contract, UX, and audit capabilities.
No vendor or AWS partner gap is evidenced. If reverse engineering exposes an
actual gap, remediate by focused pairing/enabling support before procurement.
