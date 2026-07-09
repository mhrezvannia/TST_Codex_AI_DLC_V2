# Business Logic Model - UOW-01 Local Runtime Packaging

## Context

This Functional Design consumes `unit-of-work`, `unit-of-work-story-map`, `requirements`, `components`, `component-methods`, and `services`.

## Workflow

1. Collect local environment facts: Node, Yarn, Java, Maven, Docker daemon, required ports, and required env vars.
2. Classify each fact as `ready`, `blocked`, or `warning`.
3. If prerequisites are blocked, return actionable remediation and do not claim runtime success.
4. If prerequisites are ready, validate Compose profiles and app/service build commands.
5. Emit summary for humans and later readiness automation.

## Decision Tree

```text
start
  -> check tools
  -> check ports
  -> check env
  -> docker available?
       no  -> status blocked, compose not attempted
       yes -> compose config/build path check
  -> java/maven available?
       no  -> backend gates blocked prerequisite
       yes -> backend gate eligible
```

## Outputs

- `prerequisites`: per-tool status.
- `ports`: occupied/free.
- `compose`: config/build profile status.
- `backend`: Java/Maven gate eligibility.
- `nextActions`: remediation list.

