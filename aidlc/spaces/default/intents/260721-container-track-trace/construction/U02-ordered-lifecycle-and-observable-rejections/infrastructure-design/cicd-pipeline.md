# CI/CD Pipeline - U02 Ordered Lifecycle and Observable Rejections

## Inputs and Checks

This pipeline implements U02 `performance-design.md`, `security-design.md`,
`scalability-design.md`, `reliability-design.md`, `logical-components.md`,
`components.md`, `services.md`, and `business-logic-model.md`.

Stages run build/unit/integration tests, Avro/AsyncAPI/Pact compatibility,
static/security/type checks, additive Flyway upgrade, deterministic duplicate/
out-of-sequence and ten-delivery Booking proofs, fail-once publisher/consumer
fixtures, isolated Compose/Playwright acceptance, and evidence audits. Promotion
uses tagged reversible images/config; volumes are never reset. W2-02 merge and
integration sync precede final visual acceptance; demo guard runs pre/post.

