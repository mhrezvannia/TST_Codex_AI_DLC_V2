# Observation Diary - CI Pipeline

- 2026-07-18T00:00:00Z - Selected the existing GitHub Actions workflow `.github/workflows/quality-gates.yml` as the active CI surface; repository convention already uses self-hosted on-prem Linux runners.
- 2026-07-18T00:05:00Z - Extended CI rather than creating a second workflow, preserving W0-01, W0-02, W1-01, and W2-02 gates.
- 2026-07-18T00:10:00Z - Added W2-01 shell/auth/shared package gates and an explicit `--require-pass` validator so a schema-valid `BLOCKED` live package remains a merge blocker.
- 2026-07-18T00:15:00Z - Kept W1-01 live-proof waiver wording explicit: `W1-01 live-proof waiver remains BLOCKED at compose-start; not a W2-01 PASS.`
