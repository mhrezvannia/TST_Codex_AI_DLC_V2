# Security Requirements - U01 Rate Authority

## Scope, classification, and compliance posture

This artifact applies STRIDE to U01's Rate commands, queries, reference and
Identity adapters, PostgreSQL persistence, migration adoption, and Charge-owned
pages. It consumes U01 `business-logic-model.md`, `business-rules.md`, program
`requirements.md`, and the observed `technology-stack.md`.

Rate commercial values, applicability/version history, actor/service IDs,
correlation evidence, and audit metadata are internal/confidential commercial
data. Synthetic local fixtures do not make the production data class public.
U01 claims no new GDPR, PCI DSS, HIPAA, or SOC 2 scope and invents no retention
period. Retention remains an organizational policy decision; immutable history
means the application offers no casual update/delete path, not that data must be
retained forever.

## Authentication and authorization

| ID | Requirement |
| --- | --- |
| SEC-U01-001 | Every Rate BFF route derives the human subject/capabilities from the signed session. Browser actor, role, capability, service token, or correlation authority is ignored/rejected. |
| SEC-U01-002 | The service authorizes exact resource `charge-rates` and action `read/create/update/approve/create-successor`; default and adapter failure are deny. |
| SEC-U01-003 | `PRICING` receives the five actions and `FINANCE_READ` receives read only. Denied read reveals no Rate existence or commercial fields; denied mutation commits nothing. |
| SEC-U01-004 | Non-local Rate wiring uses the fail-closed Identity HTTP adapter. Missing non-local service identity/token/secret is a configuration/readiness failure; Identity transport/timeout/malformed response is typed 503; only an authenticated exact `DENY` decision is 403. The permissive legacy agreement bean is never injectable into Rate commands. |
| SEC-U01-005 | Local authorization is an explicit subject/action map and is active only in the approved local profile. A non-local bypass/profile combination or missing required credential prevents readiness. |

Missing/invalid signed human session maps to 401 at the BFF. Authenticated exact
Identity `DENY` maps to 403. Identity transport/timeout/malformed response maps
to safe typed 503; missing required non-local credentials prevents readiness and
does not become a policy denial. Authorization is checked before record disclosure and again
at the service command boundary, so hiding a UI action is never the control.

## Input, data, and transport protection

- SEC-U01-006: body/query fields are type, enum, length, range, decimal-scale,
  and date validated. JDBC uses parameters; error envelopes never expose SQL,
  stack traces, constraint names, service credentials, or internal URLs.
- SEC-U01-007: category/code and reference IDs are verified by exact canonical
  ID, active status, set, and expected code. Provider payload size/type is
  bounded; redirects and caller-controlled provider URLs are not accepted.
- SEC-U01-008: expected row version, aggregate/version identity, Draft state,
  advisory lock, overlap predicate, and DB constraints defend against tampering
  and race-based elevation.
- SEC-U01-009: non-local HTTP uses the platform's authenticated transport and
  TLS policy; database/storage and backups use the existing platform encryption
  controls. Local Compose limitations are not represented as production
  encryption evidence.
- SEC-U01-010: secrets come from existing environment/secret seams, are absent
  from source/evidence, and fail readiness when missing outside explicitly
  approved local configuration.

Commercial amounts are returned only to authorized readers. They may appear in
the authoritative API/UI/DB acceptance evidence where needed for correctness,
but never in application log fields or metric labels.

## STRIDE control matrix

| Threat | Required control and executable proof |
| --- | --- |
| Spoofing | signed-session subject, exact service identity, decision echo; spoofed browser actor and missing service credentials fail |
| Tampering | typed validation, optimistic version, locked approval, parameterized JDBC, immutable Approved rows; stale/malformed/race tests |
| Repudiation | committed mutation and denial evidence includes actor/service, action, Rate/version, UTC time, correlation, safe reason; audit write failure rolls back mutation |
| Information disclosure | read-before-disclose authorization, safe errors, redacted logs/evidence, bounded labels; denied user sees no record counts/values |
| Denial of service | bounded page/field/payload sizes, two-second reference deadline, bounded permits/pools, key-scoped locks; overload returns typed failure without partial state |
| Elevation of privilege | exact action catalog, deny-default adapters, no browser authority, no legacy permissive bean; reader mutation and profile-bypass tests |

## Audit, logging, and evidence

SEC-U01-011 requires exactly one attributable `RateActivity` in the same
transaction as each successful Rate mutation. Approved commercial rows and
their attribution are immutable. A denied, unavailable, validation, conflict,
or rolled-back attempt creates no `RateActivity`; it emits only safe correlated
security/audit-log evidence through the existing seam where supported.

Structured logs use the stable fields `timestamp`, `level`, `service`,
`operation`, `outcome`, `code`, `correlationId`, safe `subjectId`/`serviceId`,
optional Rate/version IDs, and `elapsedMs`. They exclude token,
cookie, secret, customer payload, unit rate/amount, raw request/response, and SQL
parameters. Redaction tests scan application logs, Playwright traces, and U06
evidence before finalization.

Metrics use only low-cardinality `operation`, `outcome`, and where needed
`category`/derived lifecycle. Rate/version/customer/reference IDs, subject,
correlation, amount, and error text are prohibited labels. Latency histograms
have usable buckets immediately below/at/above the 500 ms query and 750 ms
mutation gates so threshold breaches are observable.

No external compliance certification is inferred. Required evidence is the
authorization/security matrix, dependency and secret scans, SAST/static checks,
parameterized repository tests, migration integrity tests, and the manual
security portions of `aidlc-audit` and `erp-fidelity-audit`.

## Security release gates

- zero open Critical/High vulnerabilities attributable to changed production
  code or dependencies; any exception is explicit, time-bounded, owned, and
  cannot waive an exploitable authorization/data-integrity finding;
- every allowed/denied/spoofed/missing-identity/missing-secret/non-local-bypass
  cell has executable evidence;
- no cross-database access, duplicate master-data authority, public backend URL,
  or direct browser service call is introduced;
- NFR-004, NFR-009, FR-003/FR-004, RATE-012/RATE-018-RATE-020 remain traceable.
