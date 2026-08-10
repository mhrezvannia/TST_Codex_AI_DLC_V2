# Personas — W2-03 Charge Tariffs & Agreements

## Upstream Basis and Boundary

These personas derive from [`requirements.md`](../requirements-analysis/requirements.md), the brownfield [`business-overview.md`](../../../../codekb/TST_Codex_W2-03/business-overview.md) and [`component-inventory.md`](../../../../codekb/TST_Codex_W2-03/component-inventory.md), and affirmed [`team-practices.md`](../practices-discovery/team-practices.md). They preserve the approved actor model: the Pricing Analyst owns Charge mutations and approvals; no separate Commercial Approver or manual-resolution role is invented.

## Persona 1 — Pricing Analyst

| Field | Definition |
|---|---|
| Role | Primary Charge-domain operator and authorized commercial-data steward |
| Priority | 1 — primary author/approver |
| Goals | Maintain valid OFR, BAF, and POL THC rate versions; build customer agreements from exact approved rate versions; approve immutable commercial authority; investigate no-rate evidence. |
| Pain points | Disabled/hardcoded Charge workbench, unclear applicability, overlapping effective windows, mutable history, and no reliable path from configured authority to Booking proof. |
| Context | Works in Charge-owned routes inside the shared LinerCore shell. Uses stable reference identities and one signed session-derived actor. The same role approves rate and agreement versions for this slice. |
| Success signal | A known agreement produces the expected three Booking lines; successor versions reprice correctly; invalid or overlapping authority cannot become active. |

The analyst needs validation before approval, clear Draft versus Approved state, exact version history, dirty-form protection, deterministic conflict recovery, and keyboard-accessible command feedback. The analyst may inspect an OPEN manual case but cannot enter a manual quote or resolve/close the case in W2-03.

## Persona 2 — Booking Desk Operator

| Field | Definition |
|---|---|
| Role | Primary consumer of Charge pricing through the existing Booking workflow |
| Priority | 2 — primary downstream consumer |
| Goals | Receive a real itemised price, understand its agreement/tariff provenance, reprice pricing-affecting amendments, compare immutable snapshots, and recognize when manual pricing is required. |
| Pain points | Flattened/hardcoded pricing, missing quantity/basis/version provenance, overwritten prior results, partial totals, and provider failures collapsed into an indistinguishable state. |
| Context | Remains on the existing Booking surface and never mutates Charge records. Uses requested departure date and amendment sequence through the Booking pricing port. |
| Success signal | OFR, BAF, and THC lines reconcile to the stored Charge authority and total; repricing appends history; no-rate blocks automatic confirmation without a fabricated total. |

The operator needs the current state, quantity, unit rate, line amount, total, basis/reference, source versions, and prior/current snapshots in one scannable region. `NO_RATE`, ambiguity, timeout, denied, validation, conflict, and in-progress outcomes must remain meaningfully distinct.

## Persona 3 — Charge Reader/Auditor

| Field | Definition |
|---|---|
| Role | Read-only commercial-history, authorization, and evidence consumer |
| Priority | 3 — supporting assurance persona |
| Goals | Inspect rate/agreement versions, pricing provenance, and release evidence; confirm approved history has not changed. |
| Pain points | Rewritten history, missing correlation/version identities, mutation controls shown without authority, and release claims unsupported by live evidence. |
| Context | Uses the same Charge routes in read-only mode when Charge-read capability exists; receives the shared denied route without it. |
| Success signal | Every commercial/pricing outcome is traceable by stable IDs, versions, actor/service identity, timestamp, and correlation without exposing secrets. |

This persona needs mutation commands absent in read-only mode, non-color status text, ordered version history, collapsed audit detail, and evidence links. W2-03 does not implicitly grant this persona manual-case access; that evidence remains Pricing Analyst scope unless an existing explicit capability grants it. Release evidence must retain the original W1 blocked/waived record rather than relabeling it as a real pass.

## Persona Relationships and System Actors

```text
Pricing Analyst -> configures and approves Charge authority
Charge service  -> prices through canonical POST /pricing-requests
Booking service -> persists the immutable result through its existing pricing port
Booking Desk    -> consumes or explicitly reprices the result
Reader/Auditor  -> inspects versions, provenance, and live acceptance evidence
```

Text fallback: the analyst establishes authority; services exchange the canonical result; Booking Desk consumes it; the reader audits it. Charge and Booking services are collaborating systems, not human personas. No persona authorizes cross-database access, shared-shell redesign, generic pricing abstraction, or a full manual-pricing workflow.
