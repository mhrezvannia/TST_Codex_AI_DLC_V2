$ui-ux-pro-max

Act as a principal enterprise UX designer and design-system architect
specializing in resilient operational software. This is an AI-DLC inception
design task for LinerCore, an enterprise ocean-shipping ERP. Do not edit
production code in this turn.

Inspect all current Auth, Shell, Booking, Reference Data, and Charge Agreements
pages, their loading/error/success implementations, `@erp/ui`, and the running
demo at `http://127.0.0.1`. Design one shared system-state language for the whole
product.

LinerCore users spend long periods in the ERP and must distinguish business
exceptions from technical failures. Status feedback must be precise, calm,
accessible, recoverable, and visually consistent.

Design reusable patterns for:

- Initial page loading.
- Table loading and pagination loading.
- Detail-panel loading.
- Row mutation.
- Button progress and duplicate-click prevention.
- Empty collection.
- Filtered-empty result.
- Partial data.
- Stale fallback data.
- Connectivity loss.
- Service degradation.
- Optimistic success.
- Persisted success.
- Warning and business exception.
- Field validation and linked error summary.
- Authorization lost during a task.
- Version or edit conflict.
- Background event received.
- Destructive or irreversible confirmation.
- Page not found and record no longer available.

Specify when to use:

- Skeleton.
- Inline spinner.
- Disabled loading button.
- Inline status.
- Section-level state.
- Page-level state.
- Global banner.
- Toast.
- Dialog.
- Activity or notification center.

Toasts must not carry critical information and must be announced accessibly.
Preserve layout dimensions while loading. Do not show a spinner for every small
operation. Separate business status such as Manual Pricing or Pending Event from
technical status such as service unavailable.

Use the shared LinerCore visual system: light neutral surfaces, near-black text,
restrained maritime blue, semantic green/amber/red, Source Sans 3 or Inter,
Lucide icons, 4-8px radii, subtle borders, stable dimensions, visible focus, and
no gradients, glass, decorative illustration, nested cards, or color-only
meaning.

Meet WCAG 2.2 AA. Define live-region priority, focus placement, dismissal,
duration, keyboard behavior, reduced motion, and 390/768/1024/1440px behavior.

Produce:

1. State taxonomy and decision tree.
2. Final component anatomy and token usage for every pattern.
3. Desktop and mobile wireframes for representative states.
4. Content-writing rules and example messages using LinerCore scenarios.
5. Notification priority, placement, duration, and dismissal rules.
6. `@erp/ui` primitive/component API recommendations.
7. Accessibility requirements.
8. Playwright, visual-regression, and no-layout-shift acceptance checklist.

Do not implement until the design is approved.
