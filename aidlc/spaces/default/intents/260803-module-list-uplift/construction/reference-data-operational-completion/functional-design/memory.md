# Functional Design Memory - U02 Reference Data Operational Completion

## Interpretations

- 2026-08-10T13:30:07Z - Interpreted `All A` as Q1-Q10 selecting option A exactly; the resulting workflow keeps Identity decisions request-scoped, provider mutations authoritative, and post-command detail dependent on a successful provider re-read.
- 2026-08-10T13:30:07Z - Treated unsupported Validate, deactivate, and reactivate actions as absent and BLOCKED, not as disabled or speculative UI controls.
- 2026-08-10T13:30:07Z - Applied the binding W2-02 UI ownership boundary: exactly one root-layout `PlatformShell`, shared LinerCore tokens and `@erp/ui` primitives, with Reference-only form composition remaining feature-local.
- 2026-08-10T14:10:00Z - Resolved the first architecture review against indexed source: browser create stays POST, while the BFF generates the stable provider record ID and uses the existing PUT-by-ID `version=0` behavior for duplicate-safe recovery.
- 2026-08-10T14:10:00Z - Removed the unsupported provider field-schema endpoint/schemaVersion design. Form metadata is now compile-time BFF data aligned with provider unknown-key validation through one executable V1 producer/consumer fixture.
- 2026-08-10T14:10:00Z - Replaced the incomplete generic mutation refinement with an exact Reference-local result and HTTP union, including accepted-but-unconfirmed recovery.

## Deviations

- 2026-08-10T13:30:07Z - Rejected generic UI-skill suggestions for marketing composition, new fonts or colors, animated badges, and framework-generic Server Actions because they conflict with the approved LinerCore operational-console contract and Reference BFF boundary.

## Tradeoffs

- 2026-08-10T13:30:07Z - Chose explicit conflict reconciliation and unknown-outcome re-read over automatic retries; this adds user-visible recovery steps but prevents silent overwrite and duplicate mutation.
- 2026-08-10T13:30:07Z - Chose transient form state without new persistence; this avoids a new draft authority while requiring deliberate dirty-state protection in the current session.
- 2026-08-10T14:10:00Z - Chose synchronized build-time catalogs over a new runtime schema API. This requires executable parity tests and synchronized change control, but stays within approved routes and current provider transport.
- 2026-08-10T14:10:00Z - Existing records with attributes outside V1 remain readable but not editable; preserving unknown provider truth takes precedence over silently dropping values.

## Open questions

- 2026-08-10T14:10:00Z - None after `All A`, consolidated confirmation, and review resolution. Implementation and live evidence remain BLOCKED work, not design questions.
