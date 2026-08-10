# NFR Requirements Questions - U03 Agreement Authority

## Context

U03 already fixes immutable version history, exact three-rate links, inclusive
overlap prevention, fail-closed authorization/reference validation, dual media
dialects, transactional activity/outbox, and terminal lifecycle behavior. These
questions quantify only Agreement administration capacity, contention, and
local recovery/event evidence. They do not create a production SLA, new broker,
new deployable, or pricing target.

## Questions

### Q1. What provisional local performance/capacity target should Agreement administration use?

- A. At 10 concurrent clients over at least 10,000 stable Agreements, 50,000 versions, and 150,000 exact links, require vendor list/detail p95 <= 750 ms and create/edit/approve/successor/suspend/expire p95 <= 1,000 ms, with at least 100 post-warm-up calls per operation family and per-operation evidence **(Recommended)**
- B. Apply only the existing pricing p99 <= 800 ms target; place no quantitative target on Agreement administration
- C. Require p99 <= 800 ms for every Agreement query and mutation on the same fixture/load
- X. Other (please specify)

[Answer]: A. At 10 concurrent clients over at least 10,000 stable Agreements, 50,000 versions, and 150,000 exact links, require vendor list/detail p95 <= 750 ms and create/edit/approve/successor/suspend/expire p95 <= 1,000 ms, with at least 100 post-warm-up calls per operation family and per-operation evidence (Recommended)

**Mode:** guided

### Q2. What contention proof should Agreement authority require?

- A. Run at least 20 barrier-synchronized fresh rounds each for overlapping same-key approval, same-header successor creation, and competing suspend-versus-expire, plus 20 independent-key approvals; require exactly one valid winner per contested round, exact typed losers, and no deadlock/partial activity/outbox/pool exhaustion **(Recommended)**
- B. Prove one representative race for approval, successor, and lifecycle transition
- C. Add a sustained high-load soak and production-style multi-node broker/database stress campaign
- X. Other (please specify)

[Answer]: A. Run at least 20 barrier-synchronized fresh rounds each for overlapping same-key approval, same-header successor creation, and competing suspend-versus-expire, plus 20 independent-key approvals; require exactly one valid winner per contested round, exact typed losers, and no deadlock/partial activity/outbox/pool exhaustion (Recommended)

**Mode:** guided

### Q3. What local durability/recovery objective should Agreement activity and outbox use?

- A. Require RPO 0 for every committed header/version/link/activity/outbox row, readiness plus authenticated detail within 120 seconds after restart, and relay recovery with the same dedupe key under duplicate delivery; publish failure may change relay attempt state only and never commercial state; no production availability SLA **(Recommended)**
- B. Require transactional consistency only, without measured restart or relay-recovery bounds
- C. Define a production 99.9% availability SLO and exactly-once Kafka delivery guarantee now
- X. Other (please specify)

[Answer]: A. Require RPO 0 for every committed header/version/link/activity/outbox row, readiness plus authenticated detail within 120 seconds after restart, and relay recovery with the same dedupe key under duplicate delivery; publish failure may change relay attempt state only and never commercial state; no production availability SLA (Recommended)

**Mode:** guided
