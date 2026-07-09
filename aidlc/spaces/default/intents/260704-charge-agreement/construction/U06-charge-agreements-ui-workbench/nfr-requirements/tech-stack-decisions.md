# Tech Stack Decisions - U06

## Source Alignment

Consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.

## Decisions

Use Next.js App Router, React 18, TypeScript strict mode, Vitest, and React Testing Library through Yarn/Turborepo.

## Rationale

This matches `apps/auth` and `apps/reference-data` patterns and avoids new frontend infrastructure.

## Review

Verdict: READY

Inline architecture review completed because the configured reviewer subagent model is unavailable. U06 NFRs include accessibility, error preservation, and BFF security boundaries.
