# Security Design - U05 Booking Consumption and Repricing

## Identity boundaries

Price, Reprice, amend, confirm, and reconfirm derive the existing exact human
action from the signed session and reauthorize at Booking before disclosure or
mutation. Receipt replay performs the same authorization and identity/body
match. Hidden UI actions are never a control.

Only the configured Booking service identity calls Charge with its exact
provider permission. The adapter fixes URL, v1 media, identity, correlation,
and derived idempotency key; browser actor/service/key/date headers cannot
supply authority. Missing non-local credentials or enabled bypass fails
readiness.

## Input and provider integrity

Persisted requested departure is the only business date. Booking derives the
canonical fixed-order UTF-8 body, SHA-256 fingerprint, Charge key, and local
`P|` key. Redirects, alternate hosts, caller headers, and body mutation between
retry attempts are prohibited.

Booking validates complete line order, IDs, currency, scale, arithmetic, and
all-or-none enrichment with `BigDecimal`; it never calculates, rounds, repairs,
or substitutes provider money. Partial W2 enrichment is invalid, while complete
legacy data follows its separate honest decoder.

## Receipt and snapshot controls

Receipt claims/takeovers increment a PostgreSQL fence. Release/completion
requires IN_PROGRESS plus exact owner/fence. Under Booking row lock, completion
also matches frozen revision, pricing sequence, and fingerprint. Identical
snapshot canonical bytes replay; divergent bytes return
`PRICING_SNAPSHOT_CONFLICT` without overwrite.

Confirmation/reconfirmation requires current `PRICED` or `LEGACY_PRICED`
markers matching current input. Manual, stale, unpriced, denied, malformed,
conflict, in-progress, or outage states cannot confirm.

## Disclosure and logging

Manual/outage evidence contains no amount/total. Previous priced snapshots are
labelled Previous and never current authority; Legacy entries disclose no
invented provenance. Authorization precedes Booking/history/receipt existence.

Logs may include operation, safe code, sequence, basis/source IDs, replay/fence/
circuit state, and elapsed time. They exclude customer/route/equipment payload,
canonical body, fingerprint material, credentials, unit rates, amounts, totals,
raw provider/DB payload, SQL, and stack traces. Metrics never label identifiers,
correlation, or money.

## UI security and accessibility

The existing Booking route remains in the shared authenticated shell. The
pricing region exposes only authorized commands, disables duplicate submission
while pending, announces state without color alone, preserves amendment input
after safe failures, and gives confirmation guards at both UI and service.
Lucide icons, visible focus, labelled fields, reduced motion, and WCAG 2.1 AA
apply; no browser-side commercial calculation or hidden credential is added.

## Verification and traceability

The blocking matrix covers spoofed identities/headers, wrong actions, denial
before lookup/replay, body/key/date tampering, stale fence/markers, divergent
snapshot, malformed money/enrichment, confirmation guards, secrets/bypass, and
redaction.

This design consumes `performance-requirements.md`,
`security-requirements.md`, `scalability-requirements.md`,
`reliability-requirements.md`, `tech-stack-decisions.md`, and
`business-logic-model.md`.
