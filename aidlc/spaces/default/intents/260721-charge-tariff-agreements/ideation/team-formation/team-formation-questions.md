# Team Formation Questions - W2-03 Charge Tariffs & Agreements

Upstream context: [`scope-document.md`](../scope-definition/scope-document.md), [`intent-backlog.md`](../scope-definition/intent-backlog.md), and [`feasibility-assessment.md`](../feasibility/feasibility-assessment.md).

## Q1. Availability and capacity

How should team availability and capacity be represented?

- A. Define required roles and keep roster, utilization, and committed capacity explicitly unknown until supplied (recommended)
- B. Invent named people, headcount, and full-time availability
- C. Assume one individual owns every specialty and review gate
- X. Other (please specify)
- `[Answer]:` A - Roles only (Recommended)

## Q2. Skill coverage

How should the required skills be covered?

- A. Use one cross-functional delivery mob with rotating domain, architecture, backend/data, frontend/UX, quality, security, and release-review hats (recommended)
- B. Staff only Java/data skills
- C. Create separate horizontal teams for every technology layer
- X. Other (please specify)
- `[Answer]:` A - Review hats (Recommended)

## Q3. Competing initiatives

How should competing priorities be handled when none were identified?

- A. Record competing work as unknown and serialize access to the isolated Wave A acceptance stack while protecting the manager demo (recommended)
- B. Claim the team and environments have no competing demands
- C. Invent initiatives and capacity contention
- X. Other (please specify)
- `[Answer]:` A - Unknown plus serialize (Recommended)

## Q4. Preferred topology

What team topology should W2-03 use?

- A. One accountable stream-aligned intent mob owns the vertical outcome with time-boxed specialist review hats (recommended)
- B. Split database, backend, frontend, and quality into separate teams
- C. Move Charge/Booking feature ownership into the shared-platform team
- X. Other (please specify)
- `[Answer]:` A - Stream-aligned mob (Recommended)

## Q5. Time zones and locations

How should time zones and locations be represented?

- A. Do not invent geography; require documented decisions, handoffs, and scheduled synchronous gates compatible with distributed work (recommended)
- B. Assume all contributors are co-located
- C. Invent specific regions and coverage windows
- X. Other (please specify)
- `[Answer]:` A - Unknown, async-ready (Recommended)

## Q6. External support

Are external partners, contractors, or AWS Professional Services required?

- A. Deliver with existing repository capabilities; escalate only a verified skill or environment gap through change control (recommended)
- B. Add AWS professional services despite no cloud scope
- C. Add an external pricing-suite partner
- X. Other (please specify)
- `[Answer]:` A - Not now (Recommended)

## Q7. Decision roles

Who should make phase and release decisions?

- A. Product owns scope/value; Charge and Booking domain owners own semantics; Architecture owns boundaries; Quality/Release Review owns evidence; the user approves AI-DLC gates (recommended)
- B. Give one technical role unilateral authority over every decision
- C. Invent named people for the RACI
- X. Other (please specify)
- `[Answer]:` A - Role-based gates (Recommended)

## Ambiguity and Gap Review

- The required role set is known from [`scope-document.md`](../scope-definition/scope-document.md), [`intent-backlog.md`](../scope-definition/intent-backlog.md), and [`feasibility-assessment.md`](../feasibility/feasibility-assessment.md); actual people, availability, utilization, geography, and competing initiatives remain unknown.
- No readiness claim may be made from the role plan. Named assignees and capacity commitments are required before delivery scheduling.
- A Docker-capable release-review participant or authorized runner is a verified environment dependency; this does not justify inventing a broader external-services need.
