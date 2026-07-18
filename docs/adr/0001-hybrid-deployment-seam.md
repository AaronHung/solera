# ADR-0001: Cloud Control Plane with a Hybrid Deployment Seam

Status: Accepted  
Date: 2026-07-18  
Requirements: SOL-V01-FR-004, SOL-V01-FR-008, SOL-V01-SR-004

## Context

The development Easy PI and SCADA environments are publicly reachable, so a
deployed edge Bridge would add operational cost without validating a real
private-network constraint. Production industrial customers will require PI
credentials to remain near the data source and will resist inbound access to
OT networks.

## Decision

- Run the Easy PI connector as a server-side library during v0.1 development.
- Define a versioned `ConnectorCapabilities` and request/result protocol now.
- Keep PI credentials out of the extension and model gateway.
- When a private historian is introduced, package the same connector behind an
  outbound-only Bridge that establishes the customer-to-cloud connection.
- Keep the frontier model behind a provider-neutral gateway.
- Add customer-VPC/on-prem inference only when a qualified contract requires it.

## Consequences

v0.1 gets cloud-first development speed while preserving the trust boundary
needed for a Hybrid delivery. The remote connector transport remains unbuilt
until a real customer environment supplies acceptance criteria.

## Rollback

If a Pilot forbids cloud data processing, deploy the API/model gateway in the
customer boundary. Contracts and tool policy remain unchanged.
