# Build and Test Questions

## Q1. Protected manager Keycloak recovery

Docker access is restored and stable, but `npm run demo:guard` reports the protected manager demo's existing `keycloak` service as missing. The existing container `linercore-shared-platform-keycloak-1` is stopped after a prior H2 database startup failure. May the workflow start this exact existing container without recreating or reconfiguring the protected Compose project?

A. Start the existing container
B. Leave the protected manager unchanged and stop live acceptance
X. Other (please specify)

[Answer]: A. Start the existing container

## Q2. Learning to retain

The deterministic learnings tool surfaced no installable candidates for this stage. Is there anything you want the workflow to remember for future Build and Test runs?

A. No additions
B. Add a learning (describe it in Other)
X. Other (please specify)

[Answer]: A. No additions

## Q5. Protected manager full recreation after Docker data reset

Docker Desktop recovered with a newly created empty data disk: the prior protected manager images, containers, volumes, and demo data no longer exist. May the workflow recreate the repository-defined `linercore-shared-platform` Compose stack from scratch, including pulling/building images, creating fresh volumes, importing/seeding demo data, and re-establishing `npm run demo:guard` before any sequence-19 Wave A work? This cannot recover the old Docker volumes; it creates a fresh replacement manager environment.

A. Recreate the protected manager stack
B. Leave Docker empty and keep Build and Test blocked
X. Other (please specify)

[Answer]: A. Recreate the protected manager stack

## Q3. Protected manager restart recovery

Docker Desktop is responsive after restart, and the isolated `linercore-wave-a` project has no containers. All 23 long-running existing `linercore-shared-platform` manager containers are stopped with exit code 255; the one-shot `seed-loader` remains correctly exited with code 0. May the workflow start only those exact 23 existing long-running containers, without Compose recreation, image changes, or configuration changes, so `npm run demo:guard` can be re-established?

A. Start the exact existing 23 containers
B. Leave the protected manager stopped and keep live acceptance blocked
X. Other (please specify)

[Answer]: A. Start the exact existing 23 containers

## Q4. Revision-cycle learning to retain

The deterministic learnings tool surfaced no installable candidates after revision cycle 3. Is there anything you want the workflow to remember from the Docker recovery and sequence-17/18 outcomes?

A. No additions
B. Add a learning (describe it in Other)
X. Other (please specify)

[Answer]: A. No additions
