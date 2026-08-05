---
name: enterprise-ui-governance
description: Enforce one coherent product design system across UI-bearing work in microservice architectures, modular frontends, isolated worktrees, AI-assisted delivery stages, and multiple repositories. Use when planning, designing, implementing, reviewing, or testing enterprise UI; deciding shared-versus-domain ownership; applying an external UI design assistant; preventing duplicated shells or local themes; or governing design-system evolution across independent teams.
---

# Enterprise UI Governance

Preserve one product experience across independently delivered domains. Treat
backend services as data and deployment boundaries, not automatic UI boundaries.

## Start with the authority map

Before changing UI, locate and read completely:

1. Repository-level agent instructions.
2. The product design-system master or equivalent source of truth.
3. Shared shell and navigation contracts.
4. Shared token and component package exports.
5. The active feature/intent requirements and acceptance criteria.
6. Relevant page or domain overrides.
7. Approved mockups and interaction specifications.

If the repository has no clear authority map, stop implementation and propose
one. Do not silently invent global tokens, shell behavior, or ownership.

State the loaded authorities and their precedence before producing design or
code. Resolve conflicts in this order unless the project declares another:

1. Approved business scope and requirements.
2. Security, accessibility, compliance, and technical standards.
3. Product-wide design-system master.
4. Approved domain/page override.
5. Approved interaction specification.
6. External design-tool recommendations.

External recommendations are advisory. Reject output that contradicts binding
product authority.

## Keep the architecture coherent

Use one product shell, one shared design authority, one token/component system,
and domain-owned page compositions. Never create one visual system or frontend
per backend microservice merely because services deploy independently.

Distinguish ownership:

- The UI platform owns shell, navigation, authentication presentation, tokens,
  primitives, shared states, accessibility behavior, and versioning.
- Domain teams own workflows, terminology, page composition, validation,
  commands, provider states, and BFF/view-model adapters.
- Backend services own facts, invariants, contracts, events, authorization
  decisions, and persistence—not typography, colors, or shell chrome.

Read [governance-model.md](references/governance-model.md) when defining team,
repository, module, or micro-frontend boundaries.

## Run the delivery workflow

1. Explore information architecture provisionally during early ideation.
2. Approve testable requirements and vertical user outcomes.
3. Generate the detailed design only after requirements are stable and before
   application architecture or construction is frozen.
4. Convert the reviewed design into binding interaction, state, responsive,
   accessibility, component-mapping, and traceability artifacts.
5. Resolve routes, view models, providers, and ownership during application
   design.
6. Implement with the shared package; use design tools only for conformance.
7. Validate against live integrated behavior, not screenshots alone.

Read [lifecycle.md](references/lifecycle.md) for stage-specific inputs, outputs,
gates, and isolated-workspace handling.

## Apply implementation constraints

- Render product pages inside the canonical shell.
- Reuse shared tokens and components before creating local ones.
- Keep shared primitives in the UI platform package and domain composition in
  the owning application.
- Forbid module-local themes, copied primitives, duplicate navigation/auth, and
  second canonical frontends.
- Preserve authorization, route, contract, and domain ownership boundaries.
- Prevent duplicate commands and retain user context on recoverable failures.
- Keep raw diagnostics secondary unless they are primary business information.

When a shared primitive is missing:

1. Explain the required behavior and why current primitives cannot satisfy it.
2. Record a platform dependency.
3. Keep affected evidence blocked.
4. Route the change to the shared UI owner.
5. Consume the released primitive; never fork the shared library locally.

## Require complete interaction evidence

Design every applicable state: loading, true empty, filtered empty, denied,
read-only, validation blocked, pending, persisted success, conflict, provider
error, partial/degraded, stale, not found, and recovery ownership.

Require responsive evidence at the project's named breakpoints, including a
small mobile viewport. Require WCAG AA contrast, persistent labels, linked
errors, visible focus, logical keyboard order, focus trap/restore, accessible
async announcements, non-color status meaning, reduced motion, and no page-level
mobile overflow.

Record conformance with:

| Surface/behavior | Requirement | Shared primitive/token | Domain composition | State coverage | Responsive evidence | Accessibility evidence | Status |
|---|---|---|---|---|---|---|---|

Use only `PASS`, `BLOCKED`, or `NOT APPLICABLE`. A design claim without observed
evidence is not a PASS.

Read [quality-gates.md](references/quality-gates.md) before approving design,
code, or release readiness.

## Handle project profiles

Use a project profile when paths, framework stages, component packages, or
breakpoints are product-specific. Load only the matching profile. For the
included worked example, read [linercore-profile.md](references/linercore-profile.md).

## Start UI work with this declaration

```text
This is a UI-bearing enterprise task. Load the product design authority, shared
shell contract, token/component source, active requirements, approved page
overrides, and interaction specifications before acting.

Preserve one product shell and one design system. The domain owns its workflow
and page composition; it does not own a local theme, duplicated shared
components, independent navigation/authentication, or one UI per backend
service.

State the authority order, owning domain, shared-component mapping, missing
platform dependencies, required states, responsive evidence, accessibility
evidence, and acceptance traceability. Treat generic design recommendations as
advisory and reject conflicts with product authority.
```

## Stop rather than improvise

Stop and request direction when binding authorities conflict, ownership is
ambiguous, a required shared primitive is unavailable, a provider contract is
unresolved, another domain or the shared platform would be modified without
approval, accessibility cannot be met, or live evidence contradicts the design.

Do not hide these conditions with local workarounds or false completion claims.
