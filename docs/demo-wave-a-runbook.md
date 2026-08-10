# Demo Continuity During Wave A

## Runtime Separation

The manager demo and Wave A acceptance use different Docker identities:

| Runtime | Compose project | Network | Image tag | Edge URL |
|---|---|---|---|---|
| Manager demo | `linercore-shared-platform` | `linercore-local` | `demo-20260721` lock | `http://127.0.0.1:8088` |
| Wave A acceptance | `linercore-wave-a` | `linercore-wave-a-network` | `wave-a` | `http://127.0.0.1:18088` |

Wave A worktrees must use `node scripts/wave-a-compose.mjs`. Never run an
unscoped `docker compose down`, because the default project is the live demo.
Only one Wave A live-acceptance run should use the isolated stack at a time;
implementation and test work can remain parallel in separate worktrees.

## Commands

Verify the manager demo before and after every live acceptance:

```powershell
npm run demo:guard
```

Inspect and start the isolated Wave A stack from the active intent worktree:

```powershell
npm run wave-a:config
npm run wave-a:ps
npm run wave-a:up
```

Build only the services changed by the active intent, then recreate them without
touching the manager demo:

```powershell
node scripts/wave-a-compose.mjs build <service...>
node scripts/wave-a-compose.mjs up -d --no-build <service...>
```

Remove the isolated stack and its disposable volumes when acceptance is complete:

```powershell
npm run wave-a:clean
```

## Image Lock

The demo image lock uses additional tags that reference the already-running
image IDs and therefore consumes no duplicate layer space. Recreate the lock
after an intentional image prune with:

```powershell
npm run demo:lock
```

Seed the initial Wave A tags from the currently running demo only before Wave A
starts, never after an intent has built a newer `wave-a` image:

```powershell
npm run demo:seed-wave-a
```

Do not prune Docker volumes as part of routine cleanup. Volumes may contain
database or acceptance evidence even when Docker reports them as unused.
