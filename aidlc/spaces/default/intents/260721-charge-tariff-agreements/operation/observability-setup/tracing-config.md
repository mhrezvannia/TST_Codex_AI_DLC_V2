# W2-03 Distributed Tracing Configuration

## Status and upstream basis

Status: **CONFIGURATION SPECIFIED; NOT ENABLED OR OBSERVED**.

This design consolidates `performance-design`, `security-design`,
`reliability-design`, `monitoring-design`, and `infrastructure-services`.
It uses the selected existing OpenTelemetry/Jaeger seam rather than AWS X-Ray.
Deployment Execution stopped before mutation, so no exporter, collector,
instrumentation completeness, or retained trace is claimed.

## Propagation contract

- Propagate W3C `traceparent` and `tracestate` across edge, BFF, Booking,
  Charge, Identity, Reference Data, and supported database/client boundaries.
- Create or replace the application correlation ID at the trusted edge using
  the approved safe grammar. Correlation is diagnostic, never authorization.
- A browser-supplied actor, role, capability, caller identity, host, key, or
  pricing date cannot become authority through trace context.
- Trace/export failure must not change pricing, Booking, persistence, or
  authorization outcomes.
- Missing, duplicate, clock-incompatible, or correlation-mismatched
  parent/child spans invalidate latency decomposition evidence.

## Required span topology

Required logical path:

```text
edge/nginx
  -> charge-bff
  -> booking-service
  -> charge-agreement-service
     -> authorization
     -> reference-data
     -> agreement-selection or tariff-selection
     -> pricing-terminal-transaction
  -> booking-completion-transaction
  -> response
```

Administrative paths replace pricing spans with Rate or Agreement command,
lock, transaction, activity, and outbox/relay spans. Manual fallback includes
candidate selection, terminal receipt, manual-case commit, and safe response
spans.

## Span names

| Span | Kind | Required outcome |
|---|---|---|
| `edge.request` | SERVER | bounded route/status |
| `bff.route` | INTERNAL | policy, admission, forward/deny |
| `booking.price` / `booking.reprice` | SERVER | claim, replay, completion, manual |
| `charge.price` | SERVER | Agreement, Tariff, no-rate, ambiguity, typed failure |
| `charge.authorize` | CLIENT | allow/deny/unavailable |
| `charge.reference.validate` | CLIENT | valid/invalid/unavailable |
| `charge.agreement.select` | INTERNAL | selected/none/ambiguous |
| `charge.tariff.select` | INTERNAL | selected/none/ambiguous |
| `charge.terminal.commit` | INTERNAL | priced/manual/replay/conflict |
| `booking.snapshot.commit` | INTERNAL | stored/replay/fence/conflict |
| `db.query` / `db.transaction` | CLIENT | success/typed failure |
| `outbox.publish` | PRODUCER | published/retryable/permanent |

## Attribute policy

Allowed indexed attributes:

- `service.name`
- `deployment.environment=local-acceptance`
- `linercore.journey`
- `linercore.operation`
- `linercore.outcome`
- `linercore.basis`
- `linercore.reason_class`
- `http.request.method`
- bounded route template and status code
- `db.system=postgresql` and bounded operation class

Diagnostic-only attributes may contain a redacted correlation value and safe
stable/version identifier only where the source `security-design` permits it.

Forbidden attributes and events include headers, cookies, session/service
tokens, credentials, request/response bodies, canonical price payloads,
amounts/currencies, customer/party/reference details, request hashes, owner
tokens, SQL text/parameters, stack traces at the HTTP boundary, internal URLs,
and browser storage.

## Sampling

Isolated acceptance:

- head sample 100% of required scenarios;
- retain only traces named by the U06 manifest and passing redaction;
- record explicit `trace_missing`, `trace_unsafe`, or
  `trace_linkage_invalid` states rather than silently reducing coverage.

Production sampling is unapproved. A future policy must be based on volume,
cost, privacy, and diagnostic requirements and must preserve complete error and
high-latency tail capture without inventing a current rate.

## Export and retention

- Export only when the observability profile is enabled.
- Use bounded, non-blocking batching; exporter saturation or failure is
  observable but non-authoritative to business transactions.
- Send to the existing local OpenTelemetry collector/Jaeger endpoint through
  fixed environment configuration; invalid non-local configuration leaves the
  component unready where tracing is declared mandatory.
- Write raw Playwright/trace archives only to an access-restricted temporary
  location.
- Scan the archive itself and expanded content before retention. Unsafe or
  unparseable content is discarded and the evidence cell is `BLOCKED`.
- Caps: 2,048 retained trace entries, 64 MiB compressed, 256 MiB expanded,
  32 MiB per entry, maximum 20:1 expansion ratio, and 512 MiB raw temporary
  trace space.

## Latency evidence

BFF overhead is computed from correlation-linked parent and child spans on the
same isolated host:

```text
bff_overhead_ms = bff_parent_elapsed_ms - linked_backend_child_elapsed_ms
```

The delta must be non-negative and backed by raw monotonic edge timing.
Distributed spans are diagnostic; direct command-to-response samples remain
authoritative for the p95/p99 acceptance objectives.

## Verification plan

1. Prove propagation through edge, BFF, Booking, Charge, dependencies, and
   database spans for every required journey.
2. Confirm span names, bounded attributes, parentage, time domains, and
   correlation linkage.
3. Inject exporter unavailable/saturated conditions and prove business
   behavior is unchanged.
4. Run archive and expanded-content redaction scans.
5. Recompute BFF overhead and compare it to direct monotonic measurements.

Current result: **NOT RUN - NO DEPLOYED CANDIDATE**.

