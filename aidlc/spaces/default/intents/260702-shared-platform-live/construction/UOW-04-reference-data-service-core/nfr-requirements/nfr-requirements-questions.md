# NFR Requirements Questions - UOW-04 Reference Data Service Core

## Context

Consumes `business-logic-model`, `business-rules`, `requirements`, and `technology-stack`.

## Answers

- Mutation latency target: p95 under 750 ms locally excluding publication.
- Security target: all mutations require authorization and correlation id.
- Reliability target: persisted record/history/outbox are durable across restart.

