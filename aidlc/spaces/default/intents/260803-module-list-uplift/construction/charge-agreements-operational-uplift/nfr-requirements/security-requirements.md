# Security Requirements - U03 Charge Agreements Operational Uplift

## Source Alignment

These requirements scope `requirements.md` NFR-004, FR-012, FR-016, and FR-020 to U03, restating them as unit-level statements a test can falsify. They draw the unit's actual trust boundaries from `business-logic-model.md` (the request pipeline, the Reference-option port, the command workflow) and `business-rules.md` (BR3-001 through BR3-006 authorization, BR3-050 through BR3-055 option port, BR3-070 through BR3-072 return safety). Per the answered Q4, no new compliance regime, data-classification scheme, or repository-wide security programme is introduced; NFR-008 bounds the security gate to the W4-touched `u02-security` path.

## Stack-Derived Security Constraints

`technology-stack.md` bears on two of U03's controls:

- **Zod 3.24.1 strip-versus-reject.** SEC-U03-12 and SEC-U03-14 require duplicate and unknown query keys to be *rejected* before provider access, not stripped. Zod's default object behaviour strips unknown keys, which would satisfy "the key never reaches the provider" while silently failing "the request returns `invalid-query`/400" — and would mask a client sending unsupported filters. The query schemas must be strict, and the tests must assert the 400 rather than merely the absence of the key downstream.
- **Next.js 15.5.21 route handlers as the only BFF boundary.** SEC-U03-07's rejection of browser-supplied actor, credential, correlation, replay key, and version is enforced in the route handler layer. `technology-stack.md` records no gateway or mesh in front of it, so there is no second place that would strip such a field — the handler is the whole control, which is why the requirement is stated as rejection at the BFF specifically.

Per the same file's **Evidence limitations**, PostgreSQL and Spring transitive versions were not resolved. U03 changes no Java code and asserts no security property that depends on them.

## Authorization Requirements

| ID | Requirement | Falsified by |
| --- | --- | --- |
| SEC-U03-01 | Every read and every command evaluates Identity for the current request. | A test that authorizes once, then observes a second operation succeed without a new decision. |
| SEC-U03-02 | Each command re-authorizes its own exact capability (`charge-agreements:create`, `:update`, `:approve`, `:create-successor`, `:suspend`, `:expire`). | A test that holds `:update` and successfully executes `:approve`. |
| SEC-U03-03 | On DENY or Identity outage, zero Charge and zero Reference provider calls are made. | A provider spy that records any call on either path. |
| SEC-U03-04 | Identity outage is distinguishable from DENY and maps to retryable `unavailable`/503. | A test where an outage renders the denied state, or is retried automatically. |
| SEC-U03-05 | No authorization decision is cached, persisted with a draft, or reused across requests. | A test that revokes a capability mid-session and observes a stale ALLOW. |
| SEC-U03-06 | A read-capable user without mutation capability sees provider truth with commands absent — not disabled. | A DOM assertion finding a disabled command control for an unauthorized action. |

## Trust-Boundary Requirements

| ID | Requirement | Falsified by |
| --- | --- | --- |
| SEC-U03-07 | Browser-supplied actor, capability, service credential, correlation authority, replay key, and provider version are ignored or rejected at the BFF. | A request injecting any of these fields that changes server behaviour. |
| SEC-U03-08 | The public edge clears the exact eleven-header inbound trust list and sets the five trusted replacements. | A spoofed `X-Actor-Subject` or `X-LinerCore-Subject-Assertion` surviving to the app. |
| SEC-U03-09 | The Reference option call uses the fixed Charge service credential and trusted correlation, never forwarded browser authority. | A test where a browser-supplied credential reaches the Reference service. |
| SEC-U03-10 | The replay key is derived server-side from a bounded validated client request ID and is never rendered or accepted from the browser. | A response body or DOM containing the replay key, or a browser-supplied key being honoured. |
| SEC-U03-11 | No data is rendered before the authorization decision resolves (no denial flash). | A visual or DOM-timing test observing Agreement data prior to the denied state. |

## Input and Navigation Safety

| ID | Requirement | Falsified by |
| --- | --- | --- |
| SEC-U03-12 | Duplicate, unknown, malformed, or overlong query keys return `invalid-query`/400 before any provider access. | A provider spy recording a call for a malformed query. |
| SEC-U03-13 | `returnTo` is Charge-relative, <= 2,048 decoded characters, prefix-bound, duplicate-free, and restricted to the Charge allow-list. | Any accepted scheme, host, protocol-relative path, backslash, control character, encoded separator, or traversal segment. |
| SEC-U03-14 | The Reference option query admits exactly one `domain`, one `kind`, and at most one 128-character `q`. | A multi-value or oversized parameter reaching the Reference service. |
| SEC-U03-15 | Reference options are bounded to <= 50 active records; an unverified option never becomes a canonical ID. | A free-text label accepted as an ID, or a response exceeding the cap. |

## Data-Exposure Requirements

| ID | Requirement | Falsified by |
| --- | --- | --- |
| SEC-U03-16 | User-facing failures expose only safe actionable text plus correlation/provider reference. | Raw payload, schema, stack, or transport detail in the primary workflow surface. |
| SEC-U03-17 | Technical evidence remains in a collapsed, access-appropriate disclosure. | Technical detail rendered expanded by default or to an unauthorized viewer. |
| SEC-U03-18 | A denied response carries no capability detail that would enumerate the policy model. | A denial message naming the capability the subject lacks. |

## Threats This Unit Introduces

U03 adds no new authentication mechanism and no new persistence, so its added threat surface is narrow and specific:

- **Replay of a lifecycle command.** Approve, suspend, and expire are consequential and irreversible in effect. The server-derived replay key plus the provider's idempotency makes an explicit retry duplicate-safe; the residual risk is a client that submits twice before pending state engages, which BR3-034 closes at the client boundary and the replay key closes at the provider.
- **Confused-deputy via the Reference option port.** The Charge BFF calls Reference with a service credential on behalf of a browser request. The mitigation is that the port requires the *current request's* Charge read capability first (BR3-052), so the service credential can never be exercised for an unauthorized subject.
- **Version-substitution.** Because commands carry version and row-version evidence, a client that could supply its own version could act against stale truth. BR3-032 rejects browser-supplied versions at the BFF boundary.

No other threat class is claimed. Threat modelling beyond the unit's own surface belongs to the bounded W4 security aggregation under NFR-008.

## Verification

Security evidence is produced by contract and route tests (policy, provider-call prohibition, header sanitation, allow-list rejection, replay-key derivation) and by live checks on the Compose stack (spoof rejection, no data flash, denied deep links). Per NFR-011 a detector that only prints leads is not a passing gate, and per NFR-008 only the W4-touched security path is in scope — this unit claims no repository-wide SAST, secret-scan, dependency-audit, image, IaC, SBOM, or provenance result.
