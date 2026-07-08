# User Stories Questions - Shared Platform MVP

> Stage: User Stories
> Intent record: `260630-shared-platform`
> Source context: `requirements.md`, `team-practices.md`, Enterprise Technical Environment v1.1, Shared Platform-only scope.

## Q1. Persona set

Which persona set should the stories use?

A. Full platform persona set: reference data administrator, internal carrier staff user, platform operator, security administrator, downstream module consumer, delivery/QA engineer (recommended)
B. Human UI personas only: reference data administrator, internal carrier staff user, platform operator, security administrator
C. Split downstream consumers by later module: Charge, Booking, Container Movement representatives, without runtime implementation
X. Other (please specify)

[Answer]: A. Full platform set (Recommended)

## Q2. Story breakdown approach

How should stories be organized?

A. By persona journey and platform domain, with vertical stories crossing UI/API/event layers where useful (recommended)
B. By application/service component: `reference-data-service`, `identity-service`, Kafka, `apps/reference-data`, `apps/auth`
C. One story per functional requirement ID
X. Other (please specify)

[Answer]: A. Persona + domain (Recommended)

## Q3. Story granularity

What granularity should the generated story backlog target?

A. Standard MVP backlog: about 18-24 stories with 3-6 acceptance criteria each (recommended)
B. Compact backlog: about 10-14 larger stories
C. Detailed backlog: about 30-40 smaller stories
X. Other (please specify)

[Answer]: A. 18-24 stories (Recommended)

## Q4. Technical enabler stories

Should technical enablers appear as user stories when they have visible platform value?

A. Yes, include enabler stories framed around platform operator, downstream consumer, or delivery/QA value (recommended)
B. Include only human UI stories; leave enablers to later design stages
C. Include technical enablers, but keep them separate from user stories
X. Other (please specify)

[Answer]: A. Include enablers (Recommended)

## Q5. MVP priority boundary

How should MoSCoW priority be assigned?

A. Keep Shared Platform foundation as Must Have; mark admin refinements, convenience filters, and advanced analytics as Should/Could (recommended)
B. Mark only walking skeleton stories as Must Have
C. Mark all approved requirements as Must Have
X. Other (please specify)

[Answer]: A. Foundation Must (Recommended)

## Q6. Downstream consumer treatment

How should downstream Charge, Booking, and Container Movement needs appear?

A. As consumer personas and contract-readiness stories only, with no downstream runtime implementation (recommended)
B. Exclude downstream consumers entirely from stories
C. Include module-specific stub implementation stories now
X. Other (please specify)

[Answer]: A. Contracts only (Recommended)
