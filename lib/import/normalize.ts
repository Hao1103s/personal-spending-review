import { parse } from "date-fns";
import type { TransactionType } from "@prisma/client";

import { normalizeMerchantName } from "@/lib/classify/engine";
import type { AdaptedImportRow, NormalizedCandidate } from "@/lib/types";

import { buildDedupKey } from "./dedup";

const DATETIME_FORMATS = [
  "yyyy-MM-dd HH:mm:ss",
  "yyyy/M/d HH:mm:ss",
  "yyyy-MM-dd HH:mm",
  "yyyy/M/d HH:mm",
  "yyyy/MM/dd HH:mm:ss",
  "yyyy/MM/dd HH:mm",
];

export function normalizeAmount(rawAmount: string) {
  const numeric = Number.parseFloat(rawAmount.replace(/[￥,元\s]/g, ""));
  if (Number.isNaN(numeric)) {
    throw new Error(`无法解析金额: ${rawAmount}`);
  }

  return Math.abs(numeric);
}

export function parseTransactionTime(rawTime: string) {
  for (const formatString of DATETIME_FORMATS) {
    const parsed = parse(rawTime.trim(), formatString, new Date());
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  const nativeDate = new Date(rawTime);
  if (!Number.isNaN(nativeDate.getTime())) {
    return nativeDate;
  }

  throw new Error(`无法解析时间: ${rawTime}`);
}

export function isExpenseType(type: TransactionType) {
  return type === "expense";
}

export function normalizeAdaptedRow(row: AdaptedImportRow): NormalizedCandidate | null {
  if (!isExpenseType(row.transactionType)) {
    return null;
  }

  const merchant = normalizeMerchantName(row.merchant || row.rawMerchant);
  const transactionTime = parseTransactionTime(row.rawTime);
  const amount = normalizeAmount(row.rawAmount);

  return {
    sourceType: row.sourceType,
    sourceAccount: row.sourceAccount ?? null,
    rawMerchant: row.rawMerchant.trim(),
    merchant,
    amount,
    transactionTime,
    transactionType: row.transactionType,
    note: row.note ?? null,
    dedupKey: buildDedupKey({
      sourceType: row.sourceType,
      rawTime: row.rawTime,
      rawMerchant: row.rawMerchant,
      rawAmount: row.rawAmount,
    }),
  };
}
