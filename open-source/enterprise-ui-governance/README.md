# Enterprise UI Governance

A reusable Codex skill for keeping one coherent product experience across
microservices, modular frontends, isolated worktrees, multiple repositories,
and AI-assisted delivery workflows.

The skill prevents a common enterprise failure mode: every service or team
creating its own shell, components, colors, interaction states, and accessibility
behavior until the product feels like unrelated applications.

## What it governs

- One product shell across independently deployed domains.
- Shared-versus-domain UI ownership.
- Design-system authority and conflict resolution.
- AI design-tool use without allowing generated design drift.
- Refined design, application design, construction, and release gates.
- Responsive, accessibility, state, and traceability evidence.
- Monorepo, worktree, multi-repository, and micro-frontend boundaries.

It does not impose a particular visual style or component library. Projects
connect their own design-system master, shell, tokens, components, and page
profiles.

## Installation

### Windows PowerShell

From this repository directory:

```powershell
.\install.ps1
```

### macOS or Linux

```bash
chmod +x install.sh
./install.sh
```

The installer copies the skill to
`$CODEX_HOME/skills/enterprise-ui-governance`, falling back to the standard
`.codex/skills` directory under the user profile. It refuses to overwrite an
existing installation.

Restart Codex after installation. Then invoke:

```text
$enterprise-ui-governance
```

Example:

```text
Use $enterprise-ui-governance to review this new Booking UI and verify that it
uses the shared shell, design tokens, components, responsive rules, states, and
accessibility contract without copying platform primitives locally.
```

## Repository layout

```text
enterprise-ui-governance/
├── README.md
├── LICENSE
├── CONTRIBUTING.md
├── SECURITY.md
├── install.ps1
├── install.sh
└── skills/
    └── enterprise-ui-governance/
        ├── SKILL.md
        ├── agents/openai.yaml
        └── references/
            ├── governance-model.md
            ├── lifecycle.md
            ├── quality-gates.md
            └── linercore-profile.md
```

## Design philosophy

```text
One product
├── one shell
├── one design authority
├── one token/component system
├── domain-owned workflows and page composition
└── many independently deployed backend services
```

Backend service boundaries should not automatically become frontend boundaries.
A user workflow can consume several services and still remain one coherent page.

## Commercial and open-source use

This project is released under Apache License 2.0. You may use, modify,
redistribute, and incorporate it into commercial or open-source work under the
license terms. The license includes an explicit patent grant.

## LinerCore example

The included LinerCore profile demonstrates how to adapt the generic governance
model to a real enterprise shipping ERP with a shared authenticated shell,
Next.js domain applications, a shared `@erp/ui` package, and independently
deployed Spring services.

LinerCore-specific rules are isolated in the profile; the main skill remains
product- and framework-neutral.

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md). For security
reports, follow [SECURITY.md](SECURITY.md).
