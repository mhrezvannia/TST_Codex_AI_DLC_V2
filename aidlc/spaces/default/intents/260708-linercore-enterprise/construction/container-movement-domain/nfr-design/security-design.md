# Security Design - container-movement-domain

## Source Context

This artifact consumes `security-requirements.md`, `performance-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

CMM protects operational movement facts, journey status, and event publication while keeping Booking and Charge ownership boundaries intact.

## Security Controls

| Surface | Control |
|---|---|
| Journey/status/history APIs | Keycloak/JWT and capability checks for view and history actions. |
| Movement capture | Authenticated user or service identity, DCSA validation, idempotency, and audit. |
| `booking.confirmed` consumption | Service identity, schema version, event identity, booking revision, and deduplication. |
| `containermovement.status` publication | Producer identity, correlation ID, schema version, deduplication, and contract evidence. |
| Manual correction | Capability check, reason, subject, prior fact linkage, and audit. |
| Database boundary | No Booking or Charge database reads. |

## Boundary Enforcement

CMM does not decide D&D relevance, mutate Booking lifecycle, calculate pricing, calculate D&D, or expose hidden Booking/Charge state. Requests requiring those outcomes are rejected or returned as typed boundary errors.

## Audit Design

Movement capture, validation failure, status derivation, event consumption, publication, and manual correction actions emit audit/evidence with subject or service identity, journey id, equipment, event id, decision, reason, correlation ID, and timestamp.

## Traceability

| Source | Design response |
|---|---|
| `security-requirements.md` | Implements authentication, authorization, event security, audit, boundary rules, and database isolation. |
| `performance-requirements.md` | Keeps security checks in bounded movement capture, query, and event paths. |
| `scalability-requirements.md` | Scales identity, deduplication, audit, and boundary controls across journeys, movements, snapshots, and users. |
| `reliability-requirements.md` | Prevents forged, duplicate, out-of-order, and invalid movement events from corrupting status. |
| `tech-stack-decisions.md` | Uses Keycloak/JWT, Java/Spring, PostgreSQL, Kafka, Schema Registry, OpenAPI, and message-pact. |
| `business-logic-model.md` | Implements authorized movement capture, validation, status derivation, publication, and boundary workflows. |
