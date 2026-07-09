# Code Generation Plan - UOW-01 Local Runtime Packaging and Prerequisite Checks

## Scope

Implement local runtime visibility for the Shared Platform walking skeleton.

## Steps

- [x] Step 1: Add a deterministic prerequisite checker for Node, Yarn, Java, Maven, Docker daemon, and core local ports. Traceability: FR-001, FR-004, US-001.
- [x] Step 2: Add root package scripts for text and JSON prerequisite checks. Traceability: FR-004, US-001.
- [x] Step 3: Expose identity-service and reference-data-service ports in local Compose so browser-run BFFs can reach them during development. Traceability: FR-002, FR-003.
- [x] Step 4: Add Compose environment wiring for apps-reference-data service URLs. Traceability: ADR-001, ADR-006.
- [x] Step 5: Run the prerequisite checker and record blocked prerequisites separately from code failures. Traceability: FR-004.
- [x] Step 6: Test coverage: exercise the checker through `node scripts/check-local-prereqs.mjs --json` and preserve output in the stage summary. Traceability: NFR-003.

## Review

READY for B01: local runtime gaps are now visible as machine-readable prerequisite failures instead of ambiguous app errors.
