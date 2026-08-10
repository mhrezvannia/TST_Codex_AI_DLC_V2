# External Dependency Map - W3-01 D&D Rules and Rates

## Source alignment and fail-closed policy

This map consumes approved `requirements.md`, `stories.md`, Refined `mockups.md`, Application Design `components.md`, `unit-of-work.md`, `unit-of-work-dependency.md`, `unit-of-work-story-map.md`, and affirmed `team-practices.md`.

An external dependency is ready only when its named owner supplies the listed evidence. No date or lead time is invented. An unmet item blocks the consuming Bolt or intent exit; it cannot be replaced by a Charge-local shared-shell fork, mock boundary, guessed timezone, unsigned fixture, skipped scanner or provisional green claim.

## Dependency gates

| ID | Dependency and owner | Blocks | Readiness evidence | Mitigation while waiting | Fail-closed response |
| --- | --- | --- | --- | --- | --- |
| ED-01 | W2-02 UI platform owner: merged `PlatformShell` active-module, canonical rail, skip-link/main seam | B01 integrated UI proof and all later UI | Exact merged commit/workspace revision plus package keyboard/landmark/rail tests | Progress non-UI B01 work that does not claim integrated DoD; coordinate merge review | Do not fork shell/navigation or claim UI DoD |
| ED-02 | W2-02 UI platform owner: merged `Dialog` description/`aria-describedby` seam | B02 approval/successor UI and later dialog use | Exact merged commit/workspace revision plus accessible name/description/focus/Escape/restore tests | Progress lifecycle/provider work; retain approval-dialog evidence as blocked | Do not create a Charge-local Dialog or omit programmatic description |
| ED-03 | Charge and Booking maintainers: additive `pricing.v1` provider/consumer compatibility | B01 exit and any B02-B04 consumption | Regenerated provider/consumer fixtures, existing W2-03 fixtures green, one bilateral signed manifest | Resolve schema/fixture findings in B01 under its exclusive contract owner | No unsigned release, consumer use or fixture re-ownership later |
| ED-04 | Reference Data maintainer: active valid `LOCATION.attributes.timeZoneId` for accepted ports | B01 term approval/provider proof; B03 boundary breadth | Validated NLRTM/SGSIN records and authenticated Charge REST evidence | Correct authoritative Reference Data or configuration | No direct DB read, UTC/default guess, local cache substitute or green result |
| ED-05 | Release-review/Compose owner: isolated project, edge URL and demo guard reservation | Each Bolt live DoD and final integrated acceptance | Effective Compose project/ports/build, clean health and serialized reservation record | Run non-live focused checks; queue a guarded slot | Do not run competing stacks or substitute mocks for live evidence |
| ED-06 | Security/DevSecOps owner: required scanner execution or policy disposition | B04 security evidence and intent exit | Scanner output tied to build, or explicit approved policy resolution | Repair scanner/configuration and retain status as blocked | Never report unavailable/skipped scanner green |
| ED-07 | Charge, Booking, Pricing/Product owners: provisional p99 accept-or-revise decision | Intent exit after B03 measurement | Host/build/concurrency/sample/distribution record plus named acceptance or revised target | Re-run bounded warm-local measurement after defects/environment changes | Do not promote provisional 1.5 s as an accepted production SLO |
| ED-08 | Product/Pricing Analyst and user approval roles | Each AI-DLC/Bolt gate and final acceptance | Exact approval decision and accepted business examples | Present evidence and unresolved facts without inferred consent | Do not advance a gated stage or Bolt |
| ED-09 | QA/Delivery release owners: consolidated verification | Intent exit after B04 | >=80% changed-line coverage, full viewport/theme Playwright matrix, all four unit evidence files, green `aidlc-audit` and `erp-fidelity-audit` | Close only the missing evidence against the integrated build | Do not treat focused unit checks as integrated acceptance |

## Bolt consumption view

| Bolt | Required before entry or exit | Owner escalation path |
| --- | --- | --- |
| B01 | ED-01, ED-03, ED-04, ED-05, ED-08 | Delivery -> W2-02/Charge/Booking/Reference owners -> Product/user gate |
| B02 | B01 approval plus ED-02, continuing ED-03 invariants, ED-05, ED-08 | Delivery -> W2-02/Charge owner -> Product/user gate |
| B03 | B02 approval, ED-04 breadth, ED-05, measurement portion of ED-07, ED-08 | Delivery -> Reference/Charge/Pricing owners -> Product/user gate |
| B04 | B03 approval, ED-05, evidence portion of ED-06, ED-08 | Delivery -> Security/Charge owner -> Product/user gate |
| Integrated exit | ED-06, final ED-07, ED-09 and verification of ED-01-ED-05 | Delivery/QA -> named release owners -> user live-acceptance decision |

## Status and scheduling policy

All owner availability and lead times are currently unverified. Delivery Planning therefore records role-based gates rather than dates. Delivery may add a schedule fact when the accountable owner supplies it, but must preserve the blocking Bolt, evidence and fail-closed outcome above. External dependency status is part of Bolt readiness and is reviewed before reserving the live environment.
