# Security Requirements - U01 Platform and Reference Route Foundation

## Source Alignment

These requirements scope `requirements.md` NFR-004, FR-012, FR-016, and FR-020 to U01, restating them as falsifiable statements. Trust boundaries come from this unit's `business-logic-model.md` (the canonical read pipeline, steps 1-5) and `business-rules.md` (its authorization/trust, route/query, and safe-navigation rules). Per the answered Q4, no new compliance regime is introduced; NFR-008 bounds the gate to the W4-touched `u02-security` path.

U01 has no mutation surface, so its security scope is entirely about establishing the boundary the other three units then inherit: edge sanitation, session, current-request authorization, and safe return.

## Stack-Derived Security Constraints

`technology-stack.md` bounds what these requirements may assume about the runtime, and two of its entries bear directly on U01's boundary:

- **Next.js 15.5.21 with a canonical `basePath`.** SEC-U01-02's asset and URI preservation depends on the app's `basePath` matching the Nginx prefix exactly. A base-path or edge-rewrite mismatch does not fail loudly — it serves 404s or, worse, resolves assets from an unintended path — so this is verified live rather than assumed from configuration.
- **Nginx as the only public edge.** The eleven-header clear list and five trusted replacements in SEC-U01-01 are an Nginx-level control. `technology-stack.md` records no API gateway, WAF, or service mesh, so there is no second layer that would catch a header that slips through; the edge policy is the whole control.

Per the same file's **Evidence limitations**, Node.js, Yarn, and browser-runtime versions were not retained in the developer scan. No security property here is asserted on the basis of an unversioned component — session cookie behaviour and header handling are verified against the running stack rather than inferred from a version number.

## Edge and Session Requirements

| ID | Requirement | Falsified by |
| --- | --- | --- |
| SEC-U01-01 | The public edge clears the exact eleven-header inbound trust list and sets the five trusted replacements. | A spoofed `X-Actor-Subject`, `X-LinerCore-Service-Token`, or `X-LinerCore-Subject-Assertion` surviving to the app. |
| SEC-U01-02 | The `/reference-data` prefix, full URI, query, and assets under `/reference-data/_next/*` are preserved. | An asset 404, a double-prefixed path, or a dropped query on direct load. |
| SEC-U01-03 | The session cookie is host-wide (`Path=/`) and direct refresh re-authenticates through the same pipeline. | A refresh that serves content without re-resolving the session. |
| SEC-U01-04 | A failure scoped to one prefix does not take down another module's prefix. | A Reference outage making `/booking` or the root unavailable. |

## Authorization Requirements

| ID | Requirement | Falsified by |
| --- | --- | --- |
| SEC-U01-05 | Identity evaluates `reference-data:read` for the current request on every read, including refresh. | A second read succeeding without a new decision. |
| SEC-U01-06 | DENY and Identity outage both end the flow before any Reference provider call. | A provider spy recording a call on either path. |
| SEC-U01-07 | DENY maps to the shared denied state; Identity outage maps to retryable `unavailable`/503. | An outage rendering the denied state, or a denial offering retry. |
| SEC-U01-08 | No authorization decision is cached or carried across requests. | A revoked capability still yielding ALLOW. |
| SEC-U01-09 | No data is rendered before the decision resolves. | A DOM-timing or visual test observing Reference data prior to the denied state. |
| SEC-U01-10 | A module the subject cannot read is absent from shell navigation, and its deep link renders the shared denied state. | A visible navigation entry for an unreadable module, or a deep link leaking data. |

## Input and Navigation Safety

| ID | Requirement | Falsified by |
| --- | --- | --- |
| SEC-U01-11 | Duplicate, unknown, malformed, overlong, traversal, encoded-separator, and out-of-prefix input is rejected before provider access. | A provider spy recording a call for any of them. |
| SEC-U01-12 | `returnTo` is Reference-relative, prefix-bound, length-bounded, duplicate-free, and restricted to the Reference allow-list (`setCode,includeInactive,page,size,focus`). | Any accepted scheme, host, protocol-relative path, backslash, control character, or traversal segment. |
| SEC-U01-13 | Invalid or absent return context falls back to the canonical list — never to a supplied destination. | A fallback navigating anywhere else. |
| SEC-U01-14 | Focus restoration targets only an allow-listed row identifier that exists after render. | A supplied focus value selecting an arbitrary element. |

## Trust-Boundary Requirements

| ID | Requirement | Falsified by |
| --- | --- | --- |
| SEC-U01-15 | Browser-supplied actor, capability, service credential, and correlation authority are ignored or rejected. | Any of them changing server behaviour. |
| SEC-U01-16 | No production-like local-user identity or fallback subject exists on any path. | A request served under a substituted identity when the session is absent. |
| SEC-U01-17 | User-facing failures expose only safe actionable text plus correlation/provider reference; technical evidence stays collapsed and access-appropriate. | Raw payload, schema, or transport detail in the primary surface. |

## Threats This Unit Introduces

U01 introduces no new authentication mechanism, no mutation, and no cross-module navigation. Its added surface is the **canonical prefix mount itself**: a new public edge location is the place where trust-header sanitation, base-path handling, and cookie scope are either right or silently wrong. The mitigations are SEC-U01-01 through SEC-U01-04, and they matter disproportionately because U02, U03, and U04 all inherit this boundary rather than re-establishing it — a defect here is a defect everywhere.

The architecture tests U01 establishes are themselves a security control: prohibiting domain-app React imports, a second shell or theme, arbitrary return URLs, browser actor authority, and provider calls after DENY prevents an entire class of later regression.

## Verification

Contract and route tests cover policy evaluation, the provider-call prohibition, header sanitation, allow-list rejection, and safe-return grammar. Live Compose checks cover direct load and refresh, asset resolution, spoof rejection, denied deep links, no data flash, and target-scoped failure. Per NFR-011 a detector that only prints leads is not a passing gate; per NFR-008 only the W4-touched security path is claimed.
