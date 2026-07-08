# Infrastructure Services - U04 Reference Event Outbox

## PostgreSQL Outbox

PostgreSQL is the durable queue and status store. Indexes cover status, `nextAttemptAt`, claimed state, reference set, record id, event id, created time, occurred time, and recovery timeout. Claiming uses `SKIP LOCKED` or equivalent concurrency guard.

## Kafka

Kafka is the event transport for typed reference-change events. Publication is at-least-once. Event id remains stable across retries and supports consumer deduplication.

## Schema Registry

Confluent Schema Registry governs Avro 1.11 schemas and compatibility. Serialization/schema failures are permanent unless a schema/configuration fix changes the cause.

## Status API

Status APIs query outbox/status projections by event id, record id, reference set, status, and time range. Responses expose safe lifecycle state, attempts, timestamps, correlation id, and broker metadata where safe.

## Secrets

Non-local Kafka, Schema Registry, PostgreSQL, and telemetry credentials use Vault references. Logs and status APIs do not expose broker secrets, payload secrets, raw stack traces, or unsafe payload internals.

## Source Trace

This design implements constraints from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.
