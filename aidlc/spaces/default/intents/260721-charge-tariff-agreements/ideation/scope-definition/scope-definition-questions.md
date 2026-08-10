# Scope Definition Questions - W2-03 Charge Tariffs & Agreements

Upstream context: [`intent-statement.md`](../intent-capture/intent-statement.md), [`feasibility-assessment.md`](../feasibility/feasibility-assessment.md), and [`constraint-register.md`](../feasibility/constraint-register.md).

## Q1. Minimum viable scope

What is the minimum viable W2-03 scope that delivers operational value?

- A. Administer versioned Charge data, approve an agreement, calculate real itemised pricing, consume and reprice it in Booking, and prove no-rate manual handling live (recommended)
- B. Stop after Charge administration without Booking consumption
- C. Display existing or hardcoded pricing in Booking without a real Charge authority
- X. Other (please specify)
- `[Answer]:` A - Full thin slice (Recommended)

## Q2. MoSCoW boundary

How should the stated capabilities be prioritized?

- A. Treat real rates, approved versioning, itemised Booking price, repricing, manual no-rate path, Charge UI, and live/audit evidence as one inseparable release (recommended)
- B. Defer repricing or no-rate handling
- C. Add optimization, D&D, settlement, or broader rating dimensions
- X. Other (please specify)
- `[Answer]:` A - All are Must (Recommended)

## Q3. Capability dependencies

Which dependency chain should govern the backlog?

- A. Lock contract and version semantics plus additive migrations, then Charge behavior, Booking snapshots/reprice/manual states, UI, and final live evidence (recommended)
- B. Build database, backend, and UI as separate horizontal batches
- C. Lead with UI before authoritative calculation and contract semantics
- X. Other (please specify)
- `[Answer]:` A - Contract to live (Recommended)

## Q4. Sequencing preference

What sequencing preference should the proto-backlog use?

- A. Prove one real approved rate through Charge into Booking first, then deepen administration/versioning, repricing/manual exceptions, UI, and acceptance evidence (recommended)
- B. Order visible features first even if contract and migration uncertainty remains
- C. Follow dependencies mechanically without risk-reduction judgment
- X. Other (please specify)
- `[Answer]:` A - Skeleton risk-first (Recommended)

## Q5. Deadline treatment

Are any capabilities tied to a hard deadline?

- A. No deadline was supplied; preserve the whole thin release and do not invent dates or capacity (recommended)
- B. Assume an unsupported target date
- C. Timebox by removing approved Must-Have outcomes
- X. Other (please specify)
- `[Answer]:` A - None supplied (Recommended)

## Ambiguity and Contradiction Review

- The minimum is a coupled vertical release, not a menu of independently deferrable backend, UI, Booking, degraded-path, and evidence items.
- No answer conflicts with the [`intent-statement.md`](../intent-capture/intent-statement.md), conditional findings in [`feasibility-assessment.md`](../feasibility/feasibility-assessment.md), or binding [`constraint-register.md`](../feasibility/constraint-register.md).
- No date, budget, staffing, or capacity constraint is known. Priority uses MoSCoW plus ordinal value/risk/size reasoning rather than fabricated WSJF or RICE arithmetic.
