# Design System Mapping - W2-04 Container Movement

## Sources and Authority

This mapping refines `wireframes.md` and `user-flow.md`, covers the UI outcomes
in `stories.md` and `requirements.md`, and follows `team-practices.md`. Authority
resolves from the active intent/context pack to enterprise standards, then
`design-system/linercore/MASTER.md`, executable `@erp/ui`, and finally
`design-system/linercore/pages/container-movement.md`.

W2-04 changes domain composition only. It does not edit the master,
`packages/ui`, the shared shell, global navigation, authentication, typography,
or palette. No additional page-specific rule is needed beyond the existing
Container Movement page record.

## ui-ux-pro-max Decision Record

| Recommendation | Decision | LinerCore application |
|---|---|---|
| Data-dense dashboard | Adopt with constraint | Dense filters/table/timeline, not a KPI-card dashboard |
| Filtering and pagination | Adopt | Search, lifecycle filter, Reset, result range, page controls |
| Responsive table handling | Adopt | Semantic record list at 375; labelled inner overflow at 768 |
| Keyboard/focus and form labels | Adopt | Native controls, persistent labels, visible token focus ring |
| Inline validation and error recovery | Adopt | Blur validation plus server summary/field links and retained values |
| Submission feedback | Adopt | Persistent inline focus/live result; optional supplementary toast |
| 150-300ms stable transitions | Adopt | Color/border/disclosure only; reduced-motion respected |
| Enterprise Gateway / hero / sales CTA | Reject | Product is an authenticated operational module, not marketing |
| Logo carousel/promotional sections | Reject | No operator value and violates master |
| Alternate blue/amber palette | Reject | Existing `--erp-*` semantic tokens are binding |
| Fira/remote fonts | Reject | IBM Plex Sans/system and mono tokens are binding; no remote dependency |
| Chart-first KPI composition | Reject | Journey list/detail/timeline are the required page patterns |
| Spinner-first loading | Reject | Stable-size `@erp/ui` Skeleton is binding |
| Generic Server Action for every mutation | Constrain | Use the established Next.js BFF/api-core pipeline; do not bypass project architecture |

## Route and Shell Mapping

| Surface | Shared shell behavior | W2-04 content |
|---|---|---|
| `/container-movement` | Container Movement active; shared top/nav/user/breadcrumb/skip link; no journey ribbon | Header, filters, results, pagination, states |
| `/container-movement/journeys/[id]` | Explicit route metadata may provide contextual journey ribbon | Identity, facts, one timeline, capture, Booking link, evidence |
| `/booking/[bookingId]` | Booking-owned route and composition | W2-04 supplies only canonical link/compatible projection data |

No standalone port, module-local chrome, create route, capture-result route, or
audit page is canonical.

## Primitive Mapping

| Domain composition | `@erp/ui` / platform primitive | Notes |
|---|---|---|
| Page header/actions | Stack, Inline, Button | One primary action per region; compact spacing |
| Search and filters | Input, Select, Button | Labels remain available; Reset is explicit |
| Journey results | Table, Badge, Skeleton, EmptyState | Table at 768+; app-owned semantic list composition at 375 |
| Lifecycle/next action | Badge, StatusStrip | Text/icon plus semantic token; never color-only |
| Identity/facts | Panel, Stack, Inline | No nested-card wall |
| Expected/actual history | App-owned ordered list using Button/disclosure primitives | Domain composition stays in `apps/container-movement` |
| Capture fields | Select, Combobox, Input, form/error primitives | Reference lookups are live; no free-text UN/LOCODE authority |
| Tablet capture | Drawer | Trap/restore focus; dirty-dismiss guard |
| Mobile capture | Button plus in-flow region | `aria-expanded`; no focus trap |
| Capture result | StatusStrip/alert region; optional Toast | Inline summary is authoritative feedback |
| Evidence | Existing disclosure/details composition | Collapsed by default; no secrets/raw payload |

No new shared primitive is designed. A discovered implementation gap is reported
to W2-02 rather than patched in `packages/ui` by W2-04.

## Token and Density Mapping

| Role | Required source |
|---|---|
| Background/surface/text | `--erp-color-bg`, `--erp-color-surface`, `--erp-color-surface-2`, `--erp-color-text`, `--erp-color-text-muted` |
| Primary/action/focus | `--erp-color-primary`, `--erp-color-accent`, `--erp-focus-ring` |
| State | `--erp-color-success`, `--erp-color-warning`, `--erp-color-danger` plus semantic backgrounds |
| Typography | `--erp-font-sans`; `--erp-font-mono` for IDs only; master size tokens |
| Spacing/radius | `--erp-space-*`; 12-24px content gaps; max 8px panel radius |
| Motion | Existing duration/easing tokens, 150-250ms; no scale/layout shift |

Application code adds no hardcoded hex, remote font, local palette, inline style
system, decorative gradient, or dark-default exception.

## Responsive Mapping

| Width | Results | Detail | Capture |
|---|---|---|---|
| 375 | Semantic record list | Single column, same timeline order | In-flow section after trigger |
| 768 | Compact table in labelled inner overflow | Single-column timeline | Accessible Drawer |
| 1024 | Full compact table | Primary timeline plus right action panel | Persistent right panel |
| 1440 | Same information with bounded content width | Same two-column hierarchy; no stretched whitespace | Persistent right panel |

Content priority and DOM order remain identity, lifecycle, route/equipment,
timeline, capture, evidence. No primary command or next-action fact disappears at
smaller widths.

## State-to-Component Mapping

| State | Components and tokens | Required copy/behavior |
|---|---|---|
| Loading | Skeleton shaped as header/filter/table/timeline/form | No blank page or layout shift |
| Empty | EmptyState, Reset Button | Current filters and recovery; no create CTA |
| Retryable error | StatusStrip/alert, Retry Button | Plain language; retain filters/form |
| Denied | Denied composition, safe link | No data leakage or disabled mystery control |
| Validation | Error summary plus field messages | Preserve values; focus/links |
| Duplicate | Danger semantic surface, original evidence link | Stable code and unchanged state |
| Out of sequence | Danger/warning semantic surface, Event-code link | Required next move and unchanged state |
| Accepted | Success surface plus timeline update | Code/lifecycle/next move; live announcement |
| Publication pending | Warning/info surface | Accepted in CMM; not yet claimed in Booking |
| Booking applied | Success/info surface | Observed time and canonical link |
| Degraded | Warning StatusStrip, disabled capture, Retry | Last-known time and reason |

## Ownership and Implementation Guardrails

- Domain components and responsive compositions live only in
  `apps/container-movement`.
- Shared session, BFF, `api-core`, transformer, token, and primitive contracts are
  consumed; app-to-app imports are prohibited.
- RTK is not introduced; enterprise standards prohibit it. Existing approved
  server/global-state patterns are used only where needed.
- Booking receives the sequence-compatible latest projection change but does not
  acquire a second expected/actual timeline.
- Page additions are already recorded only in
  `design-system/linercore/pages/container-movement.md`; this stage adds no other
  page override.

## Design Mapping Gate

- [x] Two canonical Container Movement routes only.
- [x] Shared shell/tokens/primitives consumed, not redesigned.
- [x] DCSA code plus readable meaning and real reference lookups specified.
- [x] Required responsive/state/a11y behavior mapped.
- [x] Marketing/decorative skill recommendations explicitly rejected.
- [x] Missing shared primitives route to W2-02.
- [ ] Executable primitive/API compatibility verified during Application Design.
- [ ] Live visual/a11y evidence captured after W2-02 integration.
