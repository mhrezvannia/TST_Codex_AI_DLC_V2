# Refined Mockups Questions - LinerCore Enterprise

## Source Context

This planning artifact consumes `wireframes.md`, `user-flow.md`, `stories.md`, `requirements.md`, and `team-practices.md`. It also uses focused inspection of `design-inputs/claude-ui-export/`, including `LinerCore.dc.html`, `Booking Directions.dc.html`, `LinerCore Platform.html`, screenshots, `support.js`, and `uploads/program-vision-document.md`.

Graphify was used first. It found `support.js`, prior mockup artifacts, enterprise technical documents, and charge/booking/movement labels, but it did not resolve the raw Claude UI export as a semantic node and found no reliable graph path to the new enterprise stories. Raw UI HTML/screenshots were therefore inspected directly and are not claimed as semantically indexed by exact source path.

## Questions And Decisions

### Q1. How should each user story be represented in the UI?

A. One screen per story  
B. One route per module with workflow panels for related stories  
C. One enterprise shell with module workspaces, contextual journey ribbon, and right-side evidence rail  
D. Use only exception queues and detail drawers  
E. Defer story-to-screen mapping to implementation  
X. Other

[Answer]: C - Use one enterprise shell with module workspaces, contextual journey ribbon, and right-side evidence rail. Map stories into workflow screens rather than one screen per story.

### Q2. What interaction patterns are needed?

A. Stepper/wizard for booking creation and amendment  
B. Inline editable workbench for agreements, tariffs, rules, and reference data  
C. Right-side evidence rail for pricing, D&D, audit, status, and health  
D. Exception queue with ownership, severity, correlationId, and next action  
E. Progressive disclosure drawers for details and conflict resolution  
X. Other

[Answer]: A, B, C, D, E - Use all five patterns, consistently tied to real permissions and APIs.

### Q3. What states must each screen handle?

A. Loading, empty, validation error, service unavailable, success  
B. Partial and stale data states caused by event lag or service degradation  
C. Permission denied and read-only states  
D. Duplicate, late, and out-of-order movement states  
E. Manual fallback and exception states  
X. Other

[Answer]: A, B, C, D, E - Enterprise screens must expose all business and system states; no hidden mock-only state.

### Q4. How should the design align with existing components?

A. Reuse existing Next app/workspace patterns and `@erp/*` packages  
B. Preserve Claude UI visual direction where compatible  
C. Use domain-specific dense operational layouts  
D. Standardize cards, panels, tables, forms, status chips, rails, and ribbons  
E. Invent a new component stack now  
X. Other

[Answer]: A, B, C, D - Reuse existing platform/frontend conventions and preserve compatible Claude UI direction. Do not invent a new component stack in this stage.

### Q5. What accessibility requirements apply?

A. WCAG 2.1 AA baseline  
B. Keyboard-first navigation for all forms, tables, rails, and dialogs  
C. Semantic headings, landmarks, labels, status announcements, and focus states  
D. Non-color-only status indicators and contrast checks  
E. Defer accessibility to frontend implementation  
X. Other

[Answer]: A, B, C, D - Accessibility is required in the mockup specification and cannot be deferred.

### Q6. What responsive breakpoints are needed?

A. Desktop 1280px and wider for full three-column operational workspace  
B. Tablet around 768px to 1279px with collapsible evidence rail  
C. Mobile around 390px to 767px for search, triage, approvals, and read-only details  
D. Complex tariff/agreement/rule editing can require desktop  
E. Desktop only  
X. Other

[Answer]: A, B, C, D - Desktop is primary, but tablet/mobile must support triage and selected action flows.

## Plan Summary

The refined mockups will specify seven primary workspaces:

1. Enterprise shell and work queue.
2. Pricing and agreements.
3. Booking creation and confirmation.
4. Container journey and movement status.
5. D&D outcome and exception handling.
6. Platform administration.
7. Operations and observability.

Each workspace maps to personas, stories, permissions, APIs/events, interaction patterns, states, responsive behavior, and accessibility requirements.

