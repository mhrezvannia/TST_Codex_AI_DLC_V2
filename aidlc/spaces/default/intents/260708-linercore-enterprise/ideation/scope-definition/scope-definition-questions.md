# Scope Definition Questions - LinerCore Enterprise

## Q1. What is the minimum viable enterprise scope?

A. A complete integrated enterprise release including Shared Platform hardening, Charge/Agreement, Booking, D&D, CMM, full UI, contracts, local Docker runtime, CI/CD, observability, and Operation.
B. Shared Platform only.
C. Documents and diagrams only.
D. Prototype UI only.
X. Other (please specify)

[Answer]: A. A complete integrated enterprise release including Shared Platform hardening, Charge/Agreement, Booking, D&D, CMM, full UI, contracts, local Docker runtime, CI/CD, observability, and Operation.

## Q2. What capabilities are Must Have?

A. All core module business flows, contract implementation, authn/authz, data ownership, local runtime, tests, and operation readiness.
B. Only read-only screens.
C. Only backend skeletons.
D. Only manual runbooks.
X. Other (please specify)

[Answer]: A. All core module business flows, contract implementation, authn/authz, data ownership, local runtime, tests, and operation readiness.

## Q3. What is explicitly out of scope for this first enterprise release?

A. Reopening the old MVP intent, cross-module database coupling, SaaS-only runtime dependency, rebuilding correct MVP code, generic global ocean booking network, payment processing, and unapproved module collapse.
B. Nothing; everything possible is in scope.
C. All tests.
D. All operation work.
X. Other (please specify)

[Answer]: A. Reopening the old MVP intent, cross-module database coupling, SaaS-only runtime dependency, rebuilding correct MVP code, generic global ocean booking network, payment processing, and unapproved module collapse.

## Q4. What sequencing preference applies?

A. Dependency-first and risk-first: preserve baseline, harden platform/contracts/runtime, then Charge/D&D, Booking, CMM, UI integration, and Operation.
B. UI-only first.
C. Random module order.
D. Operation last without prior design.
X. Other (please specify)

[Answer]: A. Dependency-first and risk-first: preserve baseline, harden platform/contracts/runtime, then Charge/D&D, Booking, CMM, UI integration, and Operation.

## Q5. How should workstreams be coordinated?

A. Use the parent enterprise intent as the coordination spine, with explicit workstreams now and possible child intents after scope/delivery approval.
B. Reuse the old Shared Platform MVP record.
C. Collapse all work into one service.
D. Skip coordination artifacts.
X. Other (please specify)

[Answer]: A. Use the parent enterprise intent as the coordination spine, with explicit workstreams now and possible child intents after scope/delivery approval.

## Q6. What are the hard scope gates?

A. Contract freeze, full local runtime, end-to-end flow validation, security/observability evidence, and Operation artifacts.
B. Containers merely start.
C. Code skeleton exists.
D. UI screenshots exist.
X. Other (please specify)

[Answer]: A. Contract freeze, full local runtime, end-to-end flow validation, security/observability evidence, and Operation artifacts.
