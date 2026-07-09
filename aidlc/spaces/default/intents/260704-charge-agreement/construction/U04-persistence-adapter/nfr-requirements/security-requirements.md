# Security Requirements - U04

## Source Alignment

Consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.

## Controls

Use parameterized queries or Spring Data/JPA binding. Do not store credentials or tokens in agreement tables.

## Data Protection

Agreement data is internal/confidential commercial data; audit status changes through activity rows.
