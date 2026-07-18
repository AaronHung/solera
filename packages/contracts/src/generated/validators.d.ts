import type { ErrorObject } from "ajv";

export interface GeneratedValidator {
  (data: unknown): boolean;
  errors?: ErrorObject[] | null;
}

export const validatePageContextSchema: GeneratedValidator;
export const validateViewSpecSchema: GeneratedValidator;
