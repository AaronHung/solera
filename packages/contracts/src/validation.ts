import type { ErrorObject } from "ajv";
import {
  validatePageContextSchema,
  validateViewSpecSchema,
} from "./generated/validators.js";
import type { PageContext, ViewSpec } from "./index";

export class ContractValidationError extends Error {
  constructor(
    message: string,
    readonly errors: ErrorObject[] = [],
  ) {
    super(message);
    this.name = "ContractValidationError";
  }
}

function formatErrors(errors: ErrorObject[] | null | undefined): string {
  return (errors ?? [])
    .map((error) => `${error.instancePath || "/"} ${error.message ?? "is invalid"}`)
    .join("; ");
}

function rejectUnsafeTree(value: unknown, path = "config"): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => rejectUnsafeTree(item, `${path}[${index}]`));
    return;
  }
  if (!value || typeof value !== "object") {
    if (typeof value === "string" && value.toLowerCase().includes("javascript:")) {
      throw new ContractValidationError(`Unsafe value at ${path}`);
    }
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    const normalized = key.toLowerCase();
    if (
      normalized.startsWith("on") ||
      ["script", "javascript", "srcdoc", "html"].some((token) =>
        normalized.includes(token),
      )
    ) {
      throw new ContractValidationError(`Unsafe key at ${path}.${key}`);
    }
    rejectUnsafeTree(child, `${path}.${key}`);
  }
}

export function validatePageContext(input: unknown): PageContext {
  if (!validatePageContextSchema(input)) {
    throw new ContractValidationError(
      `Invalid PageContext: ${formatErrors(validatePageContextSchema.errors)}`,
      [...(validatePageContextSchema.errors ?? [])],
    );
  }
  return input as PageContext;
}

export function validateViewSpec(input: unknown): ViewSpec {
  if (!validateViewSpecSchema(input)) {
    throw new ContractValidationError(
      `Invalid ViewSpec: ${formatErrors(validateViewSpecSchema.errors)}`,
      [...(validateViewSpecSchema.errors ?? [])],
    );
  }
  const spec = input as ViewSpec;

  const evidenceIds = new Set((spec.evidence ?? []).map((item) => item.evidenceId));
  for (const widget of spec.widgets) {
    rejectUnsafeTree(widget.config, `widgets.${widget.id}.config`);
    if (
      ["timeseries", "kpi", "status", "table"].includes(widget.type) &&
      widget.evidenceRefs.length === 0
    ) {
      throw new ContractValidationError(`${widget.type} Widget requires Evidence`);
    }
    for (const evidenceRef of widget.evidenceRefs) {
      if (!evidenceIds.has(evidenceRef)) {
        throw new ContractValidationError(
          `Widget ${widget.id} references unknown Evidence ${evidenceRef}`,
        );
      }
    }
  }
  return spec;
}
