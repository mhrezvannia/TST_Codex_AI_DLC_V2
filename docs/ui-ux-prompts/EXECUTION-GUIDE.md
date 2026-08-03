# Exact UI/UX Prompt Execution Guide

Use this guide for the remaining Phase 1 intents. Run one intent at a time.

## Lifecycle position

The binding design run happens at this boundary:

`Requirements Analysis 2.3 approved → User Stories 2.4 approved → PARK before executing 2.5 → run and approve UI/UX prompt → resume Refined Mockups 2.5 → Application Design 2.6`

Do not run the final design prompt before Requirements Analysis and User Stories
are approved. Do not wait until Construction. A Rough Mockups 1.6 run may explore
options, but its output is provisional and must not be passed directly to
Construction.

## Step 1 — verify the active stage

Paste:

```text
$aidlc --status
```

If Requirements Analysis or User Stories are not approved, continue AI-DLC
normally and approve each completed stage at its gate. Do not use a stage jump to
skip them. Continue only until status shows that Refined Mockups is current/next.

Every intent-launch prompt must include this control block:

```text
Proceed normally through Requirements Analysis (2.3) and User Stories (2.4),
including their approval gates. As soon as Refined Mockups (2.5) becomes the
current or next stage, park the main AI-DLC workflow at that clean inter-stage
boundary and stop. Do not execute, approve, skip, or single-run Refined Mockups.
Tell me which intent-specific UI/UX Pro Max prompt to run and wait for me.
```

The conductor should use the AI-DLC park operation at this boundary. The parked
workflow remains on 2.5 while the design-only UI/UX Pro Max task is generated,
reviewed, corrected, and explicitly approved.

## Step 2 — generate the intent design

Use the matching exact prompt below. The AI reads the numbered prompt from disk,
so you do not need to copy its full contents manually.

### W3-01 — D&D Rules and Rates

```text
$ui-ux-pro-max

Read and execute the complete design task in
docs/ui-ux-prompts/18-dnd-rules-and-rates.md.

Load the active W3-01 intent statement, its complete Context Pack, approved
Requirements Analysis and User Stories, design-system/linercore/MASTER.md,
design-system/linercore/SESSION-PROMPT.md, and the relevant page contracts.

Write the complete design candidate to
docs/ui-ux-design/18-dnd-rules-and-rates.md. You may create or update design
documentation only. Do not modify production code, routes, APIs, tests,
packages, infrastructure, or AI-DLC state. Do not use --persist and do not
advance the AI-DLC stage. End with unresolved questions and a review checklist.
```

### W3-04 — Booking Request Completeness

W3-04 may run alongside W3-01 because its providers are already closed. It must
finish before W3-03 begins.

```text
$ui-ux-pro-max

Read and execute the complete design task in
docs/ui-ux-prompts/25-booking-request-completeness.md.

Load the active W3-04 intent statement, its complete Context Pack, approved
Requirements Analysis and User Stories, design-system/linercore/MASTER.md,
design-system/linercore/SESSION-PROMPT.md, the reviewed Booking queue/create/detail
designs, current Booking/reference/pricing contracts, and the running demo.

Write the complete design candidate to
docs/ui-ux-design/25-booking-request-completeness.md. You may create or update
design documentation only. Do not modify production code, routes, APIs, tests,
packages, infrastructure, page contracts, or AI-DLC state. Do not use --persist
and do not advance the AI-DLC stage. End with unresolved questions, proposed
page-override content, and a review checklist.
```

### W3-02 — Booking Charges and Invoice

Run only after the W3-01 provider/evidence contract is approved.

```text
$ui-ux-pro-max

Read and execute the complete design task in
docs/ui-ux-prompts/19-booking-charges-and-invoice.md.

Load the active W3-02 intent statement, its complete Context Pack, approved
Requirements Analysis and User Stories, the approved W3-01 contract/design,
design-system/linercore/MASTER.md, design-system/linercore/SESSION-PROMPT.md,
the Booking refined mockups, and the relevant page contracts.

Write the complete design candidate to
docs/ui-ux-design/19-booking-charges-and-invoice.md. You may create or update
design documentation only. Do not modify production code, routes, APIs, tests,
packages, infrastructure, or AI-DLC state. Do not use --persist and do not
advance the AI-DLC stage. End with unresolved questions and a review checklist.
```

### W3-03 — Booking Amendments and Reconfirmation

```text
$ui-ux-pro-max

Read and execute the complete design task in
docs/ui-ux-prompts/20-booking-amendments-reconfirmation.md.

Load the active W3-03 intent statement, its complete Context Pack, approved
Requirements Analysis and User Stories, the approved W3-04 field baseline and
reviewed design, design-system/linercore/MASTER.md,
design-system/linercore/SESSION-PROMPT.md, the Booking refined mockups, and the
relevant page contracts.

Write the complete design candidate to
docs/ui-ux-design/20-booking-amendments-reconfirmation.md. You may create or
update design documentation only. Do not modify production code, routes, APIs,
tests, packages, infrastructure, or AI-DLC state. Do not use --persist and do
not advance the AI-DLC stage. End with unresolved questions and a review
checklist.
```

### W4-01 — three module designs

Run these three prompts in order during the same W4-01 Refined Mockups stage.

#### W4-01A — Reference Data

```text
$ui-ux-pro-max

Read and execute the complete design task in
docs/ui-ux-prompts/21-reference-data-list-detail-uplift.md.

Load the active W4-01 intent statement, its complete Context Pack, approved
Requirements Analysis and User Stories, design-system/linercore/MASTER.md,
design-system/linercore/SESSION-PROMPT.md, the old Reference Data design, and
the relevant page contracts.

Write the complete design candidate to
docs/ui-ux-design/21-reference-data-list-detail-uplift.md. You may create or
update design documentation only. Do not modify production code, routes, APIs,
tests, packages, infrastructure, or AI-DLC state. Do not use --persist and do
not advance the AI-DLC stage. End with unresolved questions and a review
checklist.
```

#### W4-01B — Charge Agreements

Run after reviewing the Reference Data design so the repeated pattern is known.

```text
$ui-ux-pro-max

Read and execute the complete design task in
docs/ui-ux-prompts/22-charge-agreements-list-detail-uplift.md.

Load the active W4-01 intent statement, its complete Context Pack, approved
Requirements Analysis and User Stories, the reviewed Reference Data uplift,
approved W3-01 D&D design/contracts, design-system/linercore/MASTER.md,
design-system/linercore/SESSION-PROMPT.md, the old Charge design, and the
relevant page contracts.

Write the complete design candidate to
docs/ui-ux-design/22-charge-agreements-list-detail-uplift.md. You may create or
update design documentation only. Do not modify production code, routes, APIs,
tests, packages, infrastructure, or AI-DLC state. Do not use --persist and do
not advance the AI-DLC stage. End with unresolved questions and a review
checklist.
```

#### W4-01C — Container Journeys

If CMM designs `90` and `91` are not already reviewed, run those foundation
prompts first. Then paste:

```text
$ui-ux-pro-max

Read and execute the complete design task in
docs/ui-ux-prompts/23-container-journeys-list-detail-uplift.md.

Load the active W4-01 intent statement, its complete Context Pack, approved
Requirements Analysis and User Stories, the reviewed Reference Data repeated
pattern, the reviewed CMM 90/91 designs, design-system/linercore/MASTER.md,
design-system/linercore/SESSION-PROMPT.md, and the relevant page contracts.

First verify the actual CMM frontend source and route mount. Do not claim they
exist if they are absent. Write the complete design candidate to
docs/ui-ux-design/23-container-journeys-list-detail-uplift.md. You may create or
update design documentation only. Do not modify production code, routes, APIs,
tests, packages, infrastructure, or AI-DLC state. Do not use --persist and do
not advance the AI-DLC stage. End with unresolved questions and a review
checklist.
```

### W4-02 — Operations Observability

```text
$ui-ux-pro-max

Read and execute the complete design task in
docs/ui-ux-prompts/24-operations-observability.md.

Load the active W4-02 intent statement, its complete Context Pack, approved
Requirements Analysis and User Stories, current Compose/telemetry descriptors,
design-system/linercore/MASTER.md, design-system/linercore/SESSION-PROMPT.md,
and the observability page contract.

Write the complete design candidate to
docs/ui-ux-design/24-operations-observability.md. You may create or update
design documentation only. Do not modify production code, dashboards,
infrastructure, telemetry configuration, alerts, runbooks, tests, or AI-DLC
state. Do not use --persist and do not advance the AI-DLC stage. End with
unresolved questions and a review checklist.
```

## Step 3 — review the generated design

Immediately after each design is generated, paste this exact prompt in the same
session:

```text
$ui-ux-pro-max

Review the design document you just created against the active intent statement,
its approved Requirements Analysis and User Stories, the complete Context Pack,
design-system/linercore/MASTER.md, SESSION-PROMPT.md, relevant page contracts,
and existing approved module designs.

Check business-scope traceability, domain ownership, route assumptions, every
loading/empty/error/denied/pending/success/conflict/degraded state, responsive
behavior at 375/390/768/1024/1440px, keyboard and focus order, async announcements,
non-color status meaning, and @erp/ui reuse. Reject marketing composition,
replacement colors/fonts, unsupported actions, invented APIs/data, and changes
to the shared shell.

Report all conflicts and missing decisions. Do not modify production code or
advance AI-DLC. If corrections are unambiguous and remain within approved scope,
apply them to the same design document and summarize the changes. Otherwise stop
with explicit questions for me.
```

Resolve all reported questions. When satisfied, paste:

```text
I approve the design document just reviewed as page-level design input for the
active intent. Record its approval status and date in that design document.
Do not modify production code and do not advance AI-DLC yet.
```

For W4-01, approve all three design documents before continuing.

## Step 4 — convert the approved design into Refined Mockups artifacts

The main workflow must still be parked with Refined Mockups 2.5 current. Resume
that workflow and supply the reviewed design as its binding input. Do not use a
single-stage runner: it is isolated and cannot advance the main intent.

### W3-01 handoff

```text
$aidlc --resume

Read and follow docs/ui-ux-prompts/REFINED-MOCKUP-HANDOFF.md completely.
Apply it to W3-01 D&D Rules and Rates using the reviewed design
docs/ui-ux-design/18-dnd-rules-and-rates.md and the W3-01 LinerCore runbook/page
contracts. Produce the binding Refined Mockups artifacts in the active W3-01
intent record. Do not advance to Application Design until I approve the gate.
```

### W3-04 handoff

```text
$aidlc --resume

Read and follow docs/ui-ux-prompts/REFINED-MOCKUP-HANDOFF.md completely.
Apply it to W3-04 Booking Request Completeness using the reviewed design
docs/ui-ux-design/25-booking-request-completeness.md, the approved W3-04 field
dictionary, and the LinerCore master plus established Booking create/detail
designs. Produce the binding Refined Mockups artifacts in the active W3-04
intent record. Record any proposed page override for approval; do not edit the
master or production code. Do not advance to Application Design until I approve
the gate.
```

### W3-02 handoff

```text
$aidlc --resume

Read and follow docs/ui-ux-prompts/REFINED-MOCKUP-HANDOFF.md completely.
Apply it to W3-02 D&D Pricing and Invoice using the reviewed design
docs/ui-ux-design/19-booking-charges-and-invoice.md, the approved W3-01
provider/evidence contract, and the W3-02 LinerCore runbook/page contract.
Produce the binding Refined Mockups artifacts in the active W3-02 intent record.
Do not advance to Application Design until I approve the gate.
```

### W3-03 handoff

```text
$aidlc --resume

Read and follow docs/ui-ux-prompts/REFINED-MOCKUP-HANDOFF.md completely.
Apply it to W3-03 Booking Amendments and Reconfirmation using the reviewed design
docs/ui-ux-design/20-booking-amendments-reconfirmation.md and the W3-03
LinerCore runbook/page contract plus the approved W3-04 field baseline. Produce
the binding Refined Mockups artifacts in the active W3-03 intent record. Do not
advance to Application Design until I approve the gate.
```

### W4-01 handoff

```text
$aidlc --resume

Read and follow docs/ui-ux-prompts/REFINED-MOCKUP-HANDOFF.md completely.
Apply it to W4-01 Module List/Detail Uplift using all three reviewed designs:
- docs/ui-ux-design/21-reference-data-list-detail-uplift.md
- docs/ui-ux-design/22-charge-agreements-list-detail-uplift.md
- docs/ui-ux-design/23-container-journeys-list-detail-uplift.md

Use the W4-01 LinerCore runbook and all relevant page contracts. Produce one
binding interaction specification per module plus the complete shared-state,
cross-link, responsive, accessibility, and traceability artifacts in the active
W4-01 intent record. Explicitly resolve the actual CMM source/mount before making
its design implementation-binding. Do not advance to Application Design until I
approve the gate.
```

### W4-02 handoff

```text
$aidlc --resume

Read and follow docs/ui-ux-prompts/REFINED-MOCKUP-HANDOFF.md completely.
Apply it to W4-02 Operations Observability using the reviewed design
docs/ui-ux-design/24-operations-observability.md and the W4-02 LinerCore
runbook/page contract. Produce the binding dashboard hierarchy, operator flows,
state matrix, accessibility requirements, and failure-drill evidence plan in the
active W4-02 intent record. Do not build a duplicate LinerCore observability UI.
Do not advance to Application Design until I approve the gate.
```

## Step 5 — approve Refined Mockups

Review the artifacts named by AI-DLC. If correct, select `Approve` in the gate.
If the gate is rendered as prose instead of buttons, paste:

```text
Approve the Refined Mockups artifacts for the active intent. Continue through
the AI-DLC engine to Application Design. Do not skip Application Design and do
not begin Construction until its required Inception gates are complete.
```

If changes are required, select `Request Changes` and name the exact design file,
artifact, section, and expected correction. Do not approve with unresolved
business, ownership, accessibility, responsive, or provider-contract questions.

## Step 6 — later-stage use

Application Design consumes the approved Refined Mockups and resolves routes,
component boundaries, APIs/providers, and state ownership. Construction consumes
both approved Refined Mockups and Application Design. During Construction, use
UI/UX Pro Max only for conformance review; material redesign returns to Refined
Mockups.

For W4-02, revalidate the approved observability design during Operation
Observability Setup (4.4) against live Grafana, Jaeger, ELK, alerts, and failure
drills.
