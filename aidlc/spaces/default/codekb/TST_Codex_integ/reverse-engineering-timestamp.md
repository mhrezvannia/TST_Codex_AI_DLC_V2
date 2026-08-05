# Reverse Engineering Timestamp - TST_Codex_integ

## Scan Metadata

| Field | Value |
|---|---|
| Repository | `D:\TST_Codex_integ` |
| Codekb directory | `aidlc/spaces/default/codekb/TST_Codex_integ/` |
| AI-DLC intent | `260717-app-shell-auth` |
| Stage | `reverse-engineering` |
| Timestamp UTC | `2026-07-18T05:50:27Z` |
| Commit | `5dd6481c0a6092ff3b2a3faa79dc54db788d3ad7` |
| Branch | `intent/W2-01-app-shell-and-auth` |
| MCP project | `TST_Codex_integ` |
| MCP index mode | `fast` |
| MCP graph nodes | `72695` |
| MCP graph edges | `82668` |

## Scope of Analysis

Reverse engineering covered the single-repo workspace root and emphasized W2-01-relevant brownfield seams:

- `apps/auth`
- `apps/booking`
- `packages/auth`
- `packages/ui`
- `services/identity-service`
- `services/booking-service`
- `compose.yaml`
- root build/test/evidence scripts

## Freshness Notes

- codebase-memory MCP was indexed during this W2-01 session and persisted to `.codebase-memory/graph.db.zst`.
- `graphify-out/GRAPH_REPORT.md` exists but was built from older commit `86e21054`, so it was treated as advisory only.
- Re-run reverse engineering or refresh MCP/Graphify after major code changes.
