# User Stories Questions - Shared Platform Local Functionality

## Context

This story plan consumes `requirements`, `business-overview`, `component-inventory`, and `team-practices`. Answers are inferred from approved artifacts to avoid optional Q&A while the user asked for continued progress.

## Questions and Answers

### Q1. Which personas should drive the story map?

A. Reference-data admin only.
B. Reference-data admin, security/IT, platform operator, downstream module developer, and implementation developer.
C. Customer booking user.
D. Finance user.
E. Public customer.
X. Other (please specify)

[Answer]: B - These personas match the Shared Platform scope and avoid downstream business-module runtime work.

### Q2. What breakdown approach should be used?

A. By UI component only.
B. By end-to-end workflow and backlog unit, preserving walking-skeleton sequence.
C. By backend modules only.
D. By downstream modules.
E. By deployment environments.
X. Other (please specify)

[Answer]: B - End-to-end workflow stories best prevent static UI or isolated backend work from being mistaken for functional platform behavior.

### Q3. What story format should be used?

A. Freeform tasks.
B. INVEST stories with Given/When/Then acceptance criteria.
C. Technical TODO bullets only.
D. Test names only.
E. Design notes only.
X. Other (please specify)

[Answer]: B - `team-practices` requires testable work and the Inception guardrails require Given/When/Then acceptance criteria.

### Q4. What priority model should be used?

A. No priorities.
B. MoSCoW with Must for U01-U08, Should for U09-U11, Could for U12.
C. UI-first regardless of dependencies.
D. Downstream module priority first.
E. Production deployment first.
X. Other (please specify)

[Answer]: B - This mirrors the approved requirements and intent backlog.

### Q5. What is the first walking-skeleton story?

A. Marketing homepage.
B. Local runtime plus one authenticated reference-data mutation with persisted history and visible publication status.
C. Full production deployment.
D. Booking creation.
E. Finance export.
X. Other (please specify)

[Answer]: B - This proves the core Shared Platform path while staying inside scope.

## Plan Summary

- Persona count: 5.
- Story count: 16.
- Breakdown: workflow/backlog-unit slices.
- Acceptance style: Given/When/Then.
- Review focus: no scope creep into Charge, Booking, or Container Movement.
