# External Dependency Map — W2-02 Design-System Closure

## Planning Basis

Dependencies are derived from `requirements.md`, `stories.md`, `mockups.md`, `components.md`, `unit-of-work.md`, `unit-of-work-dependency.md`, `unit-of-work-story-map.md`, and `team-practices.md`. The single Bolt is `booking-design-system-closure`; it does not depend on another delivery Bolt or external team.

## Dependency Map

| Dependency | Type and owner | Needed by | Expected lead time | Failure handling |
|---|---|---|---|---|
| Bun, Node.js, Yarn, repository scripts | Local toolchain; local environment | All checkpoints | Immediate/preflight | Preserve doctor/command failure; do not weaken or bypass the gate. |
| Docker Engine and Compose support | Local runtime; local environment | Live walking skeleton and UI matrix | Immediate/preflight | Record unavailable runtime and keep acceptance pending; do not use another Compose project. |
| `scripts/wave-a-compose.mjs` | Repository-owned wrapper | Start/status/log/cleanup of acceptance stack | Existing | Use it exclusively; a wrapper defect may receive only a traced in-scope correction. |
| Compose project `linercore-wave-a` and its existing images/services | Isolated local acceptance runtime; repository/service owners | BFF/backend happy path and controlled states | Image build/start time | Capture build/start failures; no substitution with `linercore-shared-platform`. |
| Existing shell, Keycloak/auth, Booking BFF, Booking service, reference/pricing, databases, and messaging dependencies | Existing application runtime | Authenticated create-to-confirm journey | Stack startup and health time | Preserve contracts and diagnose the failing dependency; do not invent an auth bypass or detached frontend. |
| Deterministic acceptance identity and existing test/reference data | Local acceptance data; existing stack | Happy path and state setup | Seed/health time | Document seed/setup; retain failure if valid workflow data cannot be produced. |
| Playwright runtime and compatible browser | Local test toolchain | Browser journey, viewports, themes, state matrix | Install/browser launch time | Record the missing browser/tool failure; do not replace UI proof with source inspection. |
| Ports and local routes assigned by the Wave A wrapper | Local environment | Canonical shell/BFF access | Immediate | Detect conflicts before action; resolve only within isolated Wave A scope. Never take over port 8088. |
| `aidlc-audit` and `erp-fidelity-audit` commands | Repository audit tooling | Terminal closure checkpoint | Command runtime | Capture unmasked exit status; any unavailable or failed audit keeps the Bolt open. |
| User human gates | Decision authority | Stage, phase, and final closure approval | User response time | Pause at the gate when required; never infer approval or scope expansion. |

## Protected Constraint: Manager Demo

`http://127.0.0.1:8088` and Compose project `linercore-shared-platform` are protected external state, not acceptance dependencies. The Bolt may observe them only through `npm run demo:guard`; it must not stop, reconfigure, rebuild, or target that project. Green pre- and post-guards are required evidence, while any failure keeps W2-02 pending.

## Exclusions and Escalation

- No AWS account, production environment, deployment approval, procurement, or external team capacity is required or claimed.
- Existing services are runtime dependencies, not newly allocated teams or separately closable work.
- A missing local prerequisite may block live proof but never authorizes a different stack, mocked acceptance host, or fabricated PASS.
- Any dependency failure is recorded against this same Bolt and escalated to the user only when local in-scope recovery is exhausted or new authority is required.

