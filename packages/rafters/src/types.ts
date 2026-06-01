// JSON's null is part of the serialized contract; undefined is not serializable.
// eslint-disable-next-line @typescript-eslint/ban-types
export type JsonPrimitive = string | number | boolean | null;
export type JsonValue =
  | JsonPrimitive
  | JsonValue[]
  | { [key: string]: JsonValue };

/** A reference to a registered handler, optionally pre-bound with leading args. */
export type HandlerRef = { $handler: string; args?: JsonValue[] };

/** A reference to a registered data source, optionally parameterized. */
export type DataRef = { $data: string; args?: JsonValue };

/** A value a prop may hold in a serialized document. */
export type PropValue =
  | JsonValue
  | HandlerRef
  | DataRef
  | RaftersNode
  | PropValue[];

export type RaftersNode = {
  type: string;
  key?: string;
  props?: Record<string, PropValue>;
};

export type RaftersDocument = {
  version: number;
  root: RaftersNode;
};
