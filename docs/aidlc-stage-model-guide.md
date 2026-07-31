# AI-DLC Stage Model Guide

This is a cost-optimized model recommendation for the complete 32-stage AI-DLC
sequence. It uses `gpt-5.6-terra` for most work and reserves
`gpt-5.6-sol` for the two stages where frontier architectural reasoning normally
provides the greatest value.

## Model profiles

| Profile | Use |
|---|---|
| `gpt-5.6-luna` / `low` | Deterministic, clerical, or high-volume lightweight work |
| `gpt-5.6-terra` / `medium` | Routine analysis, planning, documentation, and pipeline work |
| `gpt-5.6-terra` / `high` | Complex technical analysis, implementation, testing, or operational design |
| `gpt-5.6-sol` / `high` | Difficult cross-cutting architecture and quality-attribute design |

If Luna is unavailable in the current Codex surface or account, use
`gpt-5.6-terra` with `low` reasoning instead.

## Complete stage sequence

| Sequence | Phase | Stage slug | Stage | Recommended model | Reasoning | Notes |
|---:|---|---|---|---|---|---|
| 0.1 | Initialization | `workspace-scaffold` | Workspace Scaffold | `gpt-5.6-luna` | `low` | Mostly deterministic setup |
| 0.2 | Initialization | `workspace-detection` | Workspace Detection | `gpt-5.6-luna` | `low` | Repository and workspace inspection |
| 0.3 | Initialization | `state-init` | State Initialization | `gpt-5.6-luna` | `low` | Deterministic state creation |
| 1.1 | Ideation | `intent-capture` | Intent Capture & Framing | `gpt-5.6-terra` | `medium` | Product framing and clarification |
| 1.2 | Ideation | `market-research` | Market Research | `gpt-5.6-terra` | `medium` | Research synthesis |
| 1.3 | Ideation | `feasibility` | Feasibility & Constraints | `gpt-5.6-terra` | `high` | Technical, compliance, and platform constraints |
| 1.4 | Ideation | `scope-definition` | Scope Definition | `gpt-5.6-terra` | `medium` | Scope boundaries and priorities |
| 1.5 | Ideation | `team-formation` | Team Formation | `gpt-5.6-luna` | `low` | Role and responsibility assignment |
| 1.6 | Ideation | `rough-mockups` | Rough Mockups | `gpt-5.6-terra` | `medium` | Early UX structure |
| 1.7 | Ideation | `approval-handoff` | Approval & Handoff | `gpt-5.6-luna` | `low` | Packaging and checkpoint handoff |
| 2.1 | Inception | `reverse-engineering` | Reverse Engineering | `gpt-5.6-terra` | `high` | Large code scans and technical synthesis; use Sol only for a difficult final synthesis |
| 2.2 | Inception | `practices-discovery` | Practices Discovery | `gpt-5.6-terra` | `medium` | Existing engineering-practice discovery |
| 2.3 | Inception | `requirements-analysis` | Requirements Analysis | `gpt-5.6-terra` | `medium` | Requirement refinement and traceability |
| 2.4 | Inception | `user-stories` | User Stories | `gpt-5.6-terra` | `medium` | Story and acceptance-criteria generation |
| 2.5 | Inception | `refined-mockups` | Refined Mockups | `gpt-5.6-terra` | `high` | Detailed UX, accessibility, and responsive behavior |
| 2.6 | Inception | `application-design` | Application Design | `gpt-5.6-sol` | `high` | Cross-service boundaries and consequential architecture |
| 2.7 | Inception | `units-generation` | Units Generation | `gpt-5.6-terra` | `high` | Technical decomposition and dependency ordering |
| 2.8 | Inception | `delivery-planning` | Delivery Planning | `gpt-5.6-terra` | `medium` | Bolt sequencing and delivery coordination |
| 3.1 | Construction | `functional-design` | Functional Design | `gpt-5.6-terra` | `high` | Domain behavior and component design |
| 3.2 | Construction | `nfr-requirements` | NFR Requirements | `gpt-5.6-terra` | `high` | Security, reliability, compliance, and performance requirements |
| 3.3 | Construction | `nfr-design` | NFR Design | `gpt-5.6-sol` | `high` | Cross-cutting quality-attribute tradeoffs |
| 3.4 | Construction | `infrastructure-design` | Infrastructure Design | `gpt-5.6-terra` | `high` | Use a Sol review for production security, residency, or irreversible topology decisions |
| 3.5 | Construction | `code-generation` | Code Generation | `gpt-5.6-terra` | `high` | Use Sol selectively for complex shared foundations or risky migrations |
| 3.6 | Construction | `build-and-test` | Build and Test | `gpt-5.6-terra` | `high` | Escalate to Sol only for stubborn failures or critical security defects |
| 3.7 | Construction | `ci-pipeline` | CI Pipeline | `gpt-5.6-terra` | `medium` | Pipeline configuration and quality gates |
| 4.1 | Operation | `deployment-pipeline` | Deployment Pipeline | `gpt-5.6-terra` | `medium` | CD workflow and release controls |
| 4.2 | Operation | `environment-provisioning` | Environment Provisioning | `gpt-5.6-terra` | `high` | Infrastructure changes and environment validation |
| 4.3 | Operation | `deployment-execution` | Deployment Execution | `gpt-5.6-terra` | `medium` | Mostly procedural execution with deterministic gates |
| 4.4 | Operation | `observability-setup` | Observability Setup | `gpt-5.6-terra` | `medium` | Metrics, logs, traces, dashboards, and alerts |
| 4.5 | Operation | `incident-response` | Incident Response | `gpt-5.6-terra` | `high` | Use Sol for an active severe production incident |
| 4.6 | Operation | `performance-validation` | Performance Validation | `gpt-5.6-terra` | `high` | Bottleneck analysis and performance evidence |
| 4.7 | Operation | `feedback-optimization` | Feedback & Optimization | `gpt-5.6-terra` | `medium` | Feedback synthesis and improvement planning |

## Escalation policy

Start with the model listed above. Escalate a stage or a final review to
`gpt-5.6-sol` / `high` when one or more of these conditions apply:

- The decision changes public contracts or several service boundaries.
- The work involves security-critical authorization, regulated data, residency,
  encryption, or an irreversible production topology.
- A data migration or deployment has material data-loss or downtime risk.
- Terra produces conflicting designs or fails verification more than once.
- The work concerns an active severe production incident.

Prefer a single Sol review pass over running the entire stage with Sol.
Do not use `xhigh` or `max` by default; reserve them for demonstrated cases
where `high` does not produce an acceptable verified result.

## Configuration note

The current project configuration pins the main session to
`gpt-5.6-sol` / `high`, and the AI-DLC custom agent files also pin their model
to `gpt-5.6-sol`. Custom agent settings take precedence over the main project
default, so changing only `.codex/config.toml` will not reduce every stage's
model usage.

Because one AI-DLC agent can lead several stages, exact per-stage routing
requires an engine-level stage override. Without that override, the closest
cost-optimized role configuration is:

- `gpt-5.6-terra` / `medium`: product, design, delivery, pipeline-deploy, and
  operations agents.
- `gpt-5.6-terra` / `high`: architect, developer, AWS platform, DevSecOps,
  compliance, and quality agents.
- `gpt-5.6-sol` / `high`: product-lead and architecture-reviewer agents used
  for selective quality gates.

## References

- AI-DLC stage order: `.agents/skills/aidlc/SKILL.md`
- Project model default: `.codex/config.toml`
- AI-DLC custom agents: `.codex/agents/*.toml`
- OpenAI model guidance: <https://developers.openai.com/api/docs/guides/latest-model>
- OpenAI model catalog: <https://developers.openai.com/api/docs/models>
