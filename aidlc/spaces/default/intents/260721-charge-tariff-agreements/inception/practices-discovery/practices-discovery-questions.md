# Practices Discovery Questions — W2-03 Charge Tariffs & Agreements

Evidence sources: the six refreshed Reverse Engineering artifacts consumed by this stage, repository history, `docs/intents/00-INTENT-BACKLOG.md`, `.github/workflows/quality-gates.yml`, build/lint/test configuration, Compose/Wave A scripts, and the four pipeline, quality, developer, and DevSecOps scans.

## Q1. Way of Working

Which branch and merge practice should W2-03 affirm, given the program backlog and actual Wave A history differ from older generic main/squash rules?

- A. Keep `intent/W2-03-charge-tariffs-and-agreements` based on the common Wave A baseline, integrate through `integ/main-reconciled` under the backlog's dependency/merge protocol, and do not rewrite this as a global trunk policy (recommended)
- B. Ignore the program integration line and require a direct squash merge to `main`
- C. Pause until a new repository-wide branching standard is approved
- X. Other (please specify)
- `[Answer]:` A — Program integration (Recommended)

## Q2. Walking Skeleton

What should the first Construction slice prove?

- A. A gated risk-first Charge-to-Booking walking skeleton with one real approved rate line, stored Booking snapshot, and honest live-evidence status before expanding to the full OFR/BAF/THC journey (recommended)
- B. Skip a walking skeleton and build all layers in parallel before any integrated proof
- C. Treat the current hardcoded Charge page as the walking skeleton completion
- X. Other (please specify)
- `[Answer]:` A — Risk-first line (Recommended)

## Q3. Testing Posture

Which testing commitment should this feature adopt, given tests exist but no quantitative coverage floor is configured?

- A. Write tests alongside code, enforce at least 80% line coverage for changed Charge/Booking code, add Charge lint/build to blocking quality gates, and require domain, migration, contract, integration, Playwright, and live Compose evidence (recommended)
- B. Keep only the currently configured tests with no coverage target or new browser/live proof
- C. Require strict test-first TDD for every change despite no evidence that it is the team norm
- X. Other (please specify)
- `[Answer]:` A — Tests plus 80% (Recommended)

## Q4. Deployment

What deployment practice should W2-03 affirm from the evidence available?

- A. Validate through the isolated `linercore-wave-a` local Compose stack and manager-demo guards; make no production cadence, staging topology, or continuous-deployment claim without separate evidence (recommended)
- B. Treat CI quality execution as an existing production deployment pipeline
- C. Expand W2-03 to design and implement full staging/production deployment
- X. Other (please specify)
- `[Answer]:` A — Isolated Wave A (Recommended)

## Q5. Code Style and Architecture

Which code and boundary convention should W2-03 follow?

- A. Preserve Java ports-and-adapters and service-owned databases, feature-local strict TypeScript/Next.js patterns, shared auth/UI reuse, typed boundary outcomes/exceptions with correlation data, and Charge-owned pages only; do not impose an unobserved Result monad (recommended)
- B. Introduce a generic shared pricing platform and move domain behavior into shared UI/packages
- C. Replace typed outcomes with generic exceptions or string-only success maps
- X. Other (please specify)
- `[Answer]:` A — Preserve boundaries (Recommended)

## Q6. Security and Supply Chain

How should missing repository-wide AppSec automation be treated in this bounded feature?

- A. Preserve fail-closed profile/secret/session controls, pinned/immutable dependency installation, and least privilege; record missing SAST/DAST/secret/CVE/image/SBOM/signing automation as program debt unless a W2-03 change directly requires a targeted check (recommended)
- B. Expand W2-03 into a complete repository-wide DevSecOps modernization
- C. Ignore existing local-secret/profile risks and automation gaps
- X. Other (please specify)
- `[Answer]:` A — Preserve and record (Recommended)
