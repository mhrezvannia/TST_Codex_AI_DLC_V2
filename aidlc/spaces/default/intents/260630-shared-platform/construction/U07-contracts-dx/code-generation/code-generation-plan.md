# Code Generation Plan - U07 Published Contracts and Developer Experience

## Source Trace

This plan implements U07 from `business-logic-model.md`, `business-rules.md`, `domain-entities.md`, `security-design.md`, and `reliability-design.md`.

U07 publishes reviewable contract evidence for OpenAPI APIs, Avro events, examples, provider/message fixtures, compatibility status, and read-only contract catalog views. It must not create Charge, Booking, or Container Movement runtime services, UI screens, or implementation stubs.

## Implementation Steps

- [x] Step 1: Add contract catalog artifacts.
  - Traceability: BR-U07-001 through BR-U07-006, BR-U07-010.
  - Add a catalog JSON file with owner, version, lifecycle status, source service, artifact paths, compatibility status, and findings.

- [x] Step 2: Add examples and provider/message fixtures.
  - Traceability: BR-U07-003, BR-U07-004, BR-U07-013 through BR-U07-022.
  - Add API examples for reference data and identity authorization, plus message fixture metadata for representative reference-change events.

- [x] Step 3: Add executable catalog validation.
  - Traceability: BR-U07-007 through BR-U07-012, BR-U07-022.
  - Validate required artifacts exist, Avro files parse, examples parse, compatibility statuses are allowed, and downstream runtime stubs are absent.

- [x] Step 4: Add read-only contract view data for `apps/reference-data`.
  - Traceability: BR-U07-027 through BR-U07-030.
  - Add UI-safe contract catalog summaries and render a read-only catalog section with text status labels and findings.

- [x] Step 5: Add tests.
  - Traceability: Standard test strategy.
  - Add Node tests for catalog validation and frontend helper tests for contract view data.

- [x] Step 6: Run verification.
  - Traceability: U07 reliability rules.
  - Run catalog validator, Node tests, reference-data app tests/typecheck/build, JSON parsing, downstream-scope scans, and record unavailable compatibility tooling.

## Test Strategy

The active strategy is Standard. U07 must include executable validation tests for catalog shape and artifact presence, plus frontend helper/component coverage for read-only compatibility labels. Full OpenAPI diff and Schema Registry compatibility gates remain U08 CI enforcement work; U07 records compatible/pending evidence and unknown-tooling limitations.

## Approval

This plan is ready for review before U07 implementation.
