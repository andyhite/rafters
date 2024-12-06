export type ReplaceValues<TObject, TSearchValue, TReplaceValue> = {
  [TKey in keyof TObject]: TObject[TKey] extends TSearchValue
    ? TReplaceValue
    : TObject[TKey] extends TSearchValue[]
      ? TReplaceValue[]
      : TObject[TKey];
};

export function replaceValues<
  TObject extends Record<string, unknown>,
  TSearchValue,
  TReplaceValue,
>(
  object: TObject,
  comparator: (value: any) => boolean,
  replacement: (value: TSearchValue) => TReplaceValue
): ReplaceValues<TObject, TSearchValue, TReplaceValue> {
  for (const [key, value] of Object.entries(object)) {
    if (Array.isArray(value)) {
      (object as any)[key] = value.map((item) => {
        if (comparator(item)) {
          return replacement(item as TSearchValue);
        }

        return item as unknown;
      });
    }

    if (comparator(value)) {
      (object as any)[key] = replacement(value as TSearchValue);
    }
  }

  return object as ReplaceValues<TObject, TSearchValue, TReplaceValue>;
}
