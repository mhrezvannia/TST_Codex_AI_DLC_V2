# NFR Requirements Questions - observability-quality-operation-readiness

## Source Context

These questions consume `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.

Recommended answers were applied under explicit stage-level approval for remaining NFR Requirements units.

## Q1 - Evidence Freshness And Gate Performance

What freshness and runtime targets should quality evidence meet?

A. Evidence is fresh only for current `gitRef`/profile/schema/test set; full evidence bundle generation should complete within 15 minutes in CI and 20 minutes locally. Recommended.
B. Evidence is valid for 7 days.
C. No freshness target.
D. Manual review is enough.
E. Defer freshness.
X. Other (please specify)

[Answer]: A

## Q2 - Security And Compliance

What security controls are mandatory?

A. Evidence access is authenticated/authorized, secrets are redacted, denied-path/security evidence is mandatory, artifacts are internal/confidential, and release-candidate bundles are retained for 180 days. Recommended.
B. Evidence is public.
C. Secrets may appear in logs.
D. No retention target.
E. Defer security.
X. Other (please specify)

[Answer]: A

## Q3 - Evidence Scale

What first-release evidence scale should be supported?

A. At least 5 E2E flow reports, 100 contract checks, 50 dashboards/alerts/runbooks, 10,000 log/metric/trace samples, and 500 blocker/finding records. Recommended.
B. Latest green summary only.
C. Unlimited no target.
D. No scale target.
E. Defer scale.
X. Other (please specify)

[Answer]: A

## Q4 - Reliability

What reliability controls are required?

A. Fail-closed gates for required missing/stale/failed evidence, partial evidence preservation, owner/remediation on blockers, no manual green override, and explicit Operation carry-forward risks. Recommended.
B. Fail open with warning.
C. Manual green override allowed.
D. Hide skipped checks.
E. Defer reliability.
X. Other (please specify)

[Answer]: A

## Q5 - Stack

What technology posture should be used?

A. CI/local generated evidence using existing GitHub Actions, Docker Compose, OpenAPI/Pact/Avro/Schema Registry outputs, Prometheus/Grafana/Jaeger/OTel/log tooling, and read-only Enterprise Web views. Recommended.
B. New central evidence database immediately.
C. Spreadsheet evidence.
D. Screenshots only.
E. Defer stack.
X. Other (please specify)

[Answer]: A
