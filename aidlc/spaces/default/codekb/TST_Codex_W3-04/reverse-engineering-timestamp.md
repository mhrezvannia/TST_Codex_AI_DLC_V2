# Reverse Engineering Freshness Record

## Scan Identity

| Field | Value |
|---|---|
| Scan date | 2026-08-03 |
| Repository | `D:\TST_Codex_W3-04` |
| Branch | `intent/W3-04-booking-request-completeness` |
| Commit | `92603accbc07896da682d23e146adc46d52464d1` |
| Scope | Whole single repository, with W3-04 Booking Request Completeness focus |
| Durable output | `aidlc/spaces/default/codekb/TST_Codex_W3-04/` |

## Method

The scan used Graphify/codebase-memory first for architecture and symbol discovery. The graph underrepresented the current Booking implementation and was therefore treated as stale/incomplete; findings were cross-checked against checked-in source, contracts, build files, configuration, migrations, and static test inventory.

The architect synthesis preserves the developer scan's exact endpoint, version, symbol, path, branch, commit, and contract-hash evidence. No external runtime data was used.

## Evidence Boundary

This was a read-only static/source scan. The following were not run: Maven/Yarn builds, unit/integration/contract tests, coverage, Compose startup or health, Flyway against live data, Kafka or Schema Registry flows, browser UI, accessibility, performance, security audits, `aidlc-audit`, `erp-fidelity-audit`, or live acceptance.

Accordingly, the CodeKB describes checked-in architecture and identifies missing executable evidence. It does not claim the declared 24-service Compose topology is running or healthy.

## Freshness Policy

Rerun reverse engineering when the repository commit changes materially in any W3-04 seam: Booking domain/API/persistence/forms, Reference Data voyage/commodity/party contracts, pricing input/adapter, `booking.confirmed` schema/topic, CMM consumer invariants, migrations, or verification infrastructure. Refresh the code graph before the next scan and retain a source cross-check if graph completeness remains uncertain.
