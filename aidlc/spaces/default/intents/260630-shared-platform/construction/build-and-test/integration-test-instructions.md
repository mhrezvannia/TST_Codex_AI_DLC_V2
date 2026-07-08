# Integration Test Instructions - Shared Platform MVP

## Scope and Inputs

The Standard test strategy requires key boundary and cross-unit checks. These integration instructions consume the code-generation plans and summaries for all ten units and focus on seams introduced across units:

| Boundary | Source units |
| --- | --- |
| Auth app BFF and safe session shape | U01, U05 |
| Reference-data app BFF, contract catalog, and read-only permissions | U01, U06, U07 |
| Reference-data service domain, API, and outbox ports | U03, U04 |
| Contract catalog, Avro schemas, and examples | U04, U07 |
| Quality-gate runner, seeds, smoke checks, and Compose descriptors | U08, U09, U10 |

## Commands

Run local integration-style validators:

```powershell
node scripts/validate-skeleton.mjs
node scripts/validate-contract-catalog.mjs
node scripts/seed-local.mjs --dry-run --seed-file infrastructure/seeds/shared-platform-mvp-defaults.json
node scripts/smoke-local.mjs
node scripts/smoke-observability.mjs
docker compose config --quiet
```

Run the consolidated local quality gate:

```powershell
node scripts/run-quality-gates.mjs --all --evidence artifacts/quality-gates/evidence.json
```

Run backend service integration tests on a Java/Maven host:

```powershell
mvn -f services/pom.xml test
```

## Expected Boundary Coverage

| Boundary | Expected assertion |
| --- | --- |
| Contract catalog | All catalog file paths exist, OpenAPI and Avro artifacts parse, and required reference-data event types are present. |
| Seed pack | All nine MVP reference sets exist, immutable natural keys are unique, dependency relationships are valid, and dry-run idempotency is deterministic. |
| Compose | Required local services, seed-loader, Nginx routes, and optional observability profile descriptors are valid. |
| Quality gates | Package-manager policy, domain purity, contract validation, seed validation, frontend tests/typechecks, and backend Maven tests are aggregated in one JSON evidence file. |
| Backend Maven | Identity and reference-data service module tests compile and pass on a Java 21/Maven host. |

The current local run produced a quality-gate failure only for `backend-test` because Maven is not installed; all other required gates passed.
