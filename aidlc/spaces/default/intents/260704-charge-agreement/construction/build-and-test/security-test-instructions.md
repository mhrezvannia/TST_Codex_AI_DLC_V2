# Security Test Instructions - B01 Charge Agreement Walking Skeleton

## Source Alignment

This file consumes `code-generation-plan.md` and `code-summary.md` for U01.

## Scope

B01 exposes module metadata and a disabled workbench shell. It does not process customer agreement mutations or credentials.

## Checks

1. Module-info response must not expose secrets, connection strings, or tokens.
2. UI must show local-bypass/development status visibly.
3. Backend domain modules remain free of Spring/persistence/messaging source dependencies in this slice.
4. Later units must add authorization and validation tests before enabling write workflows.
