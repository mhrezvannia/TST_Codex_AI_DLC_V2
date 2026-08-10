# Build and Test Memory

## Interpretations
- 2026-07-26T11:49:00Z — JSDOM and Testing Library can exercise the real component's polling and Retry behavior in-process without Vite workers; it remains bounded evidence rather than browser acceptance.
- 2026-07-26T11:45:00Z — An in-process TypeScript/React server-render of the real component is valid bounded smoke evidence, but it does not substitute for Vitest effects/interactions or Playwright acceptance.
- 2026-07-26T11:39:00Z — Spring transaction propagation can be proven without a database engine by recording independent JDBC connections, update, commit, and rollback calls through the production repository proxy.
- 2026-07-26T11:28:10Z — Build and Test evidence is traced to every U01/U02/U03 `code-generation-plan.md` and `code-summary.md`; those upstream artifacts define the executable scope and bounded limitations.
- 2026-07-26T11:23:26Z — The engine-resolved `build-test-results.md` is canonical; `test-results.md` remains a compatibility pointer because the stage prose uses the older name.
- 2026-07-26T11:23:26Z — A complete Maven `BUILD SUCCESS` summary is valid backend evidence even though the outer shell wrapper timed out after Maven completed; the wrapper timeout remains disclosed.
- 2026-07-22T00:00:00Z — Standard strategy requires unit and integration coverage; performance and security are applicable because approved NFR artifacts exist.
## Deviations
- 2026-07-26T11:41:00Z — Dependency advisory lookup remained blocked after the permitted retry (`ETIMEDOUT`, then pre-TLS `ECONNRESET`); no third attempt or clean scan claim was made.
- 2026-07-26T11:39:00Z — The first rollback test used H2, but the uncached artifact could not be written to the machine Maven repository; it was replaced with a no-new-dependency recording DataSource rather than weakening or skipping the assertion.
- 2026-07-26T11:23:26Z — Live Compose, Playwright, and performance execution were not attempted after the required pre-guard failed with sandbox `spawnSync docker EPERM`.
- 2026-07-22T00:00:00Z — Live Compose is deferred to isolated acceptance evidence so port 8088 and the manager demo remain protected.
## Tradeoffs
- 2026-07-26T11:49:00Z — The in-process interaction harness mirrors the blocked Vitest cases while excluding layout, keyboard traversal, and real network/browser behavior that only Playwright can prove.
- 2026-07-26T11:45:00Z — The frontend smoke uses installed TypeScript and React APIs without worker subprocesses, preserving executable component evidence while keeping the blocked interaction scope explicit.
- 2026-07-26T11:39:00Z — The recording DataSource proves propagation and commit/rollback ordering deterministically, while real PostgreSQL durability remains part of guarded live integration.
- 2026-07-26T11:23:26Z — Turbo was redirected to the project-local `.turbo-cache` instead of changing machine permissions or repository dependencies.
- 2026-07-26T11:23:26Z — No npm lockfile was created for advisory scanning; the repository's Yarn audit command was used and its registry timeout was recorded.
- 2026-07-22T00:00:00Z — Bounded local Maven/Node checks are preferred over dependency or infrastructure changes that would broaden scope.
## Open questions
- 2026-07-26T11:39:00Z — Docker Desktop engine access is denied both from the Node guard and direct shell inspection; live evidence requires an environment with access to the isolated engine.
- 2026-07-26T11:23:26Z — Re-run frontend Vitest/build, dependency audit, guarded live integration, Playwright, and performance evidence in an environment that permits child-process and Docker execution.
- 2026-07-22T00:00:00Z — Confirm exact local dependency-cache availability and integrated W2-02 synchronization before visual acceptance.
