# NFR Requirements Questions - enterprise-web-shell-and-workflows

## Source Context

These questions consume `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.

Recommended answers were applied under explicit stage-level approval for remaining NFR Requirements units.

## Q1 - UI Performance

What UI performance targets should Enterprise Web meet?

A. Authenticated shell usable within 3 seconds locally, route transitions p95 <= 500 ms after data is cached, primary workflow API-backed screens p95 <= 2 seconds under seeded local load. Recommended.
B. 5 seconds for all screens.
C. No target.
D. Screenshot quality only.
E. Defer performance.
X. Other (please specify)

[Answer]: A

## Q2 - Security And Accessibility

What controls are mandatory?

A. Keycloak session, route/action capability checks, backend enforcement, no secrets in client, WCAG 2.1 AA-oriented keyboard/label/status behavior, and audit-safe UI actions. Recommended.
B. Route hiding only.
C. UI owns authorization.
D. Accessibility deferred.
E. Defer security.
X. Other (please specify)

[Answer]: A

## Q3 - UI Scale

What first-release UI scale should be supported?

A. At least 50 concurrent local simulated users, 10 module routes, 5 enterprise flows, 5,000 work-queue items, and 10,000 audit/exception rows through paginated views. Recommended.
B. Demo users only.
C. Unlimited no target.
D. No scale target.
E. Defer scale.
X. Other (please specify)

[Answer]: A

## Q4 - Reliability

What reliability controls are required?

A. Typed API clients/contracts, visible degraded states, retry-safe actions, idempotency keys for commands, optimistic/stale state handling, and no mock/prototype business logic as readiness. Recommended.
B. Best-effort UI calls.
C. Hide backend errors.
D. Local mock data is enough.
E. Defer reliability.
X. Other (please specify)

[Answer]: A

## Q5 - Stack

What technology posture should be used?

A. New integrated Next.js app using React, TypeScript, existing shared packages where valid, OpenAPI/typed clients, React Query where useful, and Claude UI only as visual baseline. Recommended.
B. Keep separate module apps only.
C. Copy Claude prototype logic.
D. Server-render everything without APIs.
E. Defer stack.
X. Other (please specify)

[Answer]: A
