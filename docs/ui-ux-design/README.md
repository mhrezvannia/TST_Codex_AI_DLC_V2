# LinerCore UI/UX Design Outputs

This directory stores reviewed outputs produced from
`docs/ui-ux-prompts/`. A file being present does not by itself make it binding:
the active intent must review it and convert it into AI-DLC Refined Mockups
artifacts using `docs/ui-ux-prompts/REFINED-MOCKUP-HANDOFF.md`.

## Imported legacy outputs

- `03-09-auth-shell-inception-design.md`
- `10-booking-operations-queue.md`
- `11-new-booking.md`
- `12-booking-operational-record.md`
- `13-booking-failure-recovery.md`

These were copied unchanged from `D:/TST_Codex_integ/docs/ui-ux-design/` and
must be checked against the current LinerCore master and active intent before
reuse.

The shared design authority remains:

- `design-system/linercore/MASTER.md`
- `design-system/linercore/SESSION-PROMPT.md`
- page contracts under `design-system/linercore/pages/`

The canonical W2-02 Booking Refined Mockups also remain under:

`aidlc/spaces/default/intents/260721-design-system-closure/inception/refined-mockups/`

## Remaining outputs to generate

Run prompts `18-24` at each intent's Refined Mockups stage and save the reviewed
results here using the same basename. Do not pre-generate all seven designs
before their requirements and user stories exist; doing so would turn unknown
business decisions into accidental UI requirements.
