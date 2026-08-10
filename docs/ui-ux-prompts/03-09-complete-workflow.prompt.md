$ui-ux-pro-max

Act as a principal enterprise UX designer, identity-governance specialist, and
design-system architect with deep experience in secure authentication handoffs,
access-request workflows, long-session operational software, and ocean-carrier
ERP systems.

This is a combined AI-DLC inception design task for the complete LinerCore Auth
and Shell workflow represented by prompts 03 through 09. Design the seven routes
as one coherent journey and one state model. Do not edit production code,
configuration, tests, or design-system files in this turn.

## Product and users

LinerCore is an enterprise ERP for an ocean shipping company. It supports
booking agents, customer-service operators, pricing analysts, pricing
approvers, reference-data stewards, equipment controllers, operations
supervisors, auditors, and platform administrators.

Users work in LinerCore for long periods. They scan dense operational data,
resolve exceptions, compare versions, approve controlled changes, and need
important decisions to be secure and traceable. Authentication pages must feel
calm and trustworthy. The authenticated shell must feel compact, stable, and
task-focused.

Users must see only the modules, records, navigation items, and actions they are
authorized to access. Do not show inaccessible modules as promotional,
disabled, locked, or teaser navigation. A user may see an access-denied state
only after following a valid deep link, attempting an action whose permission
changed, or crossing a protected boundary that requires an explicit policy
decision.

## Approved upstream context

Treat the reviewed outcomes of these earlier prompts as the design baseline:

- `00-shared-design-system.md`
- `01-keycloak-login.md`
- `02-auth-gateway.md`

Inspect their approved artifacts if they exist. Inspect the existing `@erp/ui`
package, Auth and Shell Next.js layouts, Keycloak integration, session helpers,
safe-return logic, authorization boundaries, route handlers, query contracts,
automated tests, and the running demo before proposing changes.

Inspect these live routes and their actual behavior:

- `http://127.0.0.1/auth/sign-in`
- `http://127.0.0.1/`
- `http://127.0.0.1/auth/session`
- `http://127.0.0.1/auth/access-denied`
- `http://127.0.0.1/auth/request-access`
- `http://127.0.0.1/auth/signed-out`
- `http://127.0.0.1/signed-out`

Also inspect `http://127.0.0.1/auth/`, the current Keycloak login, protected
deep-link behavior, sign-out behavior, the global user menu, and all routes to
which this workflow may safely return a user.

Do not assume a route, API, role, claim, request-tracking page, password-recovery
capability, help destination, or approval feature exists. Confirm it from the
repository or running system. Clearly distinguish:

- Existing behavior that must be preserved.
- Existing behavior that should be redesigned.
- Recommended behavior that requires backend or identity-platform support.
- Future behavior that must not appear in the current UI.

## Shared design direction

The seven routes must feel like one LinerCore product:

- Optimize for scanning, repeated action, low error rates, and clear recovery.
- Use white and cool-neutral surfaces with near-black body text.
- Use restrained maritime blue for navigation, links, focus, and information.
- Use teal or green for success, amber for warnings, and red only for errors or
  destructive actions.
- Do not make the whole interface blue.
- Use Source Sans 3 or the existing Inter stack for body text. Lexend may be
  used sparingly for headings if it is already approved.
- Use tabular numerals for timestamps, expiry values, identifiers, counts, and
  operational measures.
- Use 4-8px radii, subtle borders, minimal shadows, and stable hover states.
- Use Lucide icons only. Do not use emoji or hand-drawn SVG icons.
- Status indicators must combine text, shape, and color.
- Keep primary actions visually unambiguous and secondary actions quiet.
- Put safe technical diagnostics in a collapsed support disclosure or drawer.
- Never expose secrets, raw tokens, cookies, stack traces, policy internals,
  client identifiers, callback URLs, or unsafe return URLs.
- Preserve stable dimensions for headers, navigation, buttons, form controls,
  status areas, and content panels.

Do not use gradients, glassmorphism, decorative blobs, giant hero sections,
stock imagery, illustration-first layouts, marketing copy, floating page
sections, nested cards, oversized avatars, oversized success graphics, or walls
of KPI cards.

The authenticated shell may use persistent product navigation. Authentication,
denial, request-access, and signed-out routes must use the minimum chrome needed
for orientation and safe recovery. They must never reveal protected module
navigation or stale business data to a signed-out user.

## Terminology and content governance

Validate ocean-shipping terminology against the current DCSA standards and
Information Model wherever DCSA defines the concept. Use the current business
term only when it is more precise for an internal ERP or when DCSA does not
define the concept.

Create a terminology table containing:

- Proposed UI label.
- Relevant DCSA term, when one exists.
- Existing LinerCore domain or route name.
- Recommended final label.
- Reason for any intentional difference.

Do not rename routes, APIs, database concepts, or domain entities merely to
change their display label. Flag naming changes that require domain-owner
approval. In particular, validate labels related to bookings, equipment,
shipments, transport events, container journeys, service contracts, rates,
reference data, parties, locations, and operational statuses.

Use plain business language for authentication and authorization. Never ask a
user to interpret OIDC, PKCE, BFF, realm, claim, scope token, or callback
terminology.

## One cross-page workflow

Design and document the complete stateful journey:

1. A protected deep link or Auth Gateway determines the safe business
   destination.
2. The sign-in handoff explains the transition without requiring a technical
   choice.
3. Keycloak authenticates the user.
4. LinerCore validates the session and returns the user only to an allowlisted
   destination.
5. The Shell shows only authorized navigation, assignments, and actions.
6. The user can inspect safe account and session information from the user menu.
7. A denied action explains the protected resource and available recovery.
8. A supported access request preserves immutable denial context and creates an
   auditable request without promising approval.
9. Explicit sign-out, expiry, or invalid-session handling clears protected UI
   and provides one canonical path back to sign in.

Define one canonical source of truth for:

- Authentication state.
- Session expiry and expiring-soon thresholds.
- Authorization and business-scope decisions.
- Safe return destinations.
- Denial context.
- Access-request status.
- Explicit sign-out versus session expiry.
- Identity-service and request-service availability.

Show how each route enters and exits this state model. Identify redirect-loop,
duplicate-submission, stale-session, multi-tab, back-button, and replay risks.
Recommend deterministic behavior for each.

## Page 03: Sign-in handoff

Route: `http://127.0.0.1/auth/sign-in`

Redesign this route as a brief, trustworthy transition between LinerCore and the
configured company identity provider.

The normal path should require no technical decision. Explain in one or two
sentences that the user will continue to the company identity service and
return to the requested LinerCore workspace.

Required content and behavior:

- LinerCore identity and compact environment indicator.
- Safe destination in business language, such as `Return to Bookings`.
- Primary `Continue to sign in` action.
- Secondary `Cancel` action with a deterministic safe destination.
- Duplicate submission prevention.
- Visible redirect progress with an accessible announcement.
- Neutralization of unsafe, missing, expired, or malformed destinations.

Do not expose a raw return URL, provider configuration, client identifier,
callback path, protocol details, cookie state, or BFF implementation.

Design these states:

- Default.
- Redirect in progress.
- Invalid or unsafe destination.
- Expired transaction.
- Identity provider unavailable.
- User cancelled.
- Redirect failed.

## Page 04: ERP Shell overview

Route: `http://127.0.0.1/`

Redesign the authenticated root as a role-aware operational overview, not a
technical walking skeleton or decorative dashboard.

The shared shell must contain:

- Skip link.
- Persistent left module navigation at suitable desktop widths.
- Lucide icon and text label for every visible module.
- Compact top bar with LinerCore, environment, global search when functional,
  notifications when functional, help when a real destination exists, and the
  user menu.
- Breadcrumbs and clear active-page indication.
- Responsive navigation appropriate to 390, 768, 1024, and 1440px.

Only show authorized modules. Candidate modules, subject to actual availability
and authorization, are Home, Booking, Service Contracts and Rates, Reference
Data, Equipment Journeys, and Administration. Confirm final display labels
against existing routes, LinerCore domain language, and DCSA terminology.

Replace technical status cards with a role-aware operational overview:

- `My work` with actionable records.
- Bookings requiring validation or manual pricing.
- Pricing approvals or rate conflicts.
- Reference-data publication failures.
- Pending or exceptional equipment or movement events.
- Recently viewed records.
- Compact authorized-module shortcuts.

Use coherent Phase 1 demo data as the design reference:

- 6 active bookings.
- 1 manual-pricing exception.
- 3 approved rate versions.
- 1 approved customer agreement or service contract, using the validated term.
- 2 equipment journeys.
- 1 pending movement event.

Every count must link to a real corresponding filtered queue when that route and
filter contract exist. Otherwise, mark the behavior as a dependency rather than
inventing a link.

Move correlation identifiers and service diagnostics into a collapsed support
drawer. Show a restrained degradation banner only when action is needed.

Design these states:

- Full authorized overview.
- First login.
- No assignments.
- Partial permissions.
- Loading.
- Partial service degradation.
- Stale data.
- Notification or search feature unavailable.

## Page 05: Current session

Route: `http://127.0.0.1/auth/session`

Redesign this route as an enterprise account and session view, not a developer
payload viewer.

Show only safe, useful information:

- Display name and username.
- Subject identifier as a secondary technical value.
- Assigned roles.
- Business or organizational scope.
- Granted modules and important capabilities.
- Last authentication time.
- Session expiry.
- Expiring-soon warning.
- Primary `Return to workspace` action.
- Clearly separated `Sign out` action.

If safe session JSON is genuinely useful in the local demo, place it in an
admin-only `Technical details` disclosure with a copy button and privacy
warning. Never show secrets or raw tokens.

Define the user-menu relationship to this route, including menu labels, focus
return, expiry changes while the menu is open, and behavior across multiple
tabs.

Design these states:

- Normal.
- Expiring soon.
- Expired.
- Reduced or recently changed permission.
- Identity service unavailable.
- Signing out.
- Sign-out failed.
- Copy succeeded or failed.

Recommend whether sign out needs confirmation based on actual business risk.
Avoid confirmation when it adds no meaningful protection.

## Page 06: Auth access denied

Route: `http://127.0.0.1/auth/access-denied`

Redesign this route as a calm, specific authorization decision with clear
recovery. A denial must preserve trust and must never imply that repeated retry
can bypass policy.

State in business language:

- Which action was blocked.
- Which module, record, or resource was protected.
- Why the user may not currently perform it.
- What the user can do next.

Use `Request access` as the primary action only when the capability is
supported. Provide `Go back` and `Return to workspace` as appropriate secondary
actions. If a request is already open, show its current status and prevent a
duplicate.

Place reason code, correlation identifier, timestamp, and copy affordance in a
collapsed `Technical details` section. Never expose policy internals, sensitive
claims, stack traces, or tokens.

Design these states:

- Missing permission.
- Business-scope mismatch.
- Permission changed while the page was open.
- Expired session.
- Feature unavailable.
- Request already open.
- Access-request service unavailable.
- Missing, malformed, or unsafe denial context.

## Page 07: Request access

Route: `http://127.0.0.1/auth/request-access`

Redesign this route as an auditable, policy-governed access-request workflow.

Show:

- Requested module or protected resource.
- Requested action or capability.
- Current user.
- Business or organizational scope.
- Approver or responsible team when known.
- Required business justification.
- Requested duration only when supported.
- Concise policy acknowledgment.

Prepopulate and visually protect immutable context received from the denial
event. Make business justification required and provide useful length guidance.
Use `Submit request` as the primary action and `Cancel` as the secondary action.
Never promise approval.

After successful submission, show:

- Request identifier.
- Submission time.
- Current status.
- Expected next step.
- `Return to workspace`.
- `View request` only if a real request-tracking route exists.

Design these states:

- Default.
- Client and server validation.
- Linked error summary.
- Submitting.
- Duplicate request.
- Success.
- Policy rejection.
- Expired or replayed denial context.
- Approver unavailable.
- Request service unavailable.
- Unsaved changes.

Define idempotency, duplicate-submit prevention, cancellation, back-button, and
safe retry behavior.

## Page 08: Auth signed out

Route: `http://127.0.0.1/auth/signed-out`

Redesign this route as a clear, compact confirmation that the LinerCore
application session was removed.

Show:

- LinerCore identity.
- Heading `You are signed out`, unless evidence supports a clearer variant.
- One concise sentence confirming that the application session was cleared.
- Primary `Sign in again` action.
- Secondary close or approved public destination only if one exists.
- A warning only when the identity-provider SSO session may still be active.

Do not show protected navigation, business records, stale user details, session
payloads, or technical diagnostics in primary content.

Design these states:

- Successful sign-out.
- Identity-provider sign-out incomplete.
- Sign-out failed.
- Already signed out.
- Automatic redirect when justified.
- Authentication service unavailable.

Define when retry is safe and how redirect loops are prevented.

## Page 09: Shell signed out

Route: `http://127.0.0.1/signed-out`

Redesign this protected-Shell boundary so it is visually and behaviorally
consistent with `/auth/signed-out` while preserving the distinction between
explicit sign-out, expiry, and invalid sessions.

Show:

- LinerCore identity.
- Clear statement that the workspace session ended.
- Primary `Sign in again` action through the canonical Auth flow.
- Safe business destination context when a session expired while opening a
  protected deep link.
- Secondary sign-in help only if a real help destination exists.

Do not render authenticated Shell navigation, stale business data, session
details, raw return URLs, or a visual identity that conflicts with the Auth
signed-out page.

Design these states:

- Explicit sign-out.
- Expired session.
- Invalid session.
- Protected deep-link return.
- Unsafe or malformed return destination.
- Authentication service unavailable.

Specify whether `/signed-out` should remain a distinct route, delegate to
`/auth/signed-out`, or share a framework-neutral presentation primitive. Base
the recommendation on route ownership, security boundaries, resilience, and
the current architecture.

## Responsive and interaction requirements

Define exact behavior at 390, 768, 1024, and 1440px:

- No horizontal page overflow.
- No hidden critical status or primary action.
- No text truncation that changes the meaning of a denial, request, expiry, or
  destination.
- Mobile software keyboards must not obscure required fields or submission
  status.
- Auth state pages must remain compact on tall and short viewports.
- The Shell overview must reorganize without turning every section into a
  decorative card.
- Navigation opening and closing must preserve focus and prevent background
  interaction where appropriate.
- Long user names, role names, resource labels, identifiers, and localized
  content must wrap safely.

Use stable loading placeholders and avoid layout shift. Do not use viewport
width to scale font size.

## Accessibility and security requirements

Meet WCAG 2.2 AA:

- At least 4.5:1 contrast for normal text.
- Visible focus that is not obscured.
- Complete keyboard navigation and logical focus order.
- Skip link on authenticated Shell pages.
- Semantic landmarks and headings.
- Persistent labels for form controls.
- Linked error summary plus field-level errors.
- Accessible names and tooltips for unfamiliar icon buttons.
- `aria-live` announcements for redirects, validation, copying, submissions,
  expiry changes, sign-out, and service failures.
- Reduced-motion behavior.
- Touch targets appropriate for mobile.
- Status conveyed by text and structure, not color alone.

Define focus placement and restoration after every redirect, denial, dialog,
drawer, menu, validation failure, successful submission, and sign-out outcome.

Security and privacy behavior must include:

- Allowlisted same-origin return destinations.
- Neutralization of unsafe or malformed destinations.
- No open redirects.
- No raw token, cookie, secret, callback, client ID, or sensitive-claim display.
- No protected data after expiry or sign-out.
- Idempotent sign-in, request-access, and sign-out actions.
- Safe behavior for browser back, refresh, duplicate tabs, and stale pages.
- No suggestion that authorization can be bypassed through repeated attempts.

## Technical constraints for future implementation

The implementation stack is Next.js App Router with shared `@erp/ui`.

The design must:

- Preserve existing routes, API contracts, authorization boundaries, domain
  behavior, and automated-test IDs unless a change is explicitly justified.
- Prefer Server Components for initial data.
- Use minimal, focused client islands for redirect progress, menus, form state,
  copy feedback, and async announcements.
- Reuse or extend `@erp/ui` according to the approved shared design system.
- Avoid coupling the Keycloak theme or server-side identity code to React.
- Avoid duplicating safe-return, session-state, or authorization logic in page
  components.
- Identify shared components separately from route-specific compositions.

Do not write implementation code in this turn.

## Required output

Produce one reviewable design package with these sections:

1. **Current-state audit**
   - Route-by-route findings from the running demo and repository.
   - Security, usability, consistency, accessibility, and responsive issues.
   - Existing contracts and test behaviors that must be preserved.

2. **Users, roles, and authorization visibility**
   - Role/task assumptions.
   - Role-aware module and action visibility matrix.
   - Business-scope considerations.
   - Explicit confirmation that inaccessible navigation is omitted.

3. **DCSA terminology review**
   - The terminology table requested above.
   - Recommended display labels and unresolved domain-owner decisions.

4. **End-to-end journey**
   - A journey map from protected deep link through authentication, Shell use,
     denial, access request, session inspection, expiry, and sign-out.
   - A state-transition diagram with a text fallback.
   - Entry, exit, cancellation, retry, and recovery behavior for every route.

5. **Information architecture**
   - Global Shell navigation.
   - Auth-only navigation boundaries.
   - User-menu structure.
   - Breadcrumb and destination-label rules.

6. **Wireframes**
   - Labeled low-fidelity desktop and mobile wireframes for all seven routes.
   - Include the principal state and the most structurally different failure
     state for each route.
   - Do not collapse multiple routes into one generic wireframe.

7. **High-fidelity specification**
   - Exact approved token usage.
   - Layout dimensions, spacing, typography, borders, focus, elevation, status,
     and motion behavior.
   - Shared visual rules followed by explicit page-specific exceptions.

8. **Content design**
   - Final headings, body copy, labels, help text, warnings, errors, empty
     states, success messages, and action labels for every route and state.
   - Business-language destination examples.
   - No placeholder prose such as `Lorem ipsum`.

9. **Interaction and state matrix**
   - Loading, redirecting, submitting, success, validation, expiry, denial,
     stale data, partial permissions, unavailable services, unsafe context,
     duplicate action, cancellation, and retry behavior.
   - Focus movement and accessible announcement for every async transition.

10. **Component architecture**
    - Shared `@erp/ui` components.
    - Auth composition components.
    - Shell composition components.
    - Route-specific components.
    - Server/client boundary recommendation.
    - Components that should not be shared because their semantics differ.

11. **Responsive specification**
    - Route-by-route behavior at 390, 768, 1024, and 1440px.
    - Navigation, form, action, disclosure, table/list, and long-content rules.

12. **Accessibility acceptance criteria**
    - Keyboard path, focus order, focus restoration, semantics, announcements,
      contrast, reduced motion, zoom, reflow, autofill, and touch behavior.

13. **Playwright and visual-regression plan**
    - One complete cross-page authenticated journey.
    - Explicit sign-out journey.
    - Session-expiry deep-link journey.
    - Access-denied and request-access journey.
    - Unsafe-return and redirect-loop tests.
    - Role-aware navigation tests.
    - Service-unavailable and recovery tests.
    - Screenshots at 390, 768, 1024, and 1440px.
    - Assertions that protected data never appears after expiry or sign-out.

14. **Implementation slices**
    - Recommend the safest implementation order.
    - Separate shared foundation work from page compositions.
    - Identify backend, Keycloak, policy, or data-contract dependencies.
    - Define a review and Playwright gate after each slice.

15. **Decision register**
    - Decisions ready for approval.
    - Assumptions supported by repository evidence.
    - Open questions that truly require product, security, or domain input.
    - Your recommended answer for every open question.

The result must be detailed enough that implementation can proceed page by page
without redesigning the workflow during construction. Keep each route
individually identifiable while enforcing one coherent Auth and Shell
experience.

End with:

1. A concise recommended approval checklist.
2. The recommended first implementation slice.
3. A statement confirming that no production files were modified.

Do not implement or modify production files until the complete design package
has been reviewed and approved.
