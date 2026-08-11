# Escalation to W2-02: shared `PlatformShell` contract blocks W4-01 Construction

**Raised by**: W4-01 Module List-Detail Uplift
**Blocks**: U01 walking skeleton → B01 gate → B02, B03, B04 (all of W4-01 Construction)
**Status**: W4-01 Code Generation halted before any code was written
**Date raised**: 2026-08-11

---

## Summary

W4-01's approved Application Design consumes a shared `PlatformShell` and route registry owned by W2-02. That contract is not present in `packages/ui`. The exported `PlatformShell` is the earlier title-derived component that W4's design explicitly identifies as the thing to be replaced.

W4-01 cannot proceed. `unit-of-work.md` states U01 "remains `BLOCKED` on W2-02 ownership; a local compatibility shell is prohibited", and NFR-009 forbids a shell or shared-component fork. Both escape routes are closed by approved constraints, so this is a genuine dependency stop rather than a matter of sequencing.

## What exists today

`packages/ui/src/index.tsx`:

```ts
export function PlatformShell({
  title,
  children,
  journeyStage = null
}: {
  title: string;
  children: ReactNode;
  journeyStage?: 0 | 1 | 2 | 3 | null;
})
```

- The active rail is chosen by **string-matching the title**: `normalizedTitle.includes("charge")`, `…includes("reference")`, `…includes("booking")`.
- `railItems` is a **hardcoded list**, rendered unconditionally.
- The avatar is a hardcoded `"RT"`.
- `ShellRouteRegistration`, `ShellRouteRegistry`, and `visibleRoutes` do not exist anywhere in `packages/ui`.

## What the approved design requires

From `component-methods.md` § "Canonical Shell and Edge Contract":

```ts
interface PlatformShellProps {
  session: { subject: string; displayName?: string; permissions: readonly Capability[] };
  activeModule: ModuleKey;
  breadcrumbs: readonly { label: string; href?: string }[];
  routes: readonly ShellRouteRegistration[];
  children: React.ReactNode;
}

interface ShellRouteRegistry {
  visibleRoutes(capabilities: readonly Capability[]): readonly ShellRouteRegistration[];
  resolve(pathname: string): ShellRouteRegistration | null;
}
```

## Gap, by requirement

| Required | Present | Consequence of absence |
| --- | --- | --- |
| `session` with `permissions` | No | The shell cannot know who the subject is or what they may see |
| `routes` + `visibleRoutes(capabilities)` | No | **A module the subject cannot read cannot be hidden** |
| `activeModule` | No — inferred from `title` | Active state is a string-match heuristic, not a fact |
| `breadcrumbs` | No | Not expressible |

The second row is the blocking one. It is not cosmetic:

- **FR-012**: "A user without module-read capability shall not see that module in permitted shell navigation."
- **US-001**: "Enter only permitted module destinations."
- **SEC-U01-10**: a module the subject cannot read is absent from navigation; its deep link renders the shared denied state.

FR-012 and US-001 are U01's two primary stories. With a hardcoded rail, every module renders for every subject, so U01 cannot satisfy the stories it exists to prove — regardless of how its own code is written.

## Why W4-01 will not work around it

| Option | Why it is closed |
| --- | --- |
| Build against the missing API | It does not exist; the code would not run |
| Local compatibility shell in the Reference app | Prohibited by `unit-of-work.md`; indistinguishable from a fork once merged (NFR-009) |
| Extend `packages/ui` from W4 | W4 would be delivering a W2-02-owned platform contract — a scope change requiring the platform owner's agreement |
| Skip U01, build other units first | `bolt-plan.md` gates B02–B04 behind B01 approval, and the shell is a cross-unit dependency all four consume |

## What is being asked for

The `PlatformShellProps` and `ShellRouteRegistry` contract above, released from `packages/ui`, with:

1. `session` carrying subject, optional display name, and the capability list;
2. a route registry whose `visibleRoutes(capabilities)` filters the rail by capability;
3. `activeModule` supplied by the caller rather than inferred from a title;
4. `breadcrumbs` accepted and rendered;
5. the existing four consumers (`apps/shell`, Reference, Charge, and later `apps/container-movement`) able to adopt it.

## Blast radius while this is open

The shell is the largest correlated-failure surface in the intent — every canonical app renders the same package. Beyond U01 itself, it currently blocks:

| Also blocked | Why |
| --- | --- |
| Reference `basePath` migration | Part of U01's canonical-route work |
| Trusted-header policy on remaining locations | Coupled to the same route/auth rework |
| B02, B03, B04 | Gated behind B01 approval in `bolt-plan.md` |

## What W4-01 has completed while blocked

So the shell is genuinely the critical path, not a convenient explanation:

- 68 design artifacts across four units, stages 3.1–3.4, all human-approved with independent architecture review
- `apps-reference-data` container healthcheck (was absent)
- Edge trusted-header policy applied to the Reference and Charge locations
- **Four fail-open authorization paths closed in Reference Data** — including one where an explicit Identity `DENY` still granted read access — with five regression tests

## Related findings for other owners

Two defects found while blocked, both pre-dating W4-01 and outside its scope:

1. **Booking / shell read `idempotency-key` from the inbound request** (`apps/booking/lib/bookings.ts:532`, `apps/shell/lib/booking-client.ts:252`). This is why the trusted-header policy could not be applied to those locations — clearing the header would break Booking's mutation idempotency. Owner: Booking.
2. **The Reference workbench's client fetches do not reach Reference through the canonical edge.** `ReferenceDataWorkbench.tsx` issues root-absolute `fetch("/api/…")` calls; no matching Nginx location exists, so they fall through `location /` to `apps-shell`. They resolve only when the app is reached directly on its host port. Owner: Reference Data.

## Resume condition

W4-01 resumes at Code Generation (3.5) with `/aidlc --resume` once `packages/ui` exports the contract above. U01 is then built first as the walking skeleton, taken through Build and Test, and presented at the B01 gate with the manager-demo guard and both audits before B02 begins.
