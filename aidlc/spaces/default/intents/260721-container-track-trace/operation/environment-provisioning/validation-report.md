# W2-04 Environment Validation Report

## Verdict and Upstream Trace

**Verdict: NOT READY / HOLD.**

The environment does not currently satisfy the portable
`deployment-architecture`, the complete service set in
`infrastructure-services`, or the manager-protection and promotion rules in
`cd-config`. Backend dependencies are partially healthy, but the protected
manager edge is unavailable, the isolated acceptance environment is absent,
and no staging or production target is provisioned.

## Validation Results

| Control | Evidence | Result |
|---|---|---|
| Manager project isolation | Only `linercore-shared-platform` was listed; no `linercore-wave-a` project existed | PASS |
| Manager edge protection | Port 8088 had no listener; `npm run demo:guard` failed twice with connection refused | FAIL |
| Core backend health | Identity, Reference Data, Charge Agreement, Booking, Container Movement, and Schema Registry returned HTTP 200 | PARTIAL |
| Manager frontend and routing | nginx/edge, shell, Booking app, auth app, and other frontend containers were stopped | FAIL |
| Broker and persistence | Kafka, Schema Registry, and PostgreSQL containers were healthy | PASS |
| Observability services | Grafana, Prometheus, Jaeger, OpenTelemetry Collector, Kibana, and Elasticsearch were stopped | FAIL |
| Wave A environment | No project containers or environment were present | NOT PROVISIONED |
| CI live orchestration | No observed run creating fixture, isolated stack, Playwright evidence, manifest validation, and `always()` cleanup | BLOCKED |
| Staging | No approved or provisioned target observed | NOT PROVISIONED |
| Production | No approved target, protection rules, credentials, or recovery evidence | NOT CONFIGURED |
| AWS network controls | No AWS IaC or AWS target; VPC/subnet/security-group/NACL checks do not apply | N/A |
| Cross-account/cross-VPC connectivity | No AWS accounts or VPCs are in scope | N/A |
| Secret injection | Variable names are referenced; values were not inspected; no Compose secrets or tracked `.env` found | LOCAL ONLY / PRODUCTION UNPROVEN |
| Data preservation | Named PostgreSQL and anonymous service volumes remained present; no reset performed | PASS |

`PASS` above means only the stated check was observed. It does not override the
overall HOLD or convert the historical W1 waiver into a real pass.

## Security Posture Validation

- The check did not expose tokens, passwords, raw payloads, provider bodies, or
  environment values.
- Local Compose variable injection is not accepted as proof of non-local secret
  storage, rotation, or least-privilege delivery.
- Identity and Reference Data health was observed, but authorization matrices,
  repository-before-ALLOW probes, redaction unions, and dependency-failure
  write-set assertions were not rerun in this provisioning stage.
- The manager network is a non-internal Docker bridge. This is a local topology
  fact, not evidence of production network segmentation.
- No AWS Security Hub, Inspector, GuardDuty, CloudTrail, VPC Flow Logs, KMS,
  Secrets Manager, or Parameter Store validation applies because W2-04 has no
  AWS environment. Their absence must not be mislabeled as an AWS control
  failure or silently replaced by invented cloud resources.
- Current CI security gaps and the blocked remote dependency advisory query
  remain release-blocking as recorded by `cd-config`.

## Compliance Validation

The upstream security requirements explicitly infer no PCI DSS, HIPAA, GDPR,
production SOC 2, certification, or data-residency scope from this internal
journey slice. Existing organizational access, retention, encryption, and audit
policies remain authoritative.

Compliance evidence is therefore limited to truthful environment
identification, least-privilege intent, redaction, immutable release identity,
audit preservation, and segregation of manager versus acceptance targets. No
production compliance control is claimed from local Docker health.

## Provisioning and Deployment Logs

No provisioning action was authorized or required:

- no AWS IaC exists for this intent;
- the Wave A target is intentionally ephemeral and may be created only through
  the serialized acceptance controller;
- staging and production are not approved targets;
- the manager project is protected and was not repaired or mutated by this
  workflow stage.

The observed manager services appeared to be restarting independently during
the read-only validation window: Booking changed from exited to reachable, but
the edge remained unavailable. This transient recovery does not close the
manager guard failure.

## Required Remediation Before Environment Readiness

1. The manager environment owner must restore and verify the protected
   shell/edge and stopped application/observability components, then obtain a
   passing `npm run demo:guard`.
2. CI must wire the isolated priced Booking fixture, Wave A orchestration,
   current-image Playwright run, evidence-manifest validation, and scoped
   `always()` cleanup.
3. The remaining `cd-config` holds—registry/advisory access, 85% coverage,
   current-image UI/a11y evidence, approved performance populations, and exact
   W2-02 synchronization—must pass.
4. Any later staging or production environment requires a separately approved
   target, immutable artifact store, owner-controlled secrets, least-privilege
   network/access policy, health checks, backup/restore evidence, monitoring,
   and manual production protection.

Until these items are observed, Environment Provisioning remains an accurate
inventory and validation result, not authorization to deploy.

