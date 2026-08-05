# W1-01 Live Acceptance - w1-real-pass-20260720-green

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
| quality-gates | PASS | BR-U07-006 | quality/quality-gates.txt |
| aidlc-audit | FAIL | BR-U07-007 | audits/aidlc-audit.txt |
| erp-fidelity-audit | SKIPPED | BR-U07-007 | audits/erp-fidelity-audit.txt |

## Artifacts

- preflight/preflight.txt sha256=82f97e65551a22c31cf9e24b3972909614ed654bb0c7b9c729b800f9efcd192d
- compose/compose-config.txt sha256=fb4d606947f2266b286ef1196727a880eb1121710e94840a77e6dc0419d69d5c
- compose/compose-start.txt sha256=9b7b04a09ee47b788ec2eab55ea6892dee8441e15277cf0c79af5b963567bcfb
- compose/observability-health.txt sha256=311969990883e131657429ef16b26412d60f83a81c97a252b151a562721b55a2
- quality/contracts.txt sha256=89e025d4aa9d75de7ebe988b49f6345323756f128d0227350fa3a71880724b72
- seed/seed-dry-run.txt sha256=d5077d2990e5ca9fc3a11276976f94ddb6c61a5348d631bba004247fa954ee78
- seed/seed-live.txt sha256=a189417782ddfb48036249c1011eecdeba9d326816054dc771acec37fc93dd07
- journey/booking-ui-health.txt sha256=1be71429019ae952f717b6ca32f345da17b4b785e24b001a7f011f4e4e76d76e
- replay-restart/replay-restart.txt sha256=43303f5be55102c9e3dd0e491512d9e10704bc32cd4280c88efa2cc71568bdc6
- quality/quality-gates.txt sha256=de87369162ce621f75ac2ee7b8643d64dd1cb85aaf7816379da42751bde6c561
- audits/aidlc-audit.txt sha256=b19c9a2990cb62ec5444c05dc00ef49b8c86e7a9cc7478792eb45aadb24ec16f
