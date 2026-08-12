# Draft message to the W2-02 owner

Short form of `W2-02-SHELL-ESCALATION.md`. Send this; link the doc for detail.

---

**Subject: W4-01 is blocked on the shared PlatformShell contract**

Hi —

W4-01 has stopped at Code Generation. We can't build U01 (the walking skeleton), and because B01 gates the rest of our plan, that blocks all four units.

The shared shell in `packages/ui` isn't the contract our approved design consumes. It currently takes `{title, children, journeyStage}`, picks the active rail by string-matching the title, and renders a hardcoded module list. What we designed against is `PlatformShellProps` with `session` (including `permissions`), `activeModule`, `breadcrumbs`, and a `routes` registry exposing `visibleRoutes(capabilities)`.

The blocking part isn't cosmetic. With a hardcoded rail, **a module can't be hidden from a user who lacks capability for it.** That's FR-012 and US-001 — the two stories U01 exists to prove — so no amount of work on our side makes U01 pass.

We're not going to work around it: a local compatibility shell is prohibited by our unit definition and NFR-009, and extending `packages/ui` ourselves would mean W4 shipping a contract W2-02 owns. Both would be worse than waiting.

**What we need**, roughly in priority order:

1. `session` carrying subject, optional display name, and the capability list
2. a route registry whose `visibleRoutes(capabilities)` filters the rail
3. `activeModule` passed in rather than inferred from the title
4. `breadcrumbs` accepted and rendered

The existing consumers (`apps/shell`, Reference, Charge, and our new `apps/container-movement`) all need to be able to adopt it.

**Timing**: we're idle on this. Everything reachable without the shell is done — 68 design artifacts through stage 3.4, all approved and independently reviewed, plus a few platform fixes we could land safely. If you can give us a rough date we'll plan around it; if the contract is likely to change shape, we'd rather know now than rebuild U01 later.

Detail, including the exact gap table and why each workaround is closed:
`aidlc/spaces/default/intents/260803-module-list-uplift/construction/code-generation/W2-02-SHELL-ESCALATION.md`
on branch `intent/W4-01-module-list-detail-uplift`.

Thanks —

---

## Two unrelated things worth passing to their owners

Found while blocked; both pre-date W4-01 and neither is ours to fix.

**Booking / shell** — `apps/booking/lib/bookings.ts:532` and `apps/shell/lib/booking-client.ts:252` read `idempotency-key` from the inbound request. We applied the edge trusted-header policy to the Reference and Charge locations only, because that policy clears the header and applying it to the Booking locations would break your mutation idempotency. Worth deciding whether the value should come from the browser at all.

**Reference Data** — `ReferenceDataWorkbench.tsx` issues root-absolute `fetch("/api/…")` calls. There's no matching Nginx location, so through the canonical edge they fall through `location /` to `apps-shell` rather than reaching Reference; they only resolve when the app is hit directly on its own port. Separately, we closed four fail-open authorization paths in `resolveReferenceDataPermissions` (commit `bb8274c`) — including one where an explicit Identity `DENY` still granted read access.
