# Stakeholder Map - W1-01 Booking Quote-to-Cash

## Stakeholder Interests

| Stakeholder | Role in W1-01 | Primary interest | Evidence needed |
|---|---|---|---|
| Booking-desk / customer-service agent | Primary user | Complete one booking without re-keying and see its movement status in one detail view | Browser-observed create-to-detail journey |
| Booking product owner / lead | Driver and outcome owner | Contract-true Booking lifecycle, atomic confirmation, and usable detail workflow | DoD evidence and approval of Booking behavior |
| Charge owner / pricing team | Provider contributor | Stable pricing request/result behavior and correct quote persistence | Provider tests and live pricing call |
| CMM owner / equipment-control team | Event consumer and producer contributor | Idempotent journey creation and authoritative movement-status publication | Kafka, persistence, and redelivery proof |
| Shared Platform owner | Infrastructure steward | Reuse W0 messaging and canonical reference capabilities without divergence | Shared-adapter reuse and live broker/reference evidence |
| Quality / audit reviewer | Independent verifier | Behavioral gates that execute the real journey rather than inspect placeholders | Tests, live evidence, `aidlc-audit`, and `erp-fidelity-audit` |
| Operations / support | Runtime observer | Traceable failures, correlation across seams, and restart-safe persistence | Logs, outbox state, topic records, and recovery proof |
| Commercial executive | Business sponsor | Eliminate pricing-to-booking re-keying and establish a reliable commercial spine | Demonstrated quote-to-confirm-to-status outcome |

## Decision Rights

| Decision | Accountable | Required contributors |
|---|---|---|
| Booking user journey and acceptance | Booking product owner | Booking-desk representative, quality reviewer |
| `pricing.request` / `pricing.result` behavior | Booking and Charge owners jointly | Booking consumer and Charge provider engineers |
| `booking.confirmed` contract | Booking owner | CMM consumer acknowledgement, Platform schema review |
| `containermovement.status` contract | CMM owner | Booking consumer acknowledgement, Platform schema review |
| Shared relay, Kafka, Schema Registry, and profiles | Shared Platform owner | Booking, CMM, and operations contributors |
| Exit and merge approval | Booking Driver | Charge and CMM owners for their seams, quality/audit reviewer |

## Communication And Review

- Booking is the single Driver and owns the intent branch, integrated DoD, evidence bundle, and merge request.
- Charge and CMM contribute through their owned modules and review every change to their provider or producer contract surface.
- Contract files are shared-kernel assets: changes require producer and consumer sign-off and must remain executable through provider, message, and serde verification.
- Shared Platform reviews reuse of the W0 relay and runtime configuration; W1 must not fork or duplicate that infrastructure.
- Quality reviews occur at each vertical-unit gate and again on the live Compose exit run.
- Any contract incompatibility, live-runtime blocker, or cross-module ownership conflict is raised immediately to the Booking Driver and the affected owning team.

## Anticipated Tensions

| Tension | Resolution rule |
|---|---|
| Shipping quickly vs. broad booking completeness | Preserve the one-leg, one-equipment-line slice; defer breadth to named intents |
| Current flat model vs. contract field names | The authoritative `.avsc` and enterprise contract win; mapping must be explicit and tested |
| Existing synchronous Booking-to-CMM call vs. async contract | Kafka is authoritative for confirmation delivery in W1; remove the sync delivery from the live path |
| Local convenience vs. real integration proof | Local no-op profiles may support isolated development but cannot satisfy DoD or live evidence |
| UI polish vs. operational usability | Prioritize a complete list-to-detail workflow and state handling; full shell/design-system work remains in W2 intents |

## Success Alignment

All stakeholders align on a single observable outcome: one booking is validated and priced against live providers, confirmed atomically, delivered to CMM through real Kafka, returned to Booking as a real movement-status event, and rendered correctly on the Booking detail page. Tests and documents support this proof but do not replace it.
