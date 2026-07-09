# Tech Stack Decisions - U01

## Source Alignment

Consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.

## Decisions

| Area | Decision |
| --- | --- |
| Backend | Java 21, Spring Boot 3.3.7, Maven reactor. |
| Frontend | Next.js 15, React 18, TypeScript 5, Yarn/Turborepo. |
| Runtime | Host-runtime ports `8084` and `3002`; proxy `/charge-agreements/`. |

## Rationale

Use the repo's existing Shared Platform patterns to minimize integration risk.

## Review

Verdict: READY

Inline architecture review completed because the configured reviewer subagent model is unavailable. U01 NFRs are appropriately limited to skeleton health, visibility, and local runtime honesty.
