# Deployment Execution Questions - W1-01

## Questions And Answers

### Q1. Are all pre-deployment checks passing?

A. Preflight and Compose config pass; full deployment is blocked at image pull
B. All pre-deployment and deployment checks pass
C. Preflight fails
D. Compose config fails
E. Unknown
X. Other (please specify)

[Answer]: A

Rationale: `cd-config`, `deployment-strategy`, `environment-inventory`, and `build-test-results` all require a full live acceptance run. The fresh run `operation-deployment-execution` passed preflight and Compose config, then blocked at `compose-start`.

### Q2. Are database migrations required and tested?

A. Existing migrations are covered by build-test-results; no new migration was executed in this blocked deployment run
B. New migration executed successfully
C. New migration failed
D. Migration was skipped without evidence
E. Unknown
X. Other (please specify)

[Answer]: A

Rationale: Build and Test recorded Maven/Flyway coverage. The deployment run did not reach service startup or migration execution because Docker failed while pulling observability images.

### Q3. Are dependent services available and healthy?

A. Partial prior local stack is running, but required nginx full-stack user path is not healthy
B. All dependencies are healthy through nginx
C. No dependencies are running
D. Kafka and PostgreSQL are unavailable
E. Unknown
X. Other (please specify)

[Answer]: A

Rationale: `docker compose ps` showed core/app services running from earlier work, and direct Booking app/service checks returned HTTP 200, but the required nginx `8088` probe failed.

### Q4. What is the deployment window?

A. Manual local release-proof window after Docker image/proxy access is fixed
B. Automatic deployment on merge
C. Production emergency deployment now
D. No deployment window required
E. Unknown
X. Other (please specify)

[Answer]: A

Rationale: The deployment strategy requires manual proof and approval, not automatic production deployment.

## Open Follow-Ups

- Restore Docker HTTPS/proxy access to `docker.elastic.co` or pre-cache the Elastic observability images, then rerun `node scripts/w1-live-acceptance.mjs --run-id <new-id>`.
- Start nginx/full profile successfully before claiming user-path smoke success through `http://localhost:8088/bookings`.
