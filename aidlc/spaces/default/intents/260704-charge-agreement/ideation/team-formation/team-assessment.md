# Team Assessment - Charge & Customer Agreement

## Upstream Inputs

This assessment consumes:

| Input | Use |
| --- | --- |
| `scope-document.md` | Defines the required module capabilities and exclusions. |
| `intent-backlog.md` | Defines proto-units CA-01 through CA-12 and construction sequencing. |
| `feasibility-assessment.md` | Defines stack feasibility, runtime constraints, and technical risks. |

## Delivery Model

The practical delivery model is a compact AI-assisted build team:

| Role | Coverage |
| --- | --- |
| Product owner | User/product sponsor provides direction and gate approval. |
| Product analyst | AI-DLC product artifacts define scope, priorities, and acceptance signals. |
| Architect | AI-DLC architecture stages define service boundaries, contracts, and NFRs. |
| Developer | Codex implements code in the shared workspace. |
| Quality engineer | Tests, smoke checks, readiness scripts, and contract validation provide evidence. |
| Platform/operations | Existing host-runtime and Compose artifacts guide local execution; Docker recovery remains tracked separately. |
| Compliance/security | Compliance constraints are captured in feasibility and later NFR stages. |

## Capacity Assessment

| Area | Capacity | Notes |
| --- | --- | --- |
| Product decisions | Available | User has approved the roadmap and current module direction. |
| Implementation | Available | Codex can edit backend/frontend/scripts in the workspace. |
| Local runtime | Available with constraint | Host-runtime works; Docker/Compose remains unhealthy. |
| QA automation | Available | Existing test stack includes Maven, Vitest, Node test runner, smoke/readiness scripts. |
| Business validation | Partial | User can approve gates; detailed pricing-user validation is not yet represented by a named SME. |
| Production operations | Deferred | Production is outside first module completion. |

## Gaps

| Gap | Impact | Mitigation |
| --- | --- | --- |
| No named pricing SME | Some field/approval details may need later refinement. | Use minimal logistics pricing model and keep fields extensible. |
| Docker not healthy | Full Compose validation may lag implementation. | Build and verify in host-runtime mode first. |
| Booking not built yet | Active lookup consumer cannot be fully integrated yet. | Define and test lookup contract with examples. |

## Delivery Readiness

Proceed with a solo AI-assisted build model. The team shape is sufficient for the first local module slice if gates remain explicit and tests prove behavior.
