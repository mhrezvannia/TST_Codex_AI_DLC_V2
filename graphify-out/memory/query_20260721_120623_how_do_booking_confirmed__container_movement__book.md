---
type: "query"
date: "2026-07-21T12:06:23.498065+00:00"
question: "How do booking.confirmed, container movement, Booking consumption, timeline UI, and acceptance evidence connect in W2-04 and the current codebase?"
contributor: "graphify"
outcome: "useful"
source_nodes: ["Async Event Contract — `booking.confirmed`", "ContainerJourney", "MovementTimeline"]
---

# Q: How do booking.confirmed, container movement, Booking consumption, timeline UI, and acceptance evidence connect in W2-04 and the current codebase?

## Answer

Expanded from original query via graph vocab: [booking, confirmed, container, movement, journey, timeline, status, event, publish, consumer, compose, acceptance, duplicate, sequence]. The baseline Kafka booking-confirmed listener maps the broker record into ContainerMovementApplicationService.consumeBookingConfirmed; that method authorizes, deduplicates, validates route locations, creates or reconciles ContainerJourney, persists it, and enqueues a status event. BookingApplicationService.consumeMovementStatus validates container assignment, deduplicates by event id, and projects applied versus stale sequence disposition. W2-04 must extend this real seam with DCSA-coded expected and actual moves, lifecycle sequencing, Container Movement list/detail timeline UI, and isolated live broker-to-database-to-Booking proof.

## Outcome

- Signal: useful

## Source Nodes

- Async Event Contract — `booking.confirmed`
- ContainerJourney
- MovementTimeline