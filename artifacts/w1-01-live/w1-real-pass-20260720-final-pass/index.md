# W1-01 Live Acceptance - w1-real-pass-20260720-final-pass

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
| replay-restart | PASS | BR-U07-001, BR-U07-003 | replay-restart/replay-restart.txt |
| quality-gates | FAIL | BR-U07-006 | quality/quality-gates.txt |
| aidlc-audit | SKIPPED | BR-U07-007 | audits/aidlc-audit.txt |
| erp-fidelity-audit | SKIPPED | BR-U07-007 | audits/erp-fidelity-audit.txt |

## Artifacts

- preflight/preflight.txt sha256=82f97e65551a22c31cf9e24b3972909614ed654bb0c7b9c729b800f9efcd192d
- compose/compose-config.txt sha256=fb4d606947f2266b286ef1196727a880eb1121710e94840a77e6dc0419d69d5c
- compose/compose-start.txt sha256=4f05eb721d82f695c1eac01cba00333903bd9a407616aab620a9b9668b72a8e3
- compose/observability-health.txt sha256=311969990883e131657429ef16b26412d60f83a81c97a252b151a562721b55a2
- quality/contracts.txt sha256=df471f003120652c6dada7b9f3bcb28792ea21f5aaf02a74e21ae04e49a66f49
- seed/seed-dry-run.txt sha256=b23b5cabde2815a7ab7503571741e7c4c9c65d5fa3080125fa48d209b67f1a37
- seed/seed-live.txt sha256=0614699eb5c328e12a420021e62f7acb2524818191e09d9a73187548dcb9c3d4
- journey/booking-ui-health.txt sha256=22328e3bcd4683cf52fb62117d13c7cb2b2ae5cf38e6286b19ac98772c68cf8c
- replay-restart/replay-restart.txt sha256=42770c4119545fea9d61d9cb934352ad7d9942a9cb0d9c81585997033aaa8a5f
- quality/quality-gates.txt sha256=5117be510929b0bd4eee003c89bfa31c210774dce6200466d456752b43a97287
