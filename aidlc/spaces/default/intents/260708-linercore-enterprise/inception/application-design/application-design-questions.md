# Application Design Questions - LinerCore Enterprise

## Source Context

This support artifact consumes `requirements.md`, `stories.md`, `architecture.md`, `component-inventory.md`, and `team-practices.md`. It records design choices used to produce `components.md`, `component-methods.md`, `services.md`, `component-dependency.md`, and `decisions.md`.

Graphify was used before broad architecture decisions through query, explain, and path. It confirmed existing identity, reference-data, and charge-agreement components, and it showed no reliable direct service dependency between Reference Data and Charge Agreement. Booking and Container Movement Management remain missing as implemented services in `component-inventory.md`.

## Questions And Decisions

### Q1. Component boundary strategy

Options:

A. Collapse all enterprise domains into one service.  
B. Keep Shared Platform, Charge, Booking, CMM, UI, runtime, and contracts as explicit components.  
C. Extend Shared Platform to own Booking/CMM workflows.  
D. Treat UI as the only integration layer.  
X. Other.

[Answer]: B - Preserve explicit module boundaries and keep all cross-module access through APIs/events.

### Q2. Backend architectural style

Options:

A. One modular monolith.  
B. Separate Spring Boot services using the existing service-module pattern.  
C. Serverless-first.  
D. Frontend-only prototype.  
X. Other.

[Answer]: B - Use separate Java/Spring services with domain-core, application-service, dataaccess, messaging, container, and published-language modules.

### Q3. Service communication pattern

Options:

A. Synchronous REST only.  
B. Asynchronous events only.  
C. REST for request/response pricing and Kafka events for lifecycle/status publication.  
D. Direct database integration.  
X. Other.

[Answer]: C - Use synchronous HTTP/OpenAPI/Pact for Booking to Charge pricing calls and asynchronous Kafka/Avro/AsyncAPI/message-pact for `booking.confirmed` and `containermovement.status`.

### Q4. Data ownership

Options:

A. One shared database/schema for all services.  
B. Separate logical databases/users per service in one local PostgreSQL container.  
C. Cross-service SQL joins are allowed for local runtime only.  
D. Store all business state in Kafka.  
X. Other.

[Answer]: B - Use separate logical databases and users; no service reads another service's domain database.

### Q5. Frontend topology

Options:

A. Keep only existing apps and add no integrated enterprise shell.  
B. Create one integrated enterprise Next.js shell with module routes, reusing existing packages and app code where practical.  
C. One separate frontend per backend service only.  
D. Keep Claude HTML as the frontend.  
X. Other.

[Answer]: B - Create an integrated enterprise shell for the complete operating experience while reusing existing app/package patterns.

### Q6. Runtime topology

Options:

A. Remote runtime servers required.  
B. Local Docker Compose full profile plus independent dev profiles.  
C. Host-only runtime.  
D. Documentation-only runtime.  
X. Other.

[Answer]: B - Local Compose must support `core`, `app`, `observability`, `devtools`, and `full`, with IDE development modes.

