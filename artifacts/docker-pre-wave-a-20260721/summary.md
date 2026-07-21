# Docker Pre-Wave A Cleanup And Demo Continuity

Date: 2026-07-21

## Cleanup Result

| Resource | Before | After |
|---|---:|---:|
| Image IDs | 55 | 23, all used by running containers |
| Containers | 28 total / 23 running | 23 total / 23 running |
| Build cache | 188 records / 31.97 GB | 0 |
| Volumes | 75 | 75 |

Docker reported 11.45 GB reclaimed from unused images and 31.97 GB from build
cache. Five stopped containers were removed. Docker volumes were not pruned;
5.158 GB reported as reclaimable remains preserved because it may contain
database or acceptance evidence.

The 11 running LinerCore image IDs also carry `demo-20260721` and `wave-a`
tags. These are additional references to the same layers, not duplicate image
data. Historical W1 image versions were removed.

## Continuity Proof

- Manager demo project: `linercore-shared-platform` on edge port `8088`.
- Isolated acceptance project: `linercore-wave-a` on edge port `18088`.
- Both stacks ran concurrently with separate networks, image tags, and host ports.
- While Wave A was running, the manager demo guard passed with 23 containers,
  23 services, and HTTP results `200`, `307`, `301`, `301` for health, Booking,
  Reference Data, and Charge Agreements.
- The isolated Wave A baseline passed health, Booking, Reference Data, and the
  isolated authentication redirect. Its Charge Agreements edge route remains
  intentionally absent until W2-03 delivers that vertical slice.
- The proof Wave A containers, network, and six proof-created anonymous volumes
  were removed after verification. The manager demo remained running.

Operational commands and safety rules are in `docs/demo-wave-a-runbook.md`.
