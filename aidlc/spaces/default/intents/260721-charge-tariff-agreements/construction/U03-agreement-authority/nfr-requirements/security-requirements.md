# Security Requirements - U03 Agreement Authority

## Scope and classification

Agreement terms, linked RateVersion IDs, match fields, histories, actor/service
IDs, correlations, and outbox/audit metadata are internal/confidential commercial
data. Synthetic local fixtures do not change that classification. Existing
platform TLS, database/backup encryption, least-privilege, and secret controls
remain authoritative. U03 invents no GDPR/PCI/HIPAA/SOC 2 scope, retention
period, public API, or cross-database access.

## Authentication and authorization

| ID | Requirement |
| --- | --- |
| SEC-U03-001 | Every service operation authorizes exact resource `charge-agreements` and action `read/create/update/approve/create-successor/suspend/expire`; default and adapter failure are deny. |
| SEC-U03-002 | U02's valid signed session is required at the browser boundary, but the service independently validates its trusted internal subject/service context. Browser actor, role, capability, service token, or correlation never authorizes. |
| SEC-U03-003 | Missing/invalid browser session is BFF 401. A trusted authenticated subject receiving exact Identity DENY is 403. Identity transport/timeout/malformed response is typed 503. Missing required non-local credentials or an enabled bypass prevents readiness/configuration. |
| SEC-U03-004 | Read is authorized before lookup/not-found. Denied readers receive no Agreement existence, history, links, customer/match values, or manual-case evidence. Manual evidence remains separately protected by U04. |
| SEC-U03-005 | Every W2 BFF Agreement request uses exact vendor media. Default JSON selects only the legacy adapter; there is no fallback between dialects after denial, validation, or not-found. |

Legacy `actor` query/body fields remain parseable only for compatibility and are
ignored as authority/provenance. A missing trusted subject fails closed. Service
authorization is repeated within the command boundary before protected
persistence or mutation.

## Input and authority protection

- Typed validation bounds identifiers, enums, reasons (1-512 trimmed chars),
  dates, page/size, query grammars, and exact command fields. SQL is parameterized.
- Reference checks verify exact active set/ID for customer, lane, origin,
  destination, and equipment. Rate link checks use service-owned persistence and
  require three distinct Approved versions with exact category/code, coverage,
  and applicability. Failure is safe 422 without cross-record disclosure.
- Optimistic row version, stable/version ownership, Draft-only edits,
  stable-header lock, canonical authority key, advisory transaction lock,
  inclusive-overlap query, and DB constraints defend tampering and races.
- Approved commercial snapshots/links and append-only activity are immutable;
  suspend/expire changes lifecycle/row version only. LEGACY data is explicitly
  ineligible for W2 commands/candidates.
- Activity and outbox enqueue share the business transaction. An audit/outbox
  failure rolls back commercial writes; publisher/relay never runs inside the
  command transaction.

## STRIDE and compatibility proof

| Threat | Required executable proof |
| --- | --- |
| spoofing/elevation | allowed/denied actions, spoofed legacy/W2 actor and service headers, missing secret, non-local bypass, Identity unavailable |
| tampering | stale row version, wrong aggregate/version, link/category/coverage changes, inclusive overlap and two-context race tests |
| repudiation | exactly one attributable activity and outbox record per committed action with actor/time/correlation; zero on rollback/denial |
| disclosure | authorize-before-lookup, denied/nonexistent records, safe validation/provider errors, log/trace/evidence redaction |
| denial of service | page/reason/payload/dependency bounds, key-scoped locks, pool/lock metrics, typed unavailable without partial state |
| compatibility confusion | exact default/vendor media, mixed grammar, 406/415, W2-from-legacy exclusion, no adapter fallthrough, old/new Avro fixtures |

The Avro 1.1.0 evolution retains all 1.0.0 fields/types and adds only
nullable/default-null fields. Event payloads exclude customer, match, linked
rate, date, and money values. Schema subjects, topics, and stable Agreement
record key remain unchanged.

## Logging, metrics, and release gates

Safe structured fields are timestamp, level, service, operation/action,
lifecycle, outcome/code, correlation, safe stable/version IDs, event type,
elapsed ms, and relay attempt outcome. Logs exclude customer identifiers/names,
lane/location/equipment, linked Rate IDs, validity dates, money, reason text,
cookies, tokens, service credentials, raw payloads, SQL, and stack traces.

Metric dimensions are limited to operation/action, lifecycle, outcome/status
class, media dialect, and event type. Agreement/version/customer/correlation IDs,
dedupe keys, values, and error text are prohibited labels. Histograms bracket
750 and 1,000 ms.

Release requires the complete authorization/failure/media matrix, redaction and
secret scans, contract/schema compatibility tests, no attributable open
Critical/High vulnerability without an explicit accepted exception, and
correlated API/DB/activity/outbox evidence. A green UI or health endpoint alone
is insufficient.

## Upstream coverage

This artifact consumes `business-logic-model.md`, `business-rules.md`,
`requirements.md`, and `technology-stack.md`, making their identity, commercial
authority, media compatibility, audit, and event controls executable.

