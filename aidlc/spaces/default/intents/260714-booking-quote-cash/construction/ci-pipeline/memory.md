# CI Pipeline Memory

## Interpretations

- 2026-07-16T15:29:06Z - Treated the existing GitHub Actions workflow as the CI tool rather than introducing CodePipeline or Jenkins; the repository already has `.github/workflows/quality-gates.yml`, and team practice names GitHub Actions on self-hosted on-premises runners.

## Deviations

## Tradeoffs

- 2026-07-16T15:29:06Z - Added a W1 live-acceptance dry run to PR CI instead of requiring the full Docker live journey on every pull request; full live acceptance remains a release gate because the current Docker host is blocked on external image/proxy access.

## Open questions

- 2026-07-16T15:29:06Z - Decide whether a dedicated self-hosted runner with cached Confluent, PostgreSQL, and Elastic images should run the full live acceptance command as a scheduled or manual release proof.
