import type { RaftersDocument } from "@/types";
import { RaftersValidationError } from "@/validate/errors";
import type { ValidationResult } from "@/validate/validate";

export type Validate = (document: unknown) => ValidationResult;
export type Migrate = (document: unknown) => unknown;

export function serializeDocument(
  document: RaftersDocument,
  validate: Validate
): string {
  const result = validate(document);
  if (!result.ok) throw new RaftersValidationError(result.issues);
  return JSON.stringify(document);
}

export function deserializeDocument(
  json: string,
  migrate: Migrate,
  validate: Validate
): RaftersDocument {
  const migrated = migrate(JSON.parse(json));
  const result = validate(migrated);
  if (!result.ok) throw new RaftersValidationError(result.issues);
  return result.value;
}
