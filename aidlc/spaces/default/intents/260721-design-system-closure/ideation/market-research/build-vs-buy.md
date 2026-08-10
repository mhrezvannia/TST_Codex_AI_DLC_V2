# Build vs Buy vs Partner

The upstream intent-statement.md fixes this as a closure of an existing shared package. The decision therefore compares the remaining cost-to-proof, not the cost of a greenfield design-system launch.

## Options

### Preserve and close

Finish Booking consumption of @erp/ui, add or expose only the missing shared state primitive(s), document any semantic exceptions, and produce isolated live evidence. This preserves the protected baseline and existing ownership.

### Buy or adopt

Adopting Carbon, USWDS, or another library would require token translation, shell reconciliation, primitive remapping, regression work, dependency governance, and a new evidence cycle. Public availability does not remove integration and lifecycle cost.

### Partner or hybridize

Wrapping an external library behind @erp/ui would preserve the import boundary but introduce a second design vocabulary and migration layer. There is no unresolved DoD item that requires this additional architecture.

## Decision

**Preserve and close.** The selected option is the smallest vertical unit that can turn existing implementation into observed Definition-of-Done evidence. External systems remain non-binding references for accessibility and system-coherence practices.

## Guardrails

- No reset or replacement of c2f13dd.
- No second frontend, shell, navigation, or module-local theme.
- No expansion into generic component breadth unless a live Booking closure gap demonstrates the need.
- Preserve the historical W1 live-proof waiver as blocked/waived truth; any new live pass is separate evidence.
- Validate only on linercore-wave-a; never target linercore-shared-platform.
