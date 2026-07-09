# Team Practices - Shared Platform Local Functionality

## Way of Working

The team works from `main` with short-lived feature or Bolt branches and keeps the AI-DLC backlog as the delivery sequence. For this Shared Platform intent, work remains scoped to U01-U12 and does not include Charge, Booking, or Container Movement runtime implementation.

## Walking Skeleton

The first Construction Bolt should be a gated walking skeleton that proves the local runtime path across auth, reference-data BFF, backend service, persistence, outbox/status visibility, and smoke evidence. After that gate, the autonomy ladder can decide whether later Bolts continue autonomously or remain gated.

## Testing Posture

Tests are written alongside code and are expected to block merge through the quality-gate aggregator. Current evidence shows frontend, Java unit, contract catalog, seed validation, smoke, and backend Maven gates; Java/Maven/Docker blockers must be reported as prerequisite failures, not hidden as successful quality evidence.

## Deployment

Local and staging readiness use Docker Compose and GitHub Actions on self-hosted on-premises runners. Production promotion remains manually approved and is outside this Shared Platform local-functionality intent except for ensuring non-local profiles cannot enable unsafe local bypass behavior.

## Code Style

Backend code follows the Java/Spring hexagonal Maven module layout with pure `domain-core` modules and adapters at the edges. Frontend code uses TypeScript strict mode, Next.js App Router/BFF route handlers, Yarn/Turborepo workspaces, and approved `@erp/*` packages.
