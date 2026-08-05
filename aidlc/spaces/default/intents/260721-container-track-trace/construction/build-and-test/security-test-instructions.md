# Security Test Instructions

## Threat and requirement coverage

The U01/U02/U03 `code-generation-plan.md`, `code-summary.md`, and security
designs require fail-closed identity checks, protected-lookup ordering,
independent POST authorization, bounded inputs, parameterized persistence,
typed/redacted errors, and durable correlated audit evidence.

Exercise malformed DCSA codes, container/location/time identifiers, replay and
same-occurrence abuse, wrong-next moves, authorization DENY/unavailability,
Reference Data degradation, and response/audit redaction. Verify the UI hint
never authorizes a POST.

## Commands

1. Backend/controller security regressions:
   `mvn -f services/container-movement-service/pom.xml clean test -DskipITs`
2. Source lint/type checks:
   `npm run lint -- --filter=@erp/app-booking --cache-dir .turbo-cache`
   and `npm run typecheck -- --filter=@erp/app-booking --cache-dir .turbo-cache`
3. Dependency advisory scan for this Yarn repository:
   `yarn npm audit --all --severity high`
4. Live DAST-style negative requests only after `npm run demo:guard` and the
   isolated stack are green.

## Pass criteria and limitations

No protected record is read before fresh authorization; denied/outage paths
produce the specified safe envelope and write set; no token, provider URL, raw
payload, stack trace, or SQL detail leaks. A network timeout in advisory
lookup or Docker spawn restriction is BLOCKED evidence, not a clean scan.
