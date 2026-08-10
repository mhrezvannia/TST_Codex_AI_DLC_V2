# Core User Flow — W4-01 Module List-Detail Uplift

## Sources and Flow Boundary

Sources: `intent-statement.md`, `scope-document.md`, and `intent-backlog.md`.

The flow begins and ends inside the authenticated LinerCore shell. It describes the shared interaction grammar; module-specific provider capabilities and exact route parameters remain Requirements/User Stories inputs.

## Primary Find → Inspect → Act Flow

```text
[Open shared edge URL or exact canonical deep link]
                         |
                         v
              [Authenticated session valid?]
                  | yes             | no
                  v                 v
        [Shell + permitted nav]   [Auth flow -> return target]
                  |
                  v
      [Choose Reference / Charge / Container]
                  |
                  v
        [List route loads real provider]
          |        |        |       |
          |        |        |       `--> [Denied] -> help/request path
          |        |        `----------> [Error/degraded] -> retry/continue safely
          |        `-------------------> [True empty] -> permitted next step
          `----------------------------> [Populated]
                                                  |
                              [Search/filter/sort/page if supported]
                                  | no match           | results
                                  v                    v
                          [Filtered empty]       [Open exact record link]
                                  |                    |
                          [Clear/change filters]       v
                                              [Stable detail route]
                                               |     |      |
                                               |     |      `-> [Not found/stale]
                                               |     `--------> [Denied/read-only]
                                               `--------------> [Populated detail]
                                                                  |
                                                   [Review approved domain tabs]
                                                     |                     |
                                                     |                     `-> [Exact Booking link]
                                                     v
                                            [Permitted action available?]
                                                | no          | yes
                                                v             v
                                        [Read-only truth] [Validate/confirm]
                                                               |
                                                               v
                                                            [Pending]
                                                     | success | conflict/error
                                                     v         v
                                               [New truth] [Recover, preserve context]
                                                     \         /
                                                      v       v
                                             [Continue detail or Back to results]
```

## Module-Specific Flow Anchors

| Module | Find | Inspect | Act / continue |
|---|---|---|---|
| Reference Data | Set/record identity and supported attributes | Summary, Attributes, History | Permitted legacy-supported reference action or read-only state |
| Charge Agreements | Agreement/partner/validity/status | Summary, Rates, D&D, Status history | Permitted lifecycle action; exact Booking link |
| Container Movement | Journey/container/Booking/latest event | Summary, Movement timeline, Linked booking | Permitted movement action; exact Booking link |

## Return-Context Flow

```text
[List URL with supported query state]
              |
       [Open record link]
              |
[Detail route carries safe return context or shell history]
              |
     [Act / inspect / cross-link]
              |
      [Back to results]
              |
[Same supported filters, sort, page, and focus target restored]
```

Recovery rules:

- Invalid or unsafe return targets fall back to the canonical module list.
- Provider validation/conflict/error preserves entered data, selected tab, and record context.
- Refreshing or sharing a detail URL does not require a prior list visit.
- A cross-module link identifies the exact record and remains within the authenticated shell.

## State and Announcement Flow

| Transition | Visible response | Accessibility response | Focus rule |
|---|---|---|---|
| Route loading | Stable-size Skeleton | Loading state available without repetitive noise | Retain navigation focus until new page is ready |
| Filter result update | Count/table or filtered-empty state | Polite result-count announcement | Stay on invoking control |
| Provider error | Safe message, reference, retry | Error announced | Move only if user initiated navigation and heading needs focus |
| Dialog open/close | Scoped confirmation | Named dialog, trapped focus | Restore trigger on close |
| Action pending | Disabled duplicate command, progress | Pending announced | Stay in action context |
| Success | Updated facts/status, confirmation | Success announced | Stay on logical continuation |
| Conflict | Current provider state and recovery choice | Conflict/error announced | Move to conflict heading/summary only when necessary |
| Denied/read-only | Explicit capability state | Reason and available next step exposed | First relevant heading/action reachable |

## Responsive Flow Continuity

At 375/390, 768, 1024, and 1440 widths, the user can still: reach module navigation; find search and filters; open the same exact record link; read status without color dependence; move between approved detail tabs; invoke the primary permitted action; recover from every applicable state; and follow exact Booking cross-links. Narrow-table overflow stays inside a labelled region and never hides primary identity access.

## Flow Exit Criteria

The rough flow is ready for Requirements only if every branch is attributable to provider truth, the shell remains the sole navigation/auth owner, domain details remain distinct, deferred capability is absent, and the ordered detailed-design tasks remain parked until Requirements and User Stories approval.
