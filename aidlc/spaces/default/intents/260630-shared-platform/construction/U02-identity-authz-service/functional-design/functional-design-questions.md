# Functional Design Questions - U02 Identity Authorization Service

## Source Trace

This questions record derives from `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`.

## Question Posture

Construction questions are exceptional when approved inception artifacts already settle the design. U02 has no unresolved blocking question because the prior artifacts establish:

- Keycloak 24 authenticates users.
- `identity-service` owns authorization only.
- `identity-service` exposes authorization decision, effective-permission, role catalog, role assignment, and audit APIs.
- MVP carrier roles are pricing, sales, booking desk, equipment control, customer service, finance-read, reference admin, platform operator, and security admin.
- Protected decisions fail closed.
- Role and permission changes are audited with actor, target user, timestamp, before/after values, and reason where supplied.
- Customer-facing identity, custom password storage, and downstream module runtime implementation are out of scope.

## Recorded Answers

### Q1. What is the authentication and authorization boundary for U02?

A. Keycloak authenticates; `identity-service` authorizes.  
B. `identity-service` authenticates and authorizes.  
C. Frontend BFFs authorize locally from token claims.  
X. Other (please specify)

[Answer]: A. Keycloak authenticates; `identity-service` authorizes.

### Q2. What should happen when authorization context cannot be verified for a protected operation?

A. Fail closed and record an authorization denial/audit signal.  
B. Allow and retry audit asynchronously.  
C. Fall back to frontend-only role checks.  
X. Other (please specify)

[Answer]: A. Fail closed and record an authorization denial/audit signal.

### Q3. Where does detailed auth UI behavior belong?

A. U05 `apps/auth`; U02 exposes backend decision/session-role capabilities only.  
B. U02 implements auth UI routes.  
C. U06 owns all identity UI.  
X. Other (please specify)

[Answer]: A. U05 `apps/auth`; U02 exposes backend decision/session-role capabilities only.

## Ambiguity Analysis

No contradiction remains for U02 functional design. Open requirement questions about final permission matrix details, audit retention, and permission-review administration depth are deferred to the appropriate NFR, seed, and app-specific units without blocking the authorization domain shape.
