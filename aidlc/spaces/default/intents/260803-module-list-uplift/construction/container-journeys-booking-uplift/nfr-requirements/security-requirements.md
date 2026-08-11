# Security Requirements - U04 Container Journeys and Booking Relationship Uplift

## Source Alignment

These requirements scope `requirements.md` NFR-004, FR-012, FR-016, and FR-020 to U04, restating them as falsifiable unit-level statements. The trust boundaries come from `business-logic-model.md` (the v2 contract and assertion workflow, the capture workflow, the relationship and origin-token workflow) and `business-rules.md` (BR4-001 through BR4-008 authorization and trust, BR4-040 through BR4-049 capture, BR4-060 through BR4-067 relationship and origin). Per the answered Q4, no new compliance regime or data-classification scheme is introduced; NFR-008 bounds the gate to the W4-touched `u02-security` path.

U04 carries the largest new security surface in W4-01: it is the only unit that mints a subject assertion, issues a capture-attempt token, and signs cross-module origin tokens.

## Stack-Derived Security Constraints

`technology-stack.md` bears on U04's controls more than on any other unit's, because U04 is the only one adding both a deployable and signed credentials:

- **Java 21 / Spring Boot 3.3.7 assertion verification.** SEC-U04-08's verification runs in the CMM v2 controller. Content negotiation on the same endpoints means the v2 path must be unreachable without a valid assertion *while the existing default JSON path continues to work* — a misconfigured media-type mapping would expose an unasserted route rather than fail closed, so the negative case is tested explicitly.
- **Next.js 15.5.21 with a new `basePath`.** SEC-U04-11 requires the internal CMM service to be unreachable externally and the actor-shaped v1 contract unreachable from a browser route. A brand-new app and Nginx mount is precisely where an over-broad proxy rule gets introduced, so this is verified by live request rather than by reading configuration.
- **Spring Kafka and Confluent 7.7.1.** Transport security, broker authentication, and topic ACLs are platform properties U04 does not change and does not claim. `technology-stack.md` records no evidence about them, so no assertion is made either way.
- **Zod 3.24.1 strip-versus-reject.** SEC-U04-16 requires the v2 command body to carry *only* `eventCode`, `locationId`, and `occurredAt`. A stripping schema would silently discard an injected actor or idempotency field instead of rejecting the request, hiding a client that is attempting to supply server-owned values — so the schema must be strict.

Per the same file's **Evidence limitations**, Kafka broker, PostgreSQL, Node.js, Yarn, and browser-runtime versions were not retained in the developer scan, and Spring transitive versions were not exhaustively resolved. The new app's container image pins a Node version that is recorded from the running stack at Build and Test rather than asserted here; no security property is claimed on the basis of an unversioned component.

## Authorization Requirements

| ID | Requirement | Falsified by |
| --- | --- | --- |
| SEC-U04-01 | Every read and capture evaluates Identity for the current request. | A second operation succeeding without a new decision. |
| SEC-U04-02 | `container-movement:read` and `container-movement:capture` are distinct; capture requires its own ALLOW. | A read-only subject completing a capture. |
| SEC-U04-03 | Every route fails closed until Identity registers both capabilities; no coarse or `local-user` substitute is accepted. | Any route serving data under a substituted or absent capability. |
| SEC-U04-04 | On DENY or Identity outage, zero CMM and zero Reference calls are made. | A provider spy recording a call on either path. |
| SEC-U04-05 | Identity outage is distinguishable from DENY and maps to retryable `unavailable`/503. | An outage rendering the denied state. |
| SEC-U04-06 | No authorization is cached or reused across requests. | A revoked capability still yielding ALLOW. |

## Trusted-Identity Requirements

| ID | Requirement | Falsified by |
| --- | --- | --- |
| SEC-U04-07 | The subject assertion binds issuer, key ID, subject, HTTP method, normalized provider path, correlation ID, issued and expiry time, and nonce. | An assertion accepted for a different method, path, or subject than it was issued for. |
| SEC-U04-08 | The v2 controller verifies the assertion with a dedicated key before mapping the subject into application ports. | An unsigned, wrongly-signed, or expired assertion being honoured. |
| SEC-U04-09 | The v2 controller ignores or rejects every actor query and body field. | An actor field in the request changing the recorded actor. |
| SEC-U04-10 | The browser session, cookies, and headers are never forwarded to the CMM service as authority. | A forwarded browser credential reaching the service. |
| SEC-U04-11 | The internal CMM service is not exposed by Nginx, and the actor-shaped v1 contract is not reachable from a browser route. | Any direct external request succeeding against the service or v1. |
| SEC-U04-12 | The public edge clears the exact eleven-header inbound trust list and sets the five trusted replacements. | A spoofed `X-LinerCore-Subject-Assertion` or `X-Actor-Subject` surviving to the app. |

## Capture Integrity Requirements

| ID | Requirement | Falsified by |
| --- | --- | --- |
| SEC-U04-13 | The capture-attempt token is server-issued and binds subject, journey ID, provider `updatedAt`, action, and a server-generated idempotency key. | A token accepted for a different subject, journey, or action. |
| SEC-U04-14 | The BFF verifies signature, expiry, subject, journey, and action before forwarding the embedded key. | An expired or tampered token producing a provider call. |
| SEC-U04-15 | The browser may only echo the opaque token; it never supplies the idempotency key, correlation, or actor. | A browser-supplied key being honoured, or the key appearing in a response or the DOM. |
| SEC-U04-16 | The v2 command body carries only `eventCode`, `locationId`, and `occurredAt`; container identity is read-only. | Any additional accepted field, or a container identity changed from the browser. |
| SEC-U04-17 | A definitive validation or conflict issues a replacement token; an unknown outcome retains the original and blocks retry until an authoritative re-read. | A retry proceeding from an unknown outcome without a re-read. |

## Cross-Module Navigation Safety

| ID | Requirement | Falsified by |
| --- | --- | --- |
| SEC-U04-18 | Cross-module links carry a signed origin token — never an arbitrary `returnTo`. | Any accepted cross-module return string. |
| SEC-U04-19 | The token is <= 512 characters, expires in 10 minutes, and binds session subject, source kind and record ID, canonical href, and expected target module. | A token honoured for a different subject, target, or after expiry. |
| SEC-U04-20 | A missing, invalid, or expired token falls back to the target canonical root — never to a supplied destination. | A fallback that navigates anywhere other than the canonical root. |
| SEC-U04-21 | The relationship target authorizes independently of the source. | A denied Booking or Journey rendering data because the source was authorized. |
| SEC-U04-22 | The recent list derives the actor server-side and admits only a bounded `limit`; no actor, search, filter, sort, cursor, or page key is accepted. | Any such key changing what is returned. |

## Threats This Unit Introduces

- **Assertion forgery or replay.** U04 mints a bearer-style proof of subject. Binding it to method, normalized path, correlation, expiry, and nonce (SEC-U04-07) means a captured assertion cannot be replayed against a different operation; the residual risk is key management, which is a platform concern with its own key material in the Compose topology.
- **Capture-token theft.** The attempt token authorizes one specific movement on one journey at one provider revision. Its binding (SEC-U04-13) makes a stolen token useless for any other capture, and its short life bounds the window.
- **Cross-module open redirect.** This is the exact class the origin token exists to prevent; a plain `returnTo` across a module boundary cannot be bounded by a same-module allow-list, which is why SEC-U04-18 forbids it outright.
- **Confused-deputy on location lookup.** The BFF calls Reference with a service credential for a browser request; requiring the current request's `container-movement:read` first (BR4-070) prevents exercising it for an unauthorized subject.

## Out of Scope

No threat modelling beyond this unit's surface, no new compliance regime, and no repository-wide security programme. Kafka transport security, broker authentication, and topic ACLs are platform concerns U04 does not change and does not claim. Per NFR-008 only the W4-touched security path is in scope.

## Verification

Contract tests cover assertion issuance and verification (including spoof and replay rejection), token binding and expiry, actor-field rejection, header sanitation, allow-list rejection, and origin-token validation in both directions. Live Compose checks cover denied deep links, no data flash, and direct-service inaccessibility. Per NFR-011, a detector that only prints leads is not a passing gate.
