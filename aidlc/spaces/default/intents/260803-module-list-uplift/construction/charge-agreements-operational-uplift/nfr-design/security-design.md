# Security Design - U03 Charge Agreements Operational Uplift

## Source Alignment

This design realizes the SEC-U03 requirements in `security-requirements.md` using the request pipeline, command workflow, and option port described in `business-logic-model.md`, within the stack recorded in `tech-stack-decisions.md`. Per the answered Q1, non-applicable catalogue patterns are recorded rather than omitted; per Q2, the resilience that exists is designed and the rest explicitly excluded.

**Consumed inputs.** `security-requirements.md` supplies the numbered requirements this design realizes; `business-logic-model.md` supplies the request pipeline and boundaries they apply to; `tech-stack-decisions.md` fixes the validator and framework behaviour the controls depend on; `performance-requirements.md` shares the fail-closed ordering (its measurable form is that denied paths are faster); `scalability-requirements.md` supplies the cardinality bounds enforced at the adapters; and `reliability-requirements.md` supplies the outcome semantics that determine what a failed control may expose.

## Authorization Architecture

Authorization is a **per-request, per-operation** decision with no client participation and no memory.

```
browser request
  -> edge: clear 11 trust headers, set 5 trusted values
  -> app: resolve host-wide session
  -> BFF: IdentityPolicyPort.authorize(context, exact capability)
       |- denied            -> shared denied state, ZERO provider calls
       |- unavailable       -> retryable 503, ZERO provider calls
       `- allowed           -> strict query/body parse -> Charge provider
```

Three properties make this design rather than aspiration:

1. **Ordering is structural.** The provider client is only reachable past the policy branch, so "no provider call after DENY" is a code-path property a test can assert with a provider spy, not a convention.
2. **Each command re-authorizes its own capability.** `charge-agreements:approve` is a different decision from `:update`; a page-level read ALLOW carries no command authority. Capabilities are never accumulated into a session-scoped set that a later request reads.
3. **Deny and outage are distinct branches** that both fail closed. They differ only in what the user is offered — a denied state versus a retry — never in whether the provider is contacted.

## Trust Boundary Design

| Boundary | What crosses | What is stripped or rejected |
| --- | --- | --- |
| Browser → edge | Cookies, ordinary representation headers | The exact eleven-header inbound trust list |
| Edge → app | Trusted Host, forwarded host/proto/for, request-ID correlation | Anything the browser asserted about identity |
| Browser → BFF | Query allow-list, command body allow-list, bounded client request ID | Actor, capability, credential, correlation authority, replay key, provider version |
| BFF → Charge provider | Service credential, trusted correlation, server-derived replay key | Any browser-originated authority |
| BFF → Reference provider | Fixed service credential, trusted correlation, bounded option query | Browser authority; the current-request Charge read capability gates this call |

The Reference call is the one place U03 acts as a deputy with a service credential. The confused-deputy mitigation is ordering: the current request's Charge read capability is required *before* the credential is exercised, so the credential can never be used on behalf of an unauthorized subject.

## Input Validation Strategy

Validation is a single strict boundary per surface, implemented with Zod schemas at the route handler.

- **Strict, not stripping.** Unknown and duplicate keys must produce `invalid-query`/400, not be silently dropped. Zod's default object behaviour strips, which would satisfy "never reaches the provider" while violating "the request is rejected" — so the schemas are explicitly strict and the tests assert the 400 rather than the absence of the key downstream.
- **Allow-list, never deny-list.** The Agreement query admits exactly eight keys; the option query admits exactly `domain`, `kind`, and an optional 128-character `q`.
- **Server-derived values are never accepted.** Replay key, correlation, version, and actor are constructed server-side; a request supplying them is rejected rather than having them overwritten, so a client attempting to supply them is visible rather than silently corrected.

## Command Integrity Design

Each command carries the Agreement ID, the exact version read with the draft, and the row version. The replay key is derived server-side from a bounded validated client request ID, using the existing `deriveReplayKey` seam, and is forwarded with `FORWARD_DERIVED` idempotency. Together these give three guarantees: a stale version cannot overwrite current truth, an explicit retry is duplicate-safe at the provider, and no browser value influences either.

Consequential transitions — approve, suspend, expire — require a consequence-specific confirmation before dispatch. That is a UX control with a security purpose: it makes an irreversible lifecycle change a deliberate act rather than a mis-click.

## Data Exposure Design

User-facing failures carry safe actionable text plus correlation or provider reference. Raw payload, schema, and transport evidence lives in a collapsed, access-appropriate disclosure. A denial carries no capability detail, so the policy model cannot be enumerated by probing. Read surfaces may show raw authorized IDs when a label cannot be resolved — the ID is already authorized to that subject, so showing it leaks nothing the record does not already expose.

## Deliberately Not Used

| Catalogue pattern | Why it does not apply here | Forecloses it |
| --- | --- | --- |
| Encryption-at-rest design | U03 adds no persistence; provider databases own their own storage | `unit-of-work.md` U03 non-responsibilities |
| Secrets-management redesign | The Charge service credential and correlation scheme already exist; W4 introduces no new secret store | `tech-stack-decisions.md` |
| New compliance/data-classification framework | Explicitly excluded; the security gate is bounded to the W4-touched path | NFR-008 |
| Zero-trust network segmentation | No network topology change; the edge and internal service calls are as-is | NFR-012, `services.md` |
| Repository-wide SAST / SBOM / provenance | Out of scope; only the W4-touched `u02-security` path is claimed | NFR-008 |
| Session redesign / token rotation | Host-wide session is platform-owned (W2-02); U03 consumes it | `components.md` ownership map |

## Threat Model Realization

The three threats named in `security-requirements.md` map to concrete controls: lifecycle-command replay is closed by the server-derived key plus provider idempotency and the client-side pending guard; the confused deputy on the option port is closed by capability-before-credential ordering; version substitution is closed by BFF rejection of browser-supplied versions. No other threat class is claimed, and none of these controls depends on a component W4 introduces.

## Verification

Contract tests assert the policy-before-provider ordering with a provider spy, per-command capability separation, strict-schema rejection with the 400, replay-key derivation and forwarding, and version propagation. Live Compose checks cover header spoofing, denied deep links, and absence of a data flash. Per NFR-011 a detector that only prints leads is not a passing gate.
