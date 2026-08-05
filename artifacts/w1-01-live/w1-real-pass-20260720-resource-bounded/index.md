# W1-01 Live Acceptance - w1-real-pass-20260720-resource-bounded

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
- compose/compose-start.txt sha256=be7dee8dd6ac03d929ab1e1952b2b2ff4c85e005dba92c08010abae3565e919f
- quality/contracts.txt sha256=96df71f57409b2ea54b26783424ca11a65df781e6ad3c26c07890101ecee52e6
- seed/seed-dry-run.txt sha256=b5db4cb23ee0ab9c4e3ee90012c411cd147404178ee2f588e5ca3f47c7a8aaf2
- seed/seed-live.txt sha256=b81d8812b65add15add3cd2026546bcba2d835ac4f1c1a4bde697a4f386b5a4f
- journey/booking-ui-health.txt sha256=3f8e48933428e5e3d6a45d846e31fdb7f857538f125f8b426019f9b82ca0a270
- replay-restart/replay-restart.txt sha256=fe3e513e49f63ef87def2d4a54fadd76c7d0dcbc3a1351473ffaebde8dc42fea
