# Functional Design Memory

## Interpretations

- 2026-07-21T15:22:00Z — Treated W2-02 as a presentation and evidence closure: existing Booking/service entities remain authoritative while transient route, action, feedback, and evidence models receive detailed design.
- 2026-07-21T15:31:00Z — Normalized the route-state discriminator to the upstream `populated` term and specified one adapter from existing shell load results.

## Deviations

- 2026-07-21T15:24:00Z — The linter and type-check sensors refused Markdown output paths because their manifests accept code extensions only; retained this as non-applicability instead of adding artificial code files or snippets.

## Tradeoffs

- 2026-07-21T15:18:00Z — Kept server-oriented reads and route-local action state instead of a global client store, preserving Next.js and brownfield boundaries at the cost of explicit per-route mapping.
- 2026-07-21T15:31:00Z — Used permanent request-aware redirects with strict query allow-lists rather than hidden duplicate pages, preserving BFF ownership while removing presentation ambiguity.

## Open questions

- 2026-07-21T15:34:00Z — No implementation-blocking design question remains after the mandatory second architecture review returned READY.

