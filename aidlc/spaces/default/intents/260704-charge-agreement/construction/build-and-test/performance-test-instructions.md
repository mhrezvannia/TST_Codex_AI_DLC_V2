# Performance Test Instructions - B01 Charge Agreement Walking Skeleton

## Source Alignment

This file consumes `code-generation-plan.md` and `code-summary.md` for U01.

## Scope

B01 has no persistence or high-volume API workload. Performance validation is limited to startup/build success and bounded health/module-info response expectations.

## Checks

1. Backend health and module-info should respond locally under 200 ms after startup.
2. UI build should complete successfully without blocking on backend availability.
3. Future performance tests for list/search and active lookup belong to U05/U08.
