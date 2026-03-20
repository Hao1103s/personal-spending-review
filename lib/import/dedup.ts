import { createHash } from "crypto";

import type { SourceType } from "@prisma/client";

export function buildDedupKey({
  sourceType,
  rawTime,
  rawMerchant,
  rawAmount,
}: {
  sourceType: SourceType;
  rawTime: string;
  rawMerchant: string;
  rawAmount: string;
}) {
  const payload = [
    sourceType,
    rawTime.trim(),
    rawMerchant.trim().toLowerCase(),
    rawAmount.replace(/\s+/g, ""),
  ].join("|");

  return createHash("sha256").update(payload).digest("hex");
}

export function dedupeCandidates<T extends { dedupKey: string }>(
  candidates: T[],
  existingDedupKeys: Set<string>,
) {
  const seen = new Set(existingDedupKeys);
  const unique: T[] = [];
  let dedupedRows = 0;

  for (const candidate of candidates) {
    if (seen.has(candidate.dedupKey)) {
      dedupedRows += 1;
      continue;
    }

    seen.add(candidate.dedupKey);
    unique.push(candidate);
  }

  return {
    unique,
    dedupedRows,
  };
}
