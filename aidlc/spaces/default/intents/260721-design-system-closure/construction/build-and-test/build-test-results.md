# Build and Test Results — W2-02 Design-System Closure

## Environment and provenance

- Branch: `intent/W2-02-design-system-closure`
- Protected baseline: `c2f13dd`
- Upstream artifacts: `booking-design-system-closure/code-generation/code-generation-plan.md` and `booking-design-system-closure/code-generation/code-summary.md`
- Manager guard target: `linercore-shared-platform` / `http://127.0.0.1:8088`
- Acceptance target: `linercore-wave-a` / `http://127.0.0.1:18088`
- Formal run: `artifacts/w2-02-live/runs/20260730074058-9adef85fd5de-32c59c26`
- Sequence: 36; rerun of sequence 35 run `20260730071753-e8d654ff47be-d6a12388`
- Terminal status: `COMPLETED`

## Final executable results

| Check | Status | Result |
|---|---|---|
| Pre-lifecycle manager guard | PASS | Direct guard bound to run/workspace before Wave A ownership |
| Wave A ownership and config | PASS | No pre-existing resources; exact project, profiles, proxy wiring, ports, and acceptance overlay |
| Wave A image/startup/readiness/status | PASS | Verified prebuilt images; `up --no-build --wait`; required services running and healthy |
| Pricing fixture | PASS | Deterministic fixture created/reused under the run contract |
| Pre-browser manager guard and permit | PASS | Fresh direct guard produced by Playwright global setup and cryptographically bound to browser authorization |
| Playwright | PASS | 98 expected, 98 passed, 0 unexpected, 0 skipped, 0 flaky; 289,117.798 ms |
| Case evidence | PASS | 98 JSON case records and 98 PNG screenshots; exact fixed case IDs |
| Mutation trace | PASS | Successful create-to-confirm trace sanitized, validated, and promoted; raw staging removed |
| Wave A cleanup | PASS | Wrapper-only `down --volumes --remove-orphans`; project empty afterward |
| Post-run manager guard | PASS | 21 containers, 21 services, routes 200/308/301/301 |
| `aidlc-audit` | PASS | Exit 0; 67,829 output bytes; SHA-256 `a5a47883d7f3b7e05b3e6781f1ee6a85ce6a385d96067eeb5bd1d09af0c6ff5b` |
| `erp-fidelity-audit` | PASS | Exit 0; 13,044 output bytes; SHA-256 `48267008e4872e45b6a36e5259b99f02ec0184464cfe61987477d68cfa47661a` |
| Terminal-last envelope | PASS | Payload SHA-256 `7103d3695b030c797ab8f52bedcf2cc15a68cd648271df92776f0d0074e47b76`; manifest validator exit 0 |
| W2-02 direct script suite | PASS | 57/57 after the Windows audit-invocation regression test |
| Presentation anti-drift | PASS | All application sources passed |
| Diff hygiene | PASS | No whitespace errors |

## Formal lineage and failure preservation

Attempts 34 and 35 remain immutable `FAILED` records. Attempt 34 proved all 98 browser cases but exposed the stale post-browser freshness recheck. Attempt 35 again proved all 98 cases and then exposed the Windows WSL Bash launcher failure at `aidlc-audit`. Neither was relabeled or overwritten.

Attempt 36 is hash-bound to attempt 35 as its predecessor and is the first run in this correction lineage to complete browser proof, cleanup, post-manager guard, both audits, evidence hashing, and canonical terminal publication. This preserves diagnostic history while providing one authoritative successful envelope.

## Audit interpretation

Both audit detectors completed successfully and retained their mechanical leads. The ERP fidelity output continues to identify later-backlog capabilities such as track/trace and broader invoice/tariff depth; those are not W2-02 design-system closure requirements. Existing string-bag and inline-color leads require contract/context review and are not automatically defects. The W2-02 anti-drift and 98-case acceptance gates remain the binding scope evidence.

## Remaining items

There are no pending or failed Build and Test gates. Full load/capacity testing and the product/security tools explicitly excluded by the stage instructions remain unclaimed rather than pending. The historical W1 live-proof waiver remains **BLOCKED/WAIVED** and is not promoted to PASS.
