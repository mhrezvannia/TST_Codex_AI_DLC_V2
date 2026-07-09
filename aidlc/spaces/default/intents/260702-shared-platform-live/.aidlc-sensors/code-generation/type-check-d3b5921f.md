# type-check finding — code-generation

**Timestamp**: 2026-07-03T15:21:03Z
**Fire id**: d3b5921f
**Output path**: D:\TST_Codex\apps\reference-data\lib\service-clients.ts
**Pass**: false

## Findings

```json
{
  "pass": false,
  "errors": [
    {
      "file": "lib/service-clients.ts",
      "line": 265,
      "column": 21,
      "message": "Property 'error' does not exist on type 'ServiceResult<unknown>'.\n  Property 'error' does not exist on type '{ ok: true; status: number; correlationId: string; data: unknown; }'."
    },
    {
      "file": "lib/service-clients.ts",
      "line": 266,
      "column": 22,
      "message": "Property 'detail' does not exist on type 'ServiceResult<unknown>'.\n  Property 'detail' does not exist on type '{ ok: true; status: number; correlationId: string; data: unknown; }'."
    }
  ],
  "findings_count": 2
}
```
