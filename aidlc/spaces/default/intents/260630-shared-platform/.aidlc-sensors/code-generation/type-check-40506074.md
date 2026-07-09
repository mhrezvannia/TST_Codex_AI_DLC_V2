# type-check finding — code-generation

**Timestamp**: 2026-07-01T15:09:19Z
**Fire id**: 40506074
**Output path**: D:\TST_Codex\apps\auth\app\api\auth\callback\route.ts
**Pass**: false

## Findings

```json
{
  "pass": false,
  "errors": [
    {
      "file": "app/api/auth/callback/route.ts",
      "line": 9,
      "column": 8,
      "message": "Module '\"../../../../lib/auth-server\"' declares 'OidcTransaction' locally, but it is not exported."
    }
  ],
  "findings_count": 1
}
```
