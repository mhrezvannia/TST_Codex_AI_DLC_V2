# LinerCore UI/UX Pro Max Prompt Sequence

Every numbered Markdown file in this directory is a complete, standalone prompt.
Open the file, copy the entire contents, and paste it into Codex.

For the exact remaining-intent copy/paste workflow, start with
`EXECUTION-GUIDE.md`.

This folder is the human-facing prompt sequence. The complementary
`design-system/linercore/prompts/` folder is the intent execution runbook with
skill-search commands and page-contract references. When running an intent
manually, paste the numbered prompt from this folder; when AI-DLC produces the
binding artifacts, load both the numbered prompt's reviewed design and the
matching LinerCore runbook/page contract.

For Auth and Shell pages 03-09, choose one of these paths:

- Run `03-sign-in-handoff.md` through `09-shell-signed-out.md` individually.
- Run `03-09-complete-workflow.prompt.md` once to design the entire family as a
  coherent workflow.

Do not run both paths for the same design revision.

## Foundation and Wave A sequence

Run the existing prompts in this order:

1. `00-shared-design-system.md`
2. `01-keycloak-login.md`
3. `02-auth-gateway.md`
4. `03-09-complete-workflow.prompt.md` (recommended combined Auth/Shell path)
   or `03-sign-in-handoff.md` through `09-shell-signed-out.md`
5. `10-booking-operations-queue.md`
6. `11-new-booking.md`
7. `12-booking-detail.md`
8. `13-booking-not-found.md`
9. `14-reference-data-workbench.md`
10. `15-reference-data-access-denied.md`
11. `16-charge-agreements-workbench.md`
12. `17-shared-system-states.md`

The Booking sequence comes before the governance workbenches because it is the
primary Phase 1 demonstration journey. Reference Data and Charge Agreements are
then redesigned using the interaction and component language established by the
Booking flow.

## Remaining Phase 1 sequence

Execute each intent's prompt after its Requirements Analysis and User Stories
are approved, during Inception Refined Mockups, before Application Design and
Construction. Earlier Rough Mockup runs are provisional; Construction reruns
are conformance reviews only.

13. `18-dnd-rules-and-rates.md` — W3-01
14. `25-booking-request-completeness.md` — W3-04; may run alongside W3-01 and must be approved before W3-03
15. `19-booking-charges-and-invoice.md` — W3-02, after W3-01 contracts
16. `20-booking-amendments-reconfirmation.md` — W3-03, after W3-04
17. `21-reference-data-list-detail-uplift.md` — W4-01 Reference Data unit
18. `22-charge-agreements-list-detail-uplift.md` — W4-01 Charge unit
19. `90-container-journeys-queue-future.md` and
    `91-container-journey-detail-future.md` — CMM foundation if not approved
20. `23-container-journeys-list-detail-uplift.md` — W4-01 CMM consolidation
21. `24-operations-observability.md` — W4-02

Do not run `19` before W3-01 has an approved provider/evidence contract. For
W4-01, approve the repeated list-detail grammar with `21`, then apply it through
`22` and `23` without erasing module-specific behavior. Prompt `24` is designed
in Inception and revalidated against live Grafana, Jaeger, and ELK surfaces in
the Operation Observability Setup stage.

## Review gates

Do not run all prompts and implement everything without review.

1. Approve `00` before designing another page.
2. Approve authentication prompts `01-02`, then approve the combined `03-09`
   design package as one coherent Auth/Shell flow.
3. Approve Booking prompts `10-13` as one end-to-end workflow.
4. Approve Reference Data and Charge prompts `14-16`.
5. Approve the shared states in `17`.
6. Approve W3-01 (`18`) before W3-02 (`19`). Approve W3-04 (`25`) before W3-03
   (`20`), and review amendments against the approved W3-04 field baseline and
   established Booking detail design.
7. Approve W4-01 prompts `21-23` as one repeated pattern with three domain
   interaction specifications.
8. Approve W4-02 dashboard, trace, alert, and runbook flows in `24`, then prove
   them with live failure drills.
9. Implement one approved family at a time and verify it with Playwright.

Each prompt is intentionally design-only. It tells Codex not to edit production
code. After a design is approved, ask Codex to implement that exact approved
design with UI/UX Pro Max active.

## Exact AI-DLC handoff

For each remaining intent, give its numbered prompt only after Requirements
Analysis (2.3) and User Stories (2.4) are approved and the workflow enters
Refined Mockups (2.5). Save the reviewed result under `docs/ui-ux-design/` using
the same basename as the prompt. Then use
`REFINED-MOCKUP-HANDOFF.md` to convert that approved design into the active
intent's binding Refined Mockups artifacts before Application Design (2.6).

Do not ask Construction to interpret a raw UI/UX Pro Max answer. Construction
must consume the reviewed Refined Mockups artifacts produced by this handoff.
