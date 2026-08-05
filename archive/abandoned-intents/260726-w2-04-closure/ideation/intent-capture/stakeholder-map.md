# Stakeholder Map - W2-04 Closure

## Primary stakeholders

| Stakeholder role | Interest | Required outcome | Decision weight |
|---|---|---|---|
| Container Movement operations clerk | Complete daily journey and movement work in one authenticated product surface | Find journeys, inspect timelines, capture valid movements, and understand rejections | Primary user validation |
| Customer-service user | See operational movement progression without leaving Booking | Booking detail reflects accepted CMM status events | Primary downstream validation |
| CMM bounded owner | Preserve domain, database, API, and event-contract integrity | Correct lifecycle and idempotency behavior with service-owned persistence | Technical decision-maker |
| Booking bounded owner | Preserve consumer compatibility and projection semantics | Contract-compatible, deduplicated movement projection | Cross-module decision-maker |
| Release reviewer | Prevent unsupported completion claims | Complete live, UI, performance, and audit evidence | Exit-gate decision-maker |

## Influencers and supporting roles

| Role | Interest | Participation |
|---|---|---|
| Shared shell and identity owner | Consistent authentication, authorization, routing, and navigation | Reviews mounted CMM routes and denied-state behavior |
| Design-system owner | Consistent LinerCore operational-console behavior | Reviews page-level composition without reopening shared tokens or primitives |
| Platform eventing owner | Broker, schema, relay, and replay integrity | Reviews real event proof and schema compatibility |
| Quality and security reviewers | Repeatable positive, negative, accessibility, performance, and security evidence | Validate automated and observed gates |
| Program integration owner | Protect the manager demo and merge order | Controls isolated-stack reservation and integration synchronization |

## Decision rights

- Product acceptance requires both the operations workflow and the Booking projection; neither can be waived independently.
- CMM owns journey behavior, movement validation, and CMM pages.
- Booking owns its status projection and display contract.
- Shared shell, identity, UI primitives, and eventing remain governed by their existing bounded owners.
- The release reviewer accepts closure only when every stated live and audit gate is green.

## Communication requirements

- Report evidence by gate with PASS, FAIL, or BLOCKED; never aggregate a red gate into an overall PASS.
- Preserve exact correlation, event, journey, booking, and container identifiers in the acceptance evidence.
- Notify bounded owners before any public event-field or shared UI contract change.
- Record manager-demo guard results before and after isolated-stack work.
- Keep the historical W2-04 completion record and W1 waiver intact; corrective evidence is additive.

