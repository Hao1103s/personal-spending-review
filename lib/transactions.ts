import { Prisma, type SourceType } from "@prisma/client";
import { endOfDay, startOfDay } from "date-fns";
import { z } from "zod";

import { prisma } from "@/lib/db";

const optionalString = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().optional(),
);

const optionalNumber = z.preprocess(
  (value) => (value === "" || value === undefined ? undefined : value),
  z.coerce.number().optional(),
);

export const transactionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  category: optionalString,
  sourceType: optionalString,
  keyword: optionalString,
  amountMin: optionalNumber,
  amountMax: optionalNumber,
  startDate: optionalString,
  endDate: optionalString,
});

export type TransactionsQuery = z.infer<typeof transactionsQuerySchema>;

export async function getTransactions(query: TransactionsQuery) {
  const parsed = transactionsQuerySchema.parse(query);
  const where: Prisma.TransactionWhereInput = {};

  if (parsed.category) {
    where.category = parsed.category;
  }

  if (parsed.sourceType) {
    where.sourceType = parsed.sourceType as SourceType;
  }

  if (parsed.keyword) {
    where.OR = [
      { merchant: { contains: parsed.keyword } },
      { rawMerchant: { contains: parsed.keyword } },
      { note: { contains: parsed.keyword } },
    ];
  }

  if (parsed.amountMin !== undefined || parsed.amountMax !== undefined) {
    const amountFilter: Prisma.DecimalFilter = {};
    if (parsed.amountMin !== undefined) {
      amountFilter.gte = parsed.amountMin;
    }
    if (parsed.amountMax !== undefined) {
      amountFilter.lte = parsed.amountMax;
    }
    where.amount = amountFilter;
  }

  if (parsed.startDate || parsed.endDate) {
    const timeFilter: Prisma.DateTimeFilter = {};
    if (parsed.startDate) {
      timeFilter.gte = startOfDay(new Date(parsed.startDate));
    }
    if (parsed.endDate) {
      timeFilter.lte = endOfDay(new Date(parsed.endDate));
    }
    where.transactionTime = timeFilter;
  }

  const [total, transactions] = await Promise.all([
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where,
      orderBy: { transactionTime: "desc" },
      skip: (parsed.page - 1) * parsed.pageSize,
      take: parsed.pageSize,
    }),
  ]);

  return {
    total,
    page: parsed.page,
    pageSize: parsed.pageSize,
    pageCount: Math.max(1, Math.ceil(total / parsed.pageSize)),
    transactions: transactions.map((item) => ({
      ...item,
      amount: Number(item.amount),
    })),
  };
}
