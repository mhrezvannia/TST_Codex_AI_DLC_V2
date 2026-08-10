# Stakeholder Map — W2-03 Charge Tariffs & Agreements

## Stakeholders and Interests

| Stakeholder role | Relationship | Primary interest | Evidence needed |
|---|---|---|---|
| Charge pricing analyst | Primary business user | Maintain distinct tariffs, surcharges, and local charges; approve versioned agreements; understand which rates priced a booking | Live create/version/approve workflow, validation feedback, rate and agreement attribution |
| Booking operator / customer-service user | Primary downstream user | Receive a complete itemised quote, explicitly reprice, and recognize a booking that requires manual pricing | Stored Booking breakdown, immutable snapshots, visible `MANUAL_PRICING_REQUIRED` state |
| Charge domain owner / Driver team | Accountable delivery owner | Preserve Charge ownership, contract fidelity, data integrity, and vertical completion | Charge code review, provider contract proof, migration and calculation evidence |
| Booking domain owner / Contributor | Consumer owner | Preserve Booking behavior and confirm that the consumer reads and stores the new result fields correctly | Consumer Pact, Booking tests, Booking-visible live proof, dual sign-off |
| Shared Platform owner | Reference-data steward | Ensure Charge consumes stable canonical references rather than duplicating master data | W0-02 lookup/validation evidence and unchanged reference ownership |
| W2-02 UI owner | Shared design-system steward | Prevent module-local shell, token, primitive, typography, navigation, or palette divergence | Review limited to Charge page composition; no unauthorized `packages/ui` changes |
| Release reviewer / quality role | Independent verifier | Confirm the slice works on the isolated stack and preserves earlier intents | Pre/post guard results, tests, Playwright evidence, live manifest, both audits |
| Program backlog owner | Program decision-maker | Enforce DAG order, Wave A isolation, ownership, and honest acceptance status | Intent record, dependency trace, evidence path, backlog update only at closure |
| Manager-demo users | Protected operational stakeholders | Keep the continuously available manager demonstration undisturbed | No targeting of `linercore-shared-platform`; port 8088 and demo guard protection |
| Audit / compliance reviewer | Assurance stakeholder | Trace money outcomes to approved versions, identities, correlations, and immutable evidence | Agreement/rate version history, pricing snapshots, audit disclosure, unchanged W1 waiver history |

## Decision Rights and Influence

- **Business scope and gate decisions:** the human intent sponsor approves AI-DLC artifacts and any material scope change.
- **End-to-end delivery accountability:** the Charge Driver owns W2-03 from rate maintenance through live Booking consumption and acceptance.
- **Charge provider decisions:** the Charge domain owner approves rate/agreement semantics, persistence, calculation, provider contract, and Charge UI pages.
- **Booking consumer decisions:** the Booking domain owner approves consumer-visible contract usage, stored snapshot behavior, repricing, and manual-pricing state.
- **Shared contract changes:** Charge and Booking jointly approve additions; neither owner may unilaterally rename, remove, or reinterpret fields.
- **Reference-data decisions:** Shared Platform retains canonical ownership of charge code, currency, equipment type, trade lane, customer, and location references.
- **Shared UI decisions:** W2-02 retains ownership of `packages/ui`, the global shell, navigation, tokens, typography, and palette. W2-03 decides Charge-domain composition only.
- **Release verdict:** the release-review/quality role evaluates observed live evidence and both audits; source review or tests alone cannot grant completion.
- **Program closure:** the program backlog owner marks W2-03 closed only after the live Definition of Done and all exit gates are green.

## Communication Requirements

- Record all W2-03 decisions, gates, and evidence in `aidlc/spaces/default/intents/260721-charge-tariff-agreements/` and a new W2-03 evidence directory under `artifacts/`.
- Route contract changes through both Charge-provider and Booking-consumer review, keeping OpenAPI, examples, Pact/provider evidence, and runtime behavior synchronized.
- Route any missing shared primitive to the W2-02 owner; do not implement or redesign it inside the Charge branch without approved coordination.
- Announce isolated live-acceptance windows because Wave A sessions serialize use of the `linercore-wave-a` Compose project.
- Run and retain pre/post `demo:guard` output. If Docker access or another environmental prerequisite blocks the guard, label the evidence blocked and do not infer manager-demo safety.
- Keep the W1 historical blocked manifest and waiver unchanged and visible. New successful evidence receives a new W2-03 path and date.
- Communicate manual-pricing semantics to Booking operators using business status and actionable next steps; keep transport internals in an audit/evidence disclosure.
- Escalate any requested change to shared shell, navigation, typography, palette, `packages/ui`, or another module's owned implementation before making it.

## Alignment Risks and Responses

| Risk | Stakeholders in tension | Required response |
|---|---|---|
| Charge wants a richer result while Booking depends on frozen fields | Charge and Booking owners | Additive contract evolution, consumer-first evidence, dual sign-off |
| A Charge screen needs a missing shared primitive | Charge and W2-02 owners | Record the gap and coordinate through the program merge protocol; do not fork the design system |
| A live-acceptance command could affect the manager demo | W2-03 delivery and manager-demo users | Use only `scripts/wave-a-compose.mjs` and `linercore-wave-a`; never run an unscoped teardown |
| Repricing convenience could mutate commercial history | Pricing analysts, Booking users, auditors | Approved versions and stored Booking snapshots remain immutable; create new effective versions |
| A no-rate fallback could be mistaken for a price | Booking operators and revenue assurance | Persist and display `MANUAL_PRICING_REQUIRED` with no guessed total |
| Prior W1 acceptance history could be simplified in reporting | Program owner and reviewers | Preserve the blocked manifest and waiver verbatim; cite the later pass separately |
