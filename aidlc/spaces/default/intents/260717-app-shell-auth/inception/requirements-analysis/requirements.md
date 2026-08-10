# Requirements - W2-01 App Shell and Auth

This document consumes reviewed upstream artifacts `intent-statement.md`, `scope-document.md`, `architecture.md`, `code-structure.md`, `api-documentation.md`, and `team-practices.md`. Transitive Context Pack sources, including `business-overview.md`, `enterprise-technical-environment.md`, `00-INTENT-BACKLOG.md`, `compose.yaml`, and the W2-01 source statement, are carried through those reviewed artifacts and are cited only where they name an external contract or evidence source.

## Functional Requirements

| ID | Priority | Requirement | Source |
| --- | --- | --- | --- |
| FR-01 | Must | The system shall provide one authenticated Next.js application shell as the browser entry for W2-01, with top bar, left navigation, breadcrumbs, user menu, protected route behavior, and sign-out controls. | `intent-statement.md`, `scope-document.md` |
| FR-02 | Must | An unauthenticated browser request to a protected shell route through Nginx shall redirect into the existing `apps/auth` sign-in/OIDC flow and return to the shell after successful Keycloak authentication. | `intent-statement.md`, `architecture.md`, `api-documentation.md` |
| FR-03 | Must | The shell shall reuse the existing auth/session/sign-out surfaces and server-side session helpers; browser JavaScript shall not receive raw access or refresh tokens. | `intent-statement.md`, `api-documentation.md`, `team-practices.md`; transitive security baseline from `enterprise-technical-environment.md` |
| FR-04 | Must | Booking list, create, detail, and preserved action surfaces shall be reachable from inside the shell as the first mounted business module, without regressing W1-01 or W2-02 merged work. | `intent-statement.md`, `scope-document.md`, `code-structure.md` |
| FR-05 | Must | Mounted Booking BFF calls shall derive `X-LinerCore-Actor-Id` from the authenticated session subject and shall not hardcode or silently default to `local-user` on protected shell paths. | `intent-statement.md`, `architecture.md`, `api-documentation.md`, `team-practices.md` |
| FR-06 | Must | Booking backend authorization shall evaluate the real subject through identity-service authorization seams for Booking actions and shall produce auditable allow/deny evidence tied to that subject. | `architecture.md`, `api-documentation.md`; transitive business rule from `business-overview.md` |
| FR-07 | Must | A signed-in user without the required Booking role shall see the existing access-denied surface inside the shell rather than receiving an unhandled error or an apparently empty module. | `intent-statement.md`, `scope-document.md` |
| FR-08 | Must | Sign-out shall clear the shell session and make protected shell and Booking routes require authentication again. | `intent-statement.md`, `api-documentation.md` |
| FR-09 | Should | Shell navigation may show non-mounted modules only as clearly disabled placeholders or external links; W2-01 shall not migrate reference-data, charge agreement, or container movement module surfaces. | `scope-document.md`; transitive backlog boundary from `00-INTENT-BACKLOG.md` |
| FR-10 | Should | Browser edge, shell/BFF, Booking backend, and identity-service requests shall propagate correlation id and W3C Trace Context where the existing stack supports it. | `intent-statement.md`, `architecture.md`, `team-practices.md`; transitive W3C mandate from `enterprise-technical-environment.md` |
| FR-11 | Must | Local-development auth bypass, if retained for developer productivity, shall be explicit, logged, profile-limited, and unavailable on production-like protected paths. | `intent-statement.md`, `team-practices.md`, `api-documentation.md` |
| FR-12 | Must | W2-01 shall supply deterministic local live-proof identities before acceptance: an allow-path user `local.booking.user` with `booking-desk` access and a deny-path user `local.reference.admin` without Booking access. If existing seeds do not contain `local.booking.user`, W2-01 shall extend the local seed pack or live-proof fixture explicitly. | `team-practices.md`, `code-structure.md`, `api-documentation.md`; existing seed evidence in `infrastructure/seeds/shared-platform-mvp-defaults.json` |

## Data & Standards Alignment

| Concept | Canonical field/header | Standard or contract | Requirement |
| --- | --- | --- | --- |
| Authenticated subject | `subject`, `sub`, `X-LinerCore-Actor-Id` | OIDC subject via Keycloak 24 and internal LinerCore actor header contract | The subject carried to Booking must be the signed-in user subject, not `local-user`. |
| Session | HttpOnly session cookie | Browser BFF security baseline | Tokens remain server-side; shell reads session summary through server/BFF routes. |
| Authorization decision | subject, resource, action, decision, reason | identity-service authorization API contract | Booking actions use identity-service decisions and record deny/allow audit evidence. |
| Correlation context | `X-Correlation-Id`, `traceparent`, `tracestate` | W3C Trace Context plus project correlation contract | Requests remain traceable from Nginx/browser edge through Booking and identity-service. |
| Booking business data | booking reference, shipment party, routing, equipment, status | Existing W1 Booking/DCSA-aligned contracts | W2-01 mounts and preserves Booking surfaces; it does not redefine Booking domain fields. |

## Cross-Module Contracts

1. Auth app to shell: the shell shall use the existing `apps/auth` routes for sign-in, callback, session, request-access, access-denied, and sign-out behavior rather than adding a parallel authentication mechanism.
2. Nginx to shell/auth apps: live proof shall enter through the Nginx edge in `compose.yaml`; direct app-port-only testing is supporting evidence, not acceptance evidence.
3. Shell to Booking BFF: every protected Booking call shall include the session-derived actor subject and correlation context.
4. Booking BFF to Booking service: the `serviceHeaders` seam shall stop using static `local-user` on mounted protected paths.
5. Booking service to identity-service: Booking action authorization shall use `/internal/identity/authorize` or the existing application-service seam with the real subject.
6. Booking service audit/evidence: audit rows, logs, or evidence artifacts shall show the authenticated subject for at least one Booking action, including create plus confirm when preserved W1 behavior makes confirm available.
7. W1 live-proof waiver: W2-01 documentation may reference W1-01 outputs as merged functionality, but shall retain the W1 manifest status as BLOCKED at Compose start due the Elastic image pull issue and shall not rewrite it as PASS.
8. Local seed fixtures: `local.booking.user` shall be present for the allow path with Booking access, and `local.reference.admin` shall remain available for a deny path that lacks Booking access.

## Non-Functional Requirements

| ID | Category | Requirement |
| --- | --- | --- |
| NFR-01 | Security | Raw OAuth/OIDC tokens shall not be stored in browser local storage, session storage, or exposed client-side state. |
| NFR-02 | Security | Protected shell and Booking routes shall fail closed when session identity or role authorization is absent. |
| NFR-03 | Security | `local-user` may remain only in explicit local/test bypass code paths, with detector coverage proving mounted shell/Booking paths do not depend on it. |
| NFR-04 | Observability | W2-01 evidence shall include correlation information sufficient to trace the live login-to-Booking action path. |
| NFR-05 | Reliability | Sign-out and expired-session handling shall not leave stale shell chrome that can call Booking APIs. |
| NFR-06 | Compatibility | The implementation shall preserve existing W0-01 platform/eventing, W0-02 reference-data, W1-01 Booking, and W2-02 design-system work from `integ/main-reconciled` at `5dd6481`. |
| NFR-07 | Maintainability | Frontend implementation shall stay within existing Next.js/React/TypeScript workspace patterns; it shall not introduce Redux Toolkit, SWR, CSS Modules, styled-components, Emotion, jQuery, or Moment.js. |
| NFR-08 | Runtime | Acceptance shall run on the local/on-prem Docker Compose topology with Nginx, Keycloak, identity-service, Booking service, and shell/auth app; cloud or AWS deployment is not required for this intent. |
| NFR-09 | UX | Shell navigation, breadcrumbs, user menu, access-denied, and sign-out states shall be usable at common desktop and mobile widths without text overlap or broken controls. |
| NFR-10 | Preservation | W2-01 shall demonstrate prior-work preservation through scoped diff review and targeted runtime/build checks, not by modifying or revalidating the full prior intents as if they were part of this slice. |

## Acceptance Criteria (live behavior)

1. Given no active session, when a user opens the protected shell URL through Nginx, then the user is redirected to Keycloak/auth and returns to the shell after login.
2. Given an authenticated session with Booking access, when the user selects Booking in the shell, then the Booking list/detail/create surfaces render inside the shell route structure.
3. Given an authenticated Booking user, when the user performs a Booking create action and confirm if available, then the Booking backend receives a subject that is not `local-user` and the evidence identifies the real subject.
4. Given an authenticated user without the Booking role, when the user navigates to Booking, then the shell renders access-denied behavior and the backend records or exposes a deny decision.
5. Given an authenticated session, when the user signs out, then subsequent protected shell and Booking routes require login again.
6. Given the W2-01 branch under live Compose, when `erp-fidelity-audit` detector 6d runs, then mounted shell/Booking surfaces report zero hardcoded-auth hits.
7. Given the W2-01 evidence package, when `aidlc-audit` runs, then this intent's state, audit trail, and required artifacts are green.
8. Given the W1-01 evidence files, when W2-01 acceptance is reviewed, then the W1 waiver remains explicit as BLOCKED at `compose-start` and is not presented as a live PASS.
9. Given the local seed fixtures, when live proof starts, then `local.booking.user` can authenticate and exercise the Booking allow path, while `local.reference.admin` authenticates but receives the Booking denied path.
10. Given the final W2-01 diff, when preservation evidence is reviewed, then W0-01 platform/eventing files, W0-02 reference-data seed/completeness files, and W2-02 design-system foundation files are either unchanged or only consumed through stable public interfaces; any touched prior-work file must have a W2-01-specific reason and targeted verification.
11. Given preserved W1 Booking behavior, when Booking create/detail/action checks run from inside the shell, then existing list/detail/create semantics still work and only the actor/session propagation changes for W2-01.

## Assumptions & Constraints

- The active branch is `intent/W2-01-app-shell-and-auth` from `integ/main-reconciled` at `5dd6481`.
- The workflow scope is engine-recorded as enterprise, and the resolved delivery boundary is W2-01 only. This is closed for requirements and is not a Construction blocker.
- Existing `apps/auth` is reused; no parallel authentication service or client-token storage is introduced.
- Existing Booking list/detail/create/action behavior from W1/W2 merged work is preserved unless a change is necessary to carry the real subject through the shell.
- Reference-data, charge agreement, and container movement shell migration are deferred to W4-01.
- W2-02 owns broad design-system foundation; W2-01 may consume existing primitives but shall not take ownership of that foundation.
- Docker image availability may affect live proof. Any live runtime blockage shall be recorded honestly as a W2-01 blocker, not hidden by test-only evidence.
- The W2-01 live evidence package location is `artifacts/w2-01-live/app-shell-auth/` unless a later delivery-planning artifact chooses a more specific subfolder.

## Open Questions

1. Non-blocking implementation detail: should `local.booking.user` be added to `infrastructure/seeds/shared-platform-mvp-defaults.json`, a W2-01-specific seed overlay, or a live-proof fixture under `artifacts/w2-01-live/app-shell-auth/`?
2. Non-blocking evidence detail: should the final proof capture identity-service audit rows directly, service logs, or both?

## Review

Verdict: NOT-READY

Findings:

1. Scope is reopened after it was already source-resolved. `requirements-analysis-questions.md` says no additional user input is required and chooses enterprise-depth artifacts constrained to W2-01, and `scope-document.md` makes the same scope decision. Open Question 1 reintroduces ambiguity before Construction. Required change: close this question in `requirements.md` with the already-recorded decision, or explicitly mark it non-blocking.
2. The allow/deny live proof is not yet acceptance-ready. FR-07 and Acceptance Criteria 2-4 require role-based allow and denied paths, but Open Question 2 leaves the seeded Keycloak users and role assignments undefined. QA cannot execute or automate the live Compose proof without deterministic identities. Required change: define the required seed users/roles, or add a must-level requirement that W2-01 supplies deterministic live-proof fixtures before acceptance.
3. Traceability is mixed between reviewed artifacts and unreviewed/transitive sources. The source table cites `business-overview.md`, `enterprise-technical-environment.md`, and `00-INTENT-BACKLOG.md`, while this review packet only included the intent, scope, questions, practices, and codekb artifacts. Required change: either trace each requirement to the reviewed artifacts that carry those decisions, or label external references as transitive Context Pack sources.
4. Prior-work preservation is stated but not testable enough. NFR-06 names W0-01, W0-02, W1-01, and W2-02 preservation, but the acceptance criteria only explicitly protect Booking/W1 behavior and the W1 live-proof waiver. Required change: add an acceptance/evidence requirement that identifies how W0-01 platform/eventing, W0-02 reference-data, and W2-02 design-system preservation will be verified without expanding W2-01 scope.

Ready aspects:

- The W1 live-proof waiver handling is explicit and correctly preserved as BLOCKED at Compose start rather than rewritten as PASS.
- The core W2-01 business path is aligned with the upstream vertical slice: authenticated shell entry, Booking mount, real subject propagation, denied path, sign-out, detector 6d, and `aidlc-audit`.

## Review - Iteration 2

Verdict: READY

Findings:

1. Scope blocker is addressed. The scope question is no longer reopened; the requirements now state that enterprise is the recorded lifecycle scope while W2-01 remains the closed delivery boundary.
2. Deterministic live-proof identities are addressed. FR-12, Cross-Module Contract 8, and Acceptance Criterion 9 now require `local.booking.user` with Booking access and `local.reference.admin` without Booking access, including an explicit obligation to extend local seeds or fixtures if the allow-path user is missing.
3. Traceability blocker is addressed. The opening source note and source column now distinguish reviewed upstream artifacts from transitive Context Pack references used only for external contracts or evidence.
4. Prior-work preservation blocker is addressed. NFR-06, NFR-10, Acceptance Criterion 10, and Acceptance Criterion 11 make preservation testable through scoped diff review plus targeted runtime/build checks without expanding W2-01 into prior intent revalidation.

Required changes: none before the next stage.

Watch item: delivery planning should choose the exact location for the `local.booking.user` fixture and the concrete audit/log capture method, but both are correctly framed as non-blocking implementation and evidence details.
