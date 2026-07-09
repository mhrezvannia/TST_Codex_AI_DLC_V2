# Functional Design Questions - U01 Charge Agreement Walking Skeleton

## Answers

| Question | Answer |
| --- | --- |
| What must the walking skeleton prove? | A new backend service shell, UI shell, health endpoint, and local reverse-proxy route can run beside Shared Platform. |
| What behavior is intentionally excluded? | Full agreement lifecycle, persistence, reference integration, and Booking lookup are deferred to U02-U09. |
| What is the minimum UI behavior? | A real Charge Agreements workbench shell with visible runtime status and disabled or stubbed controls that will become functional in later bolts. |
| What is the minimum backend behavior? | `/actuator/health` plus a module info endpoint returning service identity, version, and local mode. |

## Source Alignment

Answered from `bolt-plan.md`, `unit-of-work.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`.
