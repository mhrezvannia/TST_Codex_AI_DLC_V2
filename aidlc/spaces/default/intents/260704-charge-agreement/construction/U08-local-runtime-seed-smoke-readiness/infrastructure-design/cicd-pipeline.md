# CI/CD Pipeline - U08

## Source Alignment

Consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Pipeline

Extend `run-quality-gates`, smoke, and readiness scripts to include Charge Agreement checks after B01/B03/B04 endpoints exist.

## Rollback

Remove failing readiness checks only with explicit blocker classification, not by hiding failed behavior.
