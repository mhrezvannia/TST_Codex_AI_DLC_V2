# Cost And Efficiency Analysis - W2-01 App Shell and Auth

## Inputs And Cost Boundary

This analysis consumes `dashboards`, `alarms`, `slo-config`, `deployment-log`, `load-test-results`, and `incident-plan`. W2-01 provisions no AWS account resources, tags, budgets, or Cost Explorer scope. Therefore AWS Cost Explorer, AWS Config cost views, and Trusted Advisor recommendations are NOT APPLICABLE and no hypothetical cloud bill is produced.

## Measured Local Efficiency Signals

| Signal | Observation | Cost / toil implication |
| --- | --- | --- |
| Full rebuild | Hard-coded full `--build` attempt timed out after five minutes transferring large contexts | Developer time and CI runner minutes are wasted before useful build work completes |
| Live acceptance | Complete W2 run finishes with runtime, browser, and audits PASS | Repeatable proof replaces manual route-by-route verification |
| Performance validation | Ten full journeys consumed 141010.26 ms of measured run duration | Suitable for manual/scheduled evidence, too heavy for every fast unit-test loop |
| Telemetry readiness | Base stack is healthy but seven application scrape targets are down | Operators pay recurring manual diagnostic cost and cannot use SLO automation |
| Host ports | Windows reservations require alternate host mappings | Environment setup needs documented variables to avoid repeated troubleshooting |
| Elastic images | Official 8.16.1 images now run locally | The former network/image blocker is resolved; preserve official registry provenance |

## Optimization Opportunities

| Priority | Action | Expected benefit | Constraint |
| --- | --- | --- | --- |
| P1 | Reduce Docker build contexts with service-specific contexts and `.dockerignore` coverage | Remove multi-minute context transfer and improve clean-build reproducibility | Must preserve workspace package dependencies and prior merged services |
| P1 | Add telemetry readiness checks for content type, actuator endpoints, OTLP spans, and log index presence | Replace manual checks and prevent false observability PASS claims | Instrumentation must precede alarm activation |
| P2 | Keep focused unit tests fast; run the ten-journey performance suite manually or on a scheduled/proof runner | Avoid adding roughly 2.4 minutes to every local edit loop | Release proof still requires retained evidence |
| P2 | Retain deterministic Charge fixture reuse and idempotent seed/schema behavior | Avoid repeated setup and destructive resets | Never bypass real APIs or delete volumes |
| P3 | Add artifact retention/size policy for repeated browser screenshots and run directories | Bound local disk growth | Preserve required acceptance and audit evidence |

## Savings Claims

No currency savings, cloud resource right-sizing, Savings Plan, Reserved Instance, Spot, Graviton, or cost-per-transaction claim is supported. Benefits are stated as reduced elapsed build/proof time and lower manual operational toil only.

## Guardrails

Cost reduction must not weaken OIDC validation, Identity authorization, evidence redaction, audit execution, production-readiness boundaries, or the `incident-plan` requirement for human approval of recovery actions. W1's waiver remains BLOCKED and cannot be optimized away.
