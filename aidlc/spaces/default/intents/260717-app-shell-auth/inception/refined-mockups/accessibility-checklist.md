# Accessibility Checklist - W2-01 App Shell and Auth

## Source Context

This checklist consumes `wireframes.md`, `user-flow.md`, `stories.md`, `requirements.md`, and `team-practices.md`. It applies WCAG 2.1 AA to the authenticated shell, Booking mount, denied state, and sign-out flow.

## Global Shell

- [ ] Page declares language through the root layout.
- [ ] A skip-to-content link is the first focusable element.
- [ ] `header`, `nav`, and `main` landmarks are present on shell routes.
- [ ] Every route has one visible `h1` matching the current task.
- [ ] Route changes move focus to the page `h1` or an equivalent main heading.
- [ ] Breadcrumbs are not the only navigation path.
- [ ] Visible focus appears on every interactive control.
- [ ] Normal text meets 4.5:1 contrast; UI components meet 3:1 contrast.
- [ ] No status is conveyed by color alone.

## Protected Entry and Session

- [ ] Redirect/loading status has text, not spinner-only feedback.
- [ ] Auth errors expose a safe message and retry path without raw token details.
- [ ] Protected content does not render before session validation succeeds.
- [ ] Session expiration returns the user to sign-in without trapping focus.
- [ ] User menu is keyboard reachable and has a clear accessible name.

## Booking List and Detail

- [ ] Booking table has column headers on desktop.
- [ ] Mobile Booking cards have labelled fields and clear primary actions.
- [ ] Search, filter, create, row action, and detail action controls are keyboard reachable.
- [ ] Loading, empty, error, denied, and success states include visible text.
- [ ] Async action success/error is announced through a polite live region where dynamic.
- [ ] Error states include retry/back action and correlation id when available.
- [ ] Evidence panel labels subject, authorization result, and correlation id as text.

## Access Denied

- [ ] Denied state renders inside the shell with `h1` "Access denied".
- [ ] Denied copy states the user is signed in but lacks Booking access.
- [ ] Request-access and back/home actions are keyboard reachable.
- [ ] Focus moves to the denied heading when the state appears.
- [ ] Denied evidence avoids raw internal stack traces.

## Sign-Out

- [ ] Sign-out action is reachable from the user menu by keyboard.
- [ ] Signing-out pending state is communicated with text.
- [ ] After sign-out, focus moves to the signed-out page heading.
- [ ] Re-opening a protected shell or Booking route after sign-out redirects to sign-in.
- [ ] No stale shell controls continue to call Booking APIs after sign-out.

## Responsive and Zoom

- [ ] 320px, 375px, 768px, 1024px, and 1440px widths show no text/control overlap.
- [ ] Browser zoom at 200 percent preserves access to nav, user menu, primary Booking actions, and denied/sign-out actions.
- [ ] Mobile drawer can be opened, navigated, and closed by keyboard.
- [ ] Touch targets are at least 44px by 44px on mobile where practical.
- [ ] Long display names, booking references, and correlation ids wrap or truncate with accessible full text.

## Test Evidence

- [ ] Automated accessibility scan is captured for shell landing, Booking list, Booking detail/action, access denied, and signed out.
- [ ] Keyboard-only walkthrough is captured for US-01 through US-04.
- [ ] Screen reader smoke test confirms route headings, nav, user menu, denied state, and action feedback are announced.
- [ ] Live Compose evidence remains the acceptance authority; accessibility evidence supports but does not replace the W2-01 live proof through Nginx and Keycloak.
