---
name: linercore-ui-governance
description: Enforce one coherent LinerCore design system across UI-bearing AI-DLC intents, Next.js applications, microservice-backed workflows, isolated worktrees, and separate delivery spaces. Use when planning, designing, implementing, reviewing, testing, or evolving LinerCore UI; when deciding shared-versus-domain ownership; when applying UI/UX Pro Max; or when preventing duplicated shells, local themes, inconsistent components, inaccessible states, and design drift across modules.
---

# LinerCore UI Governance

Preserve one product experience across independently delivered domains. Treat
backend service boundaries as data and deployment boundaries, not automatic UI
boundaries.

## Core architecture

Use this model:

```text
One LinerCore product
├── one authenticated shell
├── one design-system authority
├── one shared token/component package
├── domain-owned routed page compositions
└── multiple independently deployed backend services
```

Never create one frontend, visual language, or shell per microservice. A user
workflow may compose data from several services while remaining one coherent
page owned by one product domain.

## Load authority before acting

For every UI-bearing task, read these files completely before producing rough
mockups, refined mockups, application design, frontend code, or UI review:

1. `AGENTS.md`.
2. `design-system/linercore/MASTER.md`.
3. `design-system/linercore/SESSION-PROMPT.md`.
4. The active intent statement and every Context Pack item it names.
5. Relevant files under `design-system/linercore/pages/`.
6. Approved design inputs under `docs/ui-ux-design/`.
7. Approved Refined Mockups artifacts in the active intent record.
8. `packages/ui/src/styles.ts` and exported `@erp/ui` primitives when code or
   component mapping is in scope.

Load `docs/ui-ux-prompts/EXECUTION-GUIDE.md` when generating or handing off an
intent design.

## Resolve authority conflicts

Apply this precedence:

1. Approved intent scope, requirements, and user stories govern business
   behavior.
2. Enterprise technical standards and security rules govern architecture.
3. `design-system/linercore/MASTER.md` governs shared shell, tokens, primitives,
   responsiveness, accessibility, and global interaction language.
4. Approved page contracts govern domain-specific composition.
5. Approved Refined Mockups govern the intent's page behavior.
6. UI/UX Pro Max output is advisory.

Stop and surface a conflict when two binding authorities disagree. Never silently
select one or use generic UI guidance to override LinerCore.

Adopt UI/UX Pro Max recommendations for dense operational layouts, labelled
forms, validation feedback, responsive tables, keyboard behavior, focus,
non-color status meaning, and appropriate data visualization. Reject marketing
gateways, heroes, conversion layouts, replacement palettes or fonts,
dark-default themes, decorative dashboards, spinner-first loading, invented
actions, and unsupported business workflows.

Do not use UI/UX Pro Max `--persist`; the reviewed LinerCore master is already
authoritative.

## Enforce ownership

### Shared UI platform owns

- Authenticated shell and browser edge composition.
- Authentication/session presentation.
- Global navigation, breadcrumbs, top bar, user menu, and sign-out.
- Design tokens, typography, spacing, density, elevation, focus, and motion.
- Shared status language and accessibility behavior.
- Reusable primitives and cross-domain patterns in `packages/ui`.
- Master design-system governance and versioning.

### Domain intent owns

- Domain routes and page composition.
- Domain terminology, facts, commands, and validation.
- Domain-specific list columns, detail tabs, timelines, and evidence.
- Provider-specific loading, error, degraded, and recovery behavior.
- API/BFF adapters and mapping from service contracts to view models.
- Its named page override under `design-system/linercore/pages/`.

### Backend services own

- Domain facts, invariants, commands, events, and authorization decisions.
- Service contracts and service-owned persistence.

Backend services do not own colors, typography, shell chrome, navigation, or
shared frontend primitives.

## Preserve isolation without fragmentation

Prefer one AI-DLC program space with multiple vertical intents. Isolate delivery
through short-lived branches or worktrees while keeping these committed sources
shared:

- root `AGENTS.md`;
- `design-system/linercore/`;
- `packages/ui`;
- `docs/ui-ux-prompts/` and approved `docs/ui-ux-design/`;
- program memory and binding templates.

Do not create a separate AI-DLC space per microservice merely because services
deploy independently. Use a separate space only for a genuinely separate
product, policy boundary, or long-lived program.

When separate repositories are required:

1. Publish the shared UI package and tokens as a versioned internal dependency.
2. Pin a compatible version in every frontend repository.
3. Distribute the same versioned UI authority and agent instruction contract.
4. Require visual, accessibility, and compatibility gates before upgrading.
5. Never copy and fork shared primitives into a domain repository.

## Run the AI-DLC UI workflow

### Rough Mockups 1.6

Use UI/UX Pro Max for provisional information architecture and task-flow
exploration. Mark every output provisional. Do not freeze routes, APIs, roles,
or unsupported states.

### Requirements Analysis 2.3

Define testable business behavior, ownership, permissions, provider outcomes,
and pass/fail criteria. Do not let a mockup introduce requirements.

### User Stories 2.4

Write vertical outcome stories. Trace acceptance criteria to observable UI,
API, persistence, event, and failure evidence. Do not write component-only
stories.

### Refined Mockups 2.5

Run the intent-specific UI/UX prompt after Requirements Analysis and User Stories
are approved. Save and review the design under `docs/ui-ux-design/`. Convert the
approved design into binding artifacts in the active intent record:

- `mockups.md`;
- `interaction-spec.md` using the binding template;
- `accessibility-checklist.md`;
- `design-system-mapping.md`;
- complete state matrix;
- requirements/story traceability.

Do not advance until the Refined Mockups approval gate is explicit.

### Application Design 2.6

Resolve route boundaries, shared-versus-domain components, provider contracts,
view models, state ownership, authorization, and failure seams. Consume approved
Refined Mockups; do not redesign them silently.

### Construction 3.1–3.6

Implement approved behavior with `@erp/ui` and shared tokens. Use UI/UX Pro Max
only for conformance review. Return material design conflicts to Refined Mockups.

### Operation

Validate the integrated UI in the real environment. For observability surfaces,
revalidate against live Grafana, Jaeger, ELK, alerts, and runbooks rather than
building a duplicate product UI.

## Apply implementation rules

- Run all product pages inside the canonical authenticated shell.
- Import shared controls and patterns from `@erp/ui` before creating local
  components.
- Use variables from `packages/ui/src/styles.ts`; do not introduce local color,
  typography, spacing, or elevation systems.
- Keep shared tokens and primitives in `packages/ui`.
- Keep domain compositions in the owning application.
- Preserve authorization, route, API, test-ID, and domain ownership boundaries.
- Prefer server-rendered reads and focused client interaction islands under the
  approved Next.js architecture.
- Prevent duplicate command submission.
- Preserve user input and usable data across recoverable failures.
- Keep technical identifiers and raw payloads in collapsed support evidence
  unless they are primary business information.

Do not modify `packages/ui`, the shell, or the master design system from a domain
intent. When a shared primitive is missing:

1. Map the exact required behavior and why existing primitives cannot satisfy it.
2. Record a shared UI platform dependency.
3. Keep affected implementation/evidence blocked.
4. Route the change to the permanent UI platform owner.
5. Integrate the released primitive; never create a parallel library.

## Require complete state design

For every async surface, explicitly design applicable states:

- initial loading and scoped loading;
- true empty and filtered empty;
- denied and read-only;
- validation blocked;
- command pending with duplicate prevention;
- persisted success;
- version or concurrency conflict;
- provider/service error;
- partial or degraded data;
- stale data;
- not found;
- retry and recovery ownership.

Distinguish business status from technical failure. Never represent no data as
zero, failure as success, or eventual consistency as completion.

## Require responsive and accessible evidence

Verify every changed screen at 390, 768, 1024, and 1440 pixels. Require:

- no page-level mobile overflow;
- deliberate table overflow or semantic record transformation;
- persistent labels and linked errors;
- visible focus and logical keyboard order;
- correct dialog/drawer focus trap and restore;
- accessible async announcements;
- WCAG AA contrast;
- non-color status meaning;
- reduced-motion support;
- readable long identifiers with wrap, truncate, and copy behavior where needed.

## Produce a conformance record

Every UI-bearing intent must provide a design-system mapping with these columns:

| Surface/behavior | Requirement/story | Shared primitive/token | Domain composition | State coverage | Responsive evidence | Accessibility evidence | Status |
|---|---|---|---|---|---|---|---|

Use only `PASS`, `BLOCKED`, or `NOT APPLICABLE`. A design claim without running
evidence is not a PASS.

## Enforce delivery gates

Before merge, verify:

- no second shell, navigation, authentication layout, or canonical frontend;
- no unauthorized hardcoded color or module-local theme system;
- shared controls import `@erp/ui`;
- relevant page contract and design-system mapping exist;
- every required UI state is implemented and tested;
- Playwright covers the approved user workflow and recovery paths;
- all required breakpoints have visual evidence;
- accessibility tests and manual keyboard/focus review pass;
- visual regression matches approved Refined Mockups;
- missing shared primitives are resolved centrally;
- live integrated behavior proves real service data and honest degradation.

Reject completion based only on documents, screenshots, detached module pages,
mock data, unit tests, or containers starting.

## Start every UI-bearing task with this declaration

```text
This is a UI-bearing LinerCore task. Before acting, load AGENTS.md,
design-system/linercore/MASTER.md, SESSION-PROMPT.md, the active intent and
Context Pack, relevant page contracts, approved design inputs and Refined
Mockups, and applicable @erp/ui tokens/primitives.

Preserve one authenticated shell and one design system. The intent owns only its
domain composition and workflow. Do not create local themes, duplicate shared
components, independent navigation/authentication, a second canonical frontend,
or one UI per backend microservice.

State the loaded authorities, identify the owning domain, map proposed elements
to @erp/ui, list missing shared primitives as platform dependencies, and produce
responsive, accessibility, state, and traceability evidence. Treat generic UI
recommendations as advisory and reject anything conflicting with LinerCore.
```

## Stop conditions

Stop and request direction when:

- a binding design conflicts with approved requirements or the master;
- the owning domain or route is ambiguous;
- a shared primitive is required but unavailable;
- a change would edit another domain, `packages/ui`, or the shell without owner
  approval;
- a provider/API contract required by the UI is unresolved;
- the implementation cannot meet accessibility or responsive requirements;
- live evidence contradicts the approved design.

Do not hide these conditions with local workarounds.
