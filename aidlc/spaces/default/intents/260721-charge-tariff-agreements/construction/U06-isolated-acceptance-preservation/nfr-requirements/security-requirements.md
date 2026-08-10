# Security Requirements - U06 Isolated Acceptance and Preservation

## Scope and evidence classification

U06 handles internal/confidential commercial test data, signed sessions, service
identities, database evidence, logs/traces, screenshots, and audit reports. The
evidence root is access-controlled local project output and contains only the
minimum values needed to prove correctness. It creates no public endpoint,
credential store, certification, retention period, or production-access method.

## Closed authorization and fail-closed matrix

Exactly one executable result is required for every cell:

| ID | Cell | Required observation |
| --- | --- | --- |
| SEC-U06-001 | allowed human Charge/Booking actions | signed session plus exact capability succeeds; service independently authorizes |
| SEC-U06-002 | denied human/no disclosure | 403; no record/count/commercial/manual metadata or write |
| SEC-U06-003 | spoofed browser actor/capability/service headers | rejected/ignored; signed/configured subject remains authoritative |
| SEC-U06-004 | missing Booking-to-Charge service identity or permission | typed denial/unavailable, no receipt/case/snapshot/price |
| SEC-U06-005 | missing required non-local secret | readiness/configuration fails closed; no local bypass fallback |
| SEC-U06-006 | non-local bypass/profile attempt | startup/readiness or authorization blocks it |

Every cell is blocking. UI-hidden controls, a green health endpoint, or one
allowed journey cannot substitute for the matrix. Manual-case read requires its
separate exact human capability and authorizes before count/lookup.

## Manager and runtime isolation

- `npm run demo:guard` runs before and after with default manager settings.
- Manager inventory is read-only and fingerprints project labels, container/
  image IDs, start times, and published ports. Raw Docker operations may inspect
  only; they never stop/restart/build/remove/create manager objects.
- All Wave A mutations use `node scripts/wave-a-compose.mjs`; rendered project is
  exactly `linercore-wave-a`, edge 18088, and no service publishes/targets 8088.
- Direct service ports are diagnostic only. Browser/e2e calls use
  `http://127.0.0.1:18088` and normal shell/session paths.
- Database evidence queries each service-owned database independently using a
  redacting wrapper/exec. No cross-database join or copied authority is allowed.

## Evidence integrity and redaction

Each command record contains ID, redacted invocation, UTC start/end, exit code,
status, output path, and mapped requirements. `manifest.json` includes each
required typed ID exactly once and SHA-256 for every indexed artifact. A final
rehash mismatch, unindexed required file, duplicate ID, or path escape fails.

Logs, metric labels, traces, command lines, screenshots metadata, and reports
exclude cookies, tokens, passwords, service credentials, raw customer/party
payloads, and unnecessary unit rates/amounts/totals. Expected/observed commercial
values appear only in the minimal scenario assertion evidence. Redaction scans
use deterministic prohibited-value canaries plus generic secret patterns; every
lead is manually dispositioned.

Metrics use bounded operation/outcome/basis/manual-reason/replay/conflict labels;
business IDs and correlations are not labels. Safe correlations remain in logs/
traces/evidence to join one journey. Raw owner/fence tokens are hashed or omitted.

## Browser, supply-chain, and audit gates

Playwright must prove no direct browser-to-backend request, no browser-provided
authority, safe return URLs, denied/no-disclosure, keyboard/focus semantics, and
zero critical/serious axe findings for required cells. Traces and screenshots
pass the same redaction scan.

Changed production dependencies/code have no attributable unaccepted Critical/
High vulnerability; license, dependency convergence, secret, SAST/static, and
configuration checks are recorded. Detector exits for `aidlc-audit` and
`erp-fidelity-audit` are leads only; every manual seam and finding disposition is
required before green.

## Upstream coverage

This artifact consumes `business-logic-model.md`, `business-rules.md`,
`requirements.md`, and `technology-stack.md`, enforcing BR-U06-001-009C and the
security parts of NFR-004/NFR-009 without expanding runtime or UI ownership.

