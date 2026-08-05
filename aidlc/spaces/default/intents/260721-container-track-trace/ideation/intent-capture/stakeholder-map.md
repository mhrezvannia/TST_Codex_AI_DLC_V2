# Stakeholder Map — W2-04 Container Journey & Track-Trace

## Stakeholder Roles and Interests

| Stakeholder role | Relationship | Primary interests | Evidence needed |
|---|---|---|---|
| Equipment-control operations clerk | Primary user | Fast, accurate movement capture; clear next legal move; expected-versus-actual timeline; recoverable errors | Usable shared-shell workflow and observable duplicate/sequence rejection |
| Customer-service agent | Secondary user | Trustworthy Booking progression without transport internals dominating the screen | Movement status appears on the correct Booking in understandable language |
| CMM driver / Equipment Control owner | Accountable driver and producer owner | End-to-end delivery, DCSA correctness, lifecycle integrity, service ownership | CMM domain/API/UI/database evidence and producer verification |
| Booking owner | Contributor and conformist consumer | Contract compatibility, correct container association, dedupe/stale behavior, Booking projection | Consumer tests, database receipt, Booking detail evidence, dual sign-off on field/envelope changes |
| W2-02 UI owner | Shared UI contributor | Stable shared shell, tokens, primitives, and ownership boundaries | W2-04 uses merged `@erp/ui`/shell without changing shared ownership surfaces |
| Shared Platform/eventing owner | Integration contributor | Broker/SR availability, topic authorization, relay health, manager-demo isolation | Topic/SR observations, stack guard results, no local-noop substitution |
| Integration/release reviewer | Acceptance decision support | Repeatable isolated proof, protected manager demo, quality/audit fidelity | Evidence manifest, Playwright artifacts, `aidlc-audit`, `erp-fidelity-audit` |
| Product/program owner | Scope decision-maker | Vertical business value, backlog/DAG discipline, no deferred-scope leakage | Demonstrable thin journey and explicit out-of-scope mapping |

## Decision Rights

| Decision | Accountable | Required consultation / co-sign |
|---|---|---|
| W2-04 scope and observed Definition of Done | Product/program owner with CMM driver | Booking owner, integration/release reviewer |
| CMM domain, API, lifecycle, and Container Movement page composition | CMM driver | Equipment-control user perspective; UI owner for shared-contract fit |
| `containermovement.status` payload/envelope change | CMM producer owner | Booking consumer owner; contract compatibility reviewer |
| Booking consumer and detail projection changes | Booking owner | CMM producer owner for contract interpretation |
| Shared shell, tokens, or `packages/ui` changes | W2-02 UI owner | W2-04 consumes after merge; missing primitives are raised rather than independently implemented |
| Isolated Wave A stack ownership window | Integration/release reviewer | W2-02/W2-03/W2-04 session owners coordinate serialization |
| Final acceptance and intent close | CMM driver and product/program owner | Booking, UI, and integration owners provide owned-seam evidence |

## Influence Map

- **Decision-makers:** product/program owner for scope; CMM driver for delivery; Booking and CMM owners jointly for event-contract changes; integration/release reviewer for live-evidence sufficiency.
- **Strong influencers:** equipment-control clerk for capture usability; customer-service agent for Booking readability; W2-02 UI owner for shared-shell consistency; Shared Platform owner for eventing and isolation safety.
- **Informed stakeholders:** adjacent Wave A W2-03 driver and later-intent owners (`P2-02`, `P2-04`, `P2-05`, `W3-02`) receive contract/scope outcomes but do not broaden this intent.

## Communication Requirements

| Moment | Audience | Required communication |
|---|---|---|
| Intent and scope gates | Product/program, CMM, Booking | Artifact links, exact in/out boundaries, unresolved decisions |
| Contract-affecting proposal | CMM producer, Booking consumer, contract reviewer | Field/envelope diff, BACKWARD compatibility result, fixtures/provider-consumer evidence, explicit sign-off |
| UI design/code review | CMM and W2-02 UI owners | Container Movement page override only, shared primitive gaps, responsive/a11y evidence plan |
| Integration synchronization | W2-02, W2-03, W2-04, integration reviewer | Integration commit, acceptance-stack reservation, demo-guard status, known conflicts |
| Final acceptance | All decision roles | Broker/database/Booking proof, UI/Playwright evidence, rejection observations, audits, and manifest paths |
| Blocker or waiver | Product/program and release reviewer | Preserve the actual blocked state; identify authority, impact, and follow-up without rewriting evidence as PASS |

## Stakeholder Risks

- A unilateral contract or Booking change would violate module ownership and invalidate sign-off.
- Running the isolated acceptance stack concurrently could corrupt evidence or disturb another Wave A session.
- Accepting UI before W2-02 synchronization could create rework or a second visual system.
- Treating Kafka/SR details as the primary operator experience would serve platform stakeholders at the clerk's expense.
- Recasting the historical W1 waiver as a PASS would damage audit credibility even though a later, separate live PASS exists.
