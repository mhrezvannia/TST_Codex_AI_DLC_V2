# Incident Plan - Charge Agreement Walking Skeleton

## Source Alignment

This artifact consumes `dashboards`, `alarms`, `reliability-design`, `security-design`, and `deployment-architecture`.

## Severity Model

| Severity | Scenario | Response |
| --- | --- | --- |
| P1 local | Sensitive data exposed through module-info | Stop promotion, fix immediately, add regression test |
| P2 local | Backend or frontend unavailable during validation | Stop deployment, inspect logs, restart process |
| P3 local | Proxy route broken but direct app route works | Fix route/proxy before promotion |
| P4 local | Dashboard/log query documentation drift | Update operational artifacts |

## RTO and RPO

| Target | Value | Rationale |
| --- | --- | --- |
| RTO | 15 minutes for local validation restore | `reliability-design` says service restart is sufficient |
| RPO | Not applicable | U01 has no persistent data |

## Communication

Local validation incidents are recorded in the current AI-DLC stage artifacts and kept out of customer-facing incident channels. If future stages introduce persistent data, production traffic, or external integrations, this plan must be revised before release.

## Post-Incident Review

Any repeated failure in backend health, frontend health, proxy routing, or sensitive metadata checks creates a follow-up implementation item. The review should identify whether the gap belongs in code, tests, CI gates, or observability.

