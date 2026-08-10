# Feasibility Questions

The answers below synthesize intent-statement.md, competitive-analysis.md, market-trends.md, and build-vs-buy.md.

## Answered Decisions

1. **Existing integrations:** Preserve the Yarn/Turbo React workspace, Java/Maven services, Booking BFF/backend, Keycloak, PostgreSQL, Kafka, schema registry, nginx edge, and current Compose contracts.
2. **Compliance:** Produce auditable WCAG-oriented interaction evidence, but make no new PCI, HIPAA, SOC 2, GDPR, or formal legal-conformance claim.
3. **Team stack and skills:** Work inside the existing TypeScript/React, Vitest/Testing Library, Playwright, ESLint, Docker Compose, and Java service conventions.
4. **Budget and timeline:** Use the smallest vertical closure; proof gates remain hard and are not exchanged for schedule.
5. **Organizational blocker:** The manager demo at 127.0.0.1:8088 is protected. Run demo:guard before and after and never operate on linercore-shared-platform.
6. **AWS landscape:** No AWS services, account changes, or provisioning are required or authorized for this local evidence intent.

## Ambiguity and Contradiction Review

- “Live” means the isolated linercore-wave-a Compose project with real Booking routes, not production deployment and not mocked frontend-only proof.
- The root package name linercore-shared-platform does not authorize using the Compose project of that name; scripts/wave-a-compose.mjs pins linercore-wave-a.
- The existing W1 waiver remains blocked/waived historical truth. A real W2-02 live pass is new evidence, never a rewrite of that record.
