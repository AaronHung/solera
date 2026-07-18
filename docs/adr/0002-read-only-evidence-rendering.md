# ADR-0002: Read-only Tools, Evidence-first Answers, Trusted Rendering

Status: Accepted  
Date: 2026-07-18  
Requirements: SOL-V01-FR-003, SOL-V01-FR-006, SOL-V01-FR-009,
SOL-V01-SR-001, SOL-V01-SR-002, SOL-V01-SR-005

## Context

Industrial users must distinguish observed facts, calculations, and model
inference. A content script and model-generated UI can also create security and
host-page integrity risks even when business APIs are nominally read-only.

## Decision

- Register zero write/control tools in v0.1.
- Treat page content as untrusted context and never as policy.
- Produce industrial numbers only in a versioned deterministic analytics layer.
- Attach an `Evidence` object to every numerical result.
- Let the model produce `ViewSpec`, never HTML, JavaScript, or event handlers.
- Validate every ViewSpec against JSON Schema and tenant policy.
- Render only trusted, locally packaged Widgets.
- Own one overlay root and explicitly dispose of every Solera resource.

## Consequences

The Agent may decline requests when evidence is missing. New visualizations
require a reviewed Widget implementation rather than arbitrary generation.
This reduces demo flexibility but creates a defensible enterprise trust model.

## Rollback

There is no v0.1 rollback to arbitrary code or write tools. A future write
capability requires a separate product contract, threat model, approval flow,
and ADR.
