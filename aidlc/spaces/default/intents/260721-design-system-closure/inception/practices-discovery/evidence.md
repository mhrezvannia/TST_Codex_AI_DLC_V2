# Practices Discovery Evidence

Inputs reviewed: code-structure.md, technology-stack.md, dependencies.md, code-quality-assessment.md, architecture.md, and business-overview.md.

## Pipeline and Deployment Agent

Scanned git history/branches, quality-gates.yml, runtime scripts, compose.yaml, wave-a wrapper/environment, and demo guard. Inferred a short-lived intent flow on integ/main-reconciled and three distinct local runtime contexts; could not infer production deployment cadence, external environments, or a universal merge mode.

## Quality Agent

Scanned Vitest/Testing Library, Maven/JUnit, Node script tests, CI commands, Turbo outputs, and recent test commits. Inferred mixed tests-adjacent practice with blocking required commands but no coverage threshold; confirmed the missing W2-02 browser apex and audit pipefail risk.

## Developer Agent

Scanned representative TypeScript/React and Java boundaries plus shared code-KB structure. Inferred PascalCase/camelCase, strict package boundaries, adjacent tests, structured boundary errors, and layered Java services; confirmed Booking local-theme/raw-control drift and undeclared @erp/auth.

## DevSecOps Agent

Scanned ESLint, task wiring, CI and prior security requirements. Confirmed runnable lint/type/test controls but no executable proof of formatter, SAST, DAST, secrets, dependency/license, container, SBOM, provenance, signing, or severity-waiver policy.

## Human Judgement Asked

The interview resolved way of working, walking-skeleton stance, testing posture, deployment meaning, and code-style boundaries. It deliberately left external production/security controls unclaimed because they are outside W2-02 and unsupported by executable evidence.
