# W1-01 Live Acceptance - w1-real-pass-20260720-final

Status: FAILED

| Gate | Status | Maps To | Evidence |
|---|---|---|---|
| preflight | PASS | BR-U07-002, BR-U07-003 | preflight/preflight.txt |
| compose-config | PASS | BR-U07-002, BR-U07-003 | compose/compose-config.txt |
| compose-start | PASS | BR-U07-001, BR-U07-003 | compose/compose-start.txt |
| observability-health | PASS | BR-U07-003 | compose/observability-health.txt |
| contracts | PASS | BR-U07-004 | quality/contracts.txt |
| seed-dry-run | PASS | BR-U07-001 | seed/seed-dry-run.txt |
| seed-live | FAIL | BR-U07-001 | seed/seed-live.txt |
| booking-ui-health | SKIPPED | BR-U07-001 | journey/booking-ui-health.txt |
| replay-restart | SKIPPED | BR-U07-001, BR-U07-003 | replay-restart/replay-restart.txt |
| quality-gates | SKIPPED | BR-U07-006 | quality/quality-gates.txt |
| aidlc-audit | SKIPPED | BR-U07-007 | audits/aidlc-audit.txt |
| erp-fidelity-audit | SKIPPED | BR-U07-007 | audits/erp-fidelity-audit.txt |

## Artifacts

- preflight/preflight.txt sha256=82f97e65551a22c31cf9e24b3972909614ed654bb0c7b9c729b800f9efcd192d
- compose/compose-config.txt sha256=fb4d606947f2266b286ef1196727a880eb1121710e94840a77e6dc0419d69d5c
- compose/compose-start.txt sha256=b43ca3d35517b1b83a9261ce453771e606c2b8106f7a423c8f2a66f2127a684a
- compose/observability-health.txt sha256=311969990883e131657429ef16b26412d60f83a81c97a252b151a562721b55a2
- quality/contracts.txt sha256=b74ea47ed1bfa484ae004a491440ab72112e249e0515661eaf90bb5ee06485c0
- seed/seed-dry-run.txt sha256=24efa803445e7f45403d5ddbc57e31ac86a110ab2a6e7aede07fac350cc2183e
- seed/seed-live.txt sha256=283dfcb597a025b178f96db300ea384a27b8307fe52c4027d9cab713e6fbe110
