# NFR Design Questions - U06 Final Live Acceptance and Audit

## Question 1

When may `manifest.json.finalDecision` be `PASS`?

A. Only when all required live scenarios, detector 6d, `erp-fidelity-audit`, and `aidlc-audit` pass with parseable evidence.
B. When unit tests pass even if live Compose is blocked.
C. When screenshots show the expected UI.
D. When W1 waiver is rewritten as PASS.
E. When most scenarios pass.
X. Other (please specify)

[Answer]: A

## Question 2

How should blocked runtime, detector, scenario, or audit outcomes be recorded?

A. As W2-01 `BLOCKED` records with concrete `blockerId` rows in `blockers.jsonl`.
B. Omit blocked results from the manifest.
C. Convert blocked results into skipped tests.
D. Merge blocked results into the W1 waiver.
E. Replace live proof with static screenshots.
X. Other (please specify)

[Answer]: A

## Question 3

What evidence fields are security-critical for U06?

A. Real subjects, actor headers, authorization decisions, sign-out/stale-call correlation, no `local-user`, detector output, and W1 waiver BLOCKED status.
B. Browser screenshots only.
C. Anonymous route status only.
D. Raw tokens for debugging.
E. Broad service logs without scenario ids.
X. Other (please specify)

[Answer]: A

