# Intent Capture Questions - W2-04 Closure

## Q1. Business problem

Which problem is this corrective intent required to solve?

- A. W2-04 was marked complete without its promised CMM operational UI or observed live acceptance (recommended)
- B. The existing W2-04 feature needs broader product scope
- C. Only documentation needs correction
- X. Other (please specify)

`[Answer]:` A. Completion gap (Recommended)

## Q2. Primary customer

Who must receive the primary usable outcome?

- A. Container Movement operations clerks, with customer-service users receiving the Booking projection (recommended)
- B. Customer-service users only
- C. Release reviewers only
- X. Other (please specify)

`[Answer]:` A. CMM operations (Recommended)

## Q3. Observable success

What evidence is required before the closure can be called successful?

- A. CMM list/detail/capture UI plus real Kafka-to-database-to-Booking proof, rejection evidence, Playwright, performance, and both audits green (recommended)
- B. UI screenshots and unit tests only
- C. Backend API and database evidence only
- X. Other (please specify)

`[Answer]:` A. Full live proof (Recommended)

## Q4. Initiative trigger

What triggered this corrective work now?

- A. Post-completion inspection found the completion claim contradicted the recorded test and deployment evidence (recommended)
- B. A new market opportunity
- C. A regulatory deadline
- X. Other (please specify)

`[Answer]:` A. Evidence conflict (Recommended)

## Q5. Scope boundary

How tightly should the closure be constrained?

- A. Implement only the missing W2-04 UI and evidence path; preserve the existing service, shell, Booking UI, contracts, and deferred intents (recommended)
- B. Redesign all Container Movement capabilities
- C. Include EDI ingestion and the public DCSA API
- X. Other (please specify)

`[Answer]:` A. Close W2-04 only (Recommended)

## Q6. Release decision

What should happen if any live acceptance or audit gate remains red?

- A. Keep W2-04 closure blocked and report the exact failing evidence; never relabel it complete (recommended)
- B. Accept unit-test success as sufficient
- C. Waive all environment failures automatically
- X. Other (please specify)

`[Answer]:` A. Remain blocked (Recommended)
