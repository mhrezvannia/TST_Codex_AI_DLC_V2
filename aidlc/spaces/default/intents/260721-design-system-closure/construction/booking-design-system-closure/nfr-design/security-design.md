# Security Design — booking-design-system-closure

## Design Inputs

This design applies `security-requirements.md` in concert with `performance-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`. It strengthens verification of existing controls without creating a new identity, encryption, network, cloud, or compliance architecture.

## Defense-in-Depth Flow

| Boundary | Existing control retained | Closure design |
|---|---|---|
| Browser → shell | Authenticated session and canonical route | All UI lives under existing ShellFrame; no detached acceptance/auth bypass |
| Shell route → shell adapter | Server-derived session/cookie/correlation | UI never supplies actor or correlation authority |
| Shell adapter → Booking BFF | Same-origin route, cookie/correlation/idempotency forwarding | Focused positive/negative contract tests |
| Booking BFF → service | Actor derivation, JSON/origin checks, size/deadline, safe errors | Preserve interface and prove rejection paths |
| UI/evidence | Semantic safe presentation | Redact tokens/cookies/credentials/raw payloads |

## Input and Command Validation

- Presentation query parsing allow-lists current list keys and never selects auth/theme/test state.
- Standalone redirects accept full Request plus trusted canonical shell origin, match presentation routes only, emit 308, and return no decision for every `/api/**` path.
- Create/validate/price/confirm commands remain JSON, same-origin, and idempotency-protected.
- Existing 1–128 visible-character idempotency-key rule, 32,768-byte body limit, and 2,500 ms deadline remain executable.
- Service/domain validation remains authoritative; client checks do not bypass it.
- Returned error data is normalized to safe code/message/fields/correlation before presentation.

## Authorization and Information Disclosure

Denied routes/actions render inside the shared shell with a safe navigation target and no forbidden command. Resource identity is encoded for path use, but ownership/action decisions remain server-side.

Primary operator UI contains only necessary Booking facts. Correlation and secondary technical facts appear in safe audit/support context. Raw Kafka payloads, schemas, internal URLs, stack traces, tokens, cookies, and credentials are never rendered or retained in screenshots/traces/manifests.

## Evidence Redaction

The Playwright response/event recorder uses an allow-list:

- retain URL path without credentials, method, status, duration, correlation-safe identifier, state name, viewport/theme, and artifact path;
- remove Cookie, Set-Cookie, Authorization, token values, request bodies, and unrelated response payloads;
- use synthetic/local Booking data already approved for the isolated stack;
- scan manifest/results before audits for forbidden header/key names.

Playwright trace archives follow a mandatory promotion pipeline:

1. Write the raw archive only to a gitignored per-run staging directory outside
   `artifacts/w2-02-live/`.
2. Open the archive and parse trace/event JSONL plus embedded network-resource
   metadata. Redact values for `Authorization`, `Cookie`, `Set-Cookie`, token,
   credential, secret, session, and configured local-identity patterns while
   preserving names/status/timing needed for replay.
3. Rebuild the archive and run a second content scan across every archive entry and
   all other proposed durable artifacts.
4. Promote only an archive that passes the second scan with zero forbidden values.
   Record the sanitizer version/command, input hash, promoted hash, and scan result.
5. If parsing, redaction, rebuild, replay validation, or the second scan fails,
   delete the raw/staged archive, retain only a secret-free sanitizer failure report,
   mark the trace gate failed, and keep W2-02 pending.

Raw credential-bearing traces are never copied to the durable artifact path or
committed. A successful Playwright run without a proven secret-free required trace
is incomplete evidence, not a waiver.

## Security Regression Suite

Focused tests prove unauthenticated redirect, absent actor, forbidden action, invalid origin, wrong content type, invalid/missing idempotency, oversized body, timeout/safe error, redirect injection/unknown query, `/api/**` exclusion, app-import boundary, and secret-free manifest output. Source gates prove no production test-state control or local style system.

These are direct executable controls. No SAST, DAST, dependency vulnerability, SBOM, secret-scanner, WAF, AWS security service, TLS/cipher, storage encryption, formal regulatory, or certification PASS is claimed without separately installed/configured evidence.

## Blast Radius

A shell/session failure blocks canonical Booking access but does not bypass auth. A BFF failure becomes a safe route/action error and does not expose service internals. A service denial/failure preserves last safe UI state. An evidence-harness defect cannot alter production code or service state beyond documented test commands. The manager demo remains outside the test lifecycle.

## Review

**Verdict: READY**

The mandatory second review confirmed that the trace promotion pipeline is
executable and fail-closed, satisfies the secret-free evidence requirement without
discarding failure truth, and that mandatory pre/post demo guards are correctly
separated from the untouched manager-demo runtime.

**Mandatory corrections:** None.
