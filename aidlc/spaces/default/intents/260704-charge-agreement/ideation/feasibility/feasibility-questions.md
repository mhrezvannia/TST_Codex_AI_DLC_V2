# Feasibility Questions - Charge & Customer Agreement

## Q1. What existing systems must this integrate with?

A. Shared Platform identity-service, reference-data-service, Postgres, local reverse proxy, and future Booking module.
B. Only a static local JSON file.
C. External carrier rate marketplace only.
D. External ERP only.
E. None.
X. Other (please specify)

[Answer]: A

## Q2. What is the current technology stack?

A. Java 21, Spring Boot, Maven multi-module services, Next.js App Router, TypeScript, Yarn/Turborepo, Postgres, Docker Compose target, host-runtime fallback.
B. Python/FastAPI only.
C. .NET and Angular.
D. Rails monolith.
E. No existing stack.
X. Other (please specify)

[Answer]: A

## Q3. What compliance and security constraints apply first?

A. Internal commercial data, customer identifiers, role-based authorization, auditability of approval changes, and no unsafe non-local auth bypass.
B. PCI cardholder data.
C. HIPAA PHI.
D. Public anonymous data only.
E. No controls required.
X. Other (please specify)

[Answer]: A

## Q4. What environment constraints affect delivery?

A. Host-runtime works now; Docker/Compose is still blocked by Docker Desktop/C drive/containerd issues and must be recovered separately.
B. Cloud production is already provisioned.
C. No local runtime exists.
D. Only Docker works.
E. Only static UI can run.
X. Other (please specify)

[Answer]: A

## Q5. What is the preferred implementation approach?

A. Build a small vertical slice with backend domain/API/persistence, UI list/detail/edit/approve, tests, and active-agreement lookup for Booking.
B. Build all advanced RMS capabilities before any UI.
C. Build UI only.
D. Build backend only.
E. Buy a full product and stop implementation.
X. Other (please specify)

[Answer]: A
