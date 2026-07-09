# Intent Capture Questions - LinerCore Enterprise

## Q1. What business problem is this enterprise program solving?

A. Complete the integrated LinerCore production application across pricing, booking, container movement, D&D, UI, runtime, and operation.
B. Continue only the completed Shared Platform MVP.
C. Build a prototype without production NFRs.
D. Build only a document set.
X. Other (please specify)

[Answer]: A. Complete the integrated LinerCore production application across pricing, booking, container movement, D&D, UI, runtime, and operation.

## Q2. Who is the target customer and beneficiary?

A. Container liner and feeder carriers operating commercial, booking, and equipment-control workflows.
B. Only internal platform administrators.
C. Only external shippers.
D. Only engineering operators.
X. Other (please specify)

[Answer]: A. Container liner and feeder carriers operating commercial, booking, and equipment-control workflows.

## Q3. What does success require?

A. Real business implementation, real APIs/events, database migrations, frontend apps, authn/authz, tests, contract tests, local runtime, observability, and operational artifacts.
B. Containers start with placeholder APIs.
C. Documents and diagrams are complete.
D. Mock screens are available.
X. Other (please specify)

[Answer]: A. Real business implementation, real APIs/events, database migrations, frontend apps, authn/authz, tests, contract tests, local runtime, observability, and operational artifacts.

## Q4. What is the trigger for this initiative?

A. Promote from completed Shared Platform MVP and Graphify preparation into the complete enterprise LinerCore program.
B. Restart the old Shared Platform workflow.
C. Replace the existing codebase from scratch.
D. Run only a discovery exercise.
X. Other (please specify)

[Answer]: A. Promote from completed Shared Platform MVP and Graphify preparation into the complete enterprise LinerCore program.

## Q5. What source material is authoritative for intent capture?

A. Program Vision, Program Execution Plan, Enterprise Technical Environment, Shared Platform Vision/Tech-Env, enterprise contracts, Graphify graph/report, enterprise gap summary, and Claude UI export.
B. Only the current codebase.
C. Only the Claude UI prototype.
D. Only the prior Shared Platform MVP artifacts.
X. Other (please specify)

[Answer]: A. Program Vision, Program Execution Plan, Enterprise Technical Environment, Shared Platform Vision/Tech-Env, enterprise contracts, Graphify graph/report, enterprise gap summary, and Claude UI export.

## Q6. What must be preserved?

A. Historical Shared Platform MVP intent, `shared-platform-mvp-complete` tag, existing MVP implementation, and traceability to authoritative documents and Graphify analysis.
B. Nothing; the program can overwrite prior history.
C. Only source code.
D. Only documents.
X. Other (please specify)

[Answer]: A. Historical Shared Platform MVP intent, `shared-platform-mvp-complete` tag, existing MVP implementation, and traceability to authoritative documents and Graphify analysis.

## Q7. What module boundaries must be maintained?

A. Shared Platform; Charge Calculation & Customer Agreement including D&D ownership; Customer Booking; Container Movement Management.
B. Collapse all domains into one deployable.
C. Implement only Shared Platform.
D. Implement only frontend pages.
X. Other (please specify)

[Answer]: A. Shared Platform; Charge Calculation & Customer Agreement including D&D ownership; Customer Booking; Container Movement Management.

## Q8. What local execution target is required?

A. `docker compose --profile full up -d --build` plus development profiles for core, app, observability, devtools, full, and useful module modes.
B. Remote-only runtime.
C. Local frontend only.
D. Manual process without compose profiles.
X. Other (please specify)

[Answer]: A. `docker compose --profile full up -d --build` plus development profiles for core, app, observability, devtools, full, and useful module modes.

## Q9. What is the primary UX baseline?

A. `design-inputs/claude-ui-export/`, preserving visual quality while replacing prototype behavior with real business behavior.
B. Ignore the prototype.
C. Copy fake prototype business logic exactly.
D. Build only backend APIs.
X. Other (please specify)

[Answer]: A. `design-inputs/claude-ui-export/`, preserving visual quality while replacing prototype behavior with real business behavior.

## Q10. What approval should stop this stage?

A. Approve the new enterprise intent-capture baseline and proceed to Market Research.
B. Request changes to the enterprise baseline before any next AI-DLC stage.
C. Cancel the enterprise intent.
X. Other (please specify)

[Answer]: Pending human approval gate.
