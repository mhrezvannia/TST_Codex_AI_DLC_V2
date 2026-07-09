# Intent Capture Questions - Charge & Customer Agreement

## Q1. What business problem are we solving?

A. Commercial teams need a working place to define customer agreements and rate terms for liner shipping charges.
B. Operations needs charge data only as reference values for downstream booking.
C. Finance needs invoice-ready charge calculation immediately.
D. The project only needs static demo screens for now.
E. The project should replace the Shared Platform reference-data service.
X. Other (please specify)

[Answer]: A

## Q2. Who is the primary customer for this module?

A. Internal commercial/pricing users who manage customer agreements and charges.
B. External shippers directly self-managing their agreements.
C. Finance users approving invoices.
D. Operations users planning vessel/container movement.
E. Platform administrators maintaining reference data.
X. Other (please specify)

[Answer]: A

## Q3. What does success look like for the first completed module slice?

A. A user can create, view, update, and approve a customer agreement with validity windows and charge terms.
B. A user can only view seeded agreements.
C. The module only exposes backend APIs, with no UI.
D. The module only exposes UI mockups, with no backend persistence.
E. The module must include full invoice settlement and revenue accounting.
X. Other (please specify)

[Answer]: A

## Q4. Which Shared Platform capabilities should this module consume?

A. Identity/auth bypass for local development, reference data for customers/charges/currency/locations/trade lanes, and local readiness evidence.
B. Only identity.
C. Only reference data.
D. None; duplicate shared data in this module.
E. Only Docker Compose infrastructure.
X. Other (please specify)

[Answer]: A

## Q5. What is explicitly out of scope for this module?

A. Customer Booking, Container Movement, invoice settlement, payment collection, and rebuilding Shared Platform.
B. Nothing; all LinerCore modules should be implemented inside this module.
C. Only UI is out of scope.
D. Only backend APIs are out of scope.
E. Shared Platform integration is out of scope.
X. Other (please specify)

[Answer]: A

## Q6. What triggered this initiative now?

A. Shared Platform is locally functional enough to unblock the first business module in the remembered roadmap.
B. A regulatory deadline requires immediate production deployment.
C. A third-party pricing tool has been selected and needs integration only.
D. The current priority is infrastructure migration.
E. The current priority is replacing authentication.
X. Other (please specify)

[Answer]: A
