# Discovered Rules - Shared Platform

## Mandated

ALWAYS use trunk-based development on `main` with short-lived feature or Bolt branches.
ALWAYS squash-merge each completed Bolt branch into `main`.
ALWAYS run a gated walking-skeleton Bolt first for this greenfield MVP before asking the autonomy ladder prompt.
ALWAYS write tests alongside code and enforce CI-blocking quality gates before merge.
ALWAYS target at least 85% line coverage for both Shared Platform backend services.
ALWAYS follow Enterprise Technical Environment v1.1 and project configuration for backend, frontend, pipeline, and infrastructure standards.
ALWAYS deploy merges to staging through GitHub Actions on self-hosted on-premises runners.
ALWAYS require separate manual approval before production promotion.

## Forbidden

NEVER use long-lived release branches by environment for this workflow.
NEVER skip the walking-skeleton ceremony for this greenfield MVP.
NEVER treat Charge, Booking, or Container Movement runtime work as part of this Shared Platform workflow.
NEVER introduce backend domain-core dependencies on frameworks or non-Java JVM languages.
NEVER use prohibited frontend libraries or package managers outside the Enterprise Technical Environment v1.1 frontend standard.