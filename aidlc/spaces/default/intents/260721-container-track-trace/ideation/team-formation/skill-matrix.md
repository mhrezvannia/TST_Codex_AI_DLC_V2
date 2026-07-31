# Skill Matrix - W2-04

## Traceability

Skills derive from `scope-document.md`, `intent-backlog.md`, and
`feasibility-assessment.md`; ratings describe required coverage, not named
individual proficiency.

## Required coverage

| Skill | Need | Evidence / gap response |
|---|---|---|
| Container journey domain and lifecycle | Lead | Existing CMM aggregate; validate DCSA rules with domain review |
| Java/Spring transactional design | Lead | Existing services/outbox; pair on atomicity and rejection invariants |
| Kafka, Avro, AsyncAPI, consumer idempotency | Lead | W0/W1 seams and contracts; producer/consumer co-review |
| PostgreSQL/Flyway | Strong | Existing stores; require additive migration and restart proof |
| Next.js/TypeScript operational UI | Strong | Existing module/shell; synchronize W2-02 before final evidence |
| UI/UX and accessibility | Strong | `ui-ux-pro-max` plus LinerCore master/page contract |
| Playwright and live Compose acceptance | Lead | Existing scripts; one release reviewer controls serialized stack |
| Security, privacy, audit | Review | Existing RBAC/audit; verify least privilege and data minimization |

## Remediation and onboarding

Before coding, review the full Context Pack, Graphify/codebase-memory seams,
frozen contracts, W1 evidence history, and LinerCore UI rules. Use pairing or a
time-boxed enabling review for any weak area. Do not create a permanent
specialist team or external dependency without observed evidence.
