function levenshtein(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const distribution: number[][] = Array.from({ length: rows }, () =>
    Array.from<number>({ length: cols }).fill(0)
  );
  for (let index = 0; index < rows; index++) distribution[index]![0] = index;
  for (let index = 0; index < cols; index++) distribution[0]![index] = index;
  for (let index = 1; index < rows; index++) {
    for (let index_ = 1; index_ < cols; index_++) {
      const cost = a[index - 1] === b[index_ - 1] ? 0 : 1;
      distribution[index]![index_] = Math.min(
        distribution[index - 1]![index_]! + 1,
        distribution[index]![index_ - 1]! + 1,
        distribution[index - 1]![index_ - 1]! + cost
      );
    }
  }

  return distribution[a.length]![b.length]!;
}

/** Nearest candidate to `name` within an edit-distance threshold, else undefined. */
export function closest(
  name: string,
  candidates: string[]
): string | undefined {
  let best: string | undefined;
  let bestDistance = Infinity;
  const threshold = Math.max(2, Math.floor(name.length / 2));
  for (const candidate of candidates) {
    const distance = levenshtein(name.toLowerCase(), candidate.toLowerCase());
    if (distance < bestDistance) {
      bestDistance = distance;
      best = candidate;
    }
  }

  return bestDistance <= threshold ? best : undefined;
}
