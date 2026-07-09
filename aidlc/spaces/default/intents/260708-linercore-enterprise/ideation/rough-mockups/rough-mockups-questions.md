# Rough Mockups Questions - LinerCore Enterprise

## Source Context

This question file consumes:

- `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/intent-capture/intent-statement.md`
- `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/scope-definition/scope-document.md`
- `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/scope-definition/intent-backlog.md`

Answers were extracted from the approved enterprise prompt, approved ideation artifacts, Graphify query results, and direct inspection of `design-inputs/claude-ui-export/`. No new scope was added.

## Questions and Extracted Answers

### Q1. What are the primary user entry points and key screens/views?

A. Enterprise shell and module work queues only  
B. Booking creation and pricing only  
C. Full authenticated enterprise shell with Shared Platform, Pricing & Agreements, Booking, Container Movement, D&D, exceptions, and Operations  
D. Operations-only runtime console  
E. Read-only prototype walkthrough  
X. Other (please specify)

[Answer]: C - The intent-statement and scope-document require a complete authenticated enterprise UI across reference data, agreements, tariffs, pricing, bookings, amendments, manual pricing, container journeys, movements, D&D outcomes, operational exceptions, and Operation evidence.

### Q2. What is the core happy-path user flow?

A. Agreement -> booking creation -> pricing -> confirmation -> movement journey -> movement status -> D&D trigger/result -> booking storage  
B. Booking creation only  
C. Agreement management only  
D. Movement tracking only  
E. Runtime health only  
X. Other (please specify)

[Answer]: A - This combines the five approved end-to-end business flows from the intent-statement and scope-document.

### Q3. What information hierarchy should the rough mockups use?

A. Marketing landing page with hero content  
B. Dense operational console with module rail, work queue, workflow ribbon, main detail area, and right status/action rail  
C. Mobile-only form wizard  
D. Single screen with all modules collapsed together  
E. Read-only dashboard without workflows  
X. Other (please specify)

[Answer]: B - The Claude UI export favors a compact operational console, icon rail, workflow ribbon, dense booking content, and persistent pricing/charge rail. This matches the enterprise users' repeated operational workflows.

### Q4. Which existing brand guidelines, design systems, or UI patterns should be followed?

A. Ignore the Claude export and start from a generic admin template  
B. Use the Claude UI export as the preferred visual and UX baseline, preserving layout and appearance where compatible with authoritative requirements  
C. Use only the existing reference-data UI  
D. Copy prototype business logic exactly  
E. Delay all UX direction until implementation  
X. Other (please specify)

[Answer]: B - The scope-document explicitly names `design-inputs/claude-ui-export/` as the preferred visual and UX baseline, while forbidding fake prototype behavior from overriding real business requirements.

### Q5. What device/form factors must be supported?

A. Desktop operational console first, with tablet/mobile support for search, triage, read-only details, approvals, and exception routing  
B. Mobile only  
C. Desktop only with no responsive support  
D. Kiosk display only  
E. Print/PDF only  
X. Other (please specify)

[Answer]: A - The enterprise workflows are data-dense and operational. Desktop is primary, but responsive support is required for practical triage and status workflows.

### Q6. What accessibility requirements apply?

A. WCAG 2.1 AA baseline with keyboard navigation, visible focus, semantic headings, landmarks, labels, status announcements, and non-color-only indicators  
B. No accessibility target until later  
C. Color contrast only  
D. Screen reader only  
E. Keyboard only  
X. Other (please specify)

[Answer]: A - Design-agent knowledge sets WCAG 2.1 AA as the baseline, and every screen in this stage needs a one-line accessibility note.

### Q7. How should mocked UI behavior be handled when it conflicts with authoritative requirements?

A. Preserve the prototype behavior because the export is preferred  
B. Drop the visual design entirely  
C. Preserve the visual direction where possible, but implement real module ownership, APIs, permissions, events, persistence, audit, and business behavior  
D. Keep mock screens as final UI  
E. Hide conflicting flows from the UI  
X. Other (please specify)

[Answer]: C - The enterprise instructions require preserving visual quality but replacing fake prototype business logic with real behavior from authoritative documents and contracts.

### Q8. How should module boundaries appear in the UI?

A. Hide ownership because users do not care  
B. Collapse all domains into one service-shaped screen  
C. Show a coherent journey while preserving explicit module navigation, permissions, ownership labels, and audit evidence  
D. Separate modules so strongly that end-to-end flow is invisible  
E. Use only backend service names in navigation  
X. Other (please specify)

[Answer]: C - The target is one integrated enterprise application, but it must not collapse domain boundaries or blur Booking, Charge, CMM, and Shared Platform responsibilities.

### Q9. Which rough mockup screens are needed now?

A. Booking creation only  
B. Enterprise shell, pricing/agreement, booking creation, container journey, D&D outcome, reference/identity admin, and operations/observability  
C. Operations only  
D. Agreement editor only  
E. No UI screens because this is backend-first  
X. Other (please specify)

[Answer]: B - This minimum screen set covers the intent-statement, scope-document, and Must Have backlog M-003 through M-023 without pretending to finalize high-fidelity UX.

### Q10. What are the major UX contradictions to resolve?

A. None  
B. Prototype journey simplicity versus enterprise module ownership and real integration complexity  
C. Only colors and fonts  
D. Only mobile layout  
E. Only search behavior  
X. Other (please specify)

[Answer]: B - The contradiction analysis must preserve the user-friendly journey from the Claude export while enforcing real module boundaries, D&D ownership, integration contracts, permissions, and no fake completion.

## Contradiction Analysis Summary

| Tension | Resolution |
|---------|------------|
| Prototype shows a clean MVP journey | Use it as a contextual journey ribbon, not as the full enterprise architecture. |
| Prototype blends D&D and movement concepts | Show Booking trigger, CMM movement evidence, and Charge calculation as separate but connected panels. |
| Prototype values are mocked | Treat values as visual placeholders until real APIs/events exist. |
| Desktop density is high | Keep desktop-first operational density and define responsive fallback behavior. |
| UI baseline is not fully graph-indexed | Use Graphify for normalized code/document context and direct inspection for raw UI screenshots/HTML. |
