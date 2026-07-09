# Business Logic Model - U08 Local Runtime, Seed, Smoke, Readiness

## Scope

U08 makes the implemented module locally demonstrable and measurable. It consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`.

## Runtime Flow

1. Start identity, reference data, Charge Agreement backend, and Charge Agreements UI in host-runtime mode.
2. Seed or verify reference data prerequisites.
3. Create or verify one Draft agreement with valid terms.
4. Approve the agreement.
5. Run active lookup and verify a match.
6. Emit readiness evidence that distinguishes host-runtime success from Docker/Compose blockers.

## Readiness Checks

| Check | Expected result |
| --- | --- |
| Backend health | HTTP 200. |
| UI route | HTTP 200. |
| API lifecycle | Create/update/approve path works. |
| Active lookup | Approved active agreement is returned. |
| Reference integration | Required reference selectors or validation succeed when service is available. |

## Handoff

Readiness scripts become evidence for local demonstration and later Operation stages.

## Review

Verdict: READY

Inline architecture review completed because the configured reviewer subagent model is unavailable. U08 separates host-runtime success from Docker blockers and requires behavioral smoke evidence.

## Upstream Traceability

This artifact traces to the functional-design upstream inputs: unit-of-work, unit-of-work-story-map, requirements, components, component-methods, and services. The unit-specific design decisions above should be read against those approved inception artifacts.