# CI Quality Gates — W2-03

## Trace and status semantics

These gates consume every unit `code-summary`, the approved
`build-and-test-summary`, and `build-test-results`. Status meanings are closed:

- `PASS`: the exact configured check executed successfully with complete
  evidence.
- `FAIL`: the check executed and violated an assertion or threshold.
- `BLOCKED`: a required capability or immutable dependency was unavailable.
- `SKIPPED`: legal only when linked to an earlier declared FAIL/BLOCKED
  dependency.
- `UNMEASURED`: a required quantitative result, such as coverage or latency,
  has no complete measurement.

Merge and promotion treat every status other than PASS as blocking unless the
gate is explicitly classified as non-release informational.

## Pull-request and integration gates

| Gate | Required result | Blocks |
| --- | --- | --- |
| Contract catalog/provider | 15 contracts; 199 offline checks; zero mismatch | merge |
| Charge/Booking type-check | zero diagnostics | merge |
| Charge/Booking lint | zero errors/warnings | merge |
| U06 deterministic harness | 60/60 | merge |
| U02–U05 evaluator suites | 20/20; evaluator-only claims | merge |
| Charge Java reactor | zero failures/errors; Docker skips remain separate | merge |
| Booking Java reactor | complete reactor on approved dependencies | merge |
| Charge/Booking Vitest | discovery completes; zero failures | merge |
| Charge/Booking production build | both optimized builds complete | merge |
| Changed-line coverage | >=80% for changed Charge/Booking code | integration/release |
| PostgreSQL/Testcontainers | all migration/concurrency/restart tests execute and pass | integration/release |

The current local Build and Test evidence leaves Booking Maven, both frontend
test/build suites, coverage, and Docker integration blocked or unmeasured.
Therefore the current checkout is not eligible for a release marker even
though its runnable source checks are green.

## Security and supply-chain gates

| Gate | Threshold |
| --- | --- |
| Secret scanning | zero verified secrets |
| SAST | zero Critical/High findings |
| Dependency/container CVE | zero Critical/High exploitable findings, or an approved time-bounded waiver |
| License | no prohibited license |
| IaC/config | zero High/Critical misconfiguration |
| SBOM/provenance | complete component inventory bound to commit/build |
| DAST/auth disclosure | all closed authorization/no-disclosure cases pass on isolated Wave A |

Every scanner must be pinned by version/digest and run with a trusted clock.
Absent tools or stale/partial reports are BLOCKED, not clean scans.

## Release acceptance gates

Release requires:

1. `npm run demo:guard` passes before mutation.
2. U06 executes through the exact `linercore-wave-a` wrapper topology.
3. Live Charge/Booking migrations, restore, bilateral pricing, receipt/manual
   case/snapshot correlation, 76 browser cells, axe/keyboard/focus/live-region,
   measured p99/resource targets, observability, preservation, and teardown all
   pass.
4. The post-run manager guard and exact fingerprint comparison pass.
5. `aidlc-audit` and `erp-fidelity-audit` pass.
6. The writer-backed ledger/manifest closes the exact registry with no blocker.

Manual approval is an additional governance gate; it does not substitute for
any technical cell.

## Failure handling

- Fail fast inside non-mutating lanes and publish bounded diagnostics.
- After any possible Wave A mutation, always run teardown and manager
  post-guard/fingerprint verification in a non-short-circuiting recovery lane.
- Do not retry a proven capability denial blindly.
- Never bypass immutable locks, direct-connect around BFF/nginx, change the
  Compose project/ports, use manager 8088, or downgrade a blocked live check to
  a mock/evaluator pass.

