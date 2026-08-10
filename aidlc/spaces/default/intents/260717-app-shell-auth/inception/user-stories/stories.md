# User Stories - W2-01 App Shell and Auth

## Source Context

These stories consume `requirements.md`, `business-overview.md`, `component-inventory.md`, and `team-practices.md`. They preserve W0-01, W0-02, W1-01, and W2-02 merged work, keep W1's live-proof waiver explicit, and constrain W2-01 to one authenticated shell plus Booking.

## Story Map

| Priority | Protected entry | Booking subject propagation | Shell states | Live proof |
| --- | --- | --- | --- | --- |
| Must | US-01 login to shell | US-02 real subject on Booking call | US-03 denied/sign-out states | US-04 mounted Booking proof |
| Deferred | Full auth redesign | Broad role-admin policy UI | Full module navigation filtering | W4-01 module migrations |

## US-01 - Protected Shell Entry

As an unauthenticated LinerCore user, I want protected shell routes to send me through the existing sign-in flow, so that I enter business work from one authenticated product shell.

Requirement trace: FR-01, FR-02, FR-03, NFR-01, NFR-02 from `requirements.md`; auth/shell components from `component-inventory.md`; live Nginx/Keycloak posture from `team-practices.md`.

Acceptance criteria:

1. Given no active session, when I open the protected shell URL through Nginx, then I am redirected through existing auth/Keycloak flow.
2. Given successful sign-in, when the callback completes, then I land in the shell with top bar, left navigation, breadcrumbs, and user menu.
3. Given the shell session is active, when the session summary is read, then raw tokens are not exposed to browser JavaScript or local/session storage.
4. Given an expired or missing session, when I open a protected shell or Booking route, then the route fails closed and requires sign-in.
5. Given keyboard navigation, when the shell loads, then focus can reach the main shell navigation and user menu.

INVEST notes: independently proves the walking-skeleton entry risk; implementation details remain negotiable; live redirect behavior is directly testable.

## US-02 - Session Subject Reaches Booking

As an authenticated Booking user, I want Booking requests from the shell to carry my real subject, so that backend authorization and audit evidence represent the person doing the work.

Requirement trace: FR-05, FR-06, FR-10, FR-12, NFR-03, NFR-04 from `requirements.md`; `apps/booking`, booking-service, and identity-service seams from `component-inventory.md`; identity integrity value from `business-overview.md`; no-`local-user` risk from `team-practices.md`.

Acceptance criteria:

1. Given `local.booking.user` is signed in with Booking access, when a mounted Booking BFF request is sent, then `X-LinerCore-Actor-Id` is derived from the session subject and is not `local-user`.
2. Given the Booking service receives the request, when it authorizes the action, then identity-service evaluates the real subject.
3. Given the action completes, when evidence is inspected, then audit/log output includes `local.booking.user` or the corresponding Keycloak subject and correlation context.
4. Given no valid subject is available on a protected path, when Booking BFF attempts a request, then it fails closed rather than silently retrying with `local-user`.
5. Given existing local/test bypass code remains, when detector 6d scans mounted shell/Booking paths, then it reports zero hardcoded-auth hits for those paths.

INVEST notes: small enough to prove on one Booking call; high value because it closes the core identity-integrity gap; directly testable through backend evidence.

## US-03 - Shell Navigation, Denied Path, and Sign-Out

As a signed-in LinerCore user, I want shell navigation, denied access, and sign-out to behave consistently, so that I always understand my session state and available actions.

Requirement trace: FR-07, FR-08, FR-09, NFR-05, NFR-09 from `requirements.md`; auth and Booking UI surfaces from `component-inventory.md`; accessibility and live proof posture from `team-practices.md`.

Acceptance criteria:

1. Given I am signed in with Booking access, when I select Booking from shell navigation, then breadcrumbs and active navigation identify the Booking location.
2. Given I am signed in as `local.reference.admin` without Booking access, when I navigate to Booking, then access denied renders inside the shell with request-access or safe-return actions.
3. Given the deny path renders, when evidence is inspected, then backend or BFF evidence records a deny decision for the real subject.
4. Given I open the user menu, when I sign out, then the session cookie is cleared and protected routes require login again.
5. Given a common mobile or desktop viewport, when shell navigation, breadcrumbs, denied state, and sign-out controls render, then text and controls do not overlap and remain keyboard reachable.

INVEST notes: valuable as visible UX and security behavior; independent from Booking domain changes; testable through route state, evidence, and accessibility checks.

## US-04 - Mounted Booking Proof Without Prior-Work Regression

As a QA evidence owner, I want Booking list/detail/create/action behavior to run inside the shell on live Compose, so that W2-01 can prove the vertical slice without rewriting prior merged work.

Requirement trace: FR-04, FR-11, NFR-06, NFR-08, NFR-10 and Acceptance Criteria 6-11 from `requirements.md`; business boundary from `business-overview.md`; Booking/auth/service inventory from `component-inventory.md`; live Compose exit gate from `team-practices.md`.

Acceptance criteria:

1. Given live Compose is running with Nginx, Keycloak, identity-service, Booking service, and shell/auth app, when `local.booking.user` signs in, then Booking list/detail/create surfaces render inside the shell.
2. Given preserved W1 Booking actions are available, when create plus confirm if available is performed inside the shell, then existing Booking behavior still works and only actor/session propagation changes for W2-01.
3. Given the final W2-01 diff, when preservation is reviewed, then W0-01 platform/eventing, W0-02 reference-data, W1-01 Booking, and W2-02 design-system foundation files are unchanged or touched only with W2-01-specific justification and targeted verification.
4. Given the live proof package, when reviewers inspect it, then W1-01 remains recorded as a live-proof waiver/BLOCKED at `compose-start`, not a real PASS.
5. Given acceptance tooling runs, when `erp-fidelity-audit` detector 6d and `aidlc-audit` complete, then both are green for W2-01 or any live runtime blocker is recorded honestly as a blocker.

INVEST notes: evidence-owner story is valuable because it protects the program backlog merge discipline; it is testable through live artifacts and diff review without expanding W2-01 scope.

## Traceability Matrix

| Requirement area | Stories |
| --- | --- |
| Protected shell and auth reuse | US-01, US-03 |
| Booking mounted in shell | US-02, US-04 |
| Real subject and authorization | US-02, US-03 |
| Denied path and sign-out | US-03 |
| Live Compose and audit proof | US-02, US-04 |
| Prior-work preservation and W1 waiver | US-04 |

## Definition of Ready

- Each story follows the standard "As a, I want, so that" format.
- Each story has 5 Given/When/Then acceptance criteria with live observable behavior.
- Dependencies are explicit and bounded to W2-01.
- UX acceptance covers navigation, focus, denied state, sign-out, and responsive integrity.
- No story introduces broad ERP shell migration, full role-admin UX, Redux Toolkit, SWR, or design-system foundation ownership.

## Review

Verdict: READY

Findings:

1. Story value and INVEST quality are sufficient for Construction. The set is split by vertical user/evidence outcomes rather than technical layers: protected entry, real Booking subject propagation, denied/sign-out shell states, and mounted Booking proof. Each story has a clear beneficiary and a bounded W2-01 outcome.
2. Acceptance criteria are testable. The stories use observable Given/When/Then checks for Nginx/Keycloak redirect, shell landing, token non-exposure, fail-closed behavior, session-derived actor headers, identity-service authorization, deny evidence, sign-out, responsive integrity, detector 6d, and `aidlc-audit`.
3. Traceability to approved requirements is adequate. The story traces cover the must-level requirements for shell/auth reuse, Booking mount, real subject authorization, deterministic proof users, live Compose evidence, and prior-work preservation.
4. Prior merged work and W1 live-proof waiver are protected. US-04 explicitly preserves W0-01, W0-02, W1-01, and W2-02, requires W2-01-specific justification for any touched prior-work files, and keeps the W1-01 live-proof status recorded as waiver/BLOCKED at `compose-start`, not a PASS.
5. The stories avoid umbrella redesign. Broad auth redesign, full role-admin policy UI, full module navigation filtering, W4-01 module migrations, and W2-02 design-system foundation ownership are deferred or excluded.

Required changes: none before the next stage.

Non-blocking watch item: when Construction defines shell navigation behavior, keep FR-09 explicit in tests if non-mounted modules appear in navigation; they should be disabled placeholders or external links, not partially migrated module surfaces.
