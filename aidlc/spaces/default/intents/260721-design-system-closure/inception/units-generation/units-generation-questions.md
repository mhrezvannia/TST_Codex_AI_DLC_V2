# Units Generation Questions — W2-02 Design-System Closure

## Fixed Decomposition Context

The topology must consume `components.md`, `component-methods.md`, `services.md`, `component-dependency.md`, `decisions.md`, `requirements.md`, and `stories.md`. Scope documents define one non-separable vertical closure boundary: package adoption, canonical Booking behavior, demo safety, live proof, audits, and backlog truth cannot close independently.

## Q1. What Unit boundary should represent W2-02?

A. One vertical Unit of Work named `booking-design-system-closure` spanning shared foundation/enforcement, canonical Booking migration, isolated live evidence, and audited closure (recommended)
B. Four independently closable horizontal Units for package, Booking UI, evidence, and audits
C. One Unit per shared primitive
D. One Unit per backend service even though services are unchanged
X. Other (please specify)

[Answer]: A — One vertical Unit (Recommended) — 2026-07-21T14:36:46Z — **Mode:** guided

## Q2. How should internal granularity be expressed?

A. Keep one coarse acceptance Unit and document internal work areas/checkpoints without treating them as separately deployable or closable Units (recommended)
B. Promote every internal checkpoint to a separate Unit
C. Omit internal boundaries and ownership entirely
D. Split by repository folder regardless of outcome
X. Other (please specify)

[Answer]: A — Internal checkpoints (Recommended) — 2026-07-21T14:36:46Z — **Mode:** guided

## Q3. What dependency topology should Units Generation record?

A. Record a one-node acyclic DAG with no external Unit dependency; describe internal prerequisite relationships only as implementation notes, leaving economic sequencing to Delivery Planning (recommended)
B. Invent Unit dependencies on W0/W1/W2-01 already merged work
C. Record a cyclic dependency between UI and evidence
D. Choose a recommended implementation order in this stage
X. Other (please specify)

[Answer]: A — One-node DAG (Recommended) — 2026-07-21T14:36:46Z — **Mode:** guided

## Q4. What deployment model applies to the Unit?

A. Embedded changes to existing workspace packages/apps plus a root local acceptance harness; no independently deployed service, database, AWS stack, or production environment (recommended)
B. A new independently deployed Booking UI service
C. A new AWS acceptance stack
D. A standalone `packages/ui` deployment
X. Other (please specify)

[Answer]: A — Embedded + local proof (Recommended) — 2026-07-21T14:37:36Z — **Mode:** guided
