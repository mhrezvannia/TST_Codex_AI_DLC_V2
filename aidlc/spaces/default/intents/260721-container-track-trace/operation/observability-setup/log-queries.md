# W2-04 Operational Log Queries

## Status and Upstream Trace

The query contract preserves the bounded timings in `performance-design`, the
redaction rules in `security-design`, the retry/fence semantics in
`reliability-design`, the correlated fields from `monitoring-design`, and the
service ownership in `infrastructure-services`.

**Status: QUERY DESIGNS ONLY.** Elasticsearch and Kibana were stopped, no log
shipper configuration was found, and sampled Booking/CMM container logs had
zero structured-JSON lines and no correlation or trace field mentions.

## Required Structured Event Shape

Every operational event must include:

`@timestamp`, `level`, `service`, `environment`, `operation`,
`correlationId`, `result`, and optional safe `errorCode`.

Event, request, journey, booking, and container identifiers may be included
when operationally necessary and access-controlled. Tokens, credentials,
cookies, provider URLs containing credentials, raw payloads, stack traces in
user/evidence output, and protected subject claims are prohibited.

## Saved Query Specifications

The examples use Kibana Query Language plus aggregations; field names are the
required contract.

### Correlated journey path

```text
correlationId: "<id>" and
service: ("booking-service" or "container-movement-service")
```

Sort ascending by `@timestamp`; display operation, result, safe error code,
event ID, outbox state, receipt disposition, partition, and offset.

### Typed conflict outcomes

```text
service: "container-movement-service" and
errorCode: ("CMM_DUPLICATE_MOVEMENT" or "CMM_OUT_OF_SEQUENCE")
```

Aggregate by error code and operation. Confirm no accepted-state mutation using
the evidence manifest; logs alone are not database proof.

### Outbox retry and permanent failure

```text
service: "container-movement-service" and
operation: "outbox-publication" and
result: ("RETRYABLE" or "FAILED_PERMANENT")
```

Display event ID, attempt time, next-at time, worker/token/version fence,
correlation, and safe reason. Do not display the event payload.

### Booking receipt and duplicate evidence

```text
service: "booking-service" and
operation: ("movement-receipt" or "duplicate-delivery") and
result: ("PROCESSING" or "RETRYABLE" or "APPLIED" or "STALE" or "REJECTED")
```

Verify duplicate evidence is separate from the immutable original receipt.

### Dependency degradation

```text
service: "container-movement-service" and
dependency: ("identity" or "reference-data") and
result: ("TIMEOUT" or "UNAVAILABLE" or "DENIED")
```

Display correlation, operation, safe code, latency, freshness, and
capture-enabled state.

### Authorization write-set regression

```text
operation: "authorization-decision" and
result: ("DENY" or "DEPENDENCY_UNAVAILABLE")
```

Join only through the run-scoped evidence manifest to assert one denial audit
for real DENY and zero prohibited business rows.

### Sensitive-field detector

Run a controlled detector for forbidden field names and credential patterns;
the detector reports count and document identity only. It must never echo the
matched secret value into CI logs or evidence.

## Retention and Access

No production log retention duration is approved. Local Docker rotation is
inconsistently configured, and no central aggregation retention was observed.
Acceptance evidence must follow the intent's version-controlled/audit policy
with secrets removed. A later non-local policy must define owner, access
roles, retention, deletion, integrity protection, and cost before activation.

