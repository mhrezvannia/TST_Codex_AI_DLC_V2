# Reliability Design - U05 Route Compatibility and Preservation

## Source Context

This design consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`. U05 reliability means old Booking links consistently land in canonical shell routes while prior merged work remains intact or explicitly justified.

## Resilience Patterns

| Condition | Design | Requirement coverage |
| --- | --- | --- |
| `/bookings` opened | Shell-owned Next.js redirect lands consistently at `/booking`. | REL-01 |
| `/bookings/new` opened | Shell-owned Next.js redirect lands consistently at `/booking/new`; this route takes precedence over dynamic id matching. | REL-01 |
| `/bookings/[id]` opened | Shell-owned Next.js redirect lands consistently at `/booking/[id]`, preserving one safe id segment. | REL-01, REL-02 |
| Safe query parameters present | Preserve only allowlisted parameters: `page`, `pageSize`, `sort`, `direction`, `status`, `q` for list; no query parameters for create or detail in W2-01. | REL-02 |
| Unknown or malformed input | Drop unknown query parameters; malformed ids, invalid percent encoding in ids, empty ids, extra segments, path traversal, and encoded slash return shell 404 before redirect or backend call. | REL-01, REL-02 |
| Encoded value handling | Decode allowlisted list query values once and re-encode through the redirect URL builder; drop query parameters with invalid percent encoding and later duplicate keys. Decode valid detail ids once and re-encode with `encodeURIComponent`. | REL-01, REL-02 |
| Prior-work file touched | Record W2-01 reason and targeted verification. | REL-04 |
| Runtime startup blocker | Record W2-01 blocker with dependency and observed failure; do not claim PASS from tests. | REL-05 |

## Retry and Fallback Policy

- Broken compatibility mapping blocks U05 until fixed.
- Missing Booking detail data is treated as a data/setup issue, not route success.
- Prior-work regression blocks U05 unless explicitly justified and verified.
- No fallback to standalone Booking outside shell, `local-user`, or fake empty result.

## Health and Evidence Design

U05 evidence distinguishes:

- Legacy source route.
- Canonical target route.
- Redirect status.
- Preserved id/query where safe, including deterministic decode/re-encode behavior and dropped create/detail query parameters.
- Route precedence and edge-case result for `/bookings/new`, trailing slashes, shell 404 malformed ids, encoded path/query values, invalid percent encoding, duplicate keys, and unknown query parameters.
- Auth/session/actor behavior after canonical resolution.
- No backend call before redirect.
- No `local-user` request after canonical resolution.
- Preservation diff result for W0-01, W0-02, W1-01, and W2-02.
- Targeted verification for every justified touch.

## Preservation Reliability

Preservation proof must be deterministic: record touched path, prior-work category, W2-01 reason, and targeted verification outcome. If no prior-work files are touched, evidence records that absence instead of running broad unrelated checks as proof. PASS for each legacy route requires canonical target, auth/session/actor preservation, no `local-user`, no backend call before redirect, and scoped preservation evidence.

## Operational Notes

Keep W1's live-proof waiver explicit as BLOCKED at `compose-start`; U05 must not rewrite compatibility or preservation evidence into a real W1 PASS. U05 reliability work must also preserve W0-01 platform/eventing, W0-02 reference-data, W1-01 Booking, and W2-02 design-system foundation boundaries rather than modifying prior merged work to make route compatibility easier.
