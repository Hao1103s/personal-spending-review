import type { CategoryRule, MerchantMemory, PrismaClient } from "@prisma/client";

import { CATEGORIES, type CategoryName, type ClassificationResult } from "@/lib/types";

import { matchRule } from "./rules";

export function normalizeMerchantName(rawMerchant: string) {
  return rawMerchant
    .replace(/\s+/g, " ")
    .replace(/[【】]/g, "")
    .replace(/^(微信支付-|支付宝-|银行卡-)/, "")
    .replace(/^\*+/, "")
    .trim();
}

export function classifyMerchant(params: {
  merchant: string;
  memories?: Pick<MerchantMemory, "merchant" | "category" | "hitCount">[];
  rules?: Pick<CategoryRule, "matchType" | "pattern" | "category" | "priority">[];
}): ClassificationResult {
  const merchant = normalizeMerchantName(params.merchant);
  const candidate = merchant.toLowerCase();
  const isKnownCategory = (value: string): value is CategoryName =>
    CATEGORIES.includes(value as CategoryName);

  const memory = params.memories?.find((item) => item.merchant.toLowerCase() === candidate);
  if (memory && isKnownCategory(memory.category)) {
    return {
      category: memory.category,
      confidence: Math.min(0.99, 0.9 + Math.min(memory.hitCount, 5) * 0.02),
      status: "auto",
      reason: "merchant_memory",
    };
  }

  const sortedRules = [...(params.rules ?? [])].sort((a, b) => b.priority - a.priority);
  const matchedRule = sortedRules.find((rule) => matchRule(merchant, rule));

  if (matchedRule && isKnownCategory(matchedRule.category)) {
    const confidence =
      matchedRule.matchType === "exact"
        ? 0.92
        : matchedRule.matchType === "contains"
          ? 0.8
          : 0.72;

    return {
      category: matchedRule.category,
      confidence,
      status: confidence >= 0.75 ? "auto" : "pending",
      reason: `rule:${matchedRule.matchType}`,
    };
  }

  return {
    category: "其他",
    confidence: 0.28,
    status: "pending",
    reason: "fallback",
  };
}

export async function classifyMerchantWithDb(
  prisma: PrismaClient,
  merchant: string,
): Promise<ClassificationResult> {
  const normalizedMerchant = normalizeMerchantName(merchant);
  const [memory, rules] = await Promise.all([
    prisma.merchantMemory.findUnique({
      where: { merchant: normalizedMerchant.toLowerCase() },
      select: { merchant: true, category: true, hitCount: true },
    }),
    prisma.categoryRule.findMany({
      orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
      select: { matchType: true, pattern: true, category: true, priority: true },
    }),
  ]);

  return classifyMerchant({
    merchant: normalizedMerchant,
    memories: memory ? [memory] : [],
    rules,
  });
}

export async function upsertMerchantMemory(
  prisma: PrismaClient,
  merchant: string,
  category: CategoryName,
) {
  const normalizedMerchant = normalizeMerchantName(merchant).toLowerCase();

  return prisma.merchantMemory.upsert({
    where: { merchant: normalizedMerchant },
    update: {
      category,
      hitCount: { increment: 1 },
      lastUsedAt: new Date(),
    },
    create: {
      merchant: normalizedMerchant,
      category,
      hitCount: 1,
      lastUsedAt: new Date(),
    },
  });
}
