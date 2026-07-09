# Enterprise Gap Summary

> Refreshed: 2026-07-08
> Graphify command run: `py -3.11 -m graphify update .`
> AI-DLC status: not started or advanced during this refresh.

## Input Inventory

### Canonical project and Shared Platform documents

- `docs/program-vision-document.md`
- `docs/program-execution-plan.md`
- `docs/enterprise-technical-environment.md`
- `docs/shared-platform-module-vision.md`
- `docs/shared-platform-module-tech-env.md`

### Enterprise contracts

- `docs/enterprise-contracts/async-event-contract-booking-confirmed.md`
- `docs/enterprise-contracts/bilateral-contract-booking-charge-pricing.md`
- `docs/enterprise-contracts/async-event-contract-containermovement-status.md`

### Claude UI export

- `design-inputs/claude-ui-export/Booking Directions.dc.html`
- `design-inputs/claude-ui-export/LinerCore Booking Directions.html`
- `design-inputs/claude-ui-export/LinerCore Platform.html`
- `design-inputs/claude-ui-export/LinerCore.dc.html`
- `design-inputs/claude-ui-export/support.js`
- `design-inputs/claude-ui-export/uploads/program-vision-document.md`
- `design-inputs/claude-ui-export/screenshots/`

## Graphify Indexing Status

Graphify rebuilt `graphify-out/graph.json` with 19,040 nodes, 19,564 edges, and 1,304 communities. The refreshed graph is still usable for code and markdown document analysis.

The installed CLI update path reported: `Code graph updated. For doc/paper/image changes run /graphify --update in your AI assistant.` It re-extracted code structurally and did not require an LLM key for that step.

The exact normalized markdown documents are present in the graph:

- `docs/program-vision-document.md`: 58 graph nodes found.
- `docs/shared-platform-module-vision.md`: 40 graph nodes found.
- `docs/enterprise-contracts/async-event-contract-booking-confirmed.md`: 15 graph nodes found.
- `docs/enterprise-contracts/bilateral-contract-booking-charge-pricing.md`: 14 graph nodes found.
- `docs/enterprise-contracts/async-event-contract-containermovement-status.md`: 15 graph nodes found.

The Claude UI export is only partially represented:

- `design-inputs/claude-ui-export/support.js` is structurally indexed.
- `design-inputs/claude-ui-export/uploads/program-vision-document.md` is represented as markdown content.
- The raw HTML export files and screenshot images are present on disk but were not found as source-file nodes by exact path in `graphify-out/graph.json`.

No `GEMINI_API_KEY` or `GOOGLE_API_KEY` was present in the environment during this refresh. The Graphify command that would need assistant-side or Gemini-backed semantic extraction for changed documents, images, and raw UI assets is the assistant-side `/graphify --update` flow, not the structural `py -3.11 -m graphify update .` command that was requested here.

## Preparation Gaps

### Enterprise baseline

- The five canonical project and Shared Platform documents are now normalized under `docs/`, giving AI-DLC a stable source set for program vision, execution sequencing, enterprise technical constraints, Shared Platform business scope, and Shared Platform technical conformance.
- Enterprise standards still carry deferred decisions that downstream AI-DLC runs must not silently fill in: physical site and DR posture, trade/regulatory footprint, full customer-type handling beyond MVP, and final vessel schedule/capacity source.
- Shared Platform remains the first dependency gate. Downstream modules can work against stubs only after the Shared Platform reference-data, identity, and event contracts are frozen and published.

### Contracts

- `booking.confirmed` and `containermovement.status` are now explicit async event contracts with payload, schema, compatibility, security, observability, and message-pact expectations.
- `bilateral-contract-booking-charge-pricing.md` now captures the high-risk synchronous Booking to Charge pricing relationship, including pricing request, result, D&D request, and D&D result interactions.
- Remaining gap: these prose contracts still need concrete registry artifacts and executable contract tests wired into module pipelines before they can serve as a real contract-freeze gate.

### Current implementation alignment

- The current graph links the strongest implementation coverage to `reference-data-service`, `identity-service`, outbox/event publication, `apps/reference-data`, and related tests.
- This aligns with the Shared Platform foundation: canonical reference sets, role/authorization model, provider/admin APIs, outbox status, and event publication abstractions are visible in the code graph.
- Remaining gap: downstream business-module runtime behavior is not complete in the graph for the full program MVP journey. Charge, Booking, and Container Movement work still need to be driven through their own module runs and integration milestones.

### UI export

- The Claude export covers program-facing flows beyond the existing Shared Platform admin app: pricing/agreement views, booking direction and booking workflow screens, container movement status/timeline views, and charge/D&D-oriented screens.
- `apps/reference-data` currently represents the implemented Shared Platform reference-data workbench; it does not yet implement the broader Booking, Charge, or Container Movement UI concepts shown in the Claude export.
- Remaining gap: the raw HTML and screenshots should be semantically indexed or converted into stable markdown/UI-analysis notes before they are treated as graph-backed requirements.

## Refreshed Preparation Status

Status: prepared for AI-DLC context consumption, with indexing caveats.

- File availability: complete for the five canonical documents, three enterprise contracts, and Claude UI export directory.
- Graph update: complete for structural/code refresh; markdown canonical docs and enterprise contracts are visible in `graphify-out/graph.json`.
- UI graph coverage: partial. `support.js` and uploaded markdown are indexed; raw HTML and screenshots are not graph-indexed by exact source path.
- Code graph usability: usable. The code graph was refreshed successfully and can support architecture/code discovery.
- Next preparation action before advancing AI-DLC: either run an assistant-side semantic extraction path for the UI assets or keep this caveat attached to any AI-DLC stage that consumes the Claude UI export.
