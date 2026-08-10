# Functional Design Questions - U02 Reference Validation

## Q1. Validation Result Shape

How should Booking receive live reference validation outcomes?

A. Replace boolean lookups with one typed validation result containing all field outcomes (`ACTIVE`, `INACTIVE`, `NOT_FOUND`, `MISMATCH`) and a distinct provider-unavailable error; evaluate every required reference before returning (Recommended)
B. Keep fail-fast booleans and one generic error
C. Treat provider 5xx/timeouts as invalid references
D. Copy Reference Data records into Booking tables
X. Other (please specify)

[Answer]: A. Replace boolean lookups with one typed validation result containing all field outcomes (`ACTIVE`, `INACTIVE`, `NOT_FOUND`, `MISMATCH`) and a distinct provider-unavailable error; evaluate every required reference before returning (Recommended)

## Q2. Blocked Validation State

How should a completed validation with invalid/inactive references affect the Booking?

A. Persist explicit `VALIDATION_BLOCKED` status plus the latest field-addressable validation result; successful retry replaces it with `VALIDATED`, while provider outage leaves business state unchanged (Recommended)
B. Keep status `DRAFT` with no persisted reason
C. Use generic `EXCEPTION` and append duplicate exceptions on every retry
D. Delete the draft when validation fails
X. Other (please specify)

[Answer]: A. Persist explicit `VALIDATION_BLOCKED` status plus the latest field-addressable validation result; successful retry replaces it with `VALIDATED`, while provider outage leaves business state unchanged (Recommended)

## Q3. Voyage and Route Coherence

What must be true beyond each reference being active?

A. The active voyage's canonical origin/destination reference IDs must match the selected leg's load/discharge locations, in addition to active customer, both locations, voyage, and equipment type (Recommended)
B. Any active voyage may be paired with any active locations
C. Validate only customer and equipment type
D. Trust labels/codes sent by the browser without provider lookup
X. Other (please specify)

[Answer]: A. The active voyage's canonical origin/destination reference IDs must match the selected leg's load/discharge locations, in addition to active customer, both locations, voyage, and equipment type (Recommended)

## Source Context

Questions refine U02 from `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. Source verification covers the current boolean `ReferenceValidationPort`, `HttpReferenceValidationAdapter`, Reference Data OpenAPI record shape, canonical `VESSEL_VOYAGE` attributes, and existing `BookingStatus` values.
