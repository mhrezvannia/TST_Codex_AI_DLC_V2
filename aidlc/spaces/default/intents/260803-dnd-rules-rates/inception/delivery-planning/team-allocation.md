# Team Allocation - W3-01 D&D Rules and Rates

## Source alignment and team shape

This allocation consumes approved `requirements.md`, `stories.md`, Refined `mockups.md`, Application Design `components.md`, `unit-of-work.md`, `unit-of-work-dependency.md`, `unit-of-work-story-map.md`, and affirmed `team-practices.md`, together with Team Formation's mob composition, skill matrix and assessment.

One stream-aligned cross-functional W3-01 intent mob owns all four Bolts. Roles are capability hats, not invented named staffing or availability commitments. The mob retains context across the hard chain while named maintainers and business roles approve their owned seams. W2-02 remains an external platform owner; W3-01 does not fork `packages/ui`, the shell, or `Dialog`.

## Core mob and standing responsibilities

| Role/capability hat | Standing responsibility | Accountable/approval seam |
| --- | --- | --- |
| Product | Scope, story outcome, live acceptance | User retains every AI-DLC approval gate |
| Pricing Analyst | D&D semantics, applicability, example results, operational usability | Rule/rate and p99 accept-or-revise decisions |
| Architect | Charge/Booking/Reference boundaries, exact version evidence, dependency conformance | Architecture and predecessor readiness |
| Developer | Vertical implementation in existing Charge, Reference Data and Charge web boundaries | Build integrity and protected-file ownership |
| QA | Focused tests, fixtures, Playwright, Compose evidence and exit-audit collection | Evidence completeness and exact expected results |
| Design | LinerCore composition, non-color meaning, responsive/a11y fidelity | UI adherence; no shared-system changes |
| Delivery | Bolt readiness, dependency gates, serialized environment use, escalation | Bolt entry/exit checklist |
| Charge maintainer | W2-03 preservation and provider compatibility | Charge provider fixture and migration review |
| Booking maintainer | Consumer contract compatibility only | Booking consumer fixture signoff; no W3-01 runtime trigger |
| W2-02 UI platform owner | `PlatformShell`, rail/skip/main and `Dialog` description seam | Merged `packages/ui` revision and package tests |

Within a Bolt, Driver/Navigator/Facilitator duties rotate as useful. This does not divide a vertical Bolt into horizontal teams or weaken code-owner review.

## Bolt allocation

| Bolt | Responsible mob hats | Accountable hats | Required consultations | Evidence owner |
| --- | --- | --- | --- | --- |
| B01 `author-price-skeleton` | Developer, QA, Design | Architect and Product | Pricing Analyst, Charge maintainer, Booking maintainer, W2-02 owner | QA with Delivery |
| B02 `version-trigger-governance` | Developer, QA, Design | Architect and Product | Pricing Analyst, Charge maintainer, W2-02 owner | QA with Delivery |
| B03 `exact-historical-calculation` | Developer, QA | Architect and Pricing Analyst | Charge maintainer, Product, Design for evidence presentation | QA with Delivery |
| B04 `safe-attempts-evidence` | Developer, QA | Architect and Product | Security/DevSecOps owner, Charge maintainer, Design for no-disclosure/evidence states | QA with Delivery |

All Bolts use the same mob because the unit DAG has no parallel antichain and later outcomes depend on knowledge and evidence produced by earlier ones.

## Working agreements by Bolt

### B01

- A single Developer/Architect owner controls the ordered migration chain and `pricing.v1` protected artifacts.
- QA generates provider/consumer fixtures from that contract; Charge and Booking maintainers sign the one compatibility manifest.
- Design/Developer consume the merged W2-02 `PlatformShell` revision and existing `@erp/ui`; no local substitute is accepted.
- Delivery reserves the isolated Compose project before live proof.

### B02

- The mob consumes B01 migrations, fixtures and signoff without regeneration or second ownership.
- Charge maintainer reviews Standard-pricing enrichment, owner-fenced release and replay invariance.
- Design/Developer integrate the merged W2-02 `Dialog` description seam before approval-dialog proof.

### B03

- Architect and Pricing Analyst jointly validate Agreement/Tariff, old/successor and timezone examples.
- QA owns the reproducible latency harness record; named Charge/Booking/Pricing owners accept or revise the provisional target later at the intent exit gate.

### B04

- Developer/Architect lock the transport/auth/error precedence and fencing semantics before breadth work.
- QA exercises exact signed-contract, concurrency, null-terms evidence and no-disclosure cases.
- Security/DevSecOps owns scanner availability or policy resolution; no unavailable check can be reported green.

## Handoff and escalation

A predecessor handoff requires its named live evidence file, focused checks and approval before the next Bolt starts. Missing external evidence is escalated to the named accountable role and leaves the consuming Bolt blocked; it is not converted into a provisional green, local fork, guessed value or schedule promise. No calendar commitment is recorded until an owner supplies an availability or lead-time fact.
