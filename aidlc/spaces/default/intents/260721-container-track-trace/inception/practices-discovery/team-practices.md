# Team Practices - W2-04

## Way of Working

We deliver W2-04 as one stream-aligned vertical intent on its short-lived
intent branch, preserve merged program work, and synchronize with the
integration baseline after W2-02 lands. Contract, UI, and acceptance seams are
co-reviewed by their bounded owners rather than broadened through shared-file
rewrites.

## Walking Skeleton

PB-01 is the gated walking skeleton: one real `booking.confirmed` creates a
planned journey, one accepted GTOT publishes status, and Booking renders the
projection. Later lifecycle depth builds only after that broker-to-database-to-
Booking path and one observable invalid transition are proven.

## Testing Posture

Tests are written alongside code and selected by acceptance risk, with explicit
domain transition, duplicate, sequence, contract, migration, consumer, UI, and
live-path coverage. We do not invent a numeric coverage floor that the current
repository cannot enforce, and deterministic failures fail closed.

## Deployment

Pull-request and integration CI block on the established fast Java and frontend
gates. W2-04 final release acceptance is a separately serialized, manual blocking
run on `linercore-wave-a`; one evidence-preserving retry is allowed only for an
environmental failure, and the manager demo at port 8088 remains guarded.

## Code Style

Java keeps the framework-free domain, application ports, adapter, and Spring
container layering with current EditorConfig conventions; TypeScript keeps
strict Next.js/React patterns and shared `@erp/ui` tokens. Domain rejection is
explicit and stable while exceptions remain mapped at REST or infrastructure
boundaries; W2-04 adds no new universal formatter mandate.

## Evidence sources

These practices synthesize `code-structure.md`, `technology-stack.md`,
`dependencies.md`, `code-quality-assessment.md`, `architecture.md`, and
`business-overview.md`.
