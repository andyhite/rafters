import { describe, expect, it } from "vitest";

import { deserializeDocument, serializeDocument } from "@/serialize/serialize";
import { RaftersValidationError } from "@/validate/errors";
import type { ValidationResult } from "@/validate/validate";

const okValidate = (document: unknown): ValidationResult => ({
  ok: true,
  value: document as any,
});
const failValidate = (): ValidationResult => ({
  ok: false,
  issues: [{ path: [], code: "x", message: "bad" }],
});
const identityMigrate = (document: unknown) => document;

describe("serialize/deserialize", () => {
  it("serializes a valid document to JSON", () => {
    const document = { version: 1, root: { type: "Box" } };
    expect(serializeDocument(document as any, okValidate)).toBe(
      JSON.stringify(document)
    );
  });

  it("throws RaftersValidationError when serializing an invalid document", () => {
    expect(() => serializeDocument({} as any, failValidate)).toThrow(
      RaftersValidationError
    );
  });

  it("round-trips through deserialize", () => {
    const document = { version: 1, root: { type: "Box" } };
    const json = serializeDocument(document as any, okValidate);
    expect(deserializeDocument(json, identityMigrate, okValidate)).toEqual(
      document
    );
  });

  it("runs the migrate hook before validating", () => {
    const json = JSON.stringify({ version: 0, root: { type: "Box" } });
    const migrate = (document: any) => ({ ...document, version: 1 });
    const result = deserializeDocument(json, migrate, okValidate);
    expect(result.version).toBe(1);
  });

  it("throws RaftersValidationError when deserialized document is invalid", () => {
    expect(() =>
      deserializeDocument("{}", identityMigrate, failValidate)
    ).toThrow(RaftersValidationError);
  });
});
