# Reliability Requirements - U05

## Source Alignment

Consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.

## Reliability

Errors use stable HTTP statuses and payload shape. No-match lookup returns HTTP 200 with `matched=false`.

## Degradation

Reference-data or database outage returns a clear 503 where applicable.

## Enterprise SLO

| Target | Requirement |
| --- | --- |
| API availability | Production API SLO is 99.5% monthly excluding scheduled maintenance. |
| Error budget | 5xx responses stay below 0.5% of requests per rolling 30 days. |
| Timeout budget | API gateway and service timeouts are configured so client-visible failures occur within 5 seconds. |
| Audit retention | Request correlation IDs and status-change audit events remain queryable for at least 7 years through the activity/audit store. |
