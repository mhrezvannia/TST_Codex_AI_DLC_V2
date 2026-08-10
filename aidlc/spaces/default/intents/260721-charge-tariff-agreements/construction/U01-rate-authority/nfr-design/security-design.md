# Security Design - U01 Rate Authority

## Trust boundaries and upstream basis

This design realizes `security-requirements.md` within the performance,
capacity, and recovery constraints in `performance-requirements.md`,
`scalability-requirements.md`, and `reliability-requirements.md`. It preserves
the stack in `tech-stack-decisions.md` and the Rate workflows in
`business-logic-model.md`.

The browser, Charge BFF, Charge service, Identity service, Reference Data
service, and Charge PostgreSQL database are separate trust boundaries. The
browser is never authority for subject, role, capability, service credential,
correlation ownership, or canonical reference identity. U01 does not add a
public backend URL, direct browser-to-service call, cross-database access, or
shared-shell/UI security abstraction.

## Authentication and authorization architecture

The Charge BFF derives the human subject and capabilities from the signed
session, rejects an absent/invalid session as 401, and propagates a generated or
trusted correlation ID. It forwards no browser-supplied actor/role/capability.
The Charge service then independently authorizes exact resource `charge-rates`
and one of `read`, `create`, `update`, `approve`, or `create-successor`.

`PRICING` receives all five actions; `FINANCE_READ` receives `read` only. The
non-local Rate authorization bean calls the existing Identity decision API with
the Charge service identity and accepts only an authenticated `ALLOW` response
echoing the exact resource/action. Exact `DENY` is 403. Timeout, transport,
malformed response, or missing non-local credential is 503 or readiness false,
never a policy denial and never an allow.

The local profile uses an explicit subject/action table:
`local.pricing.analyst` has all five actions and `local.charge.reader` has only
read. Any other subject is denied. The legacy permissive agreement bean is a
separate named dependency and cannot satisfy the Rate application-service
constructor, preventing accidental injection.

Read authorization occurs once at the service query boundary before repository
disclosure. Mutation authorization occurs once at the service command boundary
before reference calls and database work. U02's signed-session/capability gate
is an additional BFF enforcement layer, not a second service-to-Identity
decision. Hidden UI controls are presentation only; they are not an
authorization mechanism.

## Dependency and input defense

Identity and Reference Data each use a dedicated bounded adapter with one
two-second total deadline, fixed configured base URL, no redirect following,
strict content type/size, and a safe typed response model. Identity has 10
permits and a 16 KiB response-body limit. Reference Data has 50 HTTP permits,
accepts at most five checks per Rate command, and limits each response to 64 KiB
(320 KiB aggregate). Each command may hold at most five permits. The healthy
ten-command workload therefore has exactly 50 possible concurrent checks; its
provider-call budget is 250 ms and its full fan-out budget is 300 ms. Permit
acquisition above that healthy bound is at most 100 ms or the smaller
remaining deadline; connection establishment is at most 250 ms; request
completion and bounded body consumption use the remaining shared deadline.
Reference calls for one command may run concurrently but are cancelled
together when the request deadline expires.
There is no automatic retry, circuit-breaker cache, or stale fallback for a
commercial decision. The reference adapter verifies exact canonical ID, set,
active state, and optional expected code for every field.

Transport and domain boundaries validate enum membership, field length,
decimal precision/scale, inclusive date windows, category-aware applicability,
page bounds, and expected row version. JDBC is parameterized. PostgreSQL checks,
foreign keys, partial uniqueness, optimistic predicates, advisory locks, and
row locks provide the final tamper/race guard. A constraint name, SQL fragment,
stack trace, credential, or internal URL is translated to a stable safe error
and never returned.

## Data protection and audit integrity

Rates, versions, actor/service IDs, correlation evidence, and activity metadata
are internal/confidential commercial data. Non-local transport and storage use
the platform TLS/encryption/secrets controls; local Compose does not claim
production encryption. Secrets enter through existing configuration seams and
are excluded from source, images, logs, traces, and acceptance artifacts.

Each successful mutation and its `RateActivity` append occur in the same
transaction. Audit failure rolls back the commercial mutation. Approved rows
and their attribution have no application update/delete path. Denied,
unavailable, validation, conflict, and rolled-back attempts create no activity
row; safe security telemetry may record their outcome and correlation.

Structured logs permit timestamp, level, service, operation, outcome, code,
correlation ID, safe subject/service ID, optional Rate/version ID, and elapsed
time. They prohibit tokens, cookies, secrets, request/response bodies, SQL
parameters, customer payload, and commercial amounts. Metrics use low-
cardinality operation/outcome and optional category/derived lifecycle only.

## Browser and response controls

Charge-owned pages use existing `@erp/ui` primitives and LinerCore tokens. The
BFF provides same-origin server mediation; form values remain escaped React
text, and no raw HTML rendering is introduced. Persistent labels, linked error
summaries, disabled duplicate submission, and safe value retention support
secure recovery from 409/422/503 without reflecting unsafe provider messages.

Standard platform headers, cookie attributes, CSRF posture, and session expiry
remain shared-shell/platform responsibilities. U01 consumes them and tests its
routes; it does not redesign `packages/ui`, the shell, navigation, typography,
or palette.

## Readiness, verification, and release controls

Liveness is process-local. Readiness is false when database/Flyway validation,
mandatory non-local service identity/token, secret resolution, or fail-closed
adapter wiring is invalid. Readiness does not call downstream dependencies on
every probe, avoiding a probe-induced cascade.

Executable proof covers allowed, denied, spoofed-browser, missing-session,
missing-service-credential, malformed-decision, reference mismatch, timeout,
SQL injection-shaped input, stale-version, and race cells. Log/trace/evidence
redaction scans and dependency/SAST/secret scans are blocking. Changed
production dependencies/code must have no unwaived Critical/High finding.

The design traces to `performance-requirements.md`,
`security-requirements.md`, `scalability-requirements.md`,
`reliability-requirements.md`, `tech-stack-decisions.md`, and
`business-logic-model.md`; it creates no new compliance certification or
retention claim.
