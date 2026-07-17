# Build and Test Summary - W1-01

## Upstream Coverage

This stage consumed all W1-01 code-generation outputs: `booking-draft-skeleton`, `reference-validation`, `agreement-pricing`, `confirm-to-cmm-journey`, `returned-status-detail`, `replay-restart-safety`, and `live-release-acceptance`. The instruction files reference each unit's `code-generation-plan.md` and `code-summary.md` as the trace source.

## Test Inventory

| Test type | Artifact | Status |
|---|---|---|
| Build | `build-instructions.md` | Generated and executed through Maven, Yarn, Compose config |
| Unit | `unit-test-instructions.md` | Generated and executed through Maven, Vitest, Node tests |
| Integration | `integration-test-instructions.md` | Generated and partially executed through service/script tests and Compose config |
| Performance | `performance-test-instructions.md` | Generated as live-stack baseline instructions; not executed under Standard strategy |
| Security | `security-test-instructions.md` | Generated and executed through type/lint/config/detector gates |
| Results | `build-test-results.md` | Current run recorded |

## Actual Results

| Gate | Result |
|---|---|
| Backend Maven suite | PASS, 156 Surefire tests, 0 failures, 0 errors, 0 skipped |
| Workspace Node tests | PASS, 27 tests |
| Booking frontend tests | PASS, 5 files, 15 tests |
| Booking frontend typecheck | PASS |
| Booking frontend lint | PASS, no ESLint warnings or errors |
| Booking frontend production build | PASS, Booking and BFF routes emitted |
| Docker Compose static config | PASS |
| Whitespace check | PASS with CRLF conversion warnings only |
| `aidlc-audit` detectors | PASS exit 0 with LEADS requiring manual review |
| `erp-fidelity-audit` detectors | PASS exit 0 with LEADS requiring manual review |

## Readiness Assessment

| Dimension | Assessment |
|---|---|
| Build-ready | READY for checked-in backend, frontend, script, and Compose-static gates |
| Test-ready | READY for deterministic local gates and CI translation |
| Deployment-ready | NOT READY for release until a full live acceptance run passes on Docker |
| Live-runtime proof | BLOCKED by Docker image/proxy access to Elastic observability images in the latest retained run |

## Limitations

- The live quote-to-cash user journey has not passed on the full Compose stack in this build-and-test stage. The checked-in acceptance harness records the latest attempt as `BLOCKED`, with evidence under `artifacts/w1-01-live/codegen-live-blocked-image-pull/`.
- Detector scripts produce LEADS and do not replace human review of architectural and ERP-fidelity findings.
- SAST, dependency CVE scanning, image scanning, and DAST are not yet first-class repository gates.
