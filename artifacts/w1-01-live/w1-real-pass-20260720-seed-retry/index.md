# W1-01 Live Acceptance - w1-real-pass-20260720-seed-retry

Status: FAILED

| Gate | Status | Maps To | Evidence |
|---|---|---|---|
| preflight | PASS | BR-U07-002, BR-U07-003 | preflight/preflight.txt |
| compose-config | PASS | BR-U07-002, BR-U07-003 | compose/compose-config.txt |
| compose-start | PASS | BR-U07-001, BR-U07-003 | compose/compose-start.txt |
| contracts | PASS | BR-U07-004 | quality/contracts.txt |
| seed-dry-run | PASS | BR-U07-001 | seed/seed-dry-run.txt |
| seed-live | PASS | BR-U07-001 | seed/seed-live.txt |
| booking-ui-health | PASS | BR-U07-001 | journey/booking-ui-health.txt |
| replay-restart | FAIL | BR-U07-001, BR-U07-003 | replay-restart/replay-restart.txt |
| quality-gates | SKIPPED | BR-U07-006 | quality/quality-gates.txt |
| aidlc-audit | SKIPPED | BR-U07-007 | audits/aidlc-audit.txt |
| erp-fidelity-audit | SKIPPED | BR-U07-007 | audits/erp-fidelity-audit.txt |

## Artifacts

- preflight/preflight.txt sha256=82f97e65551a22c31cf9e24b3972909614ed654bb0c7b9c729b800f9efcd192d
- compose/compose-config.txt sha256=fb4d606947f2266b286ef1196727a880eb1121710e94840a77e6dc0419d69d5c
- compose/compose-start.txt sha256=5b430e9b7ebc5de411b3d5388292d65a1ee8a20ceadbc48afa881ebf4a2e94f6
- quality/contracts.txt sha256=fed2b60936d3d5bee0c81f86dd3af83d70a50c5cba8934ea242e571fdd07ec5a
- seed/seed-dry-run.txt sha256=288ba35034420fe49d3e1c412e6a6769e932f8361f1a4059c385f7449864fdb8
- seed/seed-live.txt sha256=88dd6a2c12f60d702a5107797d39112406c4495297386edd1fc3ee1de3c418d6
- journey/booking-ui-health.txt sha256=fbcb186008e6d2d9de40ae1be3677c2ec9899c72198d27f162100522bc5ac150
- replay-restart/replay-restart.txt sha256=83a38b403499eccd64d91353d389ccf9957809dca19a00c56cf07eb8ae3d8d93
