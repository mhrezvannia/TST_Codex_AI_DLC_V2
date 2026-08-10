# Rough Wireframes - W2-03 Charge Tariffs & Agreements

These low-fidelity Charge-only wireframes realize the [`intent-statement.md`](../intent-capture/intent-statement.md), [`scope-document.md`](../scope-definition/scope-document.md), and risk-first [`intent-backlog.md`](../scope-definition/intent-backlog.md). They inherit `design-system/linercore/MASTER.md` and the new Charge page additions; they do not redraw the shared shell or Booking page.

## Information Architecture

```text
Shared authenticated shell
`-- Charge Agreements (active global module item)
    |-- Agreements
    |   |-- List / search / filter
    |   |-- New draft
    |   `-- Agreement detail
    |       |-- Overview and applicability
    |       |-- Charge lines and source rate versions
    |       |-- Version history
    |       `-- Audit (collapsed by default)
    |-- Rate entries
    |   |-- Unified list: BASE / SURCHARGE / LOCAL
    |   |-- New rate entry
    |   `-- Rate detail and version history
    `-- Manual pricing
        `-- No-rate exception queue and evidence
```

Booking consumption is a linked downstream seam: existing Booking detail/pricing renders the real line items, source versions, total, repricing history, or `MANUAL_PRICING_REQUIRED`. It is not a Charge-owned navigation branch.

## Screen 1 - Agreement List (`/charge-agreements`)

```text
+------------------------------------------------------------------------------+
| Charge Agreements                                      [New agreement]       |
| Agreements | Rate entries | Manual pricing (2)                              |
| Search [________________] Status [All v] Valid on [date] [More filters v]     |
| 24 agreements                                            [Clear] [Apply]      |
+------------------------------------------------------------------------------+
| Agreement | Customer | Version | Status   | Lane      | Validity   | Action  |
| AGR-1042   | Acme     | v3      | Approved | CNSHA-DEHAM| 01 Jul-... | Open > |
| AGR-1048   | Northwind| v1      | Draft    | SGSIN-...  | 15 Jul-... | Open > |
| ...                                                                          |
+------------------------------------------------------------------------------+
| Showing 1-20 of 24                                  < Previous  1 2  Next > |
+------------------------------------------------------------------------------+
```

Primary action: New agreement. Row identity is a real link to its detail route. Status and version are visible without opening the record.

Accessibility note: one `h1`; shell `header/nav` remain external, routed content uses `main`; keyboard entry starts at page heading then New agreement, module tabs, filters, and table; table has caption/headers and row-link labels.

## Screen 2 - New/Edit Agreement Draft

```text
+------------------------------------------------------------------------------+
| < Agreements       New agreement draft                 Unsaved changes       |
+------------------------------------------------------------------------------+
| Agreement identity                    | Applicability and validity            |
| Agreement number [AGR-____]           | Origin [CNSHA v] Destination [DEHAM v]|
| Customer [Search customer________]    | Equipment [40HC v]                   |
| Valid from [date]  Valid to [date]    |                                      |
+------------------------------------------------------------------------------+
| Charge lines                                            [Add charge line]    |
| Code [OFR v] Category [BASE v] Rate version [R-12 v] Qty basis [Container v] |
| Code [BAF v] Category [SURCHARGE v] ...                                  [x] |
| Code [THC v] Category [LOCAL v] ...                                      [x] |
+------------------------------------------------------------------------------+
| Error summary appears here after invalid submit and links to each field       |
|                                                   [Cancel] [Save draft]       |
+------------------------------------------------------------------------------+
```

Create starts with one empty charge line. Editing is permitted only for a Draft. Approved detail offers Create new version instead of edit-in-place. Dirty navigation requires confirmation.

Accessibility note: one `h1`; `main` contains labelled form sections; keyboard entry starts at Back link then Agreement number on fresh entry; after invalid submit focus moves to the error summary first and its links move to fields; persistent labels and error associations are required.

## Screen 3 - Agreement Detail and Approval

```text
+------------------------------------------------------------------------------+
| < Agreements  AGR-1042 / v3  [Approved]                [Create new version] |
| Acme Manufacturing | CNSHA -> DEHAM | 40HC | 01 Jul 2026 - 31 Dec 2026      |
+------------------------------------------------------------------------------+
| Overview | Charge lines | Version history | Audit                            |
+-----------------------------------------------+------------------------------+
| Commercial basis                              | Pricing evidence             |
| Customer: Acme                                | Source agreement: AGR-1042 v3|
| Lane/equipment: CNSHA-DEHAM / 40HC             | Approval: 21 Jul 2026        |
| Effective window: ...                         | Related Booking proof [Open] |
|                                               |                              |
| Itemised terms                                | Audit evidence [collapsed v] |
| OFR  BASE       per container  USD ... R-12   |                              |
| BAF  SURCHARGE  per container  USD ... R-22   |                              |
| THC  LOCAL      per container  USD ... R-31   |                              |
+-----------------------------------------------+------------------------------+
```

Draft variant shows Edit and Approve. Approval opens a confirmation dialog summarizing version, validity, selected rate versions, and the fact that approval makes the version immutable. Suspended/Expired variants show reason and permitted actions without offering invalid commands.

Accessibility note: one `h1`; `main` plus optional labelled `aside`; keyboard entry starts at Back link then primary lifecycle action; tabs use arrow-key behavior; dialog traps/restores focus and approval status is announced politely.

## Screen 4 - Rate Entry List (`/charge-agreements/rates`)

```text
+------------------------------------------------------------------------------+
| Rate entries                                             [New rate entry]    |
| Agreements | Rate entries | Manual pricing (2)                              |
| Search [________] Category [All v] Lane [All v] Equipment [All v] Valid [date]|
+------------------------------------------------------------------------------+
| Code | Category  | Lane       | Equipment | Basis        | USD amount | Ver  |
| OFR  | Base      | CNSHA-DEHAM| 40HC      | Per container| 1,840.00   | v4 > |
| BAF  | Surcharge | CNSHA-DEHAM| 40HC      | Per container|   220.00   | v7 > |
| THC  | Local POL | CNSHA      | 40HC      | Per container|   145.00   | v3 > |
+------------------------------------------------------------------------------+
| Effective window and status remain available as columns or compact row detail|
+------------------------------------------------------------------------------+
```

One unified list avoids three separate management systems while preserving category semantics. BASE/OFR and SURCHARGE/BAF show lane origin + destination + equipment. LOCAL/POL THC shows origin port + equipment and no destination. Expired/future versions are filterable and labelled; approved agreement dependencies are visible on rate detail before a new version is created.

Accessibility note: one `h1`; `main` contains module tabs, filter form, and labelled table/record list; keyboard entry starts at New rate entry; horizontal scroll region is keyboard reachable and named on narrow screens.

## Screen 5 - New/Edit Rate Version

```text
+------------------------------------------------------------------------------+
| < Rate entries      New BAF surcharge draft               Draft              |
+------------------------------------------------------------------------------+
| Charge code [BAF v]            Category [Surcharge v]                         |
| Origin [CNSHA v] Destination [DEHAM v] Equipment [40HC v]                    |
| Basis [Per container v] Quantity rule [Booking equipment quantity - read only]|
| Currency [USD - read only]     Amount [220.00]                                |
| Effective from [date/time]     Effective to [date/time]                       |
| Notes [_______________________________________________________________]       |
+------------------------------------------------------------------------------+
| Existing version warning: R-BAF-006 remains effective until ...               |
| Dependent approved agreements: 3 [Review links]                               |
|                                                     [Cancel] [Save draft]     |
+------------------------------------------------------------------------------+
```

The thin slice allows flat per-container USD only. For BASE and SURCHARGE, Origin + Destination + Equipment are required. For LOCAL, the form fixes Locality to POL, requires Origin port + Equipment, and hides Destination because it does not participate in matching. Unsupported dimensions are absent, not disabled teaser controls. Saving an overlapping version returns a specific inline conflict and preserves input.

Save creates a Draft. On rate detail, the Pricing Analyst may use Approve version after review. Approval makes the version immutable; Scheduled, Effective, and Expired are read-only derived labels based on the approved effective window. An agreement cannot be approved while it references a Draft rate version.

Accessibility note: one `h1`; `main` has grouped labelled form controls and linked dependency disclosure; keyboard entry starts at Back then Charge code; errors are text-linked and async reference failures use a polite live region.

## Screen 6 - Manual Pricing Queue

```text
+------------------------------------------------------------------------------+
| Manual pricing required                                  2 open cases        |
| Agreements | Rate entries | Manual pricing (2)                              |
| Booking [________] Reason [All v] Received [date range] [Apply]               |
+------------------------------------------------------------------------------+
| Booking | Customer | Lane/equipment | Reason                | Received | Open |
| BKG-781 | Acme     | CNSHA-USLAX 40HC| No applicable rate    | 10:42    | >    |
+----------------------------------------------+-------------------------------+
| Selected case MPC-2041                       | Evidence                      |
| Open - MANUAL_PRICING_REQUIRED               | Pricing request [copy]        |
| No applicable approved rate for date/lane    | Agreement lookup: no match    |
| Responsible queue: Charge pricing analyst    | Correlation [copy]            |
| [Open Booking] [Search agreements] [Rates]   | Opened at ... Audit [v]       |
+----------------------------------------------+-------------------------------+
```

This is an exception/evidence view, not a fabricated manual-amount resolution workflow. The case identity, derived Open state, opened time, request/reason/correlation evidence, and responsible role queue are explicit. It gives the operator owned next steps and preserves distinction from timeout, 503, or circuit-open failures.

Accessibility note: one `h1`; `main` contains filters, queue, and selected-case region; keyboard entry starts at filters then queue rows; selection/status updates are announced and every reason is readable without color.

## Narrow Layout (`375px`) Pattern

```text
+----------------------------------+
| Charge Agreements                |
| [New agreement]                  |
| Agreements | Rates | Manual (2)  |
| Search [____________________]     |
| [Filters]  24 results            |
+----------------------------------+
| AGR-1042  v3  Approved           |
| Acme Manufacturing               |
| CNSHA -> DEHAM / 40HC            |
| Valid 01 Jul - 31 Dec       [>]  |
+----------------------------------+
| AGR-1048  v1  Draft              |
| Northwind ...               [>]  |
+----------------------------------+
| < Previous             Next >    |
+----------------------------------+
```

Tables may switch to compact semantic record rows or a named horizontal-scroll region. Forms become one column, actions wrap in reading order, evidence follows the primary task, and no primary command disappears.

Accessibility note: one `h1`; shared mobile shell remains authoritative; keyboard/touch order matches visual order; 44px minimum touch targets, visible focus, and no page-level horizontal scroll.

## Annotated Existing Booking Pricing Surface (Integration Contract)

This is not a new W2-03-owned Booking page. It specifies the minimum real data the existing Booking detail/pricing region must render for cross-domain acceptance.

```text
+------------------------------------------------------------------------------+
| Booking BKG-781 | Pricing: Priced | Amendment 2          [Reprice]           |
| Current snapshot | Previous snapshot (amendment 1)                            |
+------------------------------------------------------------------------------+
| Pricing basis: AGREEMENT       Pricing ref: AGR-1042/v3                       |
| Code | Category  | Basis         | Qty | Unit rate | Line amount | Currency  |
| OFR  | Freight   | Per container | 2   | 1,840.00  | 3,680.00    | USD       |
| BAF  | Surcharge | Per container | 2   |   220.00  |   440.00    | USD       |
| THC  | Local     | Per container | 2   |   145.00  |   290.00    | USD       |
|                                               Total: 4,410.00 USD             |
+------------------------------------------------------------------------------+
| Provenance: agreement v3 | rate versions OFR v4, BAF v7, THC v3 | [Audit v] |
+------------------------------------------------------------------------------+
```

Repricing disables its command and shows `Repricing...`; success announces the new snapshot and retains the prior selector. No-rate replaces the table with `MANUAL_PRICING_REQUIRED`, reason, pricing request/correlation evidence, and a link to the Charge case. Pending, timeout/503/circuit, denied, and validation states use their existing distinct Booking treatments.

Accessibility note: existing Booking `main`/heading hierarchy remains authoritative; the pricing region has an `h2`, labelled current/prior snapshot controls, semantic table headers, a polite result announcement, and keyboard-reachable Reprice/exception links.

## State Matrix

| State | List/rate pages | Editor | Detail | Manual queue |
|---|---|---|---|---|
| Loading | Stable table/row skeletons | Reference-control skeletons only | Header/sections skeleton | Queue/evidence skeleton |
| Empty | Clear-filter and create action | Not applicable | Not found/recovery link | No manual cases; no celebratory marketing |
| Populated | Real pagination/count | Values and validation | Real versions/lines/audit | Real no-rate evidence |
| Error/retry | Affected region plus Retry | Preserve input | Preserve identity; retry section | Preserve selected case; retry |
| Denied/read-only | Hide mutation; explain role | Route denied without losing prior route | Read-only facts/audit | Read-only evidence |
| Validation/conflict | Filter hint only | Summary plus field errors; stale/overlap conflict | Invalid lifecycle action explained | Not applicable |
| Pending command | Filter update announced | Disable Save; show `Saving...` | Disable action; `Approving...` | Filter update announced |
| Success | Result count announced | Toast/live confirmation then detail | New status/version announced | Selected-case update announced |
| Degraded provider | Affected region plus Retry | Preserve all input; safe Retry | Preserve identity; distinct timeout/503/circuit | Preserve case; separate provider state |
| Long/overflow | Named table scroll/compact rows | Long reference labels wrap | IDs copyable; lines scroll | Reasons wrap; IDs copyable |
| Light/dark | Shared semantic tokens only | Same | Same | Same |

## Existing Screen Migration Notes

- Keep the recognizable agreement list/detail flow from `ChargeAgreementWorkbench` but replace disabled actions and hardcoded pricing with real routes/data.
- Remove "walking skeleton," planned-capability, fallback-data, and backend-port copy from the primary operator workflow.
- Replace inline `CSSProperties` and hardcoded values with `@erp/ui` primitives/tokens; no changes to `packages/ui` are designed here.
- Keep runtime/correlation evidence only in collapsed audit or release artifacts.

## Action-by-Role Matrix

| Action | Charge reader/auditor | Pricing analyst | Booking desk |
|---|---|---|---|
| View agreements/rates/audit | Yes | Yes | No Charge route requirement |
| Create/edit Draft agreement | No | Yes | No |
| Create/edit Draft rate version | No | Yes | No |
| Approve rate version | No | Yes | No |
| Approve/suspend/expire agreement | No | Yes | No |
| View manual case evidence | Yes if permitted | Yes; responsible queue | Through related Booking only |
| Trigger Booking reprice | No | No | Yes in existing Booking surface |

No Charge-read capability yields the shared denied route. Charge-read without mutation yields the same route in read-only mode with unavailable commands absent and reason text. All Charge administration route metadata sets the journey ribbon to hidden.

## Product Review Record

- Iteration 1 verdict: **NOT-READY**, with eight lifecycle, applicability, Booking-seam, state, authorization, focus, manual-ownership, and ribbon findings. All eight were addressed.
- Iteration 2 verdict: **NOT-READY**, with two remaining contradictions: a separate Commercial Approver role not authorized by the upstream actor model, and an optional Commodity field that was explicitly deferred.
- Post-iteration-limit resolution: approval now remains with the stated Pricing Analyst actor across the swimlane, role matrices, and page contract; Commodity was removed from the agreement form and remains out of scope.
- Lead final consistency check: no reviewer finding remains open. This is recorded as **ready for the human stage gate**, not as a rewritten Product Lead verdict.

## Upstream Traceability

The `intent-statement` requires real itemised pricing and manual no-rate behavior. The `scope-document` limits screens to owned administration, provenance, and exception evidence. The `intent-backlog` makes the first visual proof a real rate-to-agreement-to-Booking line and preserves repricing/no-rate closure.
