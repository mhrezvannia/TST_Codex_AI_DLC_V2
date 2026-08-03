# D&D Rules & Rates Page Contract

## Authority and ownership

This contract extends the Charge-owned page additions for W3-01. Charge owns the
ruleset and evaluation engine. Container Movement supplies movement facts later
through Booking but never owns, edits, or interprets D&D rules.

## Proposed route contract

Application Design confirms identifiers and URL spelling before code generation.

| Route | Type | Purpose |
|---|---|---|
| `/charge-agreements/dnd/rules` | List | Search/filter rule types and open a rule detail |
| `/charge-agreements/dnd/rules/new` | Create | Define an MVP DCSA-bounded rule type |
| `/charge-agreements/dnd/rules/[ruleTypeId]` | Detail | Rule identity, move bounds, rates, agreements, history, actions |
| `/charge-agreements/dnd/rates` | List | Search/filter effective D&D rates by port, rule, status, and date |
| `/charge-agreements/dnd/rates/new` | Create | Define free time and daily rate for one rule/port scope |
| `/charge-agreements/dnd/rates/[dndRateId]` | Detail | Version, applicability, agreement links, evaluation action, history |
| `/charge-agreements/[agreementId]` D&D tab | Relationship | Approved agreement linkage and effective D&D terms |

These are Charge administration routes and never show the Booking journey ribbon.

## Information architecture

- Rule list columns: name/type, start move, end move, counting basis, status,
  active rate count, updated time.
- Rate list columns: rule, port/trade scope, free days, daily amount/currency,
  effective window, version/effective state, linked agreements.
- Rule detail: identity/status; readable DCSA bounding pair; counting basis;
  rate table; linked agreements; version/history; collapsed audit.
- Rate detail: rule and scope; free-time terms; daily rate; effective window;
  version/status; linked agreements; bounded Evaluate sample action; history.
- Forms use reference-backed port and charge-code controls, persistent labels,
  on-blur validation, dirty-state protection, and review before approval.

## Evaluation panel

Evaluation is an action from rate/rule detail, not a general-purpose workbench.
Inputs are start/end move facts and occurred timestamps. Results show elapsed
calendar days, free days, chargeable days, daily rate, calculation, total,
currency, and exact rule/rate/agreement versions. Zero within free time is a
successful result, not an empty or error state.

## States and behavior

Cover loading skeleton, no rules/rates, no filter match, populated, denied,
read-only, validation blocked, save/evaluation pending, success, optimistic
version conflict, service error/retry, expired/no-applicable rate, and degraded
evidence. Commands cannot double-submit. Approved/versioned history is immutable.

## Responsive and accessibility contract

- 1024/1440: detail content plus compact action/evidence rail.
- 768: rail follows content or uses an accessible disclosure; tables use labelled
  inner overflow.
- 375: semantic record rows and one-column forms; evaluation results remain a
  readable calculation sequence.
- DCSA codes always have readable labels. Money exposes currency and basis.
- Validation focuses a linked error summary. Dialog/drawer focus is trapped and
  restored. Status never depends on color alone.

## Skill decision record

Adopt labelled forms, on-blur validation, explicit submission feedback,
responsive table handling, and keyboard/focus discipline. Reject bulk editing,
marketing/gateway composition, new colors/fonts, chart-first presentation, and
spinner-only loading because they conflict with the intent or LinerCore master.
