# Alarms

## Inputs

Alarm definitions consume `performance-design`, `security-design`, `reliability-design`, `monitoring-design`, and `infrastructure-services`.

## Local Alert Rules

| Alarm | Severity | Trigger | Action |
| --- | --- | --- | --- |
| Readiness failed | P1 | `readiness:local` status `failed` | Stop deployment and inspect evidence |
| Readiness blocked | P2 | `readiness:local` status `blocked` for required runtime | Complete environment provisioning |
| BFF upstream unavailable | P1 | Reference Data BFF returns sustained `503` | Check Identity/Reference Data services |
| Auth bypass non-local | P1 | Bypass enabled outside local profile | Stop deployment, disable env flag |
| Outbox freshness breach | P2 | `reference_event_freshness_seconds` exceeds threshold | Inspect Kafka/Schema Registry/outbox |
| Contract live failure | P1 | Live provider verification fails after services healthy | Block promotion |

## Routing

Local routing is file/evidence based until an alert channel is configured. Hosted/on-prem alert routing should map P1 to immediate operator response and P2 to same-day remediation.
