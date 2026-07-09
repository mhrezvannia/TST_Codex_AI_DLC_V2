# Escalation Matrix - Charge Agreement Walking Skeleton

## Source Alignment

This artifact consumes `dashboards`, `alarms`, `reliability-design`, `security-design`, and `deployment-architecture`.

## Ownership

| Area | Primary Owner | Backup | Escalation Trigger |
| --- | --- | --- | --- |
| Backend local runtime | Developer/operator running validation | Platform maintainer | Backend unavailable after restart |
| Frontend local runtime | Developer/operator running validation | Frontend maintainer | Typecheck/build or health failure persists |
| Proxy route | Platform maintainer | Developer/operator running validation | `/charge-agreements/` route cannot reach app |
| Sensitive metadata | Developer/operator running validation | Security reviewer | Any secret/customer/business payload exposure |

## Escalation Rules

- P1 local issues block promotion until fixed and tested.
- P2 local issues block deployment execution but do not trigger production incident processes.
- P3 local issues block route-based validation but can continue direct backend/frontend diagnostics.
- Production escalation is not active for U01 because `deployment-architecture` is local-only.

## Contact Surface

No named on-call rotation is configured in the repository. Until that exists, the person running the validation owns triage and records evidence in the AI-DLC artifacts.

