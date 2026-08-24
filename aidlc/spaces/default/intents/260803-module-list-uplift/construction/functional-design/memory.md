# Stage Memory - Functional Design (U03 charge-agreements-operational-uplift)

## Interpretations

- 2026-08-10T19:55:00Z — Treated the stage as Full mode for U03 only; U01 and U02 artifacts were accepted under the protocol's Artifact Re-use "Keep" decision. The stage-level gate therefore covers all three units even though only U03 was authored in this session.
- 2026-08-10T19:55:00Z — Read Q9's "narrow Charge lifecycle-dialog composition may wrap the shared Dialog" as a domain composition over the shared primitive, not a shared-component fork. The line is: Charge may add domain behaviour (consequence copy, reason capture, precondition summary) around `@erp/ui` Dialog; it may not reimplement focus trap, overlay, or dismissal semantics. Missing general primitive behaviour stays a W2-02 BLOCKED dependency.
- 2026-08-10T19:55:00Z — Interpreted "status" in the approved W4 query allow-list as a Charge-BFF-adapted value: the browser contract exposes W4 lifecycle vocabulary while the BFF explicitly maps it onto the verified provider vocabulary. The current source uses `lifecycle`; the design records that as an explicit adaptation, not a silent rename.

## Deviations

- 2026-08-10T19:55:00Z — Defined a Charge-local mutation result union rather than reusing `MutationResult<T>` from `component-methods.md` verbatim. Upstream `accepted` requires `value: T`, which cannot represent provider acceptance whose authoritative re-read failed. This mirrors the precedent already approved for U02 and changes no other domain's contract.

## Tradeoffs

- 2026-08-10T19:55:00Z — Chose per-region (per-tab) failure containment over whole-record failure for Rates/D&D/history/Reference-label dependencies. Costs more state plumbing and more test fixtures, but keeps verified Agreement truth visible during partial outages, which the U03 DoD requires.
- 2026-08-10T19:55:00Z — Chose to model the Approval Queue as two independently admitted segments rather than one screen gated on both. Costs a more complex admission matrix; avoids losing a working Agreement segment because the Rate filter is untested, and forecloses any client-side merge.

## Open questions

- 2026-08-10T19:55:00Z — W3-01 (D&D) is "ready to start", not closed, so the D&D tab is designed as an honest not-integrated/BLOCKED region. If W3-01 lands mid-Construction, confirm whether U03 absorbs the integration or a follow-up intent owns it; the design keeps the region and its contract seam in place so absorbing it is additive.
- 2026-08-10T19:55:00Z — `listApprovalCandidates` is declared in `component-methods.md` but no implementation resolves in indexed source. Confirm at Code Generation whether the Charge provider Draft/pending filters exist to contract-test, or whether both queue segments open as unavailable.

## Interpretations (U04)

- 2026-08-10T20:38:00Z — Read Q5's `captureEnabled` gate and Q8's "capture disabled when canonical location validation is unavailable" as two independent disable reasons that must be reported distinctly, not merged into one generic disabled state. The provider's `captureDisabledReason` owns the first; the Reference-port outage owns the second.
- 2026-08-10T20:38:00Z — Treated the four Kafka truths (Journey persistence, CMM outbox publication, broker delivery, Booking projection application) as four separately rendered facts with no derived aggregate status, since any roll-up would re-introduce the inference Q6 forbids.

## Deviations (U04)

- 2026-08-10T20:38:00Z — Defined a CMM-local mutation result union rather than reusing `MutationResult<T>` verbatim, for the same reason as U02 and U03: upstream `accepted` requires `value: T`, which cannot represent acceptance whose authoritative re-read failed. U04 additionally needs `duplicate` and `out-of-sequence` as distinct branches rather than one `conflict`.

## Tradeoffs (U04)

- 2026-08-10T20:38:00Z — Chose to keep the Booking-to-Journey adapter in `apps/shell` beside the canonical Booking page rather than moving Booking ownership to `apps/booking`. Costs a cross-app seam in the shell; avoids a route-consolidation project that is explicitly outside W4 and that source inspection shows would change the canonical owner.
- 2026-08-10T20:38:00Z — Chose signed bounded origin tokens over a cross-module `returnTo` for both Booking/Journey directions. Costs token issuance, verification, and expiry handling on both sides; a plain `returnTo` across module boundaries would be an open-redirect surface the safe-return allow-list cannot bound.

## Open questions (U04)

- 2026-08-10T20:38:00Z — Identity has not registered `container-movement:read` or `container-movement:capture`. Every U04 route and command is fail-closed until it does; confirm registration and its executable policy tests before Code Generation rather than assuming a coarse substitute.
- 2026-08-10T20:38:00Z — The listener poison/bounded-retry/DLQ/replay exit has no owner evidence. Per Q10 this blocks U04 and the whole intent from completion; confirm at Delivery/Operation whether the owners will supply verified controls or approve a bounded replacement through change control.
