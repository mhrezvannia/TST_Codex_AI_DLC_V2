# Refined Mockups - W2-04 Container Movement

## Sources, Fidelity, and Ownership

These product-grade, implementation-ready mockups refine `wireframes.md` and
`user-flow.md`, realize the nine vertical slices in `stories.md`, satisfy the UI
and lifecycle behavior in `requirements.md`, and preserve the PB-01 and evidence
posture in `team-practices.md`. `design-system/linercore/MASTER.md` and
`design-system/linercore/pages/container-movement.md` control visual language
and page ownership.

The output specifies real labels, content priority, interaction regions,
responsive transformation, and screen states. W2-04 owns only the two Container
Movement routes. The shared shell, navigation, tokens, and primitives remain
W2-02-owned; Booking detail remains Booking-owned.

## Visual Language and Content Model

- Quiet, dense operational layout using IBM Plex Sans and existing `--erp-*`
  tokens; identifiers alone use the mono token.
- Compact page headers and panels with at most 8px radius; no hero, KPI-card
  wall, gradients, decorative illustration, alternate palette, or remote font.
- DCSA code and readable meaning remain adjacent: for example,
  `GTOT - Gated out` and `DISC - Discharged`.
- Lifecycle status includes text plus a Lucide icon; color is supplementary.
- Primary operator content never leads with Kafka, schema, raw payload, or
  correlation data. Those remain in the collapsed evidence disclosure.

## Screen A - Journey List

**Route:** `/container-movement`  
**Primary story:** US-02  
**Page title:** Container journeys  
**Intro:** Find an assigned container and review its operational progression.

### 1024 and 1440 composition

| Order | Region | Refined content and behavior |
|---|---|---|
| 1 | Shared shell context | Existing top bar/nav/breadcrumb; Container Movement active; no journey ribbon |
| 2 | Page header | One h1, compact supporting sentence, Refresh secondary command |
| 3 | Command bar | Search by equipment/booking/journey; lifecycle Select; Reset; stable result count |
| 4 | Results | Table columns: Equipment, Booking, POL to POD, Lifecycle, Next movement, Updated |
| 5 | Row action | Equipment is the descriptive detail link; Enter follows it; no click-only row |
| 6 | Pagination | Showing range/total, Previous/Next, current page; filters persist |

Representative row:

| Equipment | Booking | POL to POD | Lifecycle | Next movement | Updated |
|---|---|---|---|---|---|
| `MSKU1234561` | `BKG-104` | SGSIN to NLRTM | Gated-out | LOAD at SGSIN | 21 Jul 10:42 UTC |

### 768 composition

The command bar wraps in reading order without hiding Reset or Refresh. The
table stays semantic and uses an inner overflow region with a keyboard-reachable
scroll affordance; the page itself never scrolls horizontally. Equipment,
lifecycle, and next movement remain frozen/visible priorities where the existing
Table primitive supports them.

### 375 composition

Results become a semantic list. Each record contains, in order:

1. equipment reference and text/icon lifecycle;
2. Booking reference and POL to POD;
3. next movement plus location;
4. last updated time;
5. one `Open journey <equipment>` link with a 44px target.

Search remains first, lifecycle filter and Reset share the next row, and
Previous/current-page/Next remain reachable. No route or next-action fact is
removed to make the layout fit.

## Screen B - Journey Detail and Capture

**Route:** `/container-movement/journeys/{id}`  
**Primary stories:** US-02 through US-05 and US-08  
**Page title:** the ISO 6346 equipment reference, for example `MSKU1234561`.

### Shared content hierarchy

| Order | Region | Refined content and behavior |
|---|---|---|
| 1 | Breadcrumb | Container Movement / MSKU1234561 |
| 2 | Identity header | Equipment h1, lifecycle text/icon, journey ID, Booking revision, last actual |
| 3 | Related action | `Open Booking BKG-104` canonical link; Capture command only when allowed/fresh |
| 4 | Facts | POL/POD, equipment, current load state, received freshness |
| 5 | Timeline | One ordered expected/actual list, current/next markers, progressive evidence details |
| 6 | Capture | Width-specific panel/drawer/in-flow form described below |
| 7 | Evidence | Collapsed audit/event disclosure after primary workflow |

### Timeline item anatomy

Every item exposes sequence/position, code and readable label, expected/actual
state, location, and state text without expansion. Actual items additionally
show occurrence time. Expanding `Show details` reveals received time, source,
classifier ACT, empty indicator, validation disposition, and correlation when
useful. Raw payload and schema internals are not shown.

Example progression:

| Position | Visible item | State |
|---|---|---|
| 1 | GTOT - Gated out, actual at SGSIN, 21 Jul 10:42 UTC | Accepted |
| 2 | LOAD - Loaded, expected at SGSIN | Next |
| 3 | DISC - Discharged, expected at NLRTM | Planned |
| 4 | GTIN - Gated in empty | Awaiting prior moves |

### Capture form anatomy

| Field/control | Presentation | Rule |
|---|---|---|
| Next movement | StatusStrip/instruction above form | `LOAD at SGSIN` stated in text |
| Event code | Select with GTOT/LOAD/DISC/GTIN | Next legal value preselected; all four remain selectable |
| Classifier | Read-only `ACT - Actual` | Never free text |
| Equipment | Read-only canonical ISO reference | Must match journey assignment |
| Location | live-reference Combobox | Active UN/LOCODE; next location suggested |
| Occurred | labelled date/time input | UTC conversion/explanation; no future-invalid value accepted |
| Empty indicator | Select EMPTY/LADEN | Expected value preselected from code; server validates pairing |
| Source | Read-only `MANUAL` | Transport source remains stable |
| Actions | Cancel; Record movement | Stable button width and busy label |

Correlation and idempotency are generated/propagated by the BFF and request
boundary, not exposed as routine operator inputs. They appear only in evidence
when troubleshooting.

### 1024 and 1440 composition

The identity/facts/timeline occupy the primary column. A persistent right action
panel contains capture and stays within the main reading order. The panel does
not become a floating overlay and does not obscure timeline content. Long route
or error content wraps without changing primary button placement.

### 768 composition

The timeline uses the full content width. `Capture movement` opens an accessible
Drawer after the trigger. Focus moves to the drawer heading, remains trapped
while open, Escape/Cancel closes when no submission is pending, and focus returns
to the trigger. A dirty form prompts before destructive dismissal.

### 375 composition

Identity, facts, timeline, and evidence stack in DOM order. `Capture movement`
expands an in-flow section immediately after its trigger; it does not trap focus.
The trigger changes to `Close capture` with `aria-expanded`. Form controls and
actions are full-width where needed, retain 44px targets, and never cause
page-level horizontal scrolling.

## Capture Outcome Mockups

### Accepted

The submitting command reads `Recording...` without changing width. On success,
a persistent inline summary receives programmatic focus and politely announces:
`LOAD recorded. Journey is now In-transit. Booking update pending.` The timeline
adds sequence 2, next action changes to DISC at NLRTM, and the form collapses only
after the summary is available. A toast may repeat success but is never the sole
record. Booking state changes from pending to applied when locally observed; it
does not claim early delivery.

### Duplicate

The inline error summary receives focus and states:
`Movement not recorded. GTOT at SGSIN with this occurrence identity already
exists as EVT-101. Journey remains Gated-out.` It links to the original timeline/
audit evidence when available. All entered values remain. `Review original` and
`Try corrected movement` are explicit actions; no new timeline or Booking state
appears.

### Out of sequence

The inline error summary receives focus and states:
`Movement not recorded. DISC cannot follow GTOT. Record LOAD next. Journey
remains Gated-out.` A link moves focus to Event code. Values remain, the next
legal code remains explained, and no publication/projection success is shown.

### Validation and authorization

Client validation on blur supplements, never replaces, the server. On submit,
an error summary links to field-specific messages and preserves data. A user
with read but not capture permission sees the journey but no active capture
command; a direct/deep-link denial renders a 403 explanation with no leaked
movement data or false success.

## Required State Matrix

| State | Journey list | Journey detail/capture |
|---|---|---|
| Loading | Stable header/filter/table or record-list Skeleton | Stable identity/fact/timeline/panel Skeleton |
| Empty | No matches, active-filter summary, Reset; no create CTA | Valid journey cannot be empty; unknown ID uses not-found state |
| Error/retry | Plain-language message, Retry, filters retained | Known identity retained where safe; failed regions labelled; Retry |
| Denied | No data leakage; safe return path | Read denied blocks detail; capture denied preserves authorized read |
| Populated | Filterable results/count/pagination | Identity, facts, timeline, permitted capture, evidence disclosure |
| Validation | Not applicable | Summary + field links; values retained |
| Duplicate | Not applicable | Stable code/original evidence/unchanged-state statement |
| Out of sequence | Not applicable | Stable code/required next move/unchanged-state statement |
| Success | Refreshed row facts | Inline focus/live summary and updated timeline |
| Publication pending | Latest CMM state remains accepted | `Booking update pending` with no false applied claim |
| Booking applied | Row/detail can show latest received time | `Applied in Booking` with observed time and canonical link |
| Degraded | Last-known count/freshness warning | Last-known timeline labelled; capture disabled with reason and Retry |

## Prototype Interaction Sequence

The mid-fidelity prototype follows this keyboard-verifiable sequence:

1. Skip to main content and filter the journey list.
2. Open the named equipment link and review lifecycle/next move.
3. Open capture using the viewport-specific pattern.
4. Accept the suggested GTOT and submit; hear/focus accepted feedback.
5. Reopen and submit the same occurrence; hear/focus duplicate feedback and
   review original evidence.
6. Select DISC after GTOT; hear/focus out-of-sequence feedback, follow the Event
   code link, change to LOAD, and submit successfully.
7. Follow the canonical Booking link and observe pending then applied status.

## Mockup Acceptance Notes

- Only the canonical list and detail routes are added.
- One combined timeline preserves CMM authority; Booking remains latest-only.
- UI constraints prevent common errors but keep server rejection observable.
- All required states have real copy, focus behavior, and recovery.
- Responsive transformations preserve task content rather than hiding it.
- Final visual acceptance remains pending implementation, W2-02 integration,
  isolated live-stack control, and Playwright evidence.
