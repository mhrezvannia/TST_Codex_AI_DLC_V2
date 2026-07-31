# LinerCore UI/UX Session Prompt

Use this block unchanged in every UI-bearing AI-DLC session. Append the active
intent statement after it; do not replace the shared framing with a module-only
prompt.

```text
Invoke the project ui-ux-pro-max skill as a required design input for every page
you design, implement, or review in this intent.

First load:
1. design-system/linercore/MASTER.md
2. docs/program-vision-document.md sections 3-5
3. docs/erp-workflow-map.md
4. docs/enterprise-technical-environment.md frontend standards
5. the active intent statement and its full Context Pack
6. the relevant enterprise refined-mockup interaction and accessibility artifacts
7. design-inputs/claude-ui-export/ as visual direction only

Project framing: LinerCore is an authenticated internal carrier ERP for pricing
and agreements, booking, reference data, and DCSA container movement. Its users
perform dense, repeated operational work and exception handling. Design a quiet,
professional, data-dense workbench, not a marketing or decorative SaaS page.

Use the one shared shell and @erp/ui tokens/primitives. Do not create module-local
navigation, branding, theme, typography, raw hex palette, or a second component
library. The workflow ribbon is contextual and must not appear on Overview,
Reference Data, authentication, denied, or administration pages. Reference Data
is the final business-module item in the sidebar.

Preserve real business ownership and vocabulary. Show money with source rate and
agreement evidence; show movements with DCSA code plus readable meaning. Keep
Kafka, schemas, and raw payloads in a collapsed audit/evidence surface rather than
the primary operator workflow.

Design all naturally expected route states: loading skeleton, empty, error/retry,
denied, populated, validation, pending, success, and degraded behavior. Meet WCAG
2.1 AA and verify keyboard operation, focus, labels, error announcement, reduced
motion, light/dark contrast, and responsive layouts at 375, 768, 1024, and 1440px.

Use Lucide icons and stable responsive dimensions. Avoid nested cards, oversized
headings in work surfaces, gradients, decorative blobs, rounded text pills used
as controls, layout-shifting hover effects, and explanatory feature copy.

Treat ui-ux-pro-max output as recommendations. Explicitly reject suggestions that
conflict with the intent, enterprise standards, shared master contract, or the
existing operational visual reference. Record page-specific additions only in
design-system/linercore/pages/<page>.md; do not edit the master outside W2-02.

Before completion, run the live page through Playwright and provide visual and
accessibility evidence. Do not claim UI completion from source review or tests
alone.
```

## Parallel Session Rule

The three Wave A sessions stay visually consistent because they share this prompt,
the same master contract commit, the same `@erp/ui` package, and disjoint ownership.
Chat memory is never a coordination mechanism. Decisions must be written to the
active intent record or its page override and merged through the program branch.
