# Build Instructions — W2-02 Design-System Closure

## Inputs and prerequisites

This run consumes `booking-design-system-closure/code-generation/code-generation-plan.md` and `booking-design-system-closure/code-generation/code-summary.md`. It preserves baseline `c2f13dd`, branch `intent/W2-02-design-system-closure`, the protected manager demo, and the W1 **BLOCKED/WAIVED** truth.

Prerequisites are Docker/Compose, Node/Corepack, Yarn 4.5.3, Bun, the local `linercore/w2-02-audit-tools:1` image for Windows audit execution, and a writable workspace-local Yarn cache. Non-Windows hosts may execute the detectors with host Bash. Build the audit image when absent with `docker build --file infrastructure/docker/w2-02-audit-tools.Dockerfile --tag linercore/w2-02-audit-tools:1 .`. Use:

```powershell
$env:YARN_CACHE_FOLDER="$PWD\.yarn\cache"
$env:YARN_GLOBAL_FOLDER="$PWD\.yarn\global"
corepack yarn install --immutable --mode=skip-build
```

The authenticated browser input is an ignored Playwright storage-state file containing only the documented local-profile `local.booking.user` session signed with the Wave A local session secret. It must target `http://127.0.0.1:18088`, expire after the run window, and never be committed or printed.

## Build and verification commands

Run package typechecks and lints for `@erp/ui`, `@erp/app-shell`, and `@erp/app-booking`, followed by production builds where the host permits child-process execution. Run `node --check` for the W2-02 runner/evidence modules and `corepack yarn w2-02:anti-drift`.

The live build is authoritative for the integrated UI: `corepack yarn w2-02:live-acceptance --storage-state <ignored-state.json>` invokes only `scripts/wave-a-compose.mjs` with the acceptance overlay, exact project `linercore-wave-a`, and exact edge `http://127.0.0.1:18088`. Never invoke raw unscoped Compose and never target `linercore-shared-platform` or port 8088.

## Failure handling

Host `spawn EPERM` is an environment limitation, never a PASS. Diagnose and retry a failed build/test at most twice, preserve direct output, and distinguish application failure from unavailable child-process execution. The live runner owns cleanup only after proving an empty isolated project; any failed run must retain immutable FAILED/recovery evidence and no valid COMPLETED envelope.
