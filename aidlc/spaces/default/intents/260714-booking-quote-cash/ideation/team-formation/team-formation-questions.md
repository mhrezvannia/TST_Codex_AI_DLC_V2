# Team Formation Questions - W1-01 Booking Quote-to-Cash

Source context: `ideation/scope-definition/scope-document.md`, `ideation/scope-definition/intent-backlog.md`, and `ideation/feasibility/feasibility-assessment.md`.

## Q1. Available delivery model

Who is available to execute W1-01?

- A. The user is stakeholder/approval owner and Codex is the implementation driver, with repository-defined service ownership used for review boundaries; do not invent named staff (recommended)
- B. A staffed multi-person product team is available now
- C. External contractors will own implementation
- X. Other (please specify)
- `[Answer]:` A. User plus Codex (Recommended)

## Q2. Capacity and competing work

What capacity assumption should the plan use?

- A. One active intent at a time with no calendar throughput claim; pause competing intent delivery until W1-01 reaches a safe checkpoint (recommended)
- B. Assume several independent teams can execute all proto-Units in parallel
- C. Commit to a fixed delivery date without supplied availability data
- X. Other (please specify)
- `[Answer]:` A. One active intent (Recommended)

## Q3. Team topology

How should cross-module work be coordinated?

- A. One stream-aligned W1 mob led by Booking, with explicit Charge, CMM, shared-platform, UI, quality, and live-proof review roles; stable W0 services are consumed as a platform API (recommended)
- B. Separate horizontal database, backend, messaging, and frontend teams with handoffs
- C. Allow each service to change independently without a journey owner
- X. Other (please specify)
- `[Answer]:` A. Stream-aligned mob (Recommended)

## Q4. Skills and gap treatment

How should required skills and unknown gaps be handled?

- A. Treat Java/Spring/PostgreSQL, Kafka/Avro, Next.js, Docker, contract testing, and browser/live-proof skills as required roles; resolve gaps through focused repository research and specialist review before merging (recommended)
- B. Omit frontend and live-runtime skills from the team because backend tests are sufficient
- C. Assume every skill is fully available without validation
- X. Other (please specify)
- `[Answer]:` A. Specialist hats (Recommended)

## Q5. External support and location

What external or distributed-team assumptions apply?

- A. No contractor, AWS Professional Services, or distributed human team is required; work is coordinated in this repository/worktree and validated on the local Compose runtime in the user's Asia/Tehran environment (recommended)
- B. Require AWS Professional Services before local delivery
- C. Design a multi-time-zone handoff process for an unspecified team
- X. Other (please specify)
- `[Answer]:` A. Local, no external (Recommended)

## Q6. Decision rights

Who decides and approves at phase and contract boundaries?

- A. The user approves AI-DLC gates and scope; Booking is implementation driver; producer/consumer contract changes require Booking-CMM or CMM-Booking review; Charge reviews pricing changes; Shared Platform reviews shared-infra changes (recommended)
- B. Codex may silently change scope and frozen contracts
- C. Each module owner can unilaterally change cross-service contracts
- X. Other (please specify)
- `[Answer]:` A. User plus owners (Recommended)
