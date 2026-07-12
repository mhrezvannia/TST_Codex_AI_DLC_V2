# Intent Statement — W4-01 Module List-Detail Uplift

## Intent

The remaining module surfaces (Reference Data, Charge Agreements, Container Movement) reach the same product bar as Booking: mounted in the shell, list → detail (`/[id]`) information architecture, design-system primitives, all UI states — retiring the last workbench pages. **Driver: UI team; each module team contributes its domain screens.**

## Context Pack (read before starting)

1. `docs/erp-business-ui-gap-analysis.md` Part 3.2/3.5 (the target IA)
2. W2-01 outputs (shell + Booking mount = the pattern), W2-02 outputs (primitives)
3. `aidlc/spaces/default/memory/templates/interaction-spec.md` (binding shape for each module's spec)
4. Existing workbenches: `apps/reference-data`, `apps/charge-agreements`, `apps/container-movement`

## Vertical Slice Definition

Per module, vertical: interaction spec → list page (filter/search/sort/paginate) → detail page (tabs mapped to real domain relationships) → actions moved to the detail action rail → mounted in the shell with real session → workbench page deleted. Three thin repetitions of a proven pattern.

- **Thinnest viable form:** the tab sets that match today's real data: Reference record (Summary · Attributes · History), Agreement (Summary · Rates · D&D · Status history), Journey (Summary · Movement timeline · Linked booking).
- **Deferred:** saved views, bulk operations, cross-module global search.

## In Scope / Out of Scope

- **In:** three modules uplifted + mounted, cross-links (agreement↔booking, journey↔booking), zero remaining `local-user`/inline-hex in these apps, standalone app entrypoints retired.
- **Out:** new domain capabilities (pure UX/IA intent); admin/identity UI (separate later intent if needed).

## Actors & Journey

Each persona (reference admin, pricing analyst, ops clerk) completes their core task through list→detail→action inside the shell, keyboard-accessible.

## Cross-Module Seams (must be real)

None new at the backend; the seams are navigational (cross-links resolve to real records across modules inside the shell).

## Standards Alignment

WCAG AA per W2-02 gates; interaction-spec template compliance for each module (sensor-checked).

## Definition of Done (observed, not "tests pass")

On live Compose, per module: (1) list filters/sorts/paginates against real data; (2) detail renders every tab from real relationships; (3) every action available on the old workbench works from the detail rail — clicked and observed; (4) cross-links land on the right record; (5) `erp-fidelity-audit` UI detectors ~0 across `apps/**`; (6) old workbench routes gone.

## Dependencies

W2-01, W2-02. Module teams contribute per CODEOWNERS.

## Suggested Scope & Sizing

`feature`. 3 vertical units — one per module (Reference Data first: simplest, proves the repetition), each independently mergeable.

## Open Questions

1. Uplift order?
   - A. Reference Data → Charge → CMM (recommended: simple → complex)
   - B. CMM first (most workflow-critical after Booking)
   - X. Other
   - `[Answer]:` A — Reference Data → Charge → CMM (simple → complex).
