# W2-03 Live Acceptance - build-test-live-2

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
| aidlc-audit | PASS | W2-03-S5 | audits/aidlc-audit.txt |
| erp-fidelity-audit | PASS | W2-03-S5 | audits/erp-fidelity-audit.txt |
| compose-cleanup | PASS | W2-03-S5 | cleanup/compose-cleanup.txt |
| demo-verify | FAIL | W2-03-S5 | guard/demo-verify.txt |

## Artifacts

- audits/aidlc-audit.txt sha256=7fd10d250b27ae56267704063e9a7e0ff4d561f84e2ee96a7ffb042d47f62a11
- audits/erp-fidelity-audit.txt sha256=34ba1158365f54280563c59d6dfbf865304f5feeee6aaa86b23613a0408f99a1
- cleanup/compose-cleanup.txt sha256=20e8b446450e01613be26a1de79a183dbe9ffd8037af64ed9a9406dc7fdd411a
- compose/compose-config.txt sha256=b71470572517ac5fe14d6a78789b6e56bf820e87c282ec612289bf9425d144e2
- compose/compose-start.txt sha256=7fd45fc3f154c3e5e1f1b76447b59eff8393607b42e3bc7aeb885ea9ad6110d1
- guard/demo-snapshot.txt sha256=5b06c343007e7daaadbd8ac167a192681fc9a0951cbe187d83606820e7e908b9
- guard/demo-verify.txt sha256=c503b1931f4203106c79e5f9cbc07df2cde8bc7bc239ff19f8110da2cecbf86d
- guard/protected-before.json sha256=e4fb3deea05e05a08935959c88ad765ccb542887f50b837f63a7d75bf58b07b2
- journey/live-journey.txt sha256=5b65a55c6f7d9f9700f55fba214ece3d7b7261a4dcb56cb86bdb06eb9ba7117a
- preflight/preflight.txt sha256=eb14083c72f23a27e99a8d163b936fd32ebd12f2eef18648ac0534f66ce95418
- quality/contracts.txt sha256=0ab584a8be7c4994f40dcf522dc5db394ca52ebe8c02ca1862595140f8c7fb32
- restart/restart-persistence.txt sha256=25529ca464b4b7b8251ba323a162b91652e705db2efb320fce2ca9f4ee55909c
- restart/restart-services.txt sha256=08b075a559b6f70c396a759356f7748c42df3dca536f19afe9818ef2c9e0aa1b
- runtime/booking-health.txt sha256=83750e40e5d44174145ffa995fb47f590957272a38c8064fc226eb8ca405c664
- runtime/charge-health.txt sha256=139768b44620758f1796206fcfa11810ef523e8b84cca170da5d7d7707cc31f5
- runtime/charge-ui-health.txt sha256=015426c36b2eb07cbda5483f1b7ffeb6dd86a8d5c25e1144ec098d2f2a358013
