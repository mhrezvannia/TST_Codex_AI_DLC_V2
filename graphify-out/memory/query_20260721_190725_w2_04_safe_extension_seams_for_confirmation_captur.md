---
type: "query"
date: "2026-07-21T19:07:25.394083+00:00"
question: "W2-04 safe extension seams for confirmation capture outbox Booking Identity and UI"
contributor: "graphify"
outcome: "useful"
source_nodes: ["MovementTimeline", "Booking"]
---

# Q: W2-04 safe extension seams for confirmation capture outbox Booking Identity and UI

## Answer

Expanded from original query via graph vocabulary: booking, confirmed, container, journey, movement, status, capture, outbox, publish, kafka, identity, permission. The graph identified MovementTimeline, Booking, confirmation contract, CMM application and outbox, and Identity catalog concepts. Exact codebase-memory verification established the safe seams: Kafka booking listener to CMM intake; capture to ContainerJourney and status mapper; Booking status listener to projection repository; Identity PermissionAction and catalog; and a missing CMM app behind the shared shell. Use additive evolution at these ports, not a replacement service or synchronous shortcut.

## Outcome

- Signal: useful

## Source Nodes

- MovementTimeline
- Booking