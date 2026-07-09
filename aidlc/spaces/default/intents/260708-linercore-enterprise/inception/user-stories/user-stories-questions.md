# User Stories Plan - LinerCore Enterprise

## Persona Development Approach

Personas are derived from the enterprise requirements and existing business overview rather than re-interviewed. The persona set covers commercial users, booking users, operations/movement users, platform administrators, delivery/operations engineers, and quality/compliance reviewers.

## Story Format

Stories use: `As a [persona], I want [goal], so that [benefit]`.

Acceptance criteria use Given/When/Then-style bullets where practical. Each story includes priority, requirement trace, dependencies, and INVEST notes.

## Story Prioritization

Priorities use MoSCoW. The first enterprise release is expected to make all five E2E flows demonstrable locally; Delivery Planning will decide the final MVP boundary and Bolt sequence.

## Breakdown Approach

The story set is broken down by domain workstream and end-to-end flow:

- Shared Platform and security foundations.
- Charge Calculation, Customer Agreement, and D&D.
- Customer Booking.
- Container Movement Management.
- Frontend and operations.
- Local runtime, contracts, observability, and E2E validation.

## Embedded Questions

### Q1. Persona set

Which persona model should stories use?

A. Carrier commercial, booking, movement operations, platform admin, delivery/ops, quality/compliance  
B. One persona per module only  
C. One generic operations user plus admin  
D. Executive stakeholder personas only  
E. Defer persona detail to refined mockups  
X. Other (please specify)

[Answer]: A - Use a carrier-operations persona set covering business users, platform users, and delivery/quality reviewers.

### Q2. Story granularity

How should stories be sized before Units Generation?

A. Fine-grained implementation tickets  
B. Large epics only  
C. Workflow-level stories with acceptance criteria and explicit dependencies  
D. One story per requirement ID exactly  
E. One story per UI screen  
X. Other (please specify)

[Answer]: C - Use workflow-level stories that remain readable but can later split into units and Bolts.

### Q3. Walking skeleton story stance

Which stories should form the first Construction walking skeleton candidate?

A. Shared Platform-only reference data and auth  
B. Booking create to confirmed with pricing seam and `booking.confirmed` event into CMM journey creation  
C. Charge Agreement only  
D. Full UI without backend integration  
E. Runtime and observability only  
X. Other (please specify)

[Answer]: B - The walking skeleton candidate should prove auth/reference readiness, pricing seam, booking confirmation, `booking.confirmed`, and CMM journey creation/status visibility.

### Q4. UI story treatment

How should UI stories use the Claude UI export?

A. Preserve design/navigation direction while mapping to real business flows  
B. Copy prototype behavior exactly  
C. Use only as loose inspiration  
D. Defer UI stories until implementation  
E. Build mock UI without backend dependencies  
X. Other (please specify)

[Answer]: A - Preserve compatible design direction and replace prototype logic with real APIs, permissions, and events.

## Source Context

This plan consumes `requirements.md`, `business-overview.md`, `component-inventory.md`, and `team-practices.md`.

