# Shared Infrastructure - U06 Final Live Acceptance and Audit

## Source Context

This shared infrastructure design consumes U06 `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md`, application `services.md`, and U06 `business-logic-model.md`. It identifies shared runtime and evidence resources consumed by final acceptance.

## Shared Resource Inventory

| Shared resource | Existing owner | U06 use | Boundary |
| --- | --- | --- | --- |
| Local Compose/Nginx stack | U01-U05 runtime | Live proof entry and readiness evidence. | Observe only. |
| `apps-shell`/auth/Booking/identity services | W2-01 and prior owners | Scenario surfaces. | No runtime redesign. |
| Evidence directory | W2-01 acceptance | Final artifact package. | Filesystem artifact, not app state. |
| Detector/audit tools | Existing audit tooling | Command evidence. | Run locally and save outputs. |
| W1 waiver artifact/status | W1 evidence | Distinct BLOCKED reference. | No PASS rewrite. |
| Preservation evidence | U05/final acceptance | W0/W1/W2 boundary proof. | No broad prior-work rewrite. |

## Access Boundaries

- Scenario runner uses Nginx entrypoint.
- Command runner operates from repo root and writes only evidence files.
- Evidence package can reference logs/reports but must not expose secrets.
- Final decision renderer reads evidence and writes summary; it does not change runtime state.

## Cross-Unit Ownership

U06 consumes evidence from U01-U05 and produces final package shape for acceptance. It cannot relax earlier unit requirements. Any failed/missing earlier-unit evidence makes U06 BLOCKED.

## Preservation Controls

| Prior work | Control |
| --- | --- |
| W0-01 platform/eventing | Record preservation status only; no redesign. |
| W0-02 reference-data | Record preservation status only; no UI/seed/completeness change. |
| W1-01 Booking | Preserve W1 behavior and waiver BLOCKED status. |
| W2-02 design-system foundation | Record gaps only; no foundation work. |

## Failure Isolation

U06 blockers identify the failing dependency, command, or scenario without masking other passing evidence. A W2-01 BLOCKED final decision does not change W1 waiver status and does not imply prior merged work failed unless the blocker explicitly names a regression.

