# Security Design - U08 Quality Gates

## Security Goals

U08 enforces secure build and contract controls on self-hosted on-prem GitHub Actions runners. It prevents public-cloud required gates, unmanaged frontend package managers, prohibited libraries, domain-core impurity, unsafe contract/schema changes, and sensitive data in gate evidence.

## Runner and Toolchain Controls

Required gates run on self-hosted GitHub Actions runners in the on-prem network. Public-cloud CI runners are rejected for required gates. Backend gates use Java 21 and Maven. Frontend gates use Yarn and Turborepo with locked dependency conventions.

npm, pnpm, unexpected frontend lockfiles, unmanaged package-manager changes, and prohibited frontend libraries fail relevant gates.

## Code and Contract Controls

Domain-core purity checks fail backend domain modules that import Spring, JPA, Kafka, Jackson, Lombok, persistence adapters, or external adapter namespaces. Contract/schema gates prevent unsafe OpenAPI, message fixture, Avro, and Schema Registry compatibility changes from merging.

Seed changes fail if they introduce non-repeatable or sensitive test data.

## Evidence Security

Gate evidence avoids printing secrets, tokens, Vault values, production credentials, raw provider responses, or sensitive seed data. Required/advisory status is explicit so blocking controls are not socially bypassed. Evidence paths and logs remain suitable for AI-DLC gate review and later audit.

## Source Trace

This design implements constraints from `security-requirements.md`, `performance-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.
