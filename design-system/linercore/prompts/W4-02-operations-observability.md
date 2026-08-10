# W4-02 UI/UX Pro Max Prompt — Operations & Observability

## Run at

Primary: Inception Refined Mockups (2.5) for dashboard hierarchy and operator
task flows, after metric/alert requirements are approved. Revalidate in Operation
Observability Setup (4.4) against live Grafana, Jaeger, and ELK data.

## Inputs

- `design-system/linercore/MASTER.md`
- `design-system/linercore/SESSION-PROMPT.md`
- `design-system/linercore/pages/operations-observability.md`
- `docs/intents/W4-02-operations-observability.md` and its complete Context Pack
- Event-contract observability requirements and current infrastructure descriptors

## Skill commands

```powershell
python .codex\skills\ui-ux-pro-max\scripts\search.py `
  "internal enterprise platform operations observability service health event lag traces alerts runbooks accessible data dense dashboard" `
  --design-system -p "LinerCore W4-02 Operations Observability" -f markdown

python .codex\skills\ui-ux-pro-max\scripts\search.py `
  "time series trend monitoring latency throughput" `
  --domain chart -n 8

python .codex\skills\ui-ux-pro-max\scripts\search.py `
  "operational alert dashboard accessibility color status" `
  --domain ux -n 8
```

## Append this to the shared session prompt

```text
Active intent: W4-02 Operations & Observability.

Design operator workflows in the mandated tools—Grafana dashboards, Jaeger trace
search/detail, ELK log search, alert details, and version-controlled runbooks. Do
not build a duplicate observability application inside the LinerCore shell. Use a
single correlation id as the navigation key across HTTP and Kafka spans, metrics,
and logs.

Define a platform overview plus service/HTTP and eventing dashboards. Prioritize
service availability, request latency/error rate, outbox publish lag, consumer lag,
dedupe count, retry state, and active alerts. Use line charts for trends, compact
stat panels only for current state, and tables for active alerts and affected
services. Every visual must include units, time range, threshold, legend, no-data
state, and non-color status meaning. Avoid animated streaming charts, gauges,
decorative KPI cards, and invented predictive metrics.

Produce dashboard wireframes/panel inventory, trace-to-log navigation flow,
alert-to-runbook recovery flow, no-data/stale/partial/error states, keyboard and
contrast checks, and an evidence plan for the forced CMM-consumer and Kafka
failures in the live Compose stack.
```
