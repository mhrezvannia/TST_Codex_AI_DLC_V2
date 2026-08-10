# Tech Stack Decisions - U07 Live Release Acceptance

## Selections

| Concern | Selection | Rationale |
|---|---|---|
| Runtime | Docker Compose, PostgreSQL, Kafka, Confluent Schema Registry, nginx | Approved real local release environment. |
| Backend quality | Maven/Surefire/JUnit/Pact/Avro tests | Existing Java and contract gates. |
| Frontend quality | Yarn 4/Turbo, TypeScript, Vitest/Testing Library, Playwright | Existing lock/tooling plus browser/accessibility proof. |
| Load/evidence | Checked-in Node/PowerShell scripts, monotonic timers, CSV/JSON/Markdown/SHA-256 | Portable reproducible evidence. |
| Audits | Existing `.claude/skills/aidlc-audit` and `erp-fidelity-audit` detector scripts | Required runtime/fidelity exit gates. |

## Constraints

No fixture-only runtime, noop messaging, alternate package manager, destructive reset, edited detector output, proprietary load platform, or unpinned ad hoc dependency is introduced. Transient Maven mirror/TLS failures are retried online. Versions remain those in `technology-stack.md` and locks.

## Source Coverage

Decisions implement U07 `business-logic-model.md`, `business-rules.md`, and `requirements.md` using the complete `technology-stack.md`.
