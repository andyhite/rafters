import { type ReactNode } from "react";

import { type Builder, createBuilder } from "@/builder";
import { createDataCache } from "@/data/cache";
import { inlineDataSource, resolveData } from "@/data/resolve";
import type { DataInput, DataSource } from "@/data/types";
import { inlineSource, resolveHandlers } from "@/handlers/resolve";
import type { HandlersInput, HandlerSource } from "@/handlers/types";
import { buildManifest, type Manifest } from "@/manifest/manifest";
import { normalizeRegistry } from "@/registry/normalize";
import type { ComponentRegistryInput } from "@/registry/types";
import type { Scope } from "@/render/context";
import { Renderer } from "@/render/renderer";
import { type JsonSchemaAdapter, noopAdapter } from "@/schema/json-schema";
import {
  deserializeDocument,
  type Migrate,
  serializeDocument,
} from "@/serialize/serialize";
import type { RaftersDocument, RaftersNode } from "@/types";
import { validateDocument, type ValidationResult } from "@/validate/validate";

export type CreateRaftersConfig = {
  version?: number;
  components: ComponentRegistryInput;
  handlers?: HandlersInput;
  sources?: HandlerSource[];
  data?: DataInput;
  dataSources?: DataSource[];
  jsonSchemaAdapter?: JsonSchemaAdapter;
  fallback?: (error: Error) => ReactNode;
  loadingFallback?: (info: { type: string }) => ReactNode;
  migrate?: Migrate;
};

export type Rafters = {
  Renderer: (props: {
    document: RaftersDocument | RaftersNode;
    scope?: Scope;
  }) => ReactNode;
  manifest: () => Manifest;
  validate: (document: unknown) => ValidationResult;
  serialize: (document: RaftersDocument) => string;
  deserialize: (json: string) => RaftersDocument;
  Builder: Builder;
};

const defaultFallback = (): ReactNode => null;

export function createRafters(config: CreateRaftersConfig): Rafters {
  const version = config.version ?? 1;
  const registry = normalizeRegistry(config.components);
  const handlers = resolveHandlers([
    inlineSource(config.handlers ?? {}),
    ...(config.sources ?? []),
  ]);
  const data = resolveData([
    inlineDataSource(config.data ?? {}),
    ...(config.dataSources ?? []),
  ]);
  const cache = createDataCache();
  const adapter = config.jsonSchemaAdapter ?? noopAdapter;
  const fallback = config.fallback ?? defaultFallback;
  const loadingFallback = config.loadingFallback ?? (() => null);
  const migrate: Migrate = config.migrate ?? ((document) => document);

  const validate = (document: unknown): ValidationResult =>
    validateDocument(document, { registry, handlers, data, version });

  const context = {
    registry,
    handlers,
    data,
    cache,
    fallback,
    loadingFallback,
  };

  return {
    Renderer: (props) => (
      <Renderer document={props.document} scope={props.scope} ctx={context} />
    ),
    manifest: () =>
      buildManifest({ version, registry, handlers, data, adapter }),
    validate,
    serialize: (document) => serializeDocument(document, validate),
    deserialize: (json) => deserializeDocument(json, migrate, validate),
    Builder: createBuilder(registry),
  };
}
