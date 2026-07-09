# Team Practices - Charge & Customer Agreement

## Way of Working

The team works from `main` with short-lived feature or Bolt branches and uses the AI-DLC backlog as the delivery sequence. For this Charge & Customer Agreement intent, work starts after Shared Platform and remains scoped to the commercial agreement module until active-agreement lookup is ready for Booking.

## Walking Skeleton

The first Construction Bolt should be a gated walking skeleton that proves the new backend service, new UI route/app, local host-runtime health, and one minimal agreement flow. After that gate, the autonomy ladder can decide whether remaining Bolts continue autonomously or stay gated.

## Testing Posture

Tests are written alongside code and block completion evidence. Charge Agreement must add backend domain/application tests, frontend workflow tests, contract verification for any new OpenAPI surface, and local smoke/readiness checks once runnable endpoints exist.

## Deployment

Local implementation proceeds in host-runtime mode because it is currently healthy. Docker Compose remains the target full-stack environment and must be recovered before claiming full Compose parity; production promotion remains manually approved and out of this module's first completion.

## Code Style

Backend code follows the Java/Spring hexagonal Maven module layout with pure `domain-core` modules and adapters at the edges. Frontend code uses TypeScript strict mode, Next.js App Router/BFF route handlers, Yarn/Turborepo workspaces, and existing `@erp/*` shared packages.
