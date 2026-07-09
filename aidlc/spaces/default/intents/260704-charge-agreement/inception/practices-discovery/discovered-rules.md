# Discovered Rules - Charge & Customer Agreement

## Mandated

ALWAYS build Charge & Customer Agreement as a separate business module after Shared Platform and before Customer Booking.
ALWAYS keep backend domain-core free of Spring, persistence, messaging, and frontend dependencies.
ALWAYS add tests for agreement lifecycle, charge-term validation, API behavior, UI workflows, and active lookup before declaring the module complete.
ALWAYS consume Shared Platform reference data by stable IDs rather than duplicating customer, charge-code, currency, location, commodity, or trade-lane records.
ALWAYS keep local auth bypass development-only and prevent unsafe non-local bypass behavior.
ALWAYS document Docker/Compose health separately from host-runtime readiness evidence.

## Forbidden

NEVER expand the first Charge Agreement slice into full RMS, public tariffs, spot-rate marketplace, index-linked pricing, carrier connectivity, invoicing, or payment settlement.
NEVER ship the Charge Agreement UI as view-only and call the module complete.
NEVER start Customer Booking implementation before approved active-agreement lookup is implemented and verified.
NEVER hide Docker, Kafka, Schema Registry, or Keycloak blockers as successful local readiness evidence.
