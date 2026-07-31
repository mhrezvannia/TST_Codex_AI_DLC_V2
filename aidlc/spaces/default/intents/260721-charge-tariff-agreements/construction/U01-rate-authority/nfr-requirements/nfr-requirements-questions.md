# NFR Requirements Questions - U01 Rate Authority

## Context

The approved requirements already fix W2-03 pricing p99, 80% changed-code
coverage, fail-closed authorization/reference validation, additive migrations,
and live evidence. These questions cover only the remaining U01-specific,
quantifiable Rate administration and authority targets. They do not create a
production SLA, new cloud topology, or wider compliance scope.

## Questions

### Q1. What provisional local performance/capacity target should Rate administration use?

- A. At 10 concurrent clients over at least 10,000 stable Rates / 50,000 versions, require list/detail p95 <= 500 ms and create/edit/approve/successor p95 <= 750 ms over at least 100 measured calls per operation family; record raw samples and label this local acceptance only **(Recommended)**
- B. Apply only the existing pricing p99 <= 800 ms target; place no quantitative target on Rate administration
- C. Require p99 <= 800 ms for every Rate query and mutation at 10 concurrent clients over the same dataset
- X. Other (please specify)

[Answer]: A - At 10 concurrent clients over at least 10,000 stable Rates / 50,000 versions, require list/detail p95 <= 500 ms and create/edit/approve/successor p95 <= 750 ms over at least 100 measured calls per operation family; record raw samples and label this local acceptance only. **Mode:** guided

### Q2. What concurrency/capacity proof should approval and successor creation require?

- A. Repeatedly exercise two same-key overlapping approvals (at most one winner), 20 concurrent non-conflicting approvals, and competing successor creation (exactly one Draft), with no deadlock, partial audit, duplicate version number, or pool exhaustion **(Recommended)**
- B. Prove only one same-key race for approval and successor creation
- C. Add sustained high-load stress/soak and horizontal multi-instance scale tests to U01
- X. Other (please specify)

[Answer]: A - Repeatedly exercise two same-key overlapping approvals (at most one winner), 20 concurrent non-conflicting approvals, and competing successor creation (exactly one Draft), with no deadlock, partial audit, duplicate version number, or pool exhaustion. **Mode:** guided

### Q3. What recovery objective is appropriate for this local-only vertical slice?

- A. Require RPO 0 for committed Rate/version/activity data across process restart and migration replay, bounded local service readiness within 120 seconds after restart, plus backup/restore and forward-repair proof in U06; make no production availability SLA claim **(Recommended)**
- B. Require consistency/durability only, with no measured local recovery-time target
- C. Define a production 99.9% availability SLO and production RTO/RPO now
- X. Other (please specify)

[Answer]: A - Require RPO 0 for committed Rate/version/activity data across process restart and migration replay, bounded local service readiness within 120 seconds after restart, plus backup/restore and forward-repair proof in U06; make no production availability SLA claim. **Mode:** guided

### Q4. What compliance/data-classification claim should U01 make?

- A. Classify rates, version history, actor IDs, and audit metadata as internal/confidential commercial data; require least privilege, encryption through existing platform controls, safe logging, and attributable immutable history, but do not invent GDPR/PCI/HIPAA/SOC 2 scope or a retention period absent policy **(Recommended)**
- B. Add SOC 2 readiness controls and a fixed one-year audit retention requirement
- C. Treat all Rate data as public/non-sensitive because the MVP uses synthetic local data
- X. Other (please specify)

[Answer]: A - Classify rates, version history, actor IDs, and audit metadata as internal/confidential commercial data; require least privilege, encryption through existing platform controls, safe logging, and attributable immutable history, but do not invent GDPR/PCI/HIPAA/SOC 2 scope or a retention period absent policy. **Mode:** guided
