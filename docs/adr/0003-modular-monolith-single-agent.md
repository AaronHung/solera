# ADR-0003: Modular Monolith and a Single Agent Orchestrator

Status: Accepted  
Date: 2026-07-18  
Requirements: SOL-V01-FR-003, SOL-V01-FR-005, SOL-V01-FR-007,
SOL-V01-FR-011

## Context

The Pilot must prove page context, trustworthy industrial tools, Evidence, and
Canvas. Microservices and multiple collaborating Agents would multiply tracing,
authorization, deployment, and evaluation paths before load or organizational
boundaries are known.

## Decision

- Build one FastAPI deployment with strict internal module boundaries.
- Use one bounded orchestrator state machine.
- Keep analytics pure and deterministic.
- Keep tools described by typed manifests and enforced by a central policy
  service.
- Stream versioned Agent lifecycle events.
- Split a module only when deployment isolation, independent scaling, or team
  ownership is demonstrated by Pilot evidence.

## Consequences

Local development, audit replay, and end-to-end tests remain simple. Internal
interfaces must still be treated as public contracts to preserve future
separation.

## Rollback

Any extracted service consumes the existing contracts and must first pass the
same contract and golden tests in-process and over its new transport.
