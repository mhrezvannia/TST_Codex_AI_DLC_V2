# W1-01 Live Acceptance - w1-real-pass-20260720-pass

Status: FAILED

| Gate | Status | Maps To | Evidence |
|---|---|---|---|
| preflight | PASS | BR-U07-002, BR-U07-003 | preflight/preflight.txt |
| compose-config | PASS | BR-U07-002, BR-U07-003 | compose/compose-config.txt |
| compose-start | PASS | BR-U07-001, BR-U07-003 | compose/compose-start.txt |
| observability-health | PASS | BR-U07-003 | compose/observability-health.txt |
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
- compose/compose-start.txt sha256=95a93edc759a052079b4dc9208f8e469912c51a2c49f2ef349e729c6e9d84927
- compose/observability-health.txt sha256=311969990883e131657429ef16b26412d60f83a81c97a252b151a562721b55a2
- quality/contracts.txt sha256=a28d39094a655dcdf0d6d022318cfc1aa2b7c0b9eb96e4621dfacef65cbe09aa
- seed/seed-dry-run.txt sha256=2db1cfd570ba624aa9cf6cd705b1c52655f879aabaf23ea18bc08140060197a7
- seed/seed-live.txt sha256=b23fa6cc047e7161f8b4c015c4c02b42a3fbf69342987dd364f3408ee0dbebf4
- journey/booking-ui-health.txt sha256=c445e93b16ce3313a99fd1acb471c389d8a0b56af4cb45b37f91a5e99ab7cb98
- replay-restart/replay-restart.txt sha256=233dd112fb3cdfaddbbb5873e0b55d68d3086fdfdbd05da199adad92f219fe00
