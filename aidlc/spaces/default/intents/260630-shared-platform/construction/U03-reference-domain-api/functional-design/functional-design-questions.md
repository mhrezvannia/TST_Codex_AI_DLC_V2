# Functional Design Questions - U03 Reference Domain and Provider/Admin APIs

## Source Trace

This questions record derives from `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, Shared Platform module vision, and `functional-design-questions.md` conventions.

## Question Posture

U03 has one known open detail from `requirements.md`: the final exact field list and validation rules for every reference aggregate. The authoritative Shared Platform vision resolves enough MVP shape to proceed with functional design:

- Party/Customer is a generic party plus roles model.
- Location/Port is Country to Port at MVP, with terminal/facility deferred.
- Region is a single flat grouping layer assigned over locations.
- TradeLane is origin/destination Region pairs.
- Voyage is manually maintained schedule and nominal capacity at MVP.
- Currency starts with USD only but must not block multi-currency later.
- Commodity is a flat code list at MVP.

## Recorded Answers

### Q1. How should U03 proceed where exact seed values or final optional fields are still open?

A. Use the approved MVP aggregate shape and recommended defaults; leave exact seed values and optional fields configurable for U09/code generation.  
B. Stop and require every final seed value before functional design.  
C. Collapse all reference data into a generic key/value table.  
X. Other (please specify)

[Answer]: A. Use the approved MVP aggregate shape and recommended defaults; leave exact seed values and optional fields configurable for U09/code generation.

### Q2. How should aggregate-specific rules be represented?

A. One `reference-data-service` with explicit internal aggregate modules and invariant services.  
B. One generic metadata-driven model with all rules externalized.  
C. One deployable service per reference set.  
X. Other (please specify)

[Answer]: A. One `reference-data-service` with explicit internal aggregate modules and invariant services.

### Q3. How should consumers integrate with reference data?

A. Provider/admin OpenAPI and future reference-change events only; no shared database.  
B. Shared database read access for trusted consumers.  
C. Frontend-only static reference files.  
X. Other (please specify)

[Answer]: A. Provider/admin OpenAPI and future reference-change events only; no shared database.

## Ambiguity Analysis

No blocking ambiguity remains for U03 functional design. The exact MVP trade lanes, ports, sites, and seed data remain open for U09/local seed and code-generation configuration. U03 defines the stable domain shape, lifecycle behavior, validation categories, and API contracts needed for implementation.
