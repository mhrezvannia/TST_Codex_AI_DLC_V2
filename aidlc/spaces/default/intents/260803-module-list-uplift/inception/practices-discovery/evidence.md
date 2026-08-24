# W4-01 Practices Discovery Evidence

## Sources Scanned

- Active AI-DLC state and the six durable Reverse Engineering inputs: business overview, architecture, code structure, technology stack, dependencies, and code-quality assessment.
- Git branches, merge base, recent feature/fix/merge history, the W4 intent statement, and the program backlog branch, ownership, dependency, and merge protocol.
- Root workspace manifests, Turbo tasks, `compose.yaml`, the Wave A Compose wrapper, the quality-gate aggregator, and `.github/workflows/quality-gates.yml`.
- Representative indexed Java and TypeScript boundaries through the codebase knowledge graph, plus repository configuration and targeted source/config inspection where graph evidence was insufficient.

No tests, builds, coverage runs, scanners, Compose services, browser journeys, audits, or deployments were executed during this discovery. Runtime and enforcement claims therefore remain bounded to observed configuration.

## Pipeline and Deployment Finding

The repository uses a short-lived W4 intent branch and retains a program integration branch; the active branch's merge base predates the current `integ/main-reconciled`, making a pre-Construction resynchronization checkpoint necessary. The local topology is the isolated `linercore-wave-a` Compose project with deterministic wrapper, readiness, seed, live-acceptance, demo-guard, and evidence scripts. No production environment topology, production cadence, or independently proven rollback pipeline was found, so the affirmed deployment practice remains local acceptance plus explicit release gates.

## Quality Finding

JUnit, Vitest, Testing Library, Node test runner, Playwright, and axe provide broad test assets, and recent implementation commits commonly co-change tests. History cannot prove strict TDD, no repository-wide coverage threshold is configured, and specialized older percentages do not establish a W4 floor. The tracked GitHub Actions job and aggregator fail on normal required command failures, but branch-protection enforcement is not repository-visible; the catalog also lacks a Container Movement frontend gate, and the two audit detector steps are advisory unless converted into verdict-producing checks.

## Developer Finding

The code consistently uses strict TypeScript, shared ESLint and EditorConfig rules, Next.js App Router organization, feature-local BFF/client seams, and shared workspace packages. Java follows ports-and-adapters with framework-free domain cores, application orchestration and repository ports, adapter/container integration, service-owned databases, and exception/status translation at REST boundaries. TypeScript result handling and Java error envelopes vary by module, so discovery does not invent a universal result type, formatter, or error-envelope migration.

## DevSecOps Finding

Application-level authorization and targeted security behavior tests are stronger than pipeline security automation. The workflow uses narrow permissions, immutable Yarn installation, and a blocking high-severity Yarn advisory check, but no general SAST, DAST, secret, Maven vulnerability, IaC, image, SBOM, signing, or automated dependency-update controls were found. The required `u02-security` entry currently exits fail-closed because its pinned toolchain is absent; it must become operational or be replaced by a bounded executable equivalent before W4 merge, without mislabeling the pipeline security-complete.

## Questions Asked and Affirmed

The team affirmed five evidence gaps in `practices-discovery-questions.md`: resynchronize the W4 intent branch before Construction; use Reference Data as the gated first vertical slice; write tests alongside code with risk-based test-first use; add executable 80 percent changed-W4-frontend coverage and the complete blocking W4 evidence set; and repair or boundedly replace the non-operational required security gate before merge.

Deployment and code-style questions were not repeated because prior approved W4 constraints and repository evidence were conclusive: one shell, shared tokens, `@erp/ui` ownership, isolated live Compose acceptance, strict typed module code, and no unsupported production claim.

## Evidence Limits

Static repository evidence does not prove that GitHub branch protection requires the named job, that a self-hosted runner is isolated, that every gate currently passes, or that the live stack is healthy. Those facts must be observed during Delivery Planning, CI Pipeline, Build and Test, and the final W4 exit gate; any blocker remains `BLOCKED`, never rewritten as `PASS`.

