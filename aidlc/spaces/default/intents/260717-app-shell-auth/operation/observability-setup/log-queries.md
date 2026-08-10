# Log Queries - W2-01 App Shell and Auth

## Upstream Inputs

These log queries consume `performance-design`, `security-design`, `reliability-design`, `monitoring-design`, and `infrastructure-services`.

## Query Catalog

### Shell And Edge Errors

```sql
service in ("nginx", "apps-shell")
| filter route like "/booking" or route like "/bookings" or route = "/"
| stats count() by status, route, bin(5m)
```

### Missing Or Unsafe Actor

```sql
service in ("apps-booking", "booking-service")
| filter actorSubjectId is null or actorSubjectId = "" or actorSubjectId = "local-user"
| fields timestamp, service, route, correlationId, actorSubjectId
```

### Authorization Deny/Error

```sql
service in ("booking-service", "identity-service")
| filter action = "authorize" and (decision = "deny" or status >= 500 or outcome = "timeout")
| stats count() by decision, status, resource, action, bin(5m)
```

### Sign-Out And Stale Call

```sql
service in ("apps-shell", "apps-auth", "apps-booking")
| filter route like "sign-out" or code in ("AUTH_REQUIRED", "BOOKING_ACTOR_REQUIRED")
| fields timestamp, service, route, status, code, correlationId
```

## Retention

Local proof logs are retained through evidence artifacts. Future production retention must follow project compliance policy and must not store raw cookies, tokens, passwords, service tokens, or secrets.

## Runtime Verification

Elasticsearch 8.16.1 reports a green one-node cluster and Kibana 8.16.1 reports available. No shipper, W2 index, lifecycle policy, or saved query was found, so the query catalog is not claimed deployed. Local evidence remains the authoritative log source until structured application logs are shipped and retention is approved.
