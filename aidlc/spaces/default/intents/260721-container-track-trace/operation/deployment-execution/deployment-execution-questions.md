# W2-04 Deployment Execution Decisions

## Upstream Context

These answers enforce `cd-config`, follow `deployment-strategy`, use only
targets in `environment-inventory`, and preserve the limitations recorded by
`build-test-results`.

## Decisions

### 1. Are all pre-deployment checks passing?

**Answer — no:** The manager guard recovered and passes, but the source is not
an immutable candidate, required release images and manifest are absent, Wave A
is not provisioned, and multiple CI/live evidence gates remain blocked.

### 2. Are database migrations required and tested?

**Answer — not executable for this candidate:** W2-04 uses additive Flyway
migrations, but no immutable release manifest identifies the exact checksum set
for deployment. The consumed build evidence also records incomplete live
migration proof. No migration may run until the candidate and compatibility
evidence are complete.

### 3. Are dependent services available and healthy?

**Answer — manager dependencies currently yes, deployment target no:** Identity,
Reference Data, Charge Agreement, Booking, Container Movement, Schema Registry,
and manager routes passed safe checks. The isolated Wave A target is absent,
and staging/production do not exist.

### 4. What is the deployment window?

**Answer — none authorized:** No target is ready, no release manifest is
eligible, and no manual production approval exists.

### 5. Should artifacts be pushed or services deployed?

**Answer — no:** Quality gates protect deployment. The correct execution is a
policy stop before artifact push, migration, service recreation, or smoke
mutation.

### 6. Is rollback required?

**Answer — no:** This stage made no deployment change. Existing data, volumes,
topics, offsets, outbox rows, projections, credentials, and services were not
mutated.

### 7. What does approval of this stage mean?

**Answer:** Approval accepts the deployment log, safe health snapshot, and
`NOT EXECUTED / HOLD` decision. It does not approve a deployment, waive any
gate, or turn manager-demo health into release evidence. The historical W1
result remains `BLOCKED_WAIVED`.

## Re-entry Conditions

Actual deployment may be attempted only after an immutable commit-SHA release
manifest exists, all `cd-config` gates pass, the serialized isolated target is
ready, and an authorized window and target are recorded.

