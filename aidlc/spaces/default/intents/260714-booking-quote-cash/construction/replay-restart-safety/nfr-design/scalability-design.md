# Scalability Design - U06 Replay and Restart Safety

## Bounded Catch-up

Three partitions/concurrency3, poll/batch50, Hikari10 and <=256KiB records bound duplicate/restart bursts. Consumer group resumes committed offsets but receipts/business constraints handle redelivery. Relay/listener expose lag and stop increasing concurrency when pool wait/RSS thresholds fail.

Receipts/outbox >=30d, audit >=90d, DLT7d/10k. The 100-delivery duplicate test must preserve exact business counts, drain lag30s and meet pool/RSS limits. Restart scripts wait bounded readiness rather than launching repeated catch-up processes.

## Source Coverage

Design realizes `scalability-requirements.md` with `performance-requirements.md`, `security-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and U06 `business-logic-model.md`.
