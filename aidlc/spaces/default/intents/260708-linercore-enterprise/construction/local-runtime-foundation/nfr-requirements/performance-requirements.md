# Performance Requirements - local-runtime-foundation

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

`local-runtime-foundation` must make the LinerCore enterprise runtime usable on Windows without remote runtime servers. Performance targets focus on startup, health feedback, reset, logs, and local developer iteration.

## Startup Targets

| Profile | Target |
|---|---|
| `core` | Infrastructure-ready within 5 minutes on a normal Windows development machine. |
| `app` | Application services and frontends report health within 10 minutes when images are already built. |
| `observability` | Observability infrastructure reports container and endpoint health within 5 minutes. |
| `devtools` | Optional tools start within 5 minutes and cannot block core readiness unless explicitly required. |
| `full` | Application/evidence-ready within 15 minutes when dependent unit implementations exist. |

## Command Performance

| Command class | Target |
|---|---|
| `setup` preflight | Complete within 30 seconds excluding Docker daemon startup. |
| `health` | Return profile readiness matrix within 15 seconds. |
| `logs` | Start streaming or collect last bounded log window within 10 seconds. |
| `stop` | Stop selected profile within 2 minutes. |
| `reset` | Complete scoped local volume reset within 5 minutes excluding migrations and seed hooks owned by later units. |

## Resource Constraints

- The default profile set must fit a normal developer workstation without requiring cloud services.
- The runtime must support independent IDE mode where Docker runs infrastructure and one service or frontend runs on the host.
- Startup status must show slow service owner and dependency rather than waiting silently.
- Build cache use is allowed, but readiness targets must be measured separately from first-ever dependency download.

## Benchmark Evidence

| Benchmark | Evidence |
|---|---|
| `core` startup | Compose timing, health report, blocker-free status |
| `full` startup | Compose timing, health report, service/frontend route status |
| independent IDE mode | Host-run service profile evidence and route status |
| health command | Timing, service matrix, exact status categories |

## Traceability

| Source | Performance coverage |
|---|---|
| `business-logic-model.md` | Defines start, stop/reset, health, IDE mode, and environment validation workflows. |
| `business-rules.md` | Defines profile, readiness, environment, developer mode, and completion guardrail rules. |
| `requirements.md` | Supplies FR-RUN-001 through FR-RUN-006 and local-first constraints. |
| `technology-stack.md` | Supplies Docker Compose, PostgreSQL, Keycloak, Kafka, Schema Registry, nginx, and observability stack. |
| `nfr-requirements-questions.md` | Q1 sets startup targets and Q2 defines readiness honesty. |

## Review

Verdict: READY

Reviewer route: inline architecture review, because the configured `aidlc-architecture-reviewer-agent` is not available under the current Codex account/model configuration (`openai.gpt-5.4` unsupported for this account).

Findings:

- Startup, health, reset, and command targets are measurable and tied to the approved local-first Windows runtime requirement.
- Security defaults correctly require secret-free `.env.example`, deterministic Keycloak bootstrap, local-only bypass controls, service JWT/RS256 settings, and no accidental non-local bypass.
- Scalability requirements cover the complete first-release local enterprise topology without taking ownership of business migrations or seed fixtures.
- Reliability requirements keep readiness honest by distinguishing container, infrastructure, application, evidence, and blocked states.
- Required-section and upstream-coverage sensors passed; linter and type-check are not applicable to markdown-only outputs.

Residual risks to carry forward:

- Infrastructure Design must translate these requirements into concrete Compose profile wiring, health check definitions, port maps, and host IDE mode mechanics.
- Build and Test must verify actual startup timings on a representative Windows development machine.
