# NFR Requirements Questions - contract-platform-catalog

## Source Context

These questions consume `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.

The unit `contract-platform-catalog` owns executable contract validation, compatibility checks, canonical examples, Pact/message-pact fixtures, Schema Registry evidence, and read-only contract health reporting. The questions below resolve quantitative targets and constraints that are not fully fixed in prior artifacts.

## Q1 - CI Contract Validation Budget

What CI runtime budget should the contract platform target for the complete required contract validation suite?

A. Full contract validation should complete within 10 minutes on the standard CI runner, with a 15-minute hard failure threshold. Recommended for enterprise feedback speed.
B. Full contract validation may take up to 30 minutes.
C. Only changed contracts need validation in CI; full validation is manual.
D. Runtime budget is not important for the first release.
E. Defer CI runtime targets to CI Pipeline stage.
X. Other (please specify)

[Answer]: A

## Q2 - Local Developer Validation Budget

What local validation target should developers have before opening or updating a pull request?

A. Changed-contract validation should complete within 2 minutes locally on Windows, and full contract validation should complete within 10 minutes. Recommended for local-first enterprise development.
B. Changed-contract validation should complete within 5 minutes; full validation may be CI-only.
C. Developers only run syntax validation locally.
D. Developers do not run contract validation locally.
E. Defer local validation targets to Build and Test.
X. Other (please specify)

[Answer]: A

## Q3 - Compatibility Gate Strictness

How strict should compatibility enforcement be for required first-release seams?

A. Blocking for breaking or missing compatibility evidence on required seams; warnings allowed only for optional/non-active seams. Recommended.
B. Blocking only for major-version changes.
C. Advisory only until Operation.
D. Blocking only for Booking and Charge; event seams can be advisory.
E. Compatibility can be waived by developer comment.
X. Other (please specify)

[Answer]: A

## Q4 - Contract Security Requirements

What security metadata must every protected HTTP or event contract carry?

A. Auth context, subject/service identity, required capabilities or ACL, denied-path behavior, correlationId, and audit/observability fields. Recommended from NFR-SEC and business rules.
B. Auth context and correlationId only.
C. Security metadata only for HTTP APIs, not events.
D. Security metadata is owned only by Identity Service and not contract assets.
E. Defer contract security metadata to code generation.
X. Other (please specify)

[Answer]: A

## Q5 - Evidence Retention

How long should contract validation and compatibility evidence remain available for audit and release review?

A. Retain current branch/run artifacts for normal CI retention and retain release-candidate evidence bundles for at least 180 days. Recommended balanced audit posture.
B. Retain all evidence for 30 days only.
C. Retain all evidence indefinitely.
D. Retain only the latest evidence snapshot.
E. Defer retention to Operation.
X. Other (please specify)

[Answer]: A

## Q6 - Contract Health Availability

What availability and freshness target should the read-only contract health view meet?

A. Contract health is generated from CI/local artifacts, available whenever Enterprise Web is available, and marks data stale after 24 hours or when `gitRef` changes. Recommended.
B. Contract health is generated only during release review.
C. Contract health can be manually updated.
D. Contract health has no freshness target.
E. Defer health view targets to frontend implementation.
X. Other (please specify)

[Answer]: A

## Q7 - Scalability Planning Baseline

What first-release contract catalog scale should the design support without structural redesign?

A. At least 75 contract assets, 25 active schema subjects, 20 Pact/message-pact suites, and 10 service/integration seams. Recommended for complete LinerCore enterprise scope with room for growth.
B. Exactly the known first-release contracts only.
C. At least 500 contract assets.
D. No scale baseline needed.
E. Defer scale baseline to Operation.
X. Other (please specify)

[Answer]: A

## Q8 - Failure Mode Policy

How should the contract platform behave when validators, Schema Registry, or fixture generation fail?

A. Fail closed for required seams, preserve partial evidence, identify owner/remediation, and prevent integration readiness. Recommended.
B. Fail open and warn only.
C. Retry indefinitely until green.
D. Ignore external validator failures in local mode.
E. Defer failure handling to code generation.
X. Other (please specify)

[Answer]: A

## Q9 - Technology Selection

Which technology posture should the contract platform use for the first release?

A. Reuse repository stack: OpenAPI YAML, Avro `.avsc`, AsyncAPI files, Pact/message fixtures, Schema Registry compatibility through local Docker, Yarn/Turbo for orchestration where useful, and Java/Spring verification hooks for backend providers. Recommended from `technology-stack.md`.
B. Introduce a new central contract service with its own database immediately.
C. Use only markdown and generated TypeScript types.
D. Use remote SaaS contract tooling as the required source of truth.
E. Defer technology choices to code generation.
X. Other (please specify)

[Answer]: A

## Q10 - Compliance Scope

What compliance posture applies to contract assets in the first release?

A. Treat contract assets and evidence as internal/confidential engineering artifacts that may contain identifiers/examples but no payment, PHI, or production secrets; require secret scanning and redaction for examples. Recommended from requirements out-of-scope decisions.
B. Treat all contracts as public artifacts.
C. Treat all contracts as restricted regulated records.
D. Do not apply compliance controls to contract examples.
E. Defer compliance classification to Operation.
X. Other (please specify)

[Answer]: A
