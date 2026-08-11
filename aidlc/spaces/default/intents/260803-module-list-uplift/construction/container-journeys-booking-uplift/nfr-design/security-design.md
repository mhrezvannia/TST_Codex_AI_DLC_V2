# Security Design - U04 Container Journeys and Booking Relationship Uplift

## Source Alignment

This design realizes the SEC-U04 requirements in `security-requirements.md` using the v2 contract, capture, and relationship workflows in `business-logic-model.md`, within the stack in `tech-stack-decisions.md`. Per Q1, non-applicable catalogue patterns are recorded; per Q2, only the resilience that exists is designed.

U04 mints three signed artifacts — a subject assertion, a capture-attempt token, and cross-module origin tokens — which makes it the unit where credential design is the security design.

**Consumed inputs.** `security-requirements.md` supplies the numbered requirements this design realizes; `business-logic-model.md` supplies the request pipeline and boundaries they apply to; `tech-stack-decisions.md` fixes the validator and framework behaviour the controls depend on; `performance-requirements.md` shares the fail-closed ordering (its measurable form is that denied paths are faster); `scalability-requirements.md` supplies the cardinality bounds enforced at the adapters; and `reliability-requirements.md` supplies the outcome semantics that determine what a failed control may expose.

## Authorization Architecture

```
browser request
  -> edge: clear 11 trust headers, set 5 trusted values
  -> app: resolve host-wide session
  -> BFF: authorize container-movement:read (current request)
       |- denied / unavailable -> fail closed, ZERO CMM and Reference calls
       `- allowed
            -> issue subject assertion bound to method+path+correlation
            -> CMM v2 (media-type negotiated)
  for capture:
  -> BFF: authorize container-movement:capture (independent decision)
       -> provider captureEnabled? AND location validation available?
            -> issue capture-attempt token (server-generated idempotency key)
```

Both capabilities are distinct decisions on the current request; neither is derived from the other, and every route fails closed until Identity registers them. No coarse or `local-user` substitute exists on any path.

## Three Signed Credentials

Each solves a different problem and binds a different tuple. Getting the bindings right is what makes them non-transferable.

| Credential | Binds | Prevents | Lifetime |
| --- | --- | --- | --- |
| Subject assertion | issuer, key ID, subject, HTTP method, normalized provider path, correlation, issued/expiry, nonce | Replaying a captured proof against a different operation or subject | Short-lived, per provider call |
| Capture-attempt token | subject, journey ID, provider `updatedAt`, action, server-generated idempotency key | A stolen token capturing a different movement, on a different journey, at a different revision | Short-lived, per attempt |
| Cross-module origin token | session subject, source kind, source record ID, canonical href, expected target module | Cross-module open redirect; a token minted for one target being used against another | 10 minutes, ≤512 characters |

Two design rules apply to all three: **the browser never sees a secret** (it echoes opaque tokens only, and the idempotency key stays embedded server-side), and **verification checks every bound field**, not just the signature — a valid signature over the wrong journey or target must still be rejected.

The assertion reuses the existing Charge HMAC pattern with a **dedicated CMM key**, so a key compromise in one domain does not authorize the other.

## Trust Boundary Design

| Boundary | What crosses | What is stripped or rejected |
| --- | --- | --- |
| Browser → edge | Cookies, ordinary representation headers | The exact eleven-header inbound trust list, including `X-LinerCore-Subject-Assertion` |
| Browser → BFF | Bounded `limit`, opaque attempt token, `eventCode`, `locationId`, `occurredAt` | Actor, capability, idempotency key, correlation authority, container identity, any other field |
| BFF → CMM v2 | Subject assertion, `Idempotency-Key` from the token, `X-Correlation-Id` | Any browser-originated authority |
| BFF → Reference | Service credential, trusted correlation, bounded location query | Browser authority; current-request `container-movement:read` gates the call |
| Nginx → internal CMM service | **nothing** — the service is not exposed | All external traffic |

The v1 actor-shaped contract remains internal-only. Because v2 is negotiated by media type on the *same* endpoints, the negative case matters: a request without a valid assertion must not fall back to the default JSON representation and must not reach v2 at all. That is tested explicitly rather than assumed from configuration.

## Input Validation Strategy

Zod schemas at the route handler, **strict rather than stripping**. The recent list admits only a bounded `limit` and `focus`; anything else — especially an actor identifier — is `invalid-query`/400 before provider access. The capture body admits exactly three fields plus the opaque token; a request carrying an actor or idempotency field is rejected, not silently cleaned, so a client attempting to supply server-owned values is visible.

Container identity is read-only and never a capture input.

## Capture Integrity Design

The attempt token is the whole idempotency design. The BFF generates the key, embeds it in a signed token bound to subject/journey/revision/action, and the browser can only echo the token back. On dispatch the BFF verifies signature, expiry, subject, journey, and action, then forwards the embedded key as `Idempotency-Key`. The provider's idempotency receipt makes an explicit retry duplicate-safe.

Token lifecycle after an outcome: definitive validation or conflict issues a **replacement** token (the old attempt is spent); an unknown outcome **retains** the original (so an eventual retry lands on the same idempotency key) and blocks retry until an authoritative re-read.

## Data Exposure Design

Safe actionable text plus correlation or event reference in the primary surface; raw payload, schema, and transport evidence collapsed and access-appropriate. Denials carry no capability detail. Read surfaces show raw authorized location IDs when labels fail — already-authorized identifiers, leaking nothing new. `receivedAt` and `source` are rendered neither as values nor as labelled unavailable values, because the provider does not own them.

## Deliberately Not Used

| Catalogue pattern | Why it does not apply here | Forecloses it |
| --- | --- | --- |
| Encryption-at-rest design | U04 adds no persistence; provider databases own storage | U04 non-responsibilities |
| New secrets-management platform | The assertion key joins existing Compose key material; no new secret store | `services.md`, `tech-stack-decisions.md` |
| Kafka transport security / broker auth / topic ACLs | Platform-owned; W4 changes no messaging configuration and claims nothing about it | `services.md`, NFR-008 |
| New compliance / data-classification framework | Explicitly excluded | NFR-008 |
| Zero-trust network segmentation | No network topology change beyond adding one prefix mount | NFR-012 |
| Repository-wide SAST / SBOM / provenance | Only the W4-touched `u02-security` path is claimed | NFR-008 |
| OAuth / token-exchange redesign | Session and Identity are platform-owned; U04 consumes them | `components.md` ownership map |

## Threat Model Realization

The four threats in `security-requirements.md` map to concrete controls: assertion forgery or replay is closed by full-tuple binding plus expiry and nonce; capture-token theft is bounded by subject/journey/revision/action binding and a short life; cross-module open redirect is closed by refusing `returnTo` across module boundaries entirely in favour of a target-bound token; and the confused deputy on the location port is closed by capability-before-credential ordering. Key management is the residual risk and is a platform concern with its own key material.

## Verification

Contract tests assert policy-before-provider ordering with a provider spy, capability separation between read and capture, assertion issuance and verification including spoof, expiry, and wrong-operation rejection, token binding and replacement/retention semantics, strict-schema rejection with the 400, and origin-token validation and fallback in both directions. Live Compose checks cover direct-service inaccessibility, v1 unreachability from a browser route, header spoofing, denied deep links, and absence of a data flash. Per NFR-011 a detector that only prints leads is not a passing gate.
