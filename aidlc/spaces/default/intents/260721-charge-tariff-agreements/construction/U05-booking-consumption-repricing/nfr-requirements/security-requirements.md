# Security Requirements - U05 Booking Consumption and Repricing

## Scope and classification

Booking pricing inputs/fingerprints, customer/route/equipment context, immutable
itemised snapshots and history, provider/manual evidence, receipt owner/fence,
actor/service identities, and correlations are internal/confidential commercial
data. Existing session/service authentication, TLS, database/backup encryption,
secret, and least-privilege controls remain authoritative. U05 adds no public
pricing API, compliance certification, retention rule, or cross-database access.

## Human and service authorization

| ID | Requirement |
| --- | --- |
| SEC-U05-001 | Price/Reprice/amend/confirm/reconfirm requires the existing exact Booking human action from the signed session/BFF and again at the service boundary before Booking disclosure or mutation. |
| SEC-U05-002 | Booking calls Charge with the established configured service identity and exact provider permission. Browser actor, service header/token, role, capability, idempotency key, correlation authority, or business date never supplies service authority. |
| SEC-U05-003 | Missing/invalid browser session is BFF 401; exact authenticated human/service DENY is 403 at its boundary; Identity or Charge transport/timeout/malformed authorization is typed unavailable/provider failure; missing non-local credentials or bypass configuration prevents readiness. |
| SEC-U05-004 | Receipt replay still requires the same Booking human authorization and matching Booking/operation/body identity before returning commercial outcome/history. Authorization cannot be bypassed by knowing `P|` or Charge keys. |

Confirmation/reconfirmation independently requires a current `PRICED` or
`LEGACY_PRICED` marker matching the current sequence/fingerprint. UI-hidden
actions are never the control. Manual, stale, unpriced, denied, malformed,
validation, conflict, changed, in-progress, or outage state cannot confirm.

## Input, provider, and snapshot integrity

- Persisted requested departure is the sole date; schemas, IDs, quantities,
  optional amendment date, body sizes, and canonical encoding are validated.
  There is no server-clock or browser price-time override.
- Booking derives the complete body, SHA-256 fingerprint, Charge key, and local
  `P|` key. A browser compatibility token is validated but never commercial
  authority. Different body/booking/operation under a key is 409.
- The provider adapter fixes URL, media, service identity, correlation, and
  idempotency. Redirect/open-proxy/header injection is prohibited. Retry reuses
  byte-identical body/identity/key/correlation.
- Booking validates complete W2 structure, exact line order, IDs, currency,
  numeric scale, amount/total consistency and enrichment all-or-none. It never
  repairs, recalculates, rounds, substitutes, or fabricates provider money.
- Snapshot insert is append-only and keyed to Booking/request. Identical bytes
  are replay; divergent bytes conflict. Aggregate revision/sequence/fingerprint
  and local owner/fence must match under lock before commit.

## STRIDE and disclosure matrix

| Threat | Blocking proof |
| --- | --- |
| spoofing/elevation | missing/spoofed human/service identity, browser key/actor headers, exact denied actions, missing secret, non-local bypass |
| tampering | date/fingerprint/key/body mismatch, partial provider enrichment, wrong order/money/IDs, stale fence/revision/sequence, divergent snapshot |
| repudiation | one correlation joins UI/BFF, Booking authorization/receipt, Charge request/receipt, Booking snapshot/evidence/audit and response |
| disclosure | authorize-before-lookup/replay, safe errors, history access, no current money in manual/error states, log/trace/evidence redaction |
| denial of service | fixed body/history/cursor/timeout/retry/circuit/lease/pool bounds and resource/concurrency gates |
| replay confusion | lost-200 replay with current markers, non-pricing revision preservation, due RETRYABLE reclaim, old key blocked from newer inputs |

Booking manual-required evidence contains no amount/total. Historical priced
snapshots remain clearly Previous evidence and cannot become the current price
for confirmation. Legacy flattened entries are explicitly Legacy and never gain
invented source/basis/version fields.

## Logging, metrics, and release gates

Safe logs include service/operation/outcome/code, correlation, Booking/pricing
request/sequence, basis, safe source IDs, replay/retry/fence/circuit state, and
elapsed time. They exclude customer/party/route/equipment payload, fingerprint
input/body, cookie/token/credential, unit rate/amount/total, raw provider or DB
payload, SQL, and stack traces. Metrics use bounded operation/outcome/basis/
manual reason/replay/retry/circuit dimensions; identifiers/correlation/money are
not labels.

Release requires the complete auth/spoof/secret/bypass/provider/snapshot/
confirmation/redaction matrices, zero attributable unaccepted Critical/High
vulnerabilities, and correlated API/DB evidence. A rendered UI or health check
alone is insufficient.

## Upstream coverage

This artifact consumes `business-logic-model.md`, `business-rules.md`,
`requirements.md`, and `technology-stack.md`, preserving Booking ownership,
Charge authority, existing route/shell, and no-shared-UI boundaries.

