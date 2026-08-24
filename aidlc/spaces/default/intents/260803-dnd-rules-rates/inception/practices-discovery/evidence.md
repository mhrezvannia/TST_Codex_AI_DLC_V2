# Practices Discovery Evidence - W3-01

**Scanned sources:** [code-structure.md](../../../codekb/TST_Codex_W3-01/code-structure.md), [technology-stack.md](../../../codekb/TST_Codex_W3-01/technology-stack.md), [dependencies.md](../../../codekb/TST_Codex_W3-01/dependencies.md), [code-quality-assessment.md](../../../codekb/TST_Codex_W3-01/code-quality-assessment.md), [architecture.md](../../../codekb/TST_Codex_W3-01/architecture.md), and [business-overview.md](../../../codekb/TST_Codex_W3-01/business-overview.md)

## Pipeline and delivery finding

Git evidence shows an intent branch and prior merge-oriented Wave A integration. GitHub Actions runs on PR/push with immutable Yarn installation, Maven tests, contract checks, workspace test/typecheck/lint/build, dependency audit, Compose validation and audit helpers. Deployment evidence stops at local Compose; no production topology or automated promotion is established.

## Quality finding

The repository uses JUnit/Surefire for Java and Vitest/Testing Library/Playwright/axe for the frontend. Test files and recent commits support risk-based tests alongside code, not provable strict TDD. The 80% changed-code floor exists in affirmed/project evidence but is not visibly enforced repository-wide, so the user explicitly affirmed it for touched W3-01 Charge code.

## Developer finding

The graph and source show Java ports-and-adapters modules, framework-free domain checks, named services/controllers/repositories/exceptions, strict TypeScript/Next route conventions, typed exceptions and boundary DTO translation with correlation data. W3-01 fits the existing Charge seam; Booking and Container Movement retain their bounded ownership.

## Security finding

The workflow has constrained permissions, high-severity Yarn dependency auditing and a required security aggregator, but the custom scanner gate currently exits fail-closed because pinned scanners are not integrated. No executable SAST, DAST, secret-scanning, Maven CVE, image/IaC scanning, SBOM/signing, Dependabot or Renovate configuration was found. The user affirmed fail-closed disclosure rather than a waiver or feature-scope security-platform rollout.

## Interviewed gaps

The user affirmed: 80% changed-line coverage for touched Charge backend/UI code; isolated local Compose acceptance with no production claims; and no green release/security claim until required gates actually execute or an approved policy resolves them.

