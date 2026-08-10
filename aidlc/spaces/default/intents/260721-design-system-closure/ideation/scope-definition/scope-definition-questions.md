# Scope Definition Questions

The guided answers reconcile intent-statement.md, feasibility-assessment.md, and constraint-register.md.

## Answered Decisions

1. **Minimum viable scope:** One vertical closure unit containing shared-package completion, Booking reference consumption, and observed evidence.
2. **Must-have:** Every unresolved W2-02 Definition-of-Done item, including live Compose, Playwright, aidlc-audit, and erp-fidelity-audit evidence.
3. **Nice-to-have / deferred:** Added component breadth, visual refresh, other module migrations, external library adoption, and unrelated cleanup.
4. **Dependencies:** Confirm gaps before implementation; shared primitives before Booking consumption; static checks before live proof; live proof before audits and backlog closure.
5. **Sequencing:** Risk-first within the dependency chain.
6. **Deadline:** No date may trade away proof gates, demo safety, or waiver truth.

## Ambiguity and Contradiction Review

- “One unit” does not mean one file or one commit; it means one acceptance boundary whose slices cannot independently claim W2-02 closure.
- “DoD only” includes code corrections when needed to close a documented evidence gap; it is not an evidence-only constraint.
- No answer conflicts with the W2-02 ownership boundary or protected baseline.
