# Decision Log - Charge & Customer Agreement Ideation

## Decisions

| ID | Decision | Source stage | Rationale |
| --- | --- | --- | --- |
| D-001 | Build Charge & Customer Agreement after Shared Platform. | Intent Capture | Project memory records this as the first follow-on module. |
| D-002 | Treat the scope as a feature workflow. | Intent Capture | New business module with backend, UI, tests, and integration impact. |
| D-003 | Build internal module first; preserve buy/partner seams for later. | Market Research | External RMS suites validate the category but are too broad for the first MVP slice. |
| D-004 | Use host-runtime as the reliable local implementation path. | Feasibility | Docker/Compose is currently unhealthy; host runtime is passing. |
| D-005 | Add a bounded Charge Agreement context rather than modifying Shared Platform scope. | Feasibility | Shared Platform should be consumed, not rebuilt or expanded into business modules. |
| D-006 | MVP includes lifecycle, charge terms, API, UI, Shared Platform integration, and active lookup. | Scope Definition | These capabilities unblock Booking and make the module functional. |
| D-007 | Defer Booking, Container Movement, invoicing, spot rates, index-linked pricing, and carrier connectivity. | Scope Definition | Prevents scope creep into full RMS or downstream modules. |
| D-008 | Use a solo AI-assisted delivery model with explicit quality gates. | Team Formation | No named delivery squad exists; current workspace can be advanced by Codex with tests and gates. |
| D-009 | Use dense operational UI screens for commercial users. | Rough Mockups | Users need scanning, editing, approval, and lookup workflows. |

## Open Decisions for Inception

| ID | Decision | Target stage |
| --- | --- |
| OD-001 | Confirm exact backend service boundary and module name. | Application Design |
| OD-002 | Confirm data schema and API shape for active lookup. | Requirements Analysis / Application Design |
| OD-003 | Confirm whether event publication is real or stubbed in the first slice. | NFR / Functional Design |
| OD-004 | Confirm ports/proxy route for host-runtime. | Infrastructure Design |

## Rejected Alternatives

| Alternative | Reason rejected |
| --- | --- |
| Build Booking first | Booking would lack authoritative approved commercial terms. |
| Buy full RMS now | Too broad and likely slows MVP learning. |
| Static/view-only UI | Does not satisfy user goal or module completion criteria. |
| Wait for Docker before implementation | Docker is an environment blocker but host-runtime is usable now. |
