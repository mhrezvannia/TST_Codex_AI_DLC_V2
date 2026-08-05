# W2-04 Deployment Pipeline Decisions

## Upstream Context

These answers preserve the accepted `ci-config` and release-blocking
`quality-gates`, implement the portable topology in `deployment-architecture`,
and use the immutable promotion/rollback controls from `cicd-pipeline`. They do
not override any current HOLD.

## Decisions

### 1. Which deployment strategy applies?

**Answer — decided:** Controlled service-by-service recreate/rolling promotion
of immutable commit-SHA images in the existing Compose topology. Blue/green and
canary are deferred because no duplicate production capacity, traffic router,
or production runtime is approved.

### 2. What are the promotion gates?

**Answer — decided:** Static build/test/contract/security/advisory/85%-coverage
gates must pass before packaging. A serialized isolated
`linercore-wave-a` job must then prove the current images, priced Booking
fixture, lifecycle, typed rejections, broker-to-database-to-Booking projection,
authorization/degraded states, current UI/Playwright matrix, approved
performance populations, both audits, hashed evidence manifest, and pre/post
manager demo guards. Any `PARTIAL`, `BLOCKED`, missing, stale, waived, or
fallback-image evidence stops promotion.

### 3. Who approves production?

**Answer — decided, not activated:** Production requires a separate manual
tech-lead and product-owner approval after release-review sign-off. No
production target, credentials, protection rule, health policy, or recovery
evidence is configured in this intent, so production deployment is prohibited.

### 4. What is the rollback procedure?

**Answer — decided:** Preserve evidence and data, select the previous known-good
manifest by digest, and redeploy its images/configuration only when the current
additive schema is proven backward compatible. Never run automatic down
migrations or reset volumes. If compatibility is unproven, stop and deliver a
reviewed forward repair; use backup restoration only after that restore path is
independently validated.

### 5. How are feature flags used?

**Answer — decided:** W2-04 adds no flag platform and no new release flag. The
vertical journey is promoted as one unit. Only an existing, tested
configuration switch with a safe default, owner, audit trail, and removal
condition may be used for emergency containment.

### 6. What is the retry policy?

**Answer — decided:** One evidence-preserving retry is allowed only for a
classified environmental failure. Product, contract, security, migration,
data-integrity, or deterministic test failures require correction and a new
candidate.

### 7. What is the current deployment decision?

**Answer — HOLD:** Promotion remains blocked by incomplete isolated live-job
orchestration/evidence validation, registry egress and remote advisory
resolution, missing 85% coverage reports, missing current-image UI/Playwright
proof, incomplete viewport/a11y evidence, unexecuted approved 20-sample
performance populations, and unconfirmed exact W2-02 synchronization. The W1
waiver remains `BLOCKED_WAIVED`.

## Revisit Conditions

Revisit the strategy only when an approved production topology introduces
traffic routing or parallel capacity, when a tested feature-control platform
already exists, or when recovery objectives require a different mechanism.
Those decisions belong to a separately approved infrastructure/release scope
and must not be inferred from local Compose acceptance.

