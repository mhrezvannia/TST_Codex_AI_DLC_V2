# W2-03 Live Acceptance - build-test-live

Status: FAILED

| Gate | Status | Story | Evidence |
|---|---|---|---|
| demo-snapshot | PASS | W2-03-S5 | guard/demo-snapshot.txt |
| preflight | PASS | W2-03-S5 | preflight/preflight.txt |
| compose-config | PASS | W2-03-S5 | compose/compose-config.txt |
| compose-start | FAIL | W2-03-S5 | compose/compose-start.txt |
| charge-health | SKIPPED | W2-03-S1, W2-03-S2, W2-03-S3 | runtime/charge-health.txt |
| booking-health | SKIPPED | W2-03-S4 | runtime/booking-health.txt |
| charge-ui-health | SKIPPED | W2-03-S1, W2-03-S2, W2-03-S3 | runtime/charge-ui-health.txt |
| live-journey | SKIPPED | W2-03-S1, W2-03-S2, W2-03-S3, W2-03-S4, W2-03-S5 | journey/live-journey.txt |
| restart-services | SKIPPED | W2-03-S5 | restart/restart-services.txt |
| restart-persistence | SKIPPED | W2-03-S4, W2-03-S5 | restart/restart-persistence.txt |
| contracts | SKIPPED | W2-03-S4, W2-03-S5 | quality/contracts.txt |
| aidlc-audit | FAIL | W2-03-S5 | audits/aidlc-audit.txt |
| erp-fidelity-audit | FAIL | W2-03-S5 | audits/erp-fidelity-audit.txt |
| compose-cleanup | FAIL | W2-03-S5 | cleanup/compose-cleanup.txt |
| demo-verify | FAIL | W2-03-S5 | guard/demo-verify.txt |

## Artifacts

- audits/aidlc-audit.txt sha256=b596b95e13c586a7020749780ba31dcccc50306717a50895d47669205cf620da
- audits/erp-fidelity-audit.txt sha256=4e8de71d4a7f42a228b96fc8e7083b06d33c138b2fbdd1f37b6c20fd66405aff
- cleanup/compose-cleanup.txt sha256=2a333c4c4b2de72ada0e60faa262b956187954d7807e5fd7aa748805408909e7
- compose/compose-config.txt sha256=b71470572517ac5fe14d6a78789b6e56bf820e87c282ec612289bf9425d144e2
- compose/compose-start.txt sha256=ebfaaf940e3b59ed9f07fc4112652216815655cff692b7fd3278c7807fcdb116
- guard/demo-snapshot.txt sha256=8c1a2e017f3c2c2c861864aeaa58c7db86a4304905edd45e737b69f9d9e45ce6
- guard/demo-verify.txt sha256=409b5d30a30c9f45916ae4442a67bf10746d277453c45364fbc7147e21b54a29
- guard/protected-before.json sha256=388b445703cb2f029b715a42f4f78c9f382b4b6aab287da49cda3b9040fe065c
- journey/live-journey.txt sha256=dc2bb12d1c86bd8e83362f2da8251dc1869c83170119c621a7ce64764b46d726
- preflight/preflight.txt sha256=eb14083c72f23a27e99a8d163b936fd32ebd12f2eef18648ac0534f66ce95418
- quality/contracts.txt sha256=0ab584a8be7c4994f40dcf522dc5db394ca52ebe8c02ca1862595140f8c7fb32
- restart/restart-persistence.txt sha256=50b002470c49e7ec365863e4798d0e483242cd3a0a32e6b769831edfa4418aa2
- restart/restart-services.txt sha256=08b075a559b6f70c396a759356f7748c42df3dca536f19afe9818ef2c9e0aa1b
- runtime/booking-health.txt sha256=83750e40e5d44174145ffa995fb47f590957272a38c8064fc226eb8ca405c664
- runtime/charge-health.txt sha256=139768b44620758f1796206fcfa11810ef523e8b84cca170da5d7d7707cc31f5
- runtime/charge-ui-health.txt sha256=015426c36b2eb07cbda5483f1b7ffeb6dd86a8d5c25e1144ec098d2f2a358013
