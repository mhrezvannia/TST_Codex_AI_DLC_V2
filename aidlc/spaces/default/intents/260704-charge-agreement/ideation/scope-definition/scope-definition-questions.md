# Scope Definition Questions - Charge & Customer Agreement

## Q1. What is the minimum viable scope?

A. Agreement lifecycle, charge terms, functional UI, backend API/persistence, Shared Platform reference-data consumption, tests, and active-agreement lookup.
B. Static UI only.
C. Backend only.
D. Full RMS with spot pricing and carrier connectivity.
E. Invoicing and payment settlement.
X. Other (please specify)

[Answer]: A

## Q2. What is must-have for module completion?

A. Create/edit/list/detail/approve agreements, maintain charge terms, store data, and verify with tests/smoke checks.
B. AI pricing optimization.
C. External carrier rate marketplace.
D. Full invoice settlement.
E. Container movement events.
X. Other (please specify)

[Answer]: A

## Q3. What should be deferred?

A. Booking, Container Movement, invoicing, payment settlement, public tariffs, spot rates, index-linked pricing, and carrier network integrations.
B. Agreement approval.
C. Charge terms.
D. Shared Platform reference-data integration.
E. Tests.
X. Other (please specify)

[Answer]: A

## Q4. What sequencing should drive construction?

A. Walking skeleton first, then domain persistence/API, then UI workflow, then Booking lookup/readiness.
B. UI-only first.
C. Advanced pricing first.
D. Docker recovery first.
E. Production deployment first.
X. Other (please specify)

[Answer]: A

## Q5. What hard dependency must remain visible?

A. Shared Platform services and seed data must stay running/verified in host-runtime mode while Docker recovery remains separate.
B. Customer Booking must be implemented before Charge.
C. Container Movement must be implemented before Charge.
D. External RMS purchase must complete first.
E. No dependencies exist.
X. Other (please specify)

[Answer]: A
