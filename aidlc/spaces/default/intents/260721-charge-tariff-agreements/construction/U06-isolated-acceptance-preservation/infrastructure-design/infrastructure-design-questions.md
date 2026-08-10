# Infrastructure Design Questions — U06 Isolated Acceptance and Preservation

## Assessment

No new human question is required. The engine-declared
`performance-design.md`, `security-design.md`, `scalability-design.md`,
`reliability-design.md`, `logical-components.md`, `components.md`,
`services.md`, and `business-logic-model.md` fully specify the non-deployable
driver, Wave A isolation, evidence protocol, closed registries, guarded restore,
browser matrix, performance populations, and manager-preservation boundary.

## Ambiguity analysis

The prior NFR review already closed crash consistency, trace sanitation,
Windows path containment, restore targeting, matrix cardinalities, and exact
performance populations. Production topology, SLOs, retention, and paging are
out of scope and must not be inferred.

[Answer]: Proceed with the checked-in evidence-driver design and no new
runtime infrastructure.
