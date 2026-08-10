# Infrastructure Design Questions - U06 Final Live Acceptance and Audit

## Question 1

What should U06 add to runtime infrastructure?

A. No runtime service; only finite local evidence capture under `artifacts/w2-01-live/app-shell-auth/`.
B. A managed observability service.
C. A cloud acceptance environment.
D. A continuous polling worker.
E. A database for evidence.
X. Other (please specify)

[Answer]: A

## Question 2

How should detector and audit commands be captured?

A. Exact command, start/end times, exit code, output file, PASS/BLOCKED status, and blocker id when blocked.
B. Summary text only.
C. Screenshot of terminal only.
D. Omit failed commands.
E. Convert failures to warnings.
X. Other (please specify)

[Answer]: A

## Question 3

How should final PASS be decided?

A. Only when all required files parse, scenarios pass, commands pass, no secrets leak, and W1 waiver remains BLOCKED.
B. When most scenarios pass.
C. When live runtime is unavailable but unit tests pass.
D. When W1 waiver is changed to PASS.
E. When screenshots look correct.
X. Other (please specify)

[Answer]: A

