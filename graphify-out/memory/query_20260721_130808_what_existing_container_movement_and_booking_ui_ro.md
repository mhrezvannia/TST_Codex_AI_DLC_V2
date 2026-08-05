---
type: "query"
date: "2026-07-21T13:08:08.161769+00:00"
question: "What existing Container Movement and Booking UI routes, timeline patterns, shared shell components, and user flow should rough mockups preserve?"
contributor: "graphify"
outcome: "useful"
source_nodes: ["MovementTimeline", "Booking"]
---

# Q: What existing Container Movement and Booking UI routes, timeline patterns, shared shell components, and user flow should rough mockups preserve?

## Answer

Expanded from original query via vocab: [container, movement, booking, timeline, route, shell, expected, actual, validation, duplicate, accessibility, responsive]. The graph identifies MovementTimeline in the enterprise refined interaction specification as the preferred timeline concept; codebase-memory confirms real CMM journey/list/detail/capture API routes and Booking JourneyStatusPanel, while no apps/container-movement UI is currently indexed. Rough mockups should therefore compose a new Container Movement-owned list/detail/timeline inside the existing shell, preserve expected-versus-actual and duplicate/out-of-sequence semantics, and link Booking without redesigning shared UI.

## Outcome

- Signal: useful

## Source Nodes

- MovementTimeline
- Booking