# Security Test Instructions - W1-01

## Upstream Inputs

Security testing consumes the W1-01 code-generation outputs plus the DevSecOps guidance for access control, secret handling, dependency risk, and runtime misconfiguration. The most relevant code-generation summaries are `booking-draft-skeleton`, `agreement-pricing`, `returned-status-detail`, and `live-release-acceptance`.

## Commands

Run the deterministic security-adjacent gates currently available in the repository:

```powershell
cd D:\TST_Codex_W1-01
docker compose config --quiet
git diff --check
& 'C:\Program Files\Git\bin\bash.exe' .claude/skills/aidlc-audit/detectors.sh
& 'C:\Program Files\Git\bin\bash.exe' .claude/skills/erp-fidelity-audit/detectors.sh
```

Run frontend lint/type checks:

```powershell
cd D:\TST_Codex_W1-01
yarn workspace @erp/app-booking typecheck
yarn workspace @erp/app-booking lint
```

## Review Checklist

| Risk | Expected check |
|---|---|
| Noop messaging in live proof | `MESSAGING_REQUIRE_REAL=true` rejects local-noop adapters for release acceptance |
| Service identity spoofing | local service tokens and actor mappings are validated in container tests |
| Direct browser-to-service calls | Booking browser calls BFF routes, not internal services |
| Sensitive data in logs/artifacts | acceptance harness redacts token-like values |
| Injection/query risks | JDBC paths use parameterized operations |
| Contract drift | Avro serde and mapper tests assert exact field names |
| Port/config exposure | Compose preflight requires PostgreSQL host port `55432` and nginx `8088` |

## Known Gaps

No full SAST, dependency CVE scan, image scan, or DAST command is currently wired as a deterministic repository gate. Those should be added in the CI Pipeline stage rather than invented locally here.

The detector scripts intentionally print LEADS. Exit code `0` means the detector command ran successfully, but the findings still require manual review against the source files and contract documents.
