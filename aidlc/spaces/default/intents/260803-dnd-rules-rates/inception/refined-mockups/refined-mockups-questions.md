# Refined Mockups Questions - W3-01 D&D Rules & Rates

**Inputs:** approved Requirements Analysis (`requirements.md`), approved User Stories (`stories.md`), reviewed `docs/ui-ux-design/18-dnd-rules-and-rates.md`, LinerCore master/session prompt, relevant page contracts, rough `wireframes.md`, rough `user-flow.md`, and `team-practices.md`.

## Q1 - Page-level design approval for handoff

The reviewed design candidate resolves the combined rule/rate lifecycle, deferred evaluation UI, traceability, responsive, accessibility, state, ownership, and `@erp/ui` decisions. How should Refined Mockups treat it?

- A. Approve the current reviewed candidate as binding page-level input and convert it into the five AI-DLC Refined Mockups artifacts (recommended)
- B. Request changes to the reviewed design before conversion; specify the exact section and correction
- X. Other (please specify)
- `[Answer]: A - Approve current candidate (Recommended)`

## Q2 - Existing artifact reuse after backward jump

The deterministic engine returned W3-01 from Application Design to Refined Mockups and found all five prior stage artifacts. How should the handoff be applied?

- A. Modify the existing artifacts against `REFINED-MOCKUP-HANDOFF.md`, preserving content that already conforms (recommended)
- B. Keep the prior artifacts unchanged
- C. Redo all artifacts from an empty baseline
- X. Other (please specify)
- `[Answer]: A - Modify; the user's written instruction was to apply the handoff and produce the binding artifacts.`

## Already-resolved decisions

- Exactly three fixed D&D rule types; no generic combined rule and no arbitrary movement pairs.
- One combined rule/rate Draft and successor lifecycle.
- Free days plus one flat daily rate; no progressive bands or calendar editor.
- Port-local calendar dates with weekends and holidays included; no UTC fallback.
- Evaluation UI deferred; direct API, contract, and live Compose evidence prove calculation.
- Existing authenticated shell and `@erp/ui` only; no shared-shell, token, palette, typography, or package changes.
- Proposed routes, provider view models, reference-data seams, and concurrency/error envelopes remain for Application Design.

## Ambiguity check

No Refined Mockups decision remains ambiguous. The approved Requirements Analysis and User Stories override the stale generic-combined/progressive-band/evaluation-panel concepts in the intent statement, rough flow, and older page contract. Route spelling, identifiers, provider schemas, concurrency tokens, and exact API/error envelopes are deliberately carried to Application Design and are not silently invented here.
