# Performance Design - U06 Reference Data App

## Performance Goals

U06 supports the U03 common read target of p95 <= 300 ms by using bounded BFF calls, paginated/filterable APIs, stable sorting, prior-state preservation, and non-blocking auxiliary status loads. It does not own backend query optimization or event publisher throughput.

## List and Detail Design

List requests include reference set, validated filters, search text, page cursor or page number, page size, sort, and active/inactive status. The UI keeps prior usable data visible while search, filter, page, or sort changes refresh. Empty states are rendered as empty data, not system failures.

Detail views fetch canonical record fields from `reference-data-service`, including platform id, business key, status, metadata, relationships, and sensitive-data cues. Relationship labels are loaded through APIs, not database joins or browser-side full dataset caches.

## Form and Mutation Design

Forms use reference-set metadata, React Hook Form, and Zod to validate client shape before BFF submission. Create/update/deactivate/reactivate calls go through BFF route handlers and service APIs. Success refreshes detail/list state and surfaces status/event evidence where available.

## Event Status Design

History and publication status queries are separate from canonical record reads. Pending, published, retrying, failed, stale, and unknown states render asynchronously and do not block detail display.

## Measurement

Metrics and traces cover list, detail, search/filter, form submit, deactivate/reactivate, and event-status BFF durations. Identity-service authorization latency is measured separately from reference-data-service API latency. Frontend error frequency, validation conflict frequency, and correlation ids are captured in BFF logs and user-visible support states.

## Source Trace

This design implements constraints from `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.
