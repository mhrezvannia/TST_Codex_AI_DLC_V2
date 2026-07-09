# Code Summary - UOW-07 Outbox Publication and Event Status

## Files Modified

- `apps/reference-data/lib/service-clients.ts` - Mutation commands include correlation ids and normalized records expose `eventStatus: "unknown"` until backend publication status is wired.

## Key Decisions

- The BFF does not invent publication status; it exposes unknown until the reference-data-service provides real event status.
- Kafka/outbox work remains in the Java service boundary, not the browser app.

## Test Coverage

- Covered indirectly by Reference Data BFF TypeScript and service-client tests.

## Deviations

- Kafka publisher, Schema Registry adapter, and outbox persistence were not implemented because Docker/backend prerequisites are unavailable locally.
