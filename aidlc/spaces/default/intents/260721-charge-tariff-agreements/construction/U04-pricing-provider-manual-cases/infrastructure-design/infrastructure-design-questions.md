# Infrastructure Design Questions — U04 Pricing Provider and Manual Cases

## Question assessment

No new human infrastructure question is required for U04.

The engine-declared `performance-design.md`, `security-design.md`,
`scalability-design.md`, `reliability-design.md`, `logical-components.md`,
`components.md`, `services.md`, and `business-logic-model.md` already close the
choices that would materially alter this design:

- the only approved runtime is the existing `linercore-wave-a` Compose stack;
- U04 stays inside `charge-agreement-service`, `apps-charge-agreements`, and
  PostgreSQL 15, with no new service, database, cache, queue, replica, search
  engine, AWS resource, region, or production topology;
- U01 owns the V1–V4 physical migration chain, the Hikari maximum of 10, and
  the guarded Wave A deployment;
- U04 owns deterministic pricing, receipt fencing, terminal evidence, and the
  read-only manual-case surface;
- monitoring, latency, restart, security, and preservation gates are specified
  as isolated-local acceptance evidence rather than production SLOs.

## Ambiguity analysis

No vague or contradictory answer remains. Production scale, retention, paging,
multi-region, and disaster-recovery targets are explicitly out of scope and
must not be invented here. U06 owns live Compose/restore acceptance mechanics;
U04 provides the durable probes and fixtures.

[Answer]: Proceed with the approved existing-topology design and record no
additional infrastructure assumptions.
