import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { ComponentType } from "react";

export type ComponentEntry = {
  component: ComponentType<any>;
  describe?: string;
  props?: StandardSchemaV1;
  /** Names of props that accept child node(s); surfaced in the manifest. */
  childProps?: string[];
};

export type ComponentRegistryInput = Record<
  string,
  ComponentType<any> | ComponentEntry
>;
export type NormalizedRegistry = Record<string, ComponentEntry>;
