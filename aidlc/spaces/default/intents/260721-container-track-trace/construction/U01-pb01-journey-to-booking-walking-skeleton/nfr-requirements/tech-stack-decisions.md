# Tech Stack Decisions - U01 PB-01 Journey-to-Booking Walking Skeleton

## Source Alignment

These decisions implement U01 `business-logic-model.md` and
`business-rules.md`, satisfy `requirements.md`, and preserve the brownfield
inventory in `technology-stack.md`. They select existing seams; they do not
authorize framework replacement or public-cloud expansion.

## Selected Stack

| Concern | Decision | Rationale / constraint |
| --- | --- | --- |
| domain/application | Java 21, framework-free domain core, Spring Boot 3.3.7 adapters | matches service reactor and hexagonal boundaries |
| persistence | service-owned PostgreSQL 15 with ordered Flyway migrations | atomic local effects; no cross-database SQL |
| async contract | Kafka, Confluent Schema Registry 7.7.1, Avro 1.11.4, BACKWARD compatibility | existing physical topics and published language |
| web UI | Next.js declared `^15.1.3`, lock-resolved `15.5.19`; React 18.3.1; TypeScript declared `^5.7.2`, lock-resolved `5.9.3` | evidence runs lock-resolved versions while preserving manifest ranges and existing composition |
| UI primitives | synchronized `@erp/ui`, shared `--erp-*` tokens, Lucide | W2-02 ownership; no shared-shell/package redesign |
| tests | JUnit/Maven, Vitest, Playwright 1.61.1, existing contract/audit tools | covers unit through live browser evidence |
| runtime | Docker Compose via `scripts/wave-a-compose.mjs`, project `linercore-wave-a` | isolated acceptance and port-8088 protection |
| observability | existing structured logs/correlation plus available Prometheus/Grafana/Jaeger profile | no new telemetry platform required |

## Measurement Implementation

Use monotonic timestamps in the existing acceptance/Playwright harness for the
20-request p95/max samples and broker-to-Booking correlation. Use a bounded
parallel request group in the acceptance script for 10 contenders. This does
not require adding k6/Locust/Artillery for the approved local proof; a dedicated
load tool may be reconsidered only with a later production capacity target.

Java uses injected `Clock` for domain time, parameterized JDBC, Spring
transactions, generated/typed Avro mapping, and existing build/test conventions.
Frontend state remains route/server data plus local form state; RTK is absent
and no replacement global store is introduced.

## Rejected Additions

- No EDI library, public DCSA API framework, fleet/depot/M&R package, new shell,
  second component library, alternative package manager, or public-cloud service.
- No cross-database transaction/SQL or synchronous Booking-to-CMM shortcut.
- No destructive migration/reset script used as acceptance evidence.
- No new production monitoring retention, encryption algorithm, availability,
  autoscaling, backup, or DR claim without enterprise ownership and baseline.

## Verification Gates

Maven/unit/integration/contract/serde/migration tests, frontend lint/type/test,
Playwright at required widths/themes, live isolated Compose proof,
`aidlc-audit`, and `erp-fidelity-audit` must pass their applicable gates. Final
visual/live acceptance waits for W2-02-first integration synchronization; the
historical W1 waiver/BLOCKED evidence remains unchanged rather than relabelled.
