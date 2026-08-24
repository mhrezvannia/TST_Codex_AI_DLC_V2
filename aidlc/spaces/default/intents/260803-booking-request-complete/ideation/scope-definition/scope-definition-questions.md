# Scope Definition Questions — W3-04 Booking Request Completeness

## Established scope context

- Inputs reviewed: `intent-statement.md`, `feasibility-assessment.md`, and `constraint-register.md`.
- Scope is `feature`, Standard depth/test strategy. No fixed monetary or calendar deadline is documented; the approved live Definition of Done is protected.
- The thinnest complete intent is one FCL-dry route, one requested equipment line with quantity greater than one, USD, canonical commercial fields, full authoritative voyage snapshot, exact live pricing, and confirmation without a physical container identifier.
- All delivery slices must remain vertical under `docs/aidlc-v2-slicing-playbook.md`; frontend, backend, persistence, integration, accessibility, and evidence are not separate units.

## Pending scope decisions

1. What is the minimum complete W3-04 scope?
   - A. The full approved dry-booking path: commercial field baseline, authoritative voyage snapshot including cutoffs/deadline, equipment type × quantity with no initial ID, safe legacy handling, exact pricing, compatible confirmation, shared-shell detail/states, and live evidence (recommended)
   - B. Stop after typed create/read and defer pricing/confirmation integration
   - C. Stop after pricing-minimum fields and defer the broader commercial baseline
   - X. Other
   - `[Answer]: A — Full vertical path.`

2. How should the proto-backlog be decomposed?
   - A. Five vertical increments: authoritative request spine; commercial completeness; legacy correction; exact pricing; compatible confirmation and final live proof (recommended)
   - B. Three larger vertical increments combining migration with fields and pricing with confirmation
   - C. One indivisible delivery unit
   - X. Other
   - `[Answer]: A — Five vertical increments.`

3. Which sequencing heuristic should drive the proto-backlog?
   - A. Risk-first within dependency order: first prove authoritative voyage cutoffs/deadline plus quantity/no-ID request semantics, then complete commercial fields, legacy correction, pricing, and confirmation (recommended)
   - B. Visible customer fields first, leaving reference/contract risk until later
   - C. Pricing and confirmation first, then capture completeness
   - X. Other
   - `[Answer]: A — Risk-first within dependency order.`

4. How should optional commercial fields be prioritized?
   - A. Capture optional consignee, notify party, and volume in W3-04, but do not make them confirmation blockers; test their round-trip and privacy handling (recommended)
   - B. Defer all optional commercial fields to a later intent
   - C. Make consignee, notify party, and volume mandatory for confirmation
   - X. Other
   - `[Answer]: A — Capture in W3-04; do not block confirmation.`

5. What change-control rule should guard the boundary?
   - A. Any shipping-instruction, reefer/DG, multi-leg, physical assignment, amendment, cancellation, eBL, non-USD, or external-portal addition routes to its owning future intent unless an explicit approval gate reopens W3-04 (recommended)
   - B. Allow adjacent additions whenever they are technically nearby
   - C. Let individual units expand scope without a gate if the DoD still passes
   - X. Other
   - `[Answer]: A — Scope changes require a gate; adjacent breadth stays with its owning intent.`

6. Are hard deadlines tied to a specific W3-04 capability?
   - A. No hard deadline is currently documented; protect scope and live evidence, and raise any later date/cost tradeoff at a gate (established)
   - B. A hard deadline applies and should dominate scope
   - X. Other
   - `[Answer]: A — Established by the approved Feasibility delivery envelope.`

## Ambiguity, contradiction, and timeline analysis

- Every `[Answer]:` tag is resolved; no scope question remains open.
- The approved `intent-statement.md`, Conditional GO in `feasibility-assessment.md`, and Critical/High conditions in `constraint-register.md` are mutually consistent with the full vertical path.
- “Optional consignee/notify/volume” means optional booking values and non-blocking confirmation semantics. Implementing, persisting, reopening, protecting, and testing those fields remains in W3-04 scope.
- Five proto-increments are delivery hypotheses, not horizontal teams or final Units. Each must cross all affected layers and prove an observable user/system outcome.
- Risk-first sequencing is constrained by dependencies: the authoritative schedule/equipment-request spine must exist before commercial completeness and later pricing/confirmation proof can be trusted.
- No schedule-vs-scope contradiction exists because no hard deadline is documented. Any later date or budget constraint must be presented at a gate with its proposed scope/quality tradeoff.
