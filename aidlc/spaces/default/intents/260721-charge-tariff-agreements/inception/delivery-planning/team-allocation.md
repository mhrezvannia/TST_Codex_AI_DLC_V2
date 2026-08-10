# Team Allocation - W2-03 Charge Tariffs & Agreements

## Allocation Contract

`team-practices.md` and Team Formation require one stream-aligned W2-03 intent mob with rotating specialist/review hats. No named roster, utilization, location, committed calendar capacity or independent human review availability is known. This allocation therefore assigns accountable roles and system-agent hats, not people or dates. It supports the sequential `bolt-plan.md`, the six Units in `unit-of-work.md`, the DAG in `unit-of-work-dependency.md`, and story coverage in `unit-of-work-story-map.md`, while retaining scope from `requirements.md`, `stories.md`, refined `mockups.md`, and Application Design `components.md`.

## Stream-Aligned Intent Mob

| Hat | Accountable scope | Independence rule |
| --- | --- | --- |
| Product/value | W2-03 boundary, user outcome, Bolt/user gates | User remains formal AI-DLC gate approver. |
| Delivery lead | WIP one, Bolt gates, dependency/escalation log | Cannot claim capacity or dates without assignments. |
| Charge domain | Rate/agreement/calculation/manual-case semantics and Charge pages | Mandatory on U01/U03/U04 decisions. |
| Booking domain | Pricing consumer, snapshots, Reprice/manual/outage semantics | Mandatory bilateral review for provider/consumer changes. |
| Architect/contract | Service/data ownership, API compatibility, DAG/migration impact | Reviews contract, migration, cross-service and shared-owner changes. |
| Backend/data | Java ports/adapters, PostgreSQL/Flyway, APIs | U01 is the sole Charge migration-file owner. |
| Frontend/UX/accessibility | Charge pages, existing Booking pricing region, page-state evidence | Must invoke UI skill per changed page and protect shared UI/shell ownership. |
| Quality/security | Domain/integration/contract/UI/security tests and evidence sufficiency | Independent review hat required before each Bolt gate. |
| Release review/operations | Docker, Wave A, demo guards, live/performance/audits | Mandatory and independent for B01 live skeleton and B06 release acceptance. |

One contributor/system agent may wear multiple implementation hats, but evidence review and release approval must remain credibly independent. Missing skill/independence pauses the affected gate rather than inventing a person.

## Bolt-to-Mob Allocation

| Bolt | Driver/lead agent hat | Required navigators/review hats | External/gate owner |
| --- | --- | --- | --- |
| B01 Real-rate skeleton | Developer with Charge/Booking integration focus | Charge domain, Booking domain, architect/contract, data, frontend/UX, quality/security | Release review for Docker/live observation; user for skeleton gate. |
| B02 Rate/routing foundation | Developer with Charge/data focus | Charge domain, architect/data migration owner, frontend/UX, quality/security, W2-02 consult for DS gaps | Delivery lead ensures single migration owner; shared UI owner for DS-02/03 seam. |
| B03 Agreement authority | Developer with Charge domain focus | Charge domain, architect/data, frontend/UX, quality/security | Product/Charge owner for lifecycle semantics. |
| B04 Full provider/manual cases | Developer with Charge pricing focus | Charge and Booking domain, architect/contract, data, frontend/UX, quality/security | Bilateral provider/consumer reviewers; manual-evidence capability owner. |
| B05 Booking repricing/failures | Developer with Booking integration focus | Booking and Charge domain, architect/contract, frontend/UX, quality/security | Bilateral reviewers; identity/service-auth owner as needed. |
| B06 Acceptance/preservation | Release-review role as operational lead | Charge, Booking, quality/security, architect, frontend/UX; developer supports defects only | Docker-capable owner and user final gate; serialized Wave A owner. |

## File and Contract Ownership

| Shared chain/file family | Sole authoring owner | Required reviewers | Consumer rule |
| --- | --- | --- | --- |
| Charge Flyway V1-V4 migration files | U01 data/migration hat | Architect, Charge, quality/security | U03/U04 consume V3/V4 prepared schema; never rewrite applied files. |
| `contracts/openapi/pricing.v1.yaml` and examples | U04 Charge provider hat | Booking consumer + architect + quality | B01 may add a compatible skeleton example; U04 owns final all-or-none enrichment and three-line semantics. |
| Booking typed snapshot migration/codec | U05 Booking data hat | Charge contract + architect + quality | U04 supplies authoritative contract; no duplicated commercial calculation. |
| Charge page record | Charge frontend/UX hat | Charge domain, quality, W2-02 consult | Only `design-system/linercore/pages/charge-and-agreements.md` receives Charge additions. |
| Shared `packages/ui`/shell/navigation | W2-02 owner, outside mob | W2-03 consults only | W2-03 does not modify or fork these surfaces. |
| Wave A evidence manifest | B06 release review | Quality/security, Charge, Booking, user | All observed commands/results linked; historical W1 waiver unchanged. |

## Decision and Review Gates

| Gate | Accountable role | Required evidence |
| --- | --- | --- |
| B01 skeleton | Product/value + user | Real DB/provider/Booking/UI line, negative fake-fallback proof, honest runtime status. |
| Rate/agreement lifecycle | Charge domain | Domain/repository/API/UI invariants, migration/history/concurrency proof. |
| Bilateral contract | Architect/contract | Synchronized OpenAPI/example/provider/consumer review from Charge and Booking hats. |
| UI page | Charge or Booking domain owner | `ui-ux-pro-max`, master/session/page record compliance, component/browser a11y evidence. |
| Bolt quality | Quality/security | Required tests/coverage/security/authorization and no unresolved blocker. |
| B06 live acceptance | Release review + user | Guards, isolated Compose, DB/API/UI/correlation, Playwright, performance and audits. |

## Capacity and Concurrency

- Bolt WIP is one; B01-B06 are sequential.
- Internal tasks may run concurrently only after explicit system/human owner assignment proves no shared-file collision and preserves review independence.
- No delivery dates, duration, velocity or headcount are asserted.
- Before Construction, record system/human owners for the active Bolt. Before B01/B06 live gates, record a Docker-capable release-review owner and serialized Wave A window.
- Unknown human roster blocks schedule commitments, not AI-DLC artifact/code work that has system-agent ownership and user gates.

## Escalation Paths

| Trigger | Immediate action | Decision owner |
| --- | --- | --- |
| Contract/provider-consumer red | Stop affected Bolt; preserve exact mismatch evidence | Architect + Charge/Booking reviewers. |
| Destructive or co-owned migration proposal | Stop; return ownership to U01 and forward-repair design | Architect/data owner. |
| Shared UI/shell edit requested | Stop; route to W2-02 owner or retain explicit dependency | Charge domain + architect + user if scope changes. |
| Docker/guard unavailable or failing | Stop live gate; continue no release claim | Release review + user. |
| Manager port/project exposure | Abort acceptance and inspect guard evidence | Release review. |
| Missing skill/review independence | Pause gate; assign targeted enabling/reviewer role | Delivery lead/product. |
| Scope beyond flat per-container W2-03 | Formal change control/new intent | Product + user. |

## Upstream Sources

- `requirements.md`
- `stories.md`
- refined `mockups.md`
- Application Design `components.md`
- `unit-of-work.md`
- `unit-of-work-dependency.md`
- `unit-of-work-story-map.md`
- `team-practices.md`

