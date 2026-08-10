# Governance Model

## Product topology

```text
Product UI authority
├── agent instructions
├── design-system master
├── shared tokens and components
├── authenticated shell
└── domain/page overrides
      ├── workflow A → services 1, 2, 4
      ├── workflow B → services 2, 5
      └── workflow C → services 3, 4, 6
```

A frontend boundary should follow a coherent user workflow or product module.
It should not mirror the backend service count. One screen may consume several
service contracts through a BFF or gateway while remaining owned by one domain.

## Team ownership

Assign a permanent UI platform owner. Do not leave master/token ownership with a
temporary delivery wave. Domain teams may request shared changes but cannot
merge local replacements.

Use this decision test:

- Used unchanged by three or more domains: shared-platform candidate.
- Contains domain terminology, rules, or provider behavior: domain composition.
- Changes authentication, navigation, shell layout, tokens, or global state
  language: shared-platform change.
- Merely similar visual structure with different business meaning: compose it
  from shared primitives; do not force a universal business component.

## Monorepo and worktrees

Keep agent instructions, design authority, shared package, and binding templates
committed at the common repository root. Use short-lived worktrees/branches for
isolation. Require every branch to synchronize the shared baseline before final
visual acceptance.

## Multiple repositories

Publish the shared UI package as a versioned internal dependency. Publish or
vendor a versioned policy profile beside it. Pin compatible versions, keep a
changelog and migration notes at the distribution level, and run compatibility
and visual gates before upgrades.

Never copy source components between repositories. A copied component is a fork
even if it began byte-identical.

## Micro-frontends

Do not introduce micro-frontends solely because the backend uses microservices.
Use them only when independent frontend deployment, ownership, operational
isolation, and runtime composition benefits outweigh version skew, duplicated
dependencies, cross-module navigation complexity, and accessibility risk.

Even with micro-frontends, the host owns shell/auth/navigation and every remote
consumes a compatible shared UI release and composition contract.
