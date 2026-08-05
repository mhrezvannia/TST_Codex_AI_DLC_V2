$ui-ux-pro-max

Act as a principal enterprise UX designer with deep experience in confirmed
ocean-freight booking amendments, commercial re-gating, equipment assignment,
revision conflicts, reconfirmation, and downstream reconciliation. This is an
AI-DLC Inception design task for LinerCore W3-03. Do not edit production code in
this turn.

Inspect `docs/intents/W3-03-booking-amendments.md` and its complete Context Pack,
the approved W3-04 Booking Request Completeness requirements/refined mockups/design,
the approved Booking queue/detail designs from prompts `10-13`, current Booking
commands and revision behavior, Charge repricing integration, CMM event
contracts, shared `@erp/ui`, and the running demo.

Design amendment entry from a confirmed Booking detail page, a dedicated amend
flow, review-and-reconfirm, and amendment history. Do not redesign W3-04's
complete request form. The MVP permits only:

- Equipment quantity changes.
- Manual ISO 6346 container-number assignment.

Routing changes, cancellation, split, roll, amendment fees, and other amendment
types are outside scope and must be absent rather than shown as disabled future
promises.

Create this task flow:

1. Start Amend from the confirmed Booking action rail.
2. Edit permitted equipment values with persistent labels and on-blur
   validation.
3. Show which commercial gates will rerun.
4. Review explicit current-versus-proposed values and repricing effects.
5. Confirm reconfirmation with current and expected next revision.
6. Show Booking success separately from broker publication and CMM
   reconciliation status.

Design the record header, editable equipment lines, immutable context,
commercial gate summary, before/after review, reconfirmation consequence, and
revision history. History must show revision, actor/time, changed fields,
pricing reference, event publication, and CMM reconciliation outcome.

Cover loading, denied/read-only, invalid equipment/container number, lookup
failure, dirty navigation, commercial validation blocked, repricing pending or
failed, stale/concurrent revision conflict, reconfirm pending, Booking success,
publication delayed, CMM delayed/error, stale replay ignored, duplicate submit
prevention, and complete success. Preserve user input and context on every
recoverable failure.

Use the approved LinerCore Booking design: compact record header, light neutral
surfaces, restrained maritime blue, semantic status tokens, persistent labels,
tabular revisions/money/timestamps, Lucide icons, stable dimensions, and no
separate amendment workbench, decorative diff view, color-only meaning, hero,
gradients, nested cards, or unsupported actions.

At 390px use one-column editing and labelled change records. At 768px stack the
form and evidence sections while preserving row-aligned comparison. At
1024/1440px the form and compact review/evidence rail may coexist. Meet WCAG
2.2 AA with linked error-summary focus, confirmation focus trap/restore,
announced status updates, and matching visual/keyboard order.

Produce:

1. Roles, task flow, permitted-field rules, and domain assumptions.
2. Route proposal and entry/return behavior for Application Design review.
3. Desktop/mobile wireframes for edit, review, reconfirm, and history.
4. High-fidelity form, comparison, commercial gate, confirmation, and
   propagation-evidence specifications.
5. Validation, conflict, pending, recovery, and reconciliation state matrix.
6. Responsive and accessibility behavior at all four required breakpoints.
7. `@erp/ui` mapping without creating a second Booking workbench.
8. Playwright and visual-regression acceptance checklist.

Do not implement until the W3-03 requirements, stories, and design are approved.
