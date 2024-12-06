export type IsExactUnion<TUnion, TCompareUnion> = [TUnion] extends [
  TCompareUnion,
]
  ? [TCompareUnion] extends [TUnion]
    ? true
    : false
  : false;

export type ReplaceUnionMember<TUnion, TSearch, TReplacement> =
  TUnion extends Array<infer U>
    ? Array<ReplaceUnionMember<U, TSearch, TReplacement>>
    : TUnion extends Iterable<infer U>
      ? U extends string
        ? TUnion
        : Iterable<ReplaceUnionMember<U, TSearch, TReplacement>>
      : TUnion extends TSearch
        ? Exclude<TUnion, TSearch> | TReplacement
        : TUnion;
