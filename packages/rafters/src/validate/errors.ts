import type { Issue } from "@/validate/validate";

export class RaftersValidationError extends Error {
  readonly issues: Issue[];
  constructor(issues: Issue[]) {
    super(`Rafters: document failed validation (${issues.length} issue(s))`);
    this.name = "RaftersValidationError";
    this.issues = issues;
  }
}
