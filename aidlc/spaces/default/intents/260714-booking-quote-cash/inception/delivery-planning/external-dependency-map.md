# External Dependency Map - W1-01 Booking Quote-to-Cash

## Dependency Stance

No external vendor, cloud environment, contractor, or separate human delivery team blocks local W1-01. The items below are controlled readiness dependencies owned by the user/Codex operating model. A failed readiness item is reported as BLOCKED with evidence; it is never replaced by mocks or called success.

## Controlled Readiness Items

| Item | Owner | Lead/check time | Blocks | Readiness proof | Mitigation/workaround |
|---|---|---|---|---|---|
| Docker Desktop engine, disk, required images | Codex checks; user controls host resources | Preflight before B01 | B01-B03 live DoDs | Engine/info, free-space, image inventory/pull output | Retry transient pulls; user frees storage/restarts Docker; no fake Compose success |
| PostgreSQL host port 55432 available | Codex | Preflight before B01 | B01-B03 | Port probe and Compose binding | Stop conflicting W1 process or choose another non-default port and record it; never use occupied 5432 |
| Kafka and Schema Registry healthy | Codex | B01 startup | B01-B03 broker evidence | Health, topics, subjects, compatibility mode | Diagnose image/network/config; local-noop cannot satisfy DoD |
| Disposable-local flat subject export/rebaseline approval | User already approved; Codex executes | Before B01 canonical registration | B01 | Export, fingerprints, deletion/re-registration evidence | Block if any non-local fingerprint appears |
| Active Reference Data fixtures | Codex applies W0-02 seeds | Before U02 inside B01 | B01 | API/seed active and inactive keys | Re-run idempotent seed; no direct DB ownership bypass |
| Approved active Charge agreement fixture | Codex | Before U03 inside B01 | B01-B03 | Charge API/DB fixture and provider proof | Apply through owned API/seed path; NO_RATE remains a tested business outcome, not skeleton success |
| Maven/npm dependency access via configured mirror/lockfiles | Codex; network external state | Before builds in each Bolt | Focused/broad quality gates | Online dependency resolution logs | Re-run transient TLS `bad_record_mac`; do not change trusted dependencies to hide network failure |
| User AI-DLC gate availability | User | At Delivery, B01, ladder, final gates | Phase/Bolt transitions | Audit decision rows | Park at clean boundary; never infer approval |
| Browser-capable local UI runtime | Codex | B01/B03 | Visible DoDs and accessibility proof | Health, Playwright/browser screenshots/interactions | Diagnose service/nginx/port; API-only proof cannot close UI acceptance |

## Non-Blocking Deferred Dependencies

- Production/staging infrastructure, TLS/SASL/ACL broker identity, and full JWT/RS256 auth remain later platform/W2-01 work under the recorded local-only waiver.
- Tariff persistence, D&D depth, broader movements, amendments, global shell/auth, capacity, invoicing, and payment remain later intents.
- No AWS Professional Services or external integration team is assumed.

## Escalation Rules

- Retry transient image/dependency transport errors with the same approved inputs.
- After a reproducible environment blocker, capture exact command/output and ask the user only for the host-state change Codex cannot make.
- Contract, migration, transaction, or non-local legacy-subject findings stop B01 and require explicit scope/governance resolution.
- Evidence paths live under `artifacts/w1-01-live/` and are indexed by B03.

## Source Coverage

Dependencies reflect runtime/quality constraints in `requirements.md`, story prerequisites in `stories.md`, UI runtime needs in `mockups.md`, service ownership in `components.md`, live DoDs in `unit-of-work.md`, blocking edges in `unit-of-work-dependency.md`, story seams in `unit-of-work-story-map.md`, and local Compose/branch/security practices in `team-practices.md`.
