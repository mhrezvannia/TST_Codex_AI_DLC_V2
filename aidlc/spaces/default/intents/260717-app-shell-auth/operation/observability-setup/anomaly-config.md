# Anomaly Config - W2-01 App Shell and Auth

## Upstream Inputs

This anomaly config consumes `performance-design`, `security-design`, `reliability-design`, `monitoring-design`, and `infrastructure-services`.

## Candidate Anomalies

| Signal | Baseline | Anomaly trigger |
| --- | --- | --- |
| Shell route 5xx rate | Near zero | Sudden sustained rise above static 1% threshold |
| Auth redirect failures | Near zero | Any sustained nonzero cluster over 5 minutes |
| Missing actor errors | Expected only for explicit expired/stale scenarios | Spike outside sign-out/stale-call proof |
| Deny decisions | Expected for denied actor scenario | Spike after deploy or deny on allowed actor |
| Evidence blockers | Zero for accepted release | Any blocker row in release proof |
| Audit detector failures | Zero | Any nonzero exit or unavailable detector |

## Current Status

Anomaly detection is not active. Base telemetry services are running, but application signals are absent and cannot establish a baseline. Until healthy metrics and log streams exist, static promotion blockers from the evidence package are authoritative and anomaly models must remain disabled.

## Activation Gate

Enable anomaly rules only after 14 days of representative non-production telemetry, zero unknown scrape gaps, and review of expected deny/sign-out traffic. Security-sensitive `local-user` and audit-detector signals remain static zero-tolerance alarms rather than learned anomalies.
