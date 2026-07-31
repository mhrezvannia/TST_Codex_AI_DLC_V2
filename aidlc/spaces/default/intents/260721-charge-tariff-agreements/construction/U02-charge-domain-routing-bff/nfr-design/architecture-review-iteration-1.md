# Architecture Review - U02 NFR Design - Iteration 1

## Verdict

**NOT-READY**

No Critical findings. Two High findings require correction.

## High findings

1. The claimed <=64 KiB processing overhead omits payload-proportional decoded
   strings, parsed object graphs, normalized objects, and serialization. Define
   an honest peak-memory budget or a genuinely incremental JSON parser.
2. The health contract lacks exact content type/envelopes and protected-route
   behavior while mandatory configuration is invalid.

## Advisories

- Give Reference selector forwarding its own exact bounds or explicitly share
  the Charge forwarder bounds.
- Use a trusted configured public-origin allowlist rather than treating a
  browser-controlled Host/forwarded header as same-origin authority.

The 20-permit Charge model, session/policy boundaries, statelessness, nginx
mount, manager isolation, W1 history, ownership, and live-proof separation are
otherwise sound.
