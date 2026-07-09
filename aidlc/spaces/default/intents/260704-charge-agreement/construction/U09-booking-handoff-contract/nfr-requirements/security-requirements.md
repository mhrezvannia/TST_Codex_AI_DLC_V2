# Security Requirements - U09

## Source Alignment

Consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.

## Controls

Future Booking must call the REST API with correlation/auth context and must not read Charge Agreement tables directly.

## Data Exposure

Lookup response returns only agreement/term fields needed for Booking.
