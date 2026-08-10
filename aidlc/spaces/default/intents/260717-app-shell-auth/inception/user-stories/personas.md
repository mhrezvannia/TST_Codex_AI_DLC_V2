# Personas - W2-01 App Shell and Auth

## Source Context

These personas consume `requirements.md`, `business-overview.md`, `component-inventory.md`, and `team-practices.md`. They are limited to W2-01's authenticated shell plus Booking mount.

## Primary Personas

### Authenticated Booking User

- Identity: local/live proof user `local.booking.user`, a fictional local user with Booking access.
- Goal: enter LinerCore through one shell, navigate to Booking, and complete Booking work without losing session context.
- Needs: clear shell navigation, breadcrumbs, preserved Booking list/detail/create/action behavior, and confidence that backend evidence shows their real subject.
- Frustrations: separate app islands, session surprises, generic access failures, and audit evidence that says `local-user`.
- Success signals: Booking renders in shell, actions succeed, user menu reflects the session, and evidence identifies `local.booking.user`.

### Unauthorized Authenticated User

- Identity: local/live proof user `local.reference.admin`, a fictional local user with reference/admin access but no Booking access.
- Goal: understand that they are signed in but do not have Booking permission, and know how to request access or return to safe work.
- Needs: protected shell access, clear denied state inside the shell, actionable recovery, and no misleading partial Booking data.
- Frustrations: blank screens, unhandled 403/500 responses, and being redirected out of the shell without explanation.
- Success signals: Booking route shows access denied inside the shell and backend evidence records a deny decision for the real subject.

## Supporting Personas

### Platform/UI Implementer

- Goal: deliver W2-01 without rewriting auth, Booking, or the design-system foundation.
- Needs: clear seams in `apps/auth`, `apps/booking`, `packages/auth`, booking-service, and identity-service.
- Success signals: no static `local-user` on mounted paths, no new prohibited frontend state stack, and prior W0/W1/W2 work preserved.

### QA Evidence Owner

- Goal: prove the W2-01 journey on live Compose through Nginx and Keycloak.
- Needs: deterministic users, repeatable steps, detector 6d output, `aidlc-audit`, correlation evidence, and explicit W1 waiver wording.
- Success signals: live evidence package under `artifacts/w2-01-live/app-shell-auth/`, clear PASS/BLOCKED statuses, and no false W1 PASS.

## Accessibility and UX Considerations

- All personas need shell routes with stable headings, breadcrumbs, keyboard-reachable navigation, keyboard-reachable user menu actions, and text-based status/denial feedback.
- Denied and signed-out states must include concrete next actions.
- Non-mounted modules must not look complete to business users.
