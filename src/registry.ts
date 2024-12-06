import type { ComponentType } from "react";

export type Registry = Readonly<Record<string, ComponentType<any>>>;
