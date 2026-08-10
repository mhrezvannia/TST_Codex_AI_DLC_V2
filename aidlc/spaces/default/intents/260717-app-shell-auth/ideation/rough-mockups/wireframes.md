# Wireframes - W2-01 App Shell and Auth

## Source Context

These rough wireframes consume:

- `aidlc/spaces/default/intents/260717-app-shell-auth/ideation/intent-capture/intent-statement.md`
- `aidlc/spaces/default/intents/260717-app-shell-auth/ideation/scope-definition/scope-document.md`
- `aidlc/spaces/default/intents/260717-app-shell-auth/ideation/scope-definition/intent-backlog.md`

They illustrate the W2-01 shell/auth slice only. They do not define the W2-02 design-system foundation or the W4-01 broad module migration.

## Screen 1 - Protected Entry and Login Redirect

Purpose: unauthenticated user enters the shell URL and is redirected through existing auth/Keycloak.

```
[Browser: /]
    |
    v
[Protected shell route]
    |
    +-- no session --> [Auth sign-in / Keycloak]
    |
    +-- session ok --> [Shell landing]
```

Accessibility note: page title identifies sign-in state; main landmark contains the sign-in action/status; focus moves to the first actionable sign-in control.

## Screen 2 - Authenticated Shell Landing

Purpose: give the user one application frame after login.

```
+--------------------------------------------------------------+
| LinerCore                         Search        User menu v  |
+-------------------+------------------------------------------+
| Navigation        | Breadcrumbs: Home                        |
|                   |------------------------------------------|
| > Booking         | Welcome / operational start              |
|   Reference Data  |                                          |
|   Charge          | Primary card: Booking                    |
|   Container Move  | Secondary status: modules not mounted    |
|                   |                                          |
+-------------------+------------------------------------------+
```

Accessibility note: `header`, `nav`, and `main` landmarks; `h1` is "LinerCore"; keyboard focus starts on skip link then active nav item.

## Screen 3 - Booking List Mounted in Shell

Purpose: preserve Booking list work while moving it inside the authenticated shell.

```
+--------------------------------------------------------------+
| LinerCore                                      User menu v    |
+-------------------+------------------------------------------+
| Navigation        | Breadcrumbs: Home / Booking              |
| > Booking         |------------------------------------------|
|   Reference Data  | h1 Booking                               |
|   Charge          | [New booking] [Search...] [Filters]      |
|   Container Move  |                                          |
|                   | Booking table                            |
|                   | ID | Customer | Status | Updated | ...   |
|                   | -- | -------- | ------ | ------- | ---   |
|                   | BK | ACME     | Draft  | Today   | View  |
|                   |                                          |
|                   | Session subject: shown in audit/status   |
+-------------------+------------------------------------------+
```

Accessibility note: `h1` is "Booking"; table has column headers; status is text plus visual treatment; "New booking" and row actions are keyboard reachable.

## Screen 4 - Booking Detail or Action Mounted in Shell

Purpose: prove a Booking action executes under the shell and carries the real subject.

```
+--------------------------------------------------------------+
| LinerCore                                      User menu v    |
+-------------------+------------------------------------------+
| Navigation        | Breadcrumbs: Home / Booking / BK-123     |
| > Booking         |------------------------------------------|
|                   | h1 Booking BK-123                        |
|                   | Summary: customer, status, route         |
|                   |                                          |
|                   | Actions: [Validate] [Price] [Confirm]    |
|                   |                                          |
|                   | Evidence panel                           |
|                   | - Actor subject: from session            |
|                   | - Correlation id: visible/copyable       |
|                   | - Authorization: allowed/denied          |
+-------------------+------------------------------------------+
```

Accessibility note: action buttons have accessible names; evidence panel uses a heading and text values, not color-only state; confirmation/failure messages use `aria-live`.

## Screen 5 - Access Denied Inside Shell

Purpose: user without Booking permission sees denied state without leaving the shell frame.

```
+--------------------------------------------------------------+
| LinerCore                                      User menu v    |
+-------------------+------------------------------------------+
| Navigation        | Breadcrumbs: Home / Booking              |
| > Booking         |------------------------------------------|
|                   | h1 Access denied                         |
|                   | You do not have access to Booking.       |
|                   | Request access | Back to home            |
|                   | Reference: authorization decision id     |
+-------------------+------------------------------------------+
```

Accessibility note: `h1` announces denial; next actions are links/buttons; decision reference is text; focus moves to the denied message heading.

## Screen 6 - Signed Out

Purpose: sign-out terminates session and protected routes require login again.

```
[User menu: Sign out]
        |
        v
[Auth sign-out endpoint clears session]
        |
        v
[Signed out page]
        |
        +-- Open shell again --> [Protected route redirects to sign-in]
```

Accessibility note: signed-out page has `h1` "Signed out"; primary action is "Sign in again"; route redirect does not trap keyboard focus.

## Information Architecture

- Top bar: product identity, optional search, user/session menu.
- Left nav: Booking active; other modules clearly marked not yet mounted or linked out.
- Breadcrumbs: show shell route and current Booking context.
- Main region: mounted module content.
- Evidence/status panel: only where it helps verify auth/subject/correlation behavior; avoid exposing transport internals as primary UI.

## Scope Guards

- Do not add W4-01 module migrations here.
- Do not build W2-02 primitives here.
- Do not accept a shell that only displays a user name while Booking still sends `local-user`.

## Review

Verdict: READY

Findings:

- Engineering and QA can act from these rough UX artifacts without scope ambiguity. The screens and flow are limited to W2-01 shell/auth, protected routing, session menu, denied/sign-out states, and mounted Booking list/detail/action.
- W1 live-proof waiver remains explicit in the upstream scope and user-flow guardrails; W2-01 requires its own live Compose proof and does not convert W1 into a pass.
- W2-02 and W4-01 creep is guarded: design-system foundation work and broad module migration are explicitly deferred, with non-mounted modules shown only as placeholders or links.
- Real subject propagation is testable through the visible evidence/status panel, correlation id, authorization decision, backend audit signal, and the explicit rejection of `local-user`.
- Accessibility notes exist per screen and cover headings, landmarks, keyboard reachability, focus movement, text-based states, and live-region feedback where relevant.

Required fixes: none.
