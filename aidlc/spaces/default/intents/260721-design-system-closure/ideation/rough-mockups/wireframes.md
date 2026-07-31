# Booking Closure Wireframes

These low-fidelity region maps implement intent-statement.md, scope-document.md, and intent-backlog.md. They preserve existing Booking behavior and define the UI proof target.

## Shared Frame

Every screen is rendered inside the same authenticated PlatformShell:

1. Skip link.
2. Global top bar with product identity, global status, theme control, user menu, and sign-out.
3. Shared side navigation in canonical order with Booking active.
4. Contextual workflow ribbon only where the routed Booking journey requires it.
5. Breadcrumbs and one main content landmark.
6. Module content; no nested shell or local theme.

## Screen 1: Booking List

### Region map

| Order | Region | Content and shared primitives |
|---:|---|---|
| 1 | Page header | h1 Bookings, result context, primary Create booking Button |
| 2 | Command/filter bar | labelled search Input or Combobox, status Select, reset/filter actions |
| 3 | Status strip | service/permission/degraded context when applicable |
| 4 | Results | Table with stable columns, status badges, row link/action, result count |
| 5 | Pagination | previous/next and position, preserving filter state |
| 6 | Feedback | toast or inline live-region result for actions |

### States

- Loading: content-shaped Skeleton rows and header placeholders with stable dimensions.
- Empty: EmptyState distinguishes no bookings from no filter matches; appropriate create or reset action.
- Error/retry: actionable service message, retained filters, retry Button.
- Denied: explicit permission state; no misleading disabled work surface.
- Populated: dense scan-friendly rows, textual status, stable sort/filter controls.
- Degraded: available results remain usable while unavailable evidence is clearly labelled.

Accessibility note: one h1; header, navigation, and main landmarks; keyboard entry begins at skip link then shared navigation, page command, filters, and table rows in visual order. Sort and status meaning are announced without color dependence.

### Responsive notes

- 375px: shared navigation uses its canonical narrow behavior; commands stack; table uses intentional horizontal scrolling or the existing compact representation; primary action remains visible.
- 768px: filters wrap into a compact grid; table remains the primary data structure.
- 1024px and 1440px: side navigation and full command bar remain visible; table columns use stable dimensions without stretching the workbench.

## Screen 2: Create Booking

### Region map

| Order | Region | Content and shared primitives |
|---:|---|---|
| 1 | Page header | h1 Create booking, context, Cancel link/action |
| 2 | Validation summary | shown only after blocked submit; links focus invalid fields |
| 3 | Grouped form | Cards or semantic sections with Field, Input, Select, and Combobox |
| 4 | Reference lookup | async lookup with inline Skeleton, empty, error, and retry states |
| 5 | Action bar | primary Save/Create Button, secondary Cancel, pending label |
| 6 | Feedback | retained values plus inline errors; success toast/redirect evidence |

### States

- Loading reference data: only dependent controls show stable Skeleton content.
- Validation blocked: persistent values, specific inline errors, focus at summary/first invalid control.
- Submission pending: duplicate submit prevented; status announced.
- Service error: values retained, actionable message and retry.
- Success: confirmation announced, then canonical detail route shows created identity/status.
- Dirty cancel: confirmation Dialog only when loss is possible.

Accessibility note: one h1; main contains logically headed form sections; persistent labels and associated help/error text; Tab follows visual field order; submit announces pending/error/success; Dialog traps focus, Escape closes when safe, and focus returns to Cancel.

### Responsive notes

- 375px: one column, full-width controls, stable primary action, no horizontal page scroll.
- 768px: related short fields may form two columns without changing reading order.
- 1024px and 1440px: bounded form width, grouped operational fields, no decorative empty space.

## Screen 3: Booking Detail

### Region map

| Order | Region | Content and shared primitives |
|---:|---|---|
| 1 | Identity header | h1 booking reference, status badge/text, permitted primary actions |
| 2 | Summary facts | key customer, voyage, route, equipment, and timestamps |
| 3 | Workflow/status strip | current state and actionable exception context |
| 4 | Domain sections or Tabs | readable overview and lifecycle/evidence sections |
| 5 | Lifecycle evidence | ordered events with readable labels, timestamps, source, and validation state |
| 6 | Audit disclosure | collapsed technical evidence, never primary operator content |
| 7 | Feedback | action pending/success/error states and confirmation Dialog where necessary |

### States

- Loading: identity, summary, and lifecycle Skeleton blocks preserve final layout.
- Not found/denied: distinct explicit states with safe return navigation.
- Error/retry: section-level recovery when partial detail remains available.
- Populated: identity and status precede secondary evidence.
- Pending action: affected command is disabled with announced progress.
- Long/partial data: missing optional fields are labelled; long identifiers wrap or truncate with accessible full value.

Accessibility note: one h1 with ordered h2 sections; main, navigation, and complementary audit disclosure landmarks/semantics; Tabs use arrow-key behavior; actions and lifecycle entries are keyboard reachable; focus restoration and live announcements follow shared primitives.

### Responsive notes

- 375px: identity/actions stack, facts become one column, tabs intentionally scroll or collapse using the shared pattern, audit stays secondary.
- 768px: summary facts use a constrained grid.
- 1024px and 1440px: facts and lifecycle evidence remain dense and aligned; no nested card grid.

## Cross-Screen Proof Matrix

| Dimension | Required observation |
|---|---|
| Theme | Light and dark retain contrast, status meaning, and focus ring |
| Width | 375, 768, 1024, 1440 without overlap, clipped controls, or page scroll |
| Keyboard | List filters/rows, full form, detail tabs/actions, dialogs, and return focus |
| State | Loading, empty/not-found, error/retry, denied where available, populated, pending, success |
| Shell | One shared shell, correct Booking active state, contextual ribbon only |
| Package | Applicable visible controls originate from @erp/ui or a documented semantic exception |

## Review

**Verdict: READY**

- Completeness: The list, create, and detail proof surfaces specify region order, shared primitives, operational states, and observable cross-screen evidence. Together with `user-flow.md`, this is sufficient for implementation and QA planning without inventing a new product flow.
- Closure scope: The artifact correctly preserves the existing Booking journey and one authenticated `PlatformShell`; it introduces no second frontend, local theme, independent navigation, or marketing surface.
- Product alignment and flow: Entry through Booking, filter/open or create, canonical detail, and evidence inspection form a coherent operator journey. Recovery paths retain context and distinguish empty, denied, not-found, degraded, validation, and service-error outcomes.
- Information hierarchy: Identity, status, task commands, operational content, lifecycle evidence, and secondary audit detail are ordered for a dense carrier workbench rather than a decorative dashboard.
- Responsive and accessibility coverage: All required widths are called out per screen, including deliberate table/tab handling. Each screen identifies headings, landmarks, keyboard entry/order, focus management, live announcements, and non-color status meaning.
- Required corrections: None at rough-mockup fidelity. Engineering evidence must validate every row in the proof matrix on the live isolated stack and document any semantic exception to `@erp/ui` rather than silently substituting a local primitive.
