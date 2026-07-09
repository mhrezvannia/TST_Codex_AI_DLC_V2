# Application Design Questions - Charge & Customer Agreement

## Q1. What backend boundary should be used?

A. Add `services/charge-agreement-service` as a separate bounded-context service.
B. Put Charge Agreement into reference-data-service.
C. Put Charge Agreement only in the frontend.
D. Wait for Booking and combine both.
E. Buy an external RMS instead.
X. Other (please specify)

[Answer]: A

## Q2. What frontend boundary should be used?

A. Add `apps/charge-agreements` as a Next.js App Router workspace.
B. Add screens into `apps/reference-data`.
C. Static HTML only.
D. No UI.
E. Mobile native app.
X. Other (please specify)

[Answer]: A

## Q3. What communication style should be first?

A. Synchronous REST for CRUD and active lookup; event seam for later agreement-changed publication.
B. Kafka-only from day one.
C. Direct database reads from Booking.
D. GraphQL-only.
E. File export/import only.
X. Other (please specify)

[Answer]: A
