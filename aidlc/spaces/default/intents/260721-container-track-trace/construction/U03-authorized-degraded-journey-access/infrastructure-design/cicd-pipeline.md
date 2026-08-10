# CI/CD Pipeline - U03 Authorized Degraded Journey Access

## Inputs and Checks

This pipeline implements U03 `performance-design.md`, `security-design.md`,
`scalability-requirements.md`, `reliability-design.md`, `logical-components.md`,
`components.md`, `services.md`, and `business-logic-model.md`.

Stages run build/unit/integration, auth/DTO/security/redaction checks, additive
Flyway verification, ten-request isolation proof, accessibility/Playwright
states, isolated Compose acceptance, and audits. Promotion is tagged and
reversible; volumes are never reset. Demo guard runs pre/post and final visual
acceptance waits for W2-02 merge/integration synchronization.

The isolated controller uses a distinct Compose project and volume namespace,
rejects destructive reset commands, and cannot stop or reconfigure the manager
demo. The W2-02 integration-sync check is a required prerequisite to final
visual acceptance, not a post-hoc note.
