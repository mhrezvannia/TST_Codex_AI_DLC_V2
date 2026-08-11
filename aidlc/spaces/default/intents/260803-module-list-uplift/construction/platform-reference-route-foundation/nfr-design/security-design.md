# Security Design - U01 Platform and Reference Route Foundation

## Source Alignment

This design realizes the SEC-U01 requirements in `security-requirements.md` using the canonical read pipeline in `business-logic-model.md`, within the stack in `tech-stack-decisions.md`. Per Q1, non-applicable catalogue patterns are recorded; per Q2, only the resilience that exists is designed.

U01 has no mutation surface. Its security design is therefore almost entirely about **establishing the boundary the other three units inherit** — which makes a defect here a defect everywhere, and makes the architecture tests it installs a security control in their own right.

**Consumed inputs.** `security-requirements.md` supplies the numbered requirements this design realizes; `business-logic-model.md` supplies the request pipeline and boundaries they apply to; `tech-stack-decisions.md` fixes the validator and framework behaviour the controls depend on; `performance-requirements.md` shares the fail-closed ordering (its measurable form is that denied paths are faster); `scalability-requirements.md` supplies the cardinality bounds enforced at the adapters; and `reliability-requirements.md` supplies the outcome semantics that determine what a failed control may expose.

## The Boundary U01 Establishes

```
browser
  -> Nginx /reference-data* location
       clear: Authorization, Idempotency-Key, X-Actor-Subject, X-Actor-Subject-Id,
              X-Correlation-Id, X-Forwarded-For, X-Forwarded-Host, X-Forwarded-Proto,
              X-LinerCore-Service-Id, X-LinerCore-Service-Token, X-LinerCore-Subject-Assertion
       set:   Host, X-Forwarded-Host, X-Forwarded-Proto, X-Forwarded-For, X-Correlation-Id
  -> Reference app root layout: resolve host-wide session (Path=/)
  -> shared PlatformShell (consumed, never forked)
  -> BFF: IdentityPolicyPort.authorize(context, reference-data:read)
       |- denied      -> shared denied state, ZERO provider calls
       |- unavailable -> retryable 503, ZERO provider calls
       `- allowed     -> strict route/query parse -> Reference provider
```

Every element of this is inherited unchanged by U02, U03, and U04. None of them re-establishes it; they extend it with mutation and domain concerns.

## Edge Design

The eleven-header clear list plus five trusted replacements is the whole inbound trust control — `technology-stack.md` records no API gateway, WAF, or service mesh, so there is no second layer to catch a header that slips through. Two design consequences:

- The list is **explicit and enumerated**, not a wildcard pattern. Stock Nginx cannot implement wildcard header removal, so a family-based rule like `X-Actor-*` would silently not work; naming each header is what makes the control real.
- It is applied via a **shared include on every public location**, so adding a module cannot accidentally omit it. U04's new mount inherits it by construction rather than by remembering.

Internal BFF-to-service calls bypass the public edge and set their own trust headers, so the two paths never confuse each other's authority.

## Authorization Design

One current-request decision per read, including on refresh. No capability set is accumulated in the session for a later request to consult, and no decision is stored with any client state. Deny and Identity outage are distinct branches that both fail closed — they differ only in what the user is offered.

Module visibility follows the same decision: a module the subject cannot read is absent from shell navigation, and its deep link renders the shared denied state. Hiding navigation is presentation; the deep-link denial is the actual control.

## Input and Navigation Safety Design

The route parser is a single strict boundary ahead of provider access. It rejects — rather than strips — duplicate, unknown, malformed, overlong, traversal, encoded-separator, and out-of-prefix input, so a client sending unsupported values is visible instead of silently corrected.

Safe return is an allow-list grammar, not a sanitiser: `returnTo` must be Reference-relative, prefix-bound, length-bounded, duplicate-free, and restricted to `setCode,includeInactive,page,size,focus`. Anything else falls back to the canonical list rather than to a supplied destination. Focus restoration targets only an allow-listed row identifier that exists after render, so a supplied focus value cannot select an arbitrary element.

## Architecture Tests as a Security Control

U01 installs tests that prohibit: domain-app React imports across modules, a second shell or theme, arbitrary return URLs, browser actor authority, and provider calls after DENY. These are listed here rather than only in the functional design because they are preventive controls — each forecloses a class of regression that would otherwise be reintroduced quietly in a later unit, long after the reviewer who would recognise it has moved on.

## Deliberately Not Used

| Catalogue pattern | Why it does not apply here | Forecloses it |
| --- | --- | --- |
| Encryption-at-rest design | U01 adds no persistence | U01 non-responsibilities |
| Secrets-management redesign | No new secret; session and Identity are platform-owned | `components.md` ownership map |
| New compliance / data-classification framework | Explicitly excluded | NFR-008 |
| Zero-trust network segmentation | No network topology change | NFR-012 |
| Repository-wide SAST / SBOM / provenance | Only the W4-touched path is claimed | NFR-008 |
| Session or token redesign | Host-wide session is W2-02-owned; U01 consumes it | `components.md` |
| CSRF token scheme | U01 has no state-changing request; the mutation units address their own command safety through capability re-authorization and server-derived evidence | U01 scope |
| Rate limiting / WAF | No public exposure; ten-user local acceptance topology | NFR-012 |

## Threat Model Realization

U01's added surface is the **canonical prefix mount itself** — a new public edge location is where header sanitation, base-path handling, and cookie scope are either right or silently wrong. The mitigations are the enumerated clear list, the shared include, the exact base-path match, and live verification of direct load and refresh. No new authentication mechanism, mutation, or cross-module navigation is introduced.

## Verification

Contract and route tests assert the policy-before-provider ordering with a provider spy, strict rejection of every invalid-input class, and the safe-return grammar including the malicious-target matrix. Live Compose checks cover direct load and refresh, asset resolution under the prefix, header spoofing, denied deep links, absence of a data flash, and target-scoped failure across prefixes. Per NFR-011 a detector that only prints leads is not a passing gate.
