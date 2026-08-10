# Team Practices

Evidence sources: code-structure.md, technology-stack.md, dependencies.md, code-quality-assessment.md, architecture.md, and business-overview.md.

## Way of Working

The team delivers vertical intents on short-lived intent branches from the protected program integration baseline, with one driver accountable end to end and contributors working through owned seams. Final integration mode is an explicit program-owner decision; local history is evidence, not permission to overwrite the current merge protocol.

## Walking Skeleton

For closure work, the skeleton is the smallest canonical live journey that proves the existing architecture and the unresolved Definition-of-Done gap together. W2-02 therefore proves authenticated /booking through the shared shell, Booking BFF/backend, shared UI states, and isolated live evidence before closure.

## Testing Posture

Tests are written alongside focused changes, and defects are reproduced with a failing test before repair when practical. Unit, component, contract, type, lint, and build checks are necessary but insufficient; the integrated live journey, UI matrix, demo safety, and audits remain hard gates, with no invented percentage target.

## Deployment

This closure deploys only to the isolated local linercore-wave-a acceptance stack through the approved wrapper, with demo guards before and after. Production promotion is outside this intent, and no external pipeline, environment, or rollback capability is assumed without evidence.

## Code Style

Frontend work uses strict TypeScript/Next.js workspace boundaries and @erp/ui tokens/primitives for applicable presentation; native semantic elements are allowed only as documented, tested exceptions. Module-local theme systems and duplicate shell/navigation are not acceptable, while backend and BFF behavior preserve existing Java/Spring and service ownership boundaries.
