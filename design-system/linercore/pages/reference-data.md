# Reference Data Page Contract

## Authority and ownership

This is the missing W4-01 Reference Data override. It retires the single-page
workbench in favor of authenticated shell routes and the binding list/detail
interaction-spec pattern. It introduces no new reference-data capability.

## Proposed route contract

Application Design confirms whether the set code is a path segment or stable id.

| Route | Type | Purpose |
|---|---|---|
| `/reference-data` | Set list | Find a reference set and view ownership/status/count |
| `/reference-data/[setCode]` | Record list | Search/filter/sort/paginate records in one set |
| `/reference-data/[setCode]/[recordId]` | Record detail | Summary, Attributes, History, and permitted actions |

Reference Data has no workflow ribbon. Breadcrumbs retain set and record context.

## List specifications

- Set list: set name/code, description, record count, status, last change.
- Record list: code/key, label/name, active/effective state, validity dates,
  version, last change, and a named detail link.
- Filters are driven by actual provider capabilities. Do not fake client-only
  pagination or expose filters the service cannot apply.
- Preserve search/filter state in URL search parameters and on return from detail.

## Detail specification

- Header: set, record identity, active/effective state, version, validity.
- Summary tab: readable primary fields and ownership.
- Attributes tab: domain attributes as labelled key/value data, not raw JSON.
- History tab: ordered versions/changes with actor/source/time and changed values.
- Action rail: only actions supported by the old workbench and current capability;
  mutation commands disappear in read-only mode with a concise explanation.
- Raw provider payload belongs in a collapsed audit disclosure when needed.

## States and behavior

Cover set/record loading skeleton, no sets, empty set, no filter match, populated,
not found, denied, read-only, validation, save pending/success/conflict/error,
history unavailable, and partial/degraded states. Preserve filters, selected set,
entered values, and available sections across scoped failures.

## Responsive and accessibility contract

- 1024/1440: compact tables and detail with an action/evidence rail.
- 768: labelled table overflow and stacked detail rail.
- 375: semantic record rows; primary identity/status and action remain visible.
- Tables have captions/labelled regions and real headers. Filters and result
  counts are announced politely. Forms use persistent labels, linked errors,
  visible focus, and keyboard-reachable row/action links.

## Skill decision record

Adopt the data-dense master/detail pattern, responsive table handling, breakpoint
verification, and keyboard/focus discipline. Reject bulk actions and saved views
because W4-01 explicitly defers them, along with gateway/marketing composition,
new palettes/fonts, and workbench-style create/list/status cramming.
