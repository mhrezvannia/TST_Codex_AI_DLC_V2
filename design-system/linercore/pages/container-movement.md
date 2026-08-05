# Container Movement Page Contract

## Authority and ownership

This file records only W2-04 Container Movement page composition. It adds no
shared token, primitive, shell, navigation, authentication, typography, or
palette rule. `design-system/linercore/MASTER.md` remains authoritative and
W2-02 owns `packages/ui` and the shared shell.

## Canonical routes

- `/container-movement` - filterable journey list.
- `/container-movement/journeys/{id}` - journey identity, route facts, combined
  expected/actual timeline, manual ACT capture, and collapsed audit evidence.
- Cross-module Booking links use the canonical `/booking/{bookingId}` route.

## Page-specific composition

- Journey list: compact header, search/status filters, result count, pagination,
  table at 768+ and semantic record rows at 375.
- Journey detail: identity and lifecycle, booking/equipment/route facts, one
  ordered expected/actual timeline, responsive capture panel, collapsed audit.
- Movement capture exposes GTOT, LOAD, DISC, GTIN; classifier is ACT. It shows
  the next legal code but preserves server authority and entered values.
- Duplicate/out-of-sequence results name the reason and expected next move,
  reference original evidence where available, and state that journey/Booking
  progression did not change.
- DCSA code and readable label, location, occurred/received time, source,
  validation state, and ordering warning appear together as relevant.
- Kafka topics, schemas, correlation identifiers, and raw payloads remain in the
  collapsed audit/evidence disclosure.

## Responsive additions

- 1440/1024: timeline and capture panel can share the detail workspace.
- 768: intentional table overflow; capture may use an accessible drawer.
- 375: record-list adaptation; single-column detail; capture expands in flow.
- Primary actions, readable state, and recovery remain visible at every width;
  no page-level horizontal scroll.

## State and accessibility additions

Design and verify loading skeleton, empty, error/retry, denied, populated,
validation, duplicate/sequence rejection, success, publication-pending,
Booking-applied, and degraded states in light/dark themes.

Each route has one `h1`, ordered section headings, shared landmarks/skip link,
logical keyboard order, visible focus, persistent form labels, field-associated
errors, polite status announcements, reduced-motion support, and non-color state
meaning. Timeline is an ordered list. Drawer focus is trapped/restored; mobile
in-flow capture does not trap focus.

## Skill decision record

Adopted from `ui-ux-pro-max`: data-dense operational layout, filtering,
responsive table handling, keyboard/focus coverage, visible form labels,
submission feedback, and actionable field errors.

Rejected as conflicting with the LinerCore master: Enterprise Gateway/marketing
hero, logo carousel, sales CTA, promotional sections, alternative blue/amber
palette, Fira/remote fonts, decorative effects, chart-first KPI composition, and
spinner-first loading.

## Shared dependency note

Use existing `@erp/ui` primitives. If implementation identifies a missing shared
primitive, record it for W2-02 and integrate through the Wave A merge protocol;
W2-04 does not independently change `packages/ui`.

## Refined interaction decisions

- Capture is a persistent right action panel at 1024/1440, an accessible Drawer
  at 768, and an in-flow `aria-expanded` section at 375.
- Expected and actual movements stay in one semantic ordered timeline; DCSA code
  and readable label remain visible while received/source/correlation evidence
  is progressively disclosed.
- The next legal code is preselected and explained, but all four thin-slice codes
  remain selectable so the server's sequence rejection is observable.
- Accepted and rejected submissions use a persistent inline focus/live summary;
  a toast may supplement success but is never the only evidence.
- At 375, results become semantic record items with one named journey link. At
  768+, the compact table uses intentional inner overflow rather than page-level
  horizontal scrolling.
- When lifecycle/next-move freshness cannot be confirmed, detail shows labelled
  last-known data, disables capture with a reason, and offers Retry.
