# Refined Mockups - W4-01 Module List-Detail Uplift

## Sources and Design Authority

This consolidation refines the approved Ideation `wireframes.md` and `user-flow.md` against the approved Inception `requirements.md`, `stories.md`, and `team-practices.md`. Its page-level sources are the approved designs `docs/ui-ux-design/21-reference-data-list-detail-uplift.md`, `22-charge-agreements-list-detail-uplift.md`, and `23-container-journeys-list-detail-uplift.md`.

The single authenticated LinerCore shell, shared `--erp-*` tokens, and executable `@erp/ui` primitives are binding. Domain modules own only routed composition and terminology. No mockup authorizes a domain-local shell, navigation system, theme, token set, or shared-component fork.

The approved `refined-mockups-questions.md` selects routed list/detail/task flows, complete provider-truth state coverage, platform ownership for missing shared behavior, WCAG 2.2 AA as the design target over the WCAG 2.1 AA acceptance baseline, five viewport widths in both themes, and omission of unsupported controls.

## Shared Shell and Route Hierarchy

```text
+--------------------+-------------------------------------------------------------+
| LinerCore nav      | Breadcrumb / Back                                           |
|                    | H1 + status + permitted primary action                       |
| Overview           |-------------------------------------------------------------|
| Booking            | Route-specific controls and result/status region             |
| Charge Agreements  |                                                             |
| Container Movement | Dense list, detail tabs, or focused task content             |
| Reference Data     |                                                             |
+--------------------+-------------------------------------------------------------+
```

Shell order is Overview, Booking, Charge Agreements, Container Movement, Reference Data. The shell owns authentication, permission-aware navigation, landmarks, skip link, breadcrumbs, theme, and route registry. Every entity identity is a native deep link; direct refresh works without a prior list visit.

## Reference Data Mockups

### Set and record lists

```text
+-------------------------------------------------------------------------------+
| Reference Data                                             [Create record]*   |
| Sets: [Locations] [Equipment] [Commodities] ...                               |
| Breadcrumb: Reference Data / Locations                                        |
| [Include inactive] [Size 25 v]                         1-25 of provider total |
|-------------------------------------------------------------------------------|
| Code / key       Display name       State       Version       Last change     |
| USNYC            New York           Active      7             08 Aug 2026      |
| NLRTM            Rotterdam          Active      4             07 Aug 2026      |
|-------------------------------------------------------------------------------|
| [Previous]                                                        [Next]      |
+-------------------------------------------------------------------------------+
| * Only with current action-specific server capability.                        |
+-------------------------------------------------------------------------------+
```

There is no text search or selectable sort until the Reference provider supplies an approved contract. `includeInactive`, page, and size are the only record-list controls currently admitted. True empty and filtered empty are distinct.

### Record detail and task route

```text
+-------------------------------------------------------------------------------+
| Back to Locations                                                             |
| USNYC - New York                  [Active]                 [Edit]*              |
| Version 7                                                                     |
| [Summary] [Attributes] [History]                                              |
|-------------------------------------------------------------------------------|
| Identity and ownership          | Evidence                                    |
| Code             USNYC          | Updated 08 Aug 2026                          |
| Display name     New York       | Actor and reason when supplied               |
| Set              Locations      | Technical details collapsed                 |
+-------------------------------------------------------------------------------+

EDIT ROUTE
| H1 Edit USNYC                                                            |
| Code [USNYC read-only]   Display name [New York.......................]   |
| Set-specific attributes [provider-backed controls]                       |
| Reason [..............................................................]   |
| [Cancel] [Save changes]                                                   |
```

Summary, Attributes, and History are stable URL-backed views. Create/edit use focused task routes, current provider version, persistent labels, retained drafts, and conflict recovery. Validate/deactivate/reactivate remain absent until action-specific contracts exist.

## Charge Agreements Mockups

### Agreement list

```text
+-------------------------------------------------------------------------------+
| Charge Agreements                                                             |
| [Customer v] [Trade lane v] [Commodity v] [Status v] [Valid on] [Inactive]    |
|-------------------------------------------------------------------------------|
| Agreement       Customer        Coverage          Status    Version  Validity |
| AGR-2026-0142   Acme Shipping   NLRTM-USNYC       Approved  3        2026      |
| AGR-2026-0143   Northstar       DEHAM-SGSIN       Draft     1        2026      |
|-------------------------------------------------------------------------------|
| [Previous]                     Provider total when supplied       [Next]      |
+-------------------------------------------------------------------------------+
```

The list uses only provider-supported filters and paging. Generic search, origin/destination/equipment filters, and selectable sort remain absent. Fixed provider ordering is explanatory text, never a fake sortable header.

### Agreement detail

```text
+-------------------------------------------------------------------------------+
| Back to Agreements                                                            |
| AGR-2026-0142  Version 3        [Approved]                    [Actions]*        |
| Acme Shipping - NLRTM to USNYC                                                |
| [Summary] [Rates] [D&D] [Status history]                                      |
|-------------------------------------------------------------------------------|
| Summary / selected tab                 | Action rail                           |
| Customer, coverage, validity           | Role-aware commands only             |
| Exact bound Freight/Surcharge/Local    | Immutable approved version            |
| D&D provider evidence or unavailable  | No disabled-command maze              |
| Lifecycle events with actor/time      |                                       |
+-------------------------------------------------------------------------------+
```

Rates are exact bound versions, not a second Rate Authority workbench. D&D shows contract-backed terms or a scoped unavailable state; it never invents allowances. Agreement-to-Booking and Booking-to-Agreement links remain absent while canonical identifiers are blocked.

### Charge workflow and evidence routes

```text
CHARGE AGREEMENTS
|-- Agreement list
|   |-- Create Agreement task
|   `-- Agreement detail
|       |-- Edit Draft
|       `-- Create successor
|-- Rate Authority
|   |-- Provider-filtered rate list
|   |-- Create rate Draft
|   `-- Exact rate/version detail and immutable history
|-- Approval queue candidate
|   |-- Draft Agreements
|   `-- Draft rate versions
`-- Manual pricing evidence
    |-- Provider filters and paging
    `-- OPEN case evidence; no resolve/close/manual amount
```

US-015 opens exact supporting rate/version detail from an Agreement or its Rates tab and carries only validated Agreement return context. The Rate Authority retains its own list/detail/history contract; it is not flattened into Agreement detail. US-010 uses a permission-gated manual-pricing evidence list with provider-supported reason, Booking reference, opened-range, page, and size inputs. Charge Readers see identical provider evidence but no Agreement lifecycle, rate mutation, resolve, close, repricing, or zero-price commands. The Approval Queue is an Application Design candidate only if both kinds have bounded server-side Draft filters and independent pagination; the browser never merges full datasets.

## Container Movement Mockups

### Recent Journey list

```text
+-------------------------------------------------------------------------------+
| Container Movement                                      [Limit 25 v] [Refresh]|
| Recent provider Journeys - fixed recent order                                |
|-------------------------------------------------------------------------------|
| Container       Booking        Status       Latest accepted*    Freshness     |
| LCRU1000055     BK-2026-0142   In transit   ACT_LOAD             Fresh         |
| MSKU7654321     BK-2026-0148   Allocated    No event received    Last known    |
|-------------------------------------------------------------------------------|
| 2 Journeys returned - total and pagination unavailable                       |
+-------------------------------------------------------------------------------+
| * Omit latest accepted when public append-order semantics are not confirmed.  |
+-------------------------------------------------------------------------------+
```

Only bounded `limit` and Refresh exist. Search, filters, sort, total, cursor, page, actor, and create Journey are absent. The checkout has a CMM backend and Booking projection UI, but no CMM frontend source, shell route mount, or shell navigation item; these routes remain Application Design dependencies.

### Journey detail and movement capture

```text
+-------------------------------------------------------------------------------+
| Back to recent Journeys                                                       |
| LCRU1000055                         [In transit] [Fresh]                       |
| Journey JRN-... / Booking BK-2026-0142                                       |
| [Summary] [Movement timeline] [Linked booking]                               |
|-------------------------------------------------------------------------------|
| Ordered provider-normalized timeline       | Record Movement*                 |
| 1 Recorded - GTOT / Gate out               | Event code [LOAD v]              |
| 2 Recorded - LOAD / Loaded                 | Location [Search active...]      |
| 3 Planned  - DISC / Discharge              | Occurred at [date-time]          |
| 4 Planned  - GTIN / Gate in                | [Cancel] [Record movement]       |
|                                            | Publication: unavailable         |
|                                            | Booking application: unavailable |
+-------------------------------------------------------------------------------+
```

The timeline is one semantic ordered list produced by an approved provider/BFF normalization contract; the browser does not infer lifecycle, next move, lateness, or expected/actual matching. Capture appears only with current authority and `captureEnabled=true`. It accepts event code, canonical location, and occurrence time only; server identity, idempotency, and correlation are trusted-boundary fields. There is no correction UI or publication/application claim without a public contract.

### Booking-to-Journey relationship region

```text
+--------------------------------------------------------------+
| Booking / Journey relationship                               |
| Present:     Journey JRN-... for LCRU1000055  [Open Journey] |
| Not created: Journey not created                             |
| Failure:     Journey relationship unavailable       [Retry] |
| Denied:      No relationship data flash; shared denied state |
+--------------------------------------------------------------+
```

The Booking-owned relationship region performs an authorized server/BFF lookup by exact `bookingId`. A successful result creates the native `/container-movement/journeys/[journeyId]` link from the returned ID. Absence says `Journey not created`; dependency failure retains Booking context and offers Retry; denial exposes no Journey data. Valid return context brings the user back to the invoking Booking relationship region. No client guesses a Journey ID from container, label, or prior projection.

## Responsive Mockups

At 375/390px, lists become semantic records, controls stack, tabs scroll only inside a labelled region, facts remain one column, and task forms are in flow. At 768px, true tables may use a labelled keyboard-reachable inner overflow region and action rails stack after primary content. At 1024/1440px, dense tables and two-column detail/action composition use bounded reading widths.

```text
+--------------------------------------+
| Compact LinerCore shell              |
| Breadcrumb / Back                    |
| H1 + text status                     |
| [Primary permitted action]           |
|--------------------------------------|
| Supported controls, stacked          |
| Result summary                       |
| +----------------------------------+ |
| | Native record link               | |
| | Key identity and status text     | |
| | Provider freshness / validity    | |
| +----------------------------------+ |
| One-column detail / task content     |
+--------------------------------------+
```

No width may introduce page-level horizontal overflow. Test 375, 390, 768, 1024, and 1440 CSS pixels in light and dark themes, plus 200% and 400% zoom.

## State and Evidence Coverage

All applicable screens specify loading skeleton, true empty, filtered empty only where a real filter exists, populated, denied without data flash, read-only, not found, validation, pending, accepted/saved, conflict/rejection, provider error, last-known/stale, partial/degraded, and safe recovery. Unsupported states are marked NOT APPLICABLE or BLOCKED rather than illustrated as available.

Runtime, visual, keyboard, assistive-technology, theme, and live Compose evidence remain BLOCKED until implementation exists in the integrated shell. Static mockups are design evidence only.

## Traceability and Handoff

Reference Data covers US-003 through US-006 and FR-003/004/009-013/019-021. Charge covers US-007 through US-010 and US-015, including exact rate-version evidence, Rate Authority, Approval Queue feasibility, and read-only manual-pricing evidence, against FR-005/006/009-016/019-021. Container Movement covers US-011 through US-013. Cross-module coverage for US-014 includes both Journey-to-Booking and the Booking-owned provider-lookup region for Booking-to-Journey; blocked Agreement directions remain absent. Shared shell, route, ownership, accessibility, responsive, performance, security, quality, and evidence constraints cover US-001/002, FR-001/002/017/018/022, and NFR-001 through NFR-012.

Application Design must resolve exact source/mount/BFF boundaries, route registry and permission strings, safe return-context validation, typed view models, provider capability gaps, shared primitive gaps, and blocker ownership without widening W4 business scope.

## Review

**Builder revision:** The three human-reviewed page-level candidates are represented in required order and remain consistent with the approved requirements, stories, rough wireframes, user flow, and team practices. Product-owner approval accepts W2-04 plus candidate 23 as the W4 reviewed CMM foundation; the missing standalone 90/91 outputs remain an evidence note. Charge workflow/evidence routes, US-015, US-010, and both directions of US-014 are now explicit. No BLOCKED provider, frontend, shared-platform, or runtime evidence is converted into PASS.

## Review

**Verdict: NOT-READY**

The ordered Reference Data → Charge Agreements → Container Journeys design, provider-truth boundaries, single-shell/`@erp/ui` ownership, and five-width/two-theme accessibility contract are coherent. Three blocking gaps remain:

1. **Approved Charge stories are not fully represented.** US-015 is absent from the traceability statement and no consolidated route/screen contract covers exact linked rate-version detail, supporting Rate Authority navigation, or safe Agreement return context. US-010's permission-gated manual-pricing evidence and the approved Charge Approval Queue/Rate Authority handoffs are likewise absent. A developer and QA cannot derive those approved outcomes from the current artifacts.
2. **US-014 coverage is overstated.** Journey → Booking is specified, but the Booking → Journey relationship region, provider lookup states (present, not-created, denied, dependency failure), exact surface, and return behavior are not designed. Claiming Container Movement covers US-011 through US-014 leaves half of the binding cross-link story orphaned.
3. **Container design approval is unresolved.** The artifacts call candidate 23 approved while its source verdict is `READY FOR HUMAN REVIEW WITH BLOCKERS DISCLOSED`, and `interaction-spec.md` still asks whether W2-04 artifacts plus candidate 23 replace the missing reviewed 90/91 outputs. Record the product-owner decision and correct the approval/traceability language before this gate can pass.

Validation: independent safe equivalents of the declared sensors PASS on all five stage outputs. `required-sections` finds at least two H2 headings in each output and the `interaction-spec.md` template heading set is complete; `upstream-coverage` finds `wireframes`, `user-flow`, `stories`, `requirements`, and `team-practices` in each output. The Bun wrapper/direct-script Windows `EPERM` condition is an infrastructure execution failure, not a content failure, and does not change this NOT-READY verdict.

## Review

**Verdict: READY**

Iteration 2 resolves all prior blockers. US-010 and US-015 now trace to explicit Charge routes and behaviors for exact rate/version evidence, Rate Authority list/detail/history, a provider-bounded Approval Queue candidate, and permission-gated manual-pricing evidence with no invented resolution commands. US-014 now specifies the Booking-owned lookup region for present, not-created, denied, and dependency-failure outcomes, exact provider IDs, safe return context, and focus restoration. The product-owner decision accepting W2-04 artifacts plus candidate 23 as the reviewed CMM foundation is explicitly recorded; missing standalone 90/91 files remain an evidence note rather than an open design choice.

The revised artifacts preserve the single authenticated shell and `@erp/ui` ownership, provider-authoritative controls and states, honest `BLOCKED` dependencies, the required Reference Data → Charge Agreements → Container Journeys order, and WCAG/responsive coverage at 375, 390, 768, 1024, and 1440 pixels in both themes with keyboard, focus, announcements, reduced motion, zoom/reflow, and no page-level overflow specified.

Validation: independent safe equivalents PASS for both declared sensors on all five stage outputs. `required-sections` finds the generic H2 floor in every output and the complete `interaction-spec.md` template heading set; `upstream-coverage` finds all five declared upstream artifacts in every output. The Bun Windows `EPERM` condition remains an infrastructure execution limitation, not a content finding.
