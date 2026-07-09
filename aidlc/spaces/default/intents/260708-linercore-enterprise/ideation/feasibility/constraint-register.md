# Constraint Register - LinerCore Enterprise

## Source Context

This register consumes:

- `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/intent-capture/intent-statement.md`
- `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/market-research/competitive-analysis.md`
- `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/market-research/market-trends.md`
- `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/market-research/build-vs-buy.md`

## Technical Constraints

| ID | Constraint | Source | Impact | Handling |
|----|------------|--------|--------|----------|
| TC-001 | Preserve explicit module boundaries. | Intent statement, Program Vision | Prevents domain collapse. | Keep Shared Platform, Charge/Agreement, Booking, CMM separate. |
| TC-002 | No service may query another service's domain database. | Intent statement, Enterprise Technical Environment | Forces API/event integration. | Use OpenAPI/events only. |
| TC-003 | Local runtime target is `docker compose --profile full up -d --build`. | Intent statement | Makes Compose parity mandatory. | Add runtime gates and profile tests. |
| TC-004 | One local PostgreSQL container may host multiple logical databases/users. | Intent statement | Simplifies local infrastructure while preserving ownership. | Create per-service logical DBs and users. |
| TC-005 | Kafka, Schema Registry, Keycloak, reverse proxy, services, frontends, and observability support must run locally. | Intent statement | Raises infrastructure complexity. | Decompose profiles and health checks. |
| TC-006 | Graphify is the primary codebase-understanding layer. | Intent statement | Shapes discovery and architecture decisions. | Use `graphify query`, `explain`, `path` before broad decisions. |
| TC-007 | codebase-memory MCP is secondary when available. | Intent statement | Avoids over-reliance when no MCP resources are exposed. | Record current MCP unavailability and retry in later sessions. |
| TC-008 | Raw Claude UI HTML/screenshots are not fully graph-indexed by exact source path. | Enterprise gap summary | UI requirements need careful interpretation. | Normalize UI requirements before implementation. |

## Business and Scope Constraints

| ID | Constraint | Source | Impact | Handling |
|----|------------|--------|--------|----------|
| BC-001 | Historical Shared Platform MVP is immutable. | Intent statement | Prevents workflow history corruption. | Never reopen, overwrite, or reuse `260630-shared-platform`. |
| BC-002 | Complete enterprise target includes Operation. | Intent statement | Operation cannot be skipped. | Keep all 32 enterprise stages active. |
| BC-003 | Do not reduce enterprise scope to Shared Platform only. | Intent statement | Prevents false narrowing. | Track all four workstreams. |
| BC-004 | Build core domains rather than buying a whole suite. | Build-vs-buy | Confirms engineering investment. | Buy/adopt only commodity or network-heavy parts. |
| BC-005 | Preserve visual direction from Claude UI where possible. | Intent statement | UI must align with prototype quality. | Replace prototype logic with real behavior. |

## Integration Constraints

| ID | Constraint | Source | Impact | Handling |
|----|------------|--------|--------|----------|
| IC-001 | Implement `booking.confirmed` from Booking to CMM. | Enterprise contracts | Required for journey creation. | Avro/AsyncAPI/message-pact and outbox. |
| IC-002 | Implement `containermovement.status` from CMM to Booking. | Enterprise contracts | Required for Booking lifecycle updates. | Avro/AsyncAPI/message-pact and consumer idempotency. |
| IC-003 | Implement pricing APIs between Booking and Charge. | Enterprise contracts | Required for booking pricing and D&D results. | OpenAPI/Pact, timeouts, retries, circuit breakers. |
| IC-004 | Maintain correlation ID across APIs/events. | Enterprise Technical Environment | Required for traceability. | Common middleware/envelope. |
| IC-005 | Apply backward compatibility for schemas. | Enterprise contracts | Required for safe evolution. | Schema Registry compatibility checks. |

## Compliance and Security Constraints

| ID | Constraint | Source | Impact | Handling |
|----|------------|--------|--------|----------|
| SC-001 | Use Keycloak/OIDC and JWT/RS256. | Enterprise Technical Environment | Defines authn/authz foundation. | Keycloak integration and token validation. |
| SC-002 | Enforce least privilege and service authorization. | Intent statement, compliance scan | Required for enterprise readiness. | Capability model, service policies, Kafka ACLs. |
| SC-003 | Protect customer/party PII and commercial pricing data. | Compliance scan | Requires data classification and audit. | Classify stores, restrict access, log sensitive events. |
| SC-004 | Data residency/trade footprint remains deferred. | Program Vision, feasibility scan | Blocks final deployment policy until resolved. | Carry open question into NFR and Operation stages. |
| SC-005 | Completion requires evidence, not assertion. | User instruction, compliance principle | Blocks fake readiness. | Tests, contract reports, health checks, logs, runbooks. |

## Organizational Constraints

| ID | Constraint | Source | Impact | Handling |
|----|------------|--------|--------|----------|
| OC-001 | Trunk-based development on `main`. | Project/team memory | Shapes delivery and worktrees. | Short-lived Bolt branches. |
| OC-002 | Stage gates require human approval. | AI-DLC protocol | Controls advancement. | Stop at gates. |
| OC-003 | Existing older project rules include Shared Platform and Charge-specific decisions. | Project memory | Some rules are historical, not enterprise-wide. | Preserve valid decisions but avoid over-applying narrow old scope. |
| OC-004 | Graphify update should run after major changes. | Intent statement | Keeps code graph current. | Run `graphify . --update` or fallback after major edits. |

## Constraint Watchlist

- External finance API contract depth is not yet fixed.
- Vessel schedule/capacity source remains open.
- Trade/regulatory footprint remains open.
- Customer types beyond MVP remain open.
- Whether module child intents should be spawned immediately remains open for Scope Definition/Delivery Planning.
