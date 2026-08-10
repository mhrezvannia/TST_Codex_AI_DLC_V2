# LinerCore Booking Failure And Recovery Design

Status: Approved-design candidate
Route family: `/bookings/[bookingId]`
Design sequence: Page 13 of the approved Booking workflow, following pages 10,
11, and 12
Implementation status: Design only. No production files were modified.

This document defines the missing-record and page-level failure experience for
Booking. It is intentionally a recovery layer for the approved Booking queue,
creation form, and operational record. It does not redesign those pages.

## Executive Decisions

1. Failure classification is resolved on the server. Page components receive a
   safe presentation model, not raw service errors.
2. A valid authenticated Shell remains visible when the user still has Booking
   access and no protected record data is at risk.
3. Authentication expiry leaves this route family and uses the approved
   signed-out boundary. Module-level authorization denial uses the approved
   access-denied flow.
4. `Back to bookings` always restores an allowlisted, previously filtered
   Booking list when one exists. An unsafe or absent value becomes `/bookings`.
5. Retry appears only for transient or incomplete reads. It never appears for
   malformed links, policy denials, known deletion, or known scope mismatch.
6. `Request access` appears only when the authorization response contains a
   safe, immutable denial context and the request service is available.
7. `Open latest revision` appears only when the server supplies an authoritative
   latest revision and destination. The browser never derives this link.
8. Not-found, archived/deleted, and out-of-scope language is used only when the
   backend can prove that state without violating record-existence policy.
9. Partial data and stale revision are in-record states. They preserve the
   trustworthy record header and do not replace the whole page.
10. Technical values are closed by default and never include stack traces,
    tokens, cookies, policy internals, callback URLs, or service credentials.

## Evidence And Current-State Audit

### Current frontend behavior

The current nested `not-found.tsx` renders:

- Heading `Booking not found`.
- Message `The booking ID does not match a persisted record.`
- Link to unfiltered `/bookings`.

This wording exposes storage language, assumes more than the service proves,
and loses list context.

The current Booking detail route:

- Calls `notFound()` for every `404`.
- Renders `Booking unavailable` for all other failed reads.
- Displays the raw service message.
- Creates a Retry link that drops `returnTo`, `created`, and future active-view
  state.
- Has no route-level `error.tsx` recovery boundary.

The live unsigned route currently renders HTTP `200` with:

```text
Booking unavailable
A signed-in Booking actor is required
Retry
```

The Retry link removes the filtered-list return destination. A malformed
Booking identifier reaches the same read path instead of being rejected at the
route boundary.

### Current service behavior

The Booking application service authorizes `booking:read` before repository
lookup. This is a useful security property:

- A Booking user can receive `200` for an existing booking.
- A Booking user receives `404` for a missing identifier.
- A user without Booking read permission receives `403` for both existing and
  missing identifiers.
- The `403` therefore does not reveal whether the requested booking exists.

Current service errors are not presentation-ready:

| Condition | Current status | Current code | Current message |
| --- | ---: | --- | --- |
| Missing booking | `404` | `not_found` | `No value present` |
| Malformed identifier | `404` | `not_found` | `No value present` |
| Booking read denied | `403` | `forbidden` | `booking command denied` |
| Read transport failure | `503` | `BOOKING_UNAVAILABLE` in BFF command paths | `Booking service is unavailable` |
| Stale command state | `409` | `BOOKING_CHANGED` | Domain exception message |

The detail-page read helper currently discards service `code`, `fields`, and
`correlationId`. Its generated correlation ID is logged but not returned to the
page. The service also emits `local-correlation` for several mapped errors.
Technical details cannot be implemented reliably until this read contract is
enriched.

### Current list-context behavior

The implemented list return contract supports:

- `search`
- `status`
- `page`

`safeBookingReturnTo` accepts only `/bookings` or `/bookings?...`; otherwise it
falls back to `/bookings`. This allowlist is the correct baseline.

The approved page-10 design adds filters only after their API and URL contracts
exist. Page 13 must consume the same canonical filter serializer rather than
maintain a second allowlist.

### Capabilities not present today

The repository does not currently prove:

- A Booking deletion or archival lifecycle with a tombstone.
- A canonical archived-record route.
- Record-level business-scope authorization for Booking reads.
- A safe denial-context contract for access requests.
- A latest-revision redirect contract for page reads.
- A partial-read completeness contract.
- An explicit expected-revision or ETag contract for commands.

These remain designed states with named dependencies. The UI must not claim
they occurred until the corresponding server evidence exists.

### UI/UX Pro Max interpretation

The applicable guidance is:

- Explain the business situation before technical detail.
- Offer one obvious next step and a quiet escape.
- Preserve entered or navigational context after recoverable failure.
- Announce asynchronous failure and recovery without repeated live-region
  noise.
- Keep semantic HTML, visible focus, and keyboard-complete controls.
- Avoid dead ends, error walls, and decorative failure illustrations.

Generic landing-page, trust-badge, animated-metric, and hero recommendations do
not apply to this operational ERP.

## 1. State Taxonomy

### Canonical taxonomy

| Safe presentation kind | Applies when | Surface | Primary recovery | Retryable |
| --- | --- | --- | --- | --- |
| `invalid-link` | Path identifier fails the approved Booking ID grammar before a service call | Terminal page state | Back to bookings | No |
| `not-found` | An authorized read returns a canonical missing-record result | Terminal page state | Back to bookings | No |
| `record-retired` | Authoritative tombstone says deleted, archived, retired, or replaced | Terminal page state | Open latest revision when supplied; otherwise Back | No |
| `permission-denied` | User lacks module/action permission and policy safely identifies denial | Approved access-denied boundary | Request access when supported | No |
| `out-of-scope` | Record-level policy returns a safe business-scope mismatch | Access-denied composition | Request access when supported | No |
| `service-unavailable` | Timeout, network failure, `502`, `503`, or `504` prevents the read | Terminal page state | Retry | Yes |
| `partial-record` | Read succeeds with explicit completeness metadata and one or more sections unavailable | In-record status strip | Retry missing details | Yes |
| `stale-revision` | Current view or command expected an older revision than the authoritative revision | In-record conflict strip | Open latest revision | No blind retry |

### Adjacent states owned elsewhere

| Condition | Destination |
| --- | --- |
| No authenticated session | Approved `/signed-out` or canonical Auth sign-in flow |
| Session expires while protected content is visible | Remove protected content, then approved signed-out boundary |
| Booking module unavailable from navigation authorization | Approved `/auth/access-denied` flow |
| Field or business validation failure | Page 11 or page 12 inline validation/blocker pattern |
| Journey-only read failure | Page 12 Journey view recovery |
| Charges-only read failure | Page 12 Charges partial/unavailable pattern |
| Unexpected render exception | Booking route `error.tsx`, using the service-unavailable visual pattern but distinct diagnostics |

### Classification order

The server composition uses this deterministic order:

1. Validate and normalize the route identifier.
2. Validate the session.
3. Evaluate module/action authorization.
4. Evaluate record scope when that capability exists.
5. Read the Booking record.
6. Resolve tombstone or replacement metadata when the read contract supports it.
7. Resolve completeness and revision metadata.
8. Map only safe fields into a presentation model.

The client must not infer state from message text such as `No value present` or
`booking command denied`.

### Existence-disclosure rule

The current authorization-before-lookup order must be preserved.

- A user without `booking:read` receives the same denial experience for a valid
  existing ID and a valid missing ID.
- No Booking number, customer, status, route, or existence hint appears in that
  denial.
- `out-of-scope` is shown only when product and security approve the scope
  reason as safe to reveal.
- When scope cannot be safely revealed, use the neutral `not-found` copy and do
  not show `Request access` unless a safe denial context exists.

### Recommended safe presentation model

The future page composition should consume a discriminated result resembling:

```text
kind
status
title
message
retryable
safeReturnTo
supportReference
occurredAt
serviceDisplayName
denialContext?
latestRevision?
latestDestination?
availableRecord?
unavailableSections?
```

This is a design contract, not prescribed TypeScript. Raw exceptions and raw
identity decisions remain server-side.

## 2. Final Content

### Shared language rules

- Use `booking reference` in user-facing recovery copy.
- Use `Booking ID` only inside Technical details.
- Use sentence case.
- Never display raw enum values.
- Never say `command denied`, `No value present`, `403`, `404`, `503`, `BFF`,
  `OIDC`, `scope token`, or `repository`.
- Do not promise that access will be granted or that a service will recover at a
  particular time.

### Booking ID does not exist

Use only after an authorized canonical lookup proves no current record or
approved tombstone.

Heading:

```text
Booking not found
```

Body:

```text
No booking is available for this reference. Return to your Booking list and
open another record.
```

Actions:

- Primary: `Back to bookings`
- Secondary: `Return to workspace`
- Do not show Retry.

Technical details:

```text
Technical details
Booking ID              8c6bf440-bd67-4883-8b8f-623b6ba362b3
Detected at             27 Jul 2026, 14:32
Service                 Booking
Support reference       3d2c7e1a-...
[Copy support reference]
```

Do not repeat an untrusted route value as visible primary content.

### Booking deleted, archived, retired, or replaced

Use only when a trusted lifecycle/tombstone response supplies the reason.

Default heading:

```text
This booking is no longer available
```

Archived body:

```text
This booking was archived on 26 Jul 2026 and is not available in the current
Booking queue.
```

Deleted body:

```text
This booking was removed under the approved retention process and can no
longer be opened.
```

Replaced body:

```text
This booking was replaced by revision 2. Open the latest revision to continue.
```

Actions:

- Replaced primary: `Open revision 2`
- Archived/deleted primary: `Back to bookings`
- Secondary: `Return to workspace`
- Do not invent `View archive` until a real authorized route exists.

Technical details add only supplied values:

```text
Lifecycle outcome       Archived
Effective at            26 Jul 2026, 18:05
Replacement revision    2
Support reference       8a71...
```

Do not identify the actor or retention reason unless policy marks it safe.

### User lacks permission to view Booking records

This state is module/action denial. It must remain identical for existing and
missing record IDs.

Heading:

```text
You do not have access to Booking records
```

Body:

```text
Your current access does not include permission to view Booking records.
Request access if you need Booking for your work.
```

Actions:

- Primary when supported: `Request access`
- Primary when unsupported: `Return to workspace`
- Secondary when request is supported: `Return to workspace`
- Do not show Retry or Back to bookings when the list is also unauthorized.

Technical details:

```text
Decision time            27 Jul 2026, 14:32
Protected area           Booking
Requested action         View booking
Support reference        4f09...
```

The reason code and correlation ID may be included under Technical details only
when security approves them. Never show role internals, claims, policy rules, or
the requested record's business data.

### Invalid or malformed deep link

Heading:

```text
This booking link is invalid
```

Body:

```text
The link does not contain a valid Booking reference. Return to your list and
open the booking again.
```

Actions:

- Primary: `Back to bookings`
- Secondary: `Return to workspace`
- Do not show Retry.

Technical details:

```text
Detected at              27 Jul 2026, 14:32
Failure type             Invalid booking link
Support reference        6b13...
```

Do not echo the complete malformed value, query string, or unsafe return
destination. A short sanitized prefix may be logged server-side, not displayed.

### Booking service temporarily unavailable

Heading:

```text
Booking is temporarily unavailable
```

Body:

```text
LinerCore could not load this booking. Try again, or return to your Booking
list. No changes were made.
```

Actions:

- Primary: `Retry`
- Secondary: `Back to bookings`
- Tertiary text link: `Return to workspace` only when the list is also
  unavailable.

Retry states:

- Button busy label: `Retrying`
- Polite announcement: `Retrying booking`
- Repeated failure: `Booking is still unavailable. Try again later or return to
  your list.`
- Successful recovery: `Booking loaded`

Technical details:

```text
Service                  Booking
Detected at              27 Jul 2026, 14:32
Support reference        c927...
[Copy support reference]
```

The UI may show `Try again in about 30 seconds` only when a trusted
`Retry-After` value exists.

### Partial booking data returned

This is not a terminal page. Keep the record identity, known status, active
view, and all facts marked complete by the server.

Status-strip heading:

```text
Some booking details are unavailable
```

Body:

```text
You can review the available information, but some sections are incomplete.
Retry before taking an action that depends on the missing details.
```

Section-specific examples:

```text
Charges are unavailable.
Journey details are unavailable.
Customer name is unavailable; the customer code is shown.
```

Actions:

- Primary inside strip: `Retry missing details`
- Secondary: none in the strip.
- Existing `Back to bookings` remains in the record header.
- Disable only commands whose prerequisites are incomplete. Do not disable
  unrelated navigation or copy actions.

Technical details:

```text
Unavailable sections     Charges, Journey
Data retrieved at        27 Jul 2026, 14:31
Service                  Booking composition
Support reference        e80a...
```

Never show a blank value as `0`, `No`, or `Not applicable`.

### Stale revision or record changed

Conflict heading:

```text
This booking changed
```

Body:

```text
You were viewing revision 1. Revision 2 is now available. Open the latest
revision and review its status, charges, and changes before continuing.
```

Actions:

- Primary: `Open revision 2`
- Secondary: `Stay on revision 1`
- Existing Back preserves the filtered list.
- All state-changing actions remain unavailable while the user stays on the old
  revision.

Progress and success:

- Busy label: `Opening revision 2`
- Polite success: `Revision 2 loaded`

Technical details:

```text
Viewed revision          1
Latest revision          2
Conflict detected at     27 Jul 2026, 14:32
Support reference        b614...
```

Do not automatically resubmit validation, pricing, confirmation, amendment, or
reconfirmation.

### Requested record outside the user's business scope

Use only when a record-level policy returns a safe, explicit scope mismatch.

Heading:

```text
This booking is outside your current scope
```

Body:

```text
Your access is limited to Europe Export operations. This booking belongs to a
different business scope.
```

When the user's scope label is not safe or available:

```text
Your current business scope does not allow you to view this booking.
```

Actions:

- Primary when supported: `Request access`
- Secondary: `Back to bookings`
- Tertiary: `Return to workspace` when the list is unavailable.
- Do not show Retry.

Technical details:

```text
Current scope            Europe Export
Requested action         View booking
Decision time            27 Jul 2026, 14:32
Support reference        7d11...
```

Do not display the protected booking's customer, route, owner, status, or
business-scope label unless policy explicitly permits that disclosure.

### Unexpected page failure

This state belongs to the future route error boundary and is separate from a
classified Booking service outage.

Heading:

```text
This booking page could not be displayed
```

Body:

```text
An unexpected problem interrupted this page. Try the page again, or return to
your Booking list.
```

Actions:

- Primary: `Try page again`
- Secondary: `Back to bookings`

Technical details show a generated support reference and timestamp, never the
exception message or stack trace.

## 3. Desktop And Mobile Wireframes

### Desktop terminal state, not found or invalid link

```text
+----------------+-----------------------------------------------------------+
| LinerCore      | Top bar: environment | search | help | user              |
|                +-----------------------------------------------------------+
| Home           | Breadcrumbs: Home / Bookings / Unavailable record         |
| Bookings       +-----------------------------------------------------------+
| Rates          | < Back to bookings                                        |
| Reference Data |                                                           |
|                | [FileQuestion 20] Booking not found                       |
|                |                    No booking is available for this        |
|                |                    reference. Return to your Booking list  |
|                |                    and open another record.                |
|                |                                                           |
|                |                    [Back to bookings] Return to workspace  |
|                |                                                           |
|                |                    > Technical details                     |
|                |                                                           |
+----------------+-----------------------------------------------------------+
```

Rules:

- The Shell remains because the session and Booking module permission are valid.
- Content aligns with the normal record page grid; it is not vertically centered
  like a marketing page.
- Maximum text measure is `680px`.
- The state has one `h1`.

### Desktop authorization denial

```text
+-------------------------------------------------------------------------+
| LinerCore                         Local demo                User menu     |
+-------------------------------------------------------------------------+
| Breadcrumbs: Home / Access denied                                      |
|                                                                         |
| [ShieldAlert 20] You do not have access to Booking records              |
|                  Your current access does not include permission to     |
|                  view Booking records.                                  |
|                                                                         |
|                  [Request access]  Return to workspace                  |
|                                                                         |
|                  > Technical details                                   |
+-------------------------------------------------------------------------+
```

Rules:

- Do not render protected Booking navigation when the module itself is denied.
- Reuse the approved access-denied page chrome and request-access handoff.
- Do not show the requested Booking ID in primary content.

### Desktop service unavailable

```text
+----------------+-----------------------------------------------------------+
| Shell          | Breadcrumbs: Home / Bookings / Unavailable record         |
|                +-----------------------------------------------------------+
|                | < Back to bookings                                        |
|                |                                                           |
|                | [CloudOff 20] Booking is temporarily unavailable           |
|                |               LinerCore could not load this booking.       |
|                |               Try again, or return to your Booking list.   |
|                |               No changes were made.                        |
|                |                                                           |
|                |               [Retry]  Back to bookings                    |
|                |                                                           |
|                |               > Technical details                         |
+----------------+-----------------------------------------------------------+
```

During retry the structure does not move. The primary button retains its width,
shows a small RefreshCw progress icon, and becomes unavailable to duplicate
activation.

### Desktop partial record

```text
+----------------+-----------------------------------------------------------+
| Shell          | < Back to bookings                                        |
|                | BKG-8c6bf440-...  Confirmed  Revision 1      [Check status]|
|                | Northstar Retail                                          |
|                | Overview | Charges | Journey | Activity                    |
|                +-----------------------------------------------------------+
|                | [TriangleAlert] Some booking details are unavailable       |
|                | Charges and Journey are incomplete.                        |
|                | [Retry missing details]                                    |
|                +-----------------------------------------------------------+
|                | Route                   Equipment                          |
|                | USNYC -> NLRTM          LCRU1000055 / 22G1                 |
|                |                                                           |
|                | Charges                                                   |
|                | [Unavailable section placeholder with explicit label]     |
+----------------+-----------------------------------------------------------+
```

Rules:

- Known record data stays visible.
- Unavailable sections use stable placeholders with a heading and source state.
- No authoritative action is available if it depends on missing data.

### Desktop stale revision

```text
+----------------+-----------------------------------------------------------+
| Shell          | BKG-8c6bf440-...  Confirmed  Revision 1                   |
|                | Overview | Charges | Journey | Activity                    |
|                +-----------------------------------------------------------+
|                | [History] This booking changed                            |
|                | You were viewing revision 1. Revision 2 is now available. |
|                | [Open revision 2]  Stay on revision 1                     |
|                +-----------------------------------------------------------+
|                | Existing revision 1 content remains readable              |
|                | State-changing commands are unavailable                   |
+----------------+-----------------------------------------------------------+
```

### Mobile terminal state, 390px

```text
+--------------------------------------+
| Menu  LinerCore     Local demo  User |
+--------------------------------------+
| Home / Bookings / Unavailable        |
|                                      |
| < Back to bookings                   |
|                                      |
| [CloudOff]                           |
| Booking is temporarily unavailable   |
|                                      |
| LinerCore could not load this        |
| booking. Try again, or return to      |
| your Booking list. No changes were   |
| made.                                |
|                                      |
| [ Retry                         ]     |
| [ Back to bookings              ]     |
|                                      |
| > Technical details                  |
+--------------------------------------+
```

### Mobile partial or stale record

```text
+--------------------------------------+
| < Back to bookings                   |
| BKG-8c6bf440-bd67-                   |
| 4883-8b8f-623b6ba362b3               |
| Northstar Retail                     |
| Confirmed     Revision 1             |
|                                      |
| Overview Charges Journey Activity -> |
|                                      |
| [!] This booking changed             |
| Revision 2 is now available.         |
| [ Open revision 2               ]     |
| Stay on revision 1                   |
|                                      |
| Existing revision 1 content          |
+--------------------------------------+
```

The view navigation may scroll horizontally only inside its own bounded region.
The page itself must not overflow horizontally.

## 4. High-Fidelity Visual Specification

### Approved tokens

Use the page-12 shared LinerCore tokens without a page-specific palette:

| Purpose | Value |
| --- | --- |
| Page background | `#f4f7fb` |
| Primary surface | `#ffffff` |
| Secondary surface | `#eef3f9` |
| Border | `#d7e2ef` |
| Strong border | `#c2d0e0` |
| Primary text | `#102235` |
| Muted text | `#5a6b7d` |
| Maritime blue | `#11427a` |
| Maritime blue hover | `#0d3663` |
| Success foreground/background | `#136b45` / `#e7f4ee` |
| Warning foreground/background | `#8a5200` / `#fbf0dc` |
| Danger foreground/background | `#b42318` / `#fbe9e7` |
| Information foreground/background | `#2a68b0` / `#e7f0fb` |
| Small radius | `6px` |
| Surface radius | `8px` |
| Focus | 3px maritime-blue outline with 2px white separation |

### Tone assignment

| State | Tone | Icon |
| --- | --- | --- |
| Invalid link | Neutral/information | `Link2Off` |
| Not found | Neutral/information | `FileQuestion` |
| Retired/archived | Neutral/warning | `Archive` |
| Permission denied | Warning, not danger | `ShieldAlert` |
| Out of scope | Warning | `ShieldAlert` |
| Service unavailable | Warning | `CloudOff` |
| Partial record | Warning | `TriangleAlert` |
| Stale revision | Warning | `History` |
| Unexpected page failure | Danger used sparingly | `CircleAlert` |

Icons are `20px` in terminal states and `18px` in strips. They are
`aria-hidden` because the adjacent heading conveys meaning.

### Typography

- Font: approved Inter stack.
- Terminal `h1`: `24px/32px`, weight `700`; `20px/28px` at 390px.
- Strip heading: `16px/24px`, weight `700`.
- Body and controls: `14px/20px`.
- Secondary and Technical details labels: `13px/18px`.
- Technical values: `13px/18px` monospace with tabular numerals.
- Letter spacing: `0`.
- Long identifiers: `overflow-wrap: anywhere`.

### Terminal-state layout

- Main content uses the same horizontal grid as the Booking record.
- Desktop content starts `32px` below breadcrumbs.
- Maximum text width: `680px`.
- Icon-to-heading gap: `12px`.
- Heading-to-body gap: `8px`.
- Body-to-actions gap: `24px`.
- Action gap: `8px`.
- Disclosure begins `24px` after actions with a top border.
- No surrounding card, drop shadow, illustration, or colored full-page panel.

### Actions

- Desktop button height: `40px`.
- Mobile button height: `44px`.
- Primary uses maritime blue.
- Secondary uses white, strong border, and primary text.
- Tertiary is a text link.
- Mobile actions stack full width when two buttons would wrap.
- Busy labels do not resize the button. Reserve sufficient inline width.
- Hover changes color only. No scale, lift, or layout motion.

### Status and conflict strips

- Full available content width.
- `8px` radius, `1px` semantic border, no shadow.
- Padding: `16px` desktop, `12px` mobile.
- Strip layout: icon, text block, action area.
- Below `768px`, actions move below text.
- The strip is not nested inside another card.
- Warning colors are restrained; the page remains predominantly neutral.

### Technical details

- Native disclosure semantics or an equivalent accessible implementation.
- Summary label: `Technical details`.
- Closed by default.
- Rows use a definition list, not a table.
- Desktop: `160px minmax(0, 1fr) auto`.
- Mobile: stacked term, value, copy action.
- Copy uses the Lucide `Copy` icon with tooltip and accessible name.
- Copy feedback is inline or a polite live announcement, never tooltip-only.

### Responsive behavior

| Width | Behavior |
| --- | --- |
| `390px` | Compact top bar; one-column state; full-width actions; stacked technical rows; no horizontal page overflow |
| `768px` | Shell navigation follows approved tablet pattern; actions may remain inline; partial record uses one or two fact columns |
| `1024px` | Persistent Shell navigation; terminal content remains left aligned; strips use text plus right-aligned action |
| `1440px` | Persistent Shell; content does not stretch beyond readable measure; empty space remains structural, not decorative |

At every width:

- Critical heading, status, and primary recovery remain visible.
- Long Booking IDs and support references wrap safely.
- No text truncation changes the meaning of a denial or recovery.
- No viewport-width font scaling.

## 5. Recovery And Navigation Behavior

### Recovery priority

| State | Primary | Secondary | Never offer |
| --- | --- | --- | --- |
| Invalid link | Back to bookings | Return to workspace | Retry |
| Not found | Back to bookings | Return to workspace | Retry |
| Retired/replaced | Open latest revision when supplied; otherwise Back | Return to workspace | Retry old record |
| Permission denied | Request access when supported; otherwise Workspace | Workspace | Retry |
| Out of scope | Request access when supported | Back to bookings | Retry |
| Service unavailable | Retry | Back to bookings | Request access |
| Partial record | Retry missing details | Existing Back in header | Blind state-changing action |
| Stale revision | Open latest revision | Stay on current revision | Resubmit command |

### Safe list return

1. The queue serializes its current approved filter and pagination state.
2. The detail route receives it as `returnTo`.
3. The server validates it with the shared Booking-list destination allowlist.
4. Every terminal, partial, conflict, and retry path carries the validated value.
5. Back uses browser history only when the previous entry is a verified
   same-origin Booking-list destination. Otherwise it navigates to the validated
   `returnTo`.
6. Unsafe, malformed, cross-origin, double-encoded, or oversized values become
   `/bookings`.

The current nested `not-found.tsx` cannot consume page search parameters. The
future implementation must preserve true `404` behavior while moving safe
return context into a route-owned server composition. Do not store a raw
return destination in local storage or an unsigned cookie.

### Retry

- Retry repeats only the read that failed.
- Retry retains pathname, safe `returnTo`, active record view, and supported
  display query state.
- One retry may be in flight.
- The button is busy and duplicate activation is ignored.
- Do not automatically loop retries.
- Respect trusted `Retry-After`; do not expose raw header values.
- On success, replace the failure state with the record and focus the Booking
  heading.
- On another failure, keep focus on Retry and announce the updated message once.
- Browser refresh produces the same safe classification.

### Request access

- Use the approved pages 06 and 07 workflow.
- Preserve immutable resource type, requested capability, safe destination,
  denial timestamp, and support reference.
- Do not pass a raw service message.
- Prevent duplicate open requests.
- If request access is unsupported or unavailable, make `Return to workspace`
  primary.

### Open latest revision

- The server supplies revision number and allowlisted destination.
- Preserve the active record view and safe Booking-list return context.
- Do not synthesize `/revisions/{n}` unless that route exists.
- Do not resubmit the command that exposed the conflict.
- When the latest revision loads, focus the record heading and announce
  `Revision 2 loaded`.
- If the latest revision becomes unavailable, show a compact read failure while
  retaining the old revision only when security policy permits.

### Browser history, refresh, and multiple tabs

- Back from a terminal state must not reveal cached protected data.
- Refresh re-evaluates session, authorization, scope, existence, and revision.
- A previously open tab receives the current authorization result on its next
  server transition or explicit refresh.
- Permission loss removes protected record content before rendering denial.
- A stale tab cannot issue a state-changing command without expected-revision
  validation.
- `Retry` and `Open latest revision` are safe under repeated clicks and
  back/forward navigation.

### Shell retention

Retain full authorized Shell:

- Invalid link after valid Booking access.
- Authorized not found.
- Service unavailable.
- Partial data.
- Stale revision.

Use minimal approved denial/auth chrome:

- Missing Booking module permission.
- Session expired.
- Identity service unavailable when the session cannot be trusted.

For record-level scope denial, show only navigation the user remains authorized
to access. Never keep stale record facts behind the denial.

## 6. `@erp/ui` Component Mapping

### Reuse

| Design element | Existing component | Use |
| --- | --- | --- |
| Commands | `Button` | Retry, Back, Request access, Open latest |
| Loading | `Skeleton` | Stable retry and partial-section placeholders |
| Inline status | `StatusStrip` | Partial data and stale revision after extension |
| Empty content | `EmptyState` | May inform neutral not-found composition, but is not sufficient alone |
| Status label | `StatusBadge` | Record status only, not failure classification |
| Layout | `Stack`, `Inline` | Internal spacing without decorative panels |

### Extend or add globally

| Component | Responsibility |
| --- | --- |
| `FailureState` | Semantic icon, heading, body, primary/secondary actions, optional disclosure |
| `TechnicalDetails` | Closed disclosure and safe definition-list rows |
| `IdentifierValue` | Wrapping or middle-truncated value with full accessible value |
| `CopyButton` | Lucide icon, tooltip, accessible name, polite feedback |
| `ConflictStrip` | Focusable conflict heading, message, latest/stay actions |
| `PartialDataNotice` | Names unavailable sections and guards dependent actions |
| `AsyncActionButton` | Stable busy label and duplicate-submit prevention |

`StatusStrip` currently has a fixed polite live region and no tone, heading,
actions, or focus target. Extend it deliberately rather than attaching every
failure behavior to the existing component.

`EmptyState` currently renders its title as a paragraph. A terminal route state
requires a real page heading and therefore must not use it unchanged.

### Booking-specific compositions

- `BookingFailurePage`
- `BookingPartialRecordNotice`
- `BookingRevisionConflict`
- `BookingFailureTechnicalDetails`
- `BookingSafeReturnLink`
- `classifyBookingReadFailure` on the server boundary

The generic component must not know:

- Whether a Booking ID may be disclosed.
- Whether a policy denial is safe to label as scope mismatch.
- Whether a record has been archived or deleted.
- Whether a latest revision exists.
- Which Booking actions depend on incomplete data.

### Server and client boundaries

Server responsibilities:

- Route identifier validation.
- Session and authorization evaluation.
- Resource-existence masking.
- Business-scope policy.
- Tombstone and latest-revision lookup.
- Safe return validation.
- Service-error normalization.
- Safe technical-detail selection.
- Initial failure or partial-record composition.

Focused client islands:

- Retry busy state.
- Route error-boundary reset.
- Copy feedback.
- Technical-details disclosure only if enhanced behavior is needed.
- Async announcement after retry or latest-revision navigation.

Do not make the Booking detail page a client component.

### Read contract changes required

Replace message-only failed reads with structured safe fields:

- Canonical uppercase code.
- HTTP status.
- Retryable flag.
- Correlation/support reference.
- Occurred-at timestamp.
- Optional trusted Retry-After.
- Optional safe denial context.
- Optional tombstone outcome.
- Optional latest revision/destination.
- Optional completeness metadata.

The BFF maps raw service messages to approved content. React must not compare
error strings.

## 7. Accessibility Acceptance Criteria

### Structure and names

- One `main` landmark and one `h1` for every terminal page.
- Authenticated Shell keeps its skip link and landmarks.
- Partial and conflict strips use an `h2` appropriate to the record structure.
- Buttons and links have distinct labels that describe their result.
- Icon-only Copy actions have visible tooltips and accessible names.
- Technical details use a semantic disclosure and definition list.
- Time values use `time` with machine-readable datetime.

### Focus placement

| Transition | Focus |
| --- | --- |
| Direct navigation to terminal state | Page `h1` receives programmatic focus after the Shell skip target |
| Authorization redirect | Approved access-denied heading |
| Retry starts | Remains on Retry button |
| Retry fails | Remains on Retry; updated status is announced once |
| Retry succeeds | Booking `h1` |
| Partial data discovered on initial load | Normal page focus; polite notice, no focus theft |
| Partial data discovered after action | Partial-data heading |
| Stale conflict after command | Conflict heading |
| Open latest succeeds | Booking `h1`, then polite `Revision 2 loaded` |
| Stay on old revision | Return focus to the command that exposed the conflict when present |
| Technical details opens | Remains on disclosure summary |
| Copy succeeds/fails | Remains on Copy button |
| Request-access return | Approved denial/request source focus restoration |

Headings made programmatically focusable use `tabindex="-1"` and retain a visible
focus indication when focused.

### Announcements

- Full navigation relies on document title and heading; it does not add a
  duplicate assertive alert.
- `Retrying booking`, `Booking loaded`, `Booking is still unavailable`, copy
  feedback, partial-data changes, and revision changes use one controlled live
  region.
- Validation or policy denial that blocks an active command may use an
  assertive announcement once.
- Polling and background refresh never repeat unchanged messages.
- Busy buttons expose `aria-busy` or equivalent state and remain named.

### Keyboard

Recommended terminal-state order:

1. Skip link.
2. Shell navigation and top-bar controls where authorized.
3. Breadcrumbs.
4. Back to bookings.
5. Primary recovery.
6. Secondary recovery.
7. Technical details summary.
8. Copy actions inside expanded details.

Requirements:

- Enter and Space activate buttons.
- Enter activates links.
- Disclosure uses native keyboard behavior.
- No focus trap on a page-level failure.
- Focus is never placed on a disabled command.
- Mobile navigation follows the approved Shell focus trap and restoration rules.

### Visual and reflow

- Normal text contrast is at least `4.5:1`.
- Focus is visible and not obscured.
- Meaning never depends on color or icon alone.
- At 200% and 400% zoom, actions wrap without overlap.
- At `390px`, the page has no horizontal overflow.
- Long identifiers wrap and do not force page width.
- Touch targets are at least `44px` on mobile.
- Reduced motion removes icon rotation and animated progress; text and busy
  state remain.

## 8. Playwright And Visual-Regression Acceptance

### Test fixtures and interception

Provide deterministic fixtures for:

- Valid existing booking.
- Valid missing Booking ID.
- Malformed Booking ID.
- Tombstone archived/deleted/replaced outcomes.
- Module permission denial.
- Record-level scope denial.
- Service timeout and `503`.
- Partial record with named unavailable sections.
- Revision-1 view with authoritative revision 2.
- Unsafe and malformed `returnTo`.

Tests must assert service calls and safe presentation, not only screenshots.

### Invalid link

- A malformed Booking ID renders `This booking link is invalid`.
- No Booking service request is made.
- No malformed identifier or unsafe query appears in primary content.
- Back restores the filtered list.
- Unsafe `returnTo` becomes `/bookings`.
- Retry is absent.

### Not found

- Authorized missing ID returns the canonical not-found page and true not-found
  route status.
- Copy never contains `No value present` or persistence terminology.
- Filtered `returnTo` is preserved.
- Retry is absent.
- Technical details contain only safe values.

### Retired, archived, and replaced

- Each authoritative lifecycle reason selects the approved copy.
- Archived and deleted records do not invent an archive route.
- Replacement shows `Open revision 2` only when an allowlisted destination is
  supplied.
- No stale record data remains visible.

### Permission and existence masking

- A denied user receives the same visible denial for an existing ID and a
  missing ID.
- Neither response contains Booking number, customer, route, equipment, status,
  or existence hints.
- Retry is absent.
- Request access appears only with a safe denial context and available service.
- The protected Booking navigation is omitted when module access is denied.
- Direct browser back does not reveal cached record content.

### Business scope

- A safe record-level scope mismatch uses approved scope copy.
- Protected record facts are absent.
- Missing or unsafe scope reason falls back to the neutral masked state.
- Request-access context is immutable and does not include unsafe resource data.

### Service unavailable

- Timeout, `502`, `503`, and `504` map to the same business-safe state.
- Retry preserves `returnTo`, active view, and route identity.
- Double click and Enter key repeat create one request.
- Busy label is stable and announced.
- Repeated failure updates the message once.
- Success replaces the state with the Booking record and focuses its `h1`.
- No stack trace, raw exception, host name, or internal port appears.

### Partial data

- The real record header and complete sections remain visible.
- Unavailable sections are named.
- Missing values are not rendered as zero, No, or Not applicable.
- Commands dependent on missing evidence are unavailable.
- Unrelated navigation and actions remain available.
- Retry updates only the affected sections without layout shift.

### Stale revision

- Conflict preserves revision 1 content and active view.
- All state-changing commands become unavailable.
- `Open revision 2` carries active view and safe list return.
- No prior command is resubmitted.
- `Stay on revision 1` retains readable content and visible stale status.
- Loading revision 2 announces success and focuses the record heading.

### Error boundary

- An unexpected render error uses `This booking page could not be displayed`.
- `Try page again` invokes one boundary reset.
- Repeated failure stays recoverable.
- Technical details omit stack and exception text.
- Back restores the filtered list.

### Accessibility

- Automated WCAG checks pass for all principal states.
- Keyboard-only navigation reaches every recovery and disclosure action.
- Focus placement matches this specification.
- Live announcements occur once per transition.
- Disclosure state and copy feedback are correctly named.
- Status is not color-only.
- 200% and 400% zoom produce no overlap or loss of content.

### Visual baselines

Capture at:

- `390x844`
- `768x1024`
- `1024x768`
- `1440x900`

Principal screenshots:

- Invalid link.
- Not found.
- Module permission denied.
- Service unavailable.
- Partial record.
- Stale revision.
- Technical details expanded.

Visual assertions:

- No full-screen red panel.
- No decorative illustration or nested card stack.
- Shell context is correct for the state.
- Primary recovery remains visually dominant.
- Text measure remains readable at wide widths.
- Buttons do not resize in busy states.
- Long identifiers do not cause overflow.
- Mobile actions remain reachable without covering content.

## Implementation Dependencies

These are design dependencies, not work performed by this task:

1. Normalize Booking service error codes and remove raw Java exception messages
   from external responses.
2. Preserve authorization-before-lookup behavior.
3. Return safe code, support reference, timestamp, and retry metadata from the
   page read helper.
4. Decide and implement a route pattern that preserves both true `404` semantics
   and validated list context.
5. Add Booking ID route validation before service calls.
6. Add a tombstone/replacement contract before showing archive, deletion, or
   latest-revision claims.
7. Add record-level business-scope authorization before showing the scope state.
8. Add safe denial context and access-request service integration before showing
   `Request access`.
9. Add completeness metadata before rendering partial-record authority.
10. Add expected revision or ETag before claiming stale-command protection.
11. Add the shared FailureState, TechnicalDetails, CopyButton, and conflict/
    partial notice foundations.
12. Add route-level error-boundary coverage.

## Approval Checklist

- Approve server-owned failure classification.
- Approve authorization-before-existence masking.
- Approve no Retry for malformed, missing, retired, denied, or out-of-scope
  states.
- Approve `Request access` only with safe denial context.
- Approve archive/deletion/scope/latest language only when backed by explicit
  contracts.
- Approve full Shell retention only when session and Booking access remain
  valid.
- Approve partial data and stale revision as in-record states.
- Approve the exact headings, messages, and action hierarchy.
- Approve validated filtered-list return on every recovery path.
- Approve the shared component and read-contract dependencies.

## Recommended Combined Implementation Order For Pages 10-13

After pages 10-13 are approved together:

1. Shared Shell-aligned page grid, breadcrumbs, buttons, statuses, disclosures,
   CopyButton, FailureState, PartialDataNotice, and ConflictStrip.
2. Structured Booking read-result contract, safe error mapping, route ID
   validation, and canonical list-return serializer.
3. Page 10 queue and preserved list context.
4. Page 11 create draft and successful return to detail.
5. Page 12 route-backed operational record and lifecycle actions.
6. Page 13 terminal, partial, conflict, denial, and error-boundary compositions.
7. Cross-page Playwright journeys and visual baselines at all four widths.

No production code, configuration, tests, AI-DLC state, or design-system source
files were modified while producing this design.
