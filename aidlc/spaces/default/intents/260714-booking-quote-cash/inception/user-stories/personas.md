# Personas - W1-01 Booking Quote-to-Cash

## Primary Persona - Customer-Service Booking Agent

**Role:** Internal carrier booking-desk user responsible for turning a customer request into a commercially valid confirmed booking.

**Goals:** Create the booking once, identify invalid reference data before it causes rework, obtain a trustworthy itemized agreement quote, confirm without duplicate actions, and see that operations received the booking.

**Pain points:** Re-entering data across systems, opaque validation codes, guessed or stale charges, confirmation that appears successful while downstream handoff failed, and status pages that lose context after refresh.

**Working context:** Repeated operational use on desktop with occasional narrower viewports; scans compact tables and detail rails; may recover from slow services, manual-pricing cases, and pending event propagation. Needs stable `/bookings`, `/bookings/new`, and `/bookings/{bookingId}` locations, keyboard access, explicit state, and correlation-friendly support evidence.

## Secondary Persona - Intent Release Reviewer

**Role:** Accountable reviewer who decides whether the vertical intent is safe to merge based on observable behavior and deterministic evidence; this is a role, not an invented named team member.

**Goals:** Reproduce the one-booking journey, inspect exact contracts and real Kafka topics, prove idempotency/restart behavior, verify quality/audit results, and locate all evidence without interpreting optimistic logs.

**Pain points:** Green unit tests that hide broken Compose wiring, local-noop messages presented as broker proof, duplicate journey effects after replay, inconsistent contract copies, and evidence scattered across terminals.

**Working context:** Runs the canonical Compose profile with PostgreSQL on a non-default host port, exercises API/UI and broker tooling, inspects service databases, and reads machine-verifiable artifacts under `artifacts/`.

## Relationships and Priority

The customer-service agent is the primary value recipient and owns stories US-W1-001 through US-W1-005. The intent release reviewer owns US-W1-006 and US-W1-007 and protects the same customer outcome by preventing unreliable integrations from merging. Booking drives the journey; Charge, CMM, Reference Data, Kafka, and Schema Registry are collaborating systems rather than additional human personas.

## Upstream Sources

Personas derive from `requirements.md`, `business-overview.md`, `component-inventory.md`, and `team-practices.md`.
