import { prisma } from "@/lib/db";
import { CATEGORY_COLORS } from "@/lib/types";

import { detectAnomalies, type AnalyticsTransaction } from "./anomaly";

import {
  endOfDay,
  endOfMonth,
  eachDayOfInterval,
  format,
  isWithinInterval,
  startOfDay,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns";

function percentChange(current: number, previous: number) {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }

  return ((current - previous) / previous) * 100;
}

export function buildDashboardSnapshot(
  transactions: AnalyticsTransaction[],
  referenceDate = new Date(),
) {
  const expenseTransactions = transactions.filter((item) => item.transactionType === "expense");
  const monthStart = startOfMonth(referenceDate);
  const monthEnd = endOfMonth(referenceDate);
  const previousMonthStart = startOfMonth(subMonths(referenceDate, 1));
  const previousMonthEnd = endOfMonth(subMonths(referenceDate, 1));
  const last30Start = startOfDay(subDays(referenceDate, 29));
  const last30End = endOfDay(referenceDate);

  const monthTransactions = expenseTransactions.filter((item) =>
    isWithinInterval(item.transactionTime, { start: monthStart, end: monthEnd }),
  );
  const previousMonthTransactions = expenseTransactions.filter((item) =>
    isWithinInterval(item.transactionTime, {
      start: previousMonthStart,
      end: previousMonthEnd,
    }),
  );
  const monthTotal = monthTransactions.reduce((sum, item) => sum + item.amount, 0);
  const previousMonthTotal = previousMonthTransactions.reduce((sum, item) => sum + item.amount, 0);

  const daysElapsed =
    Math.floor(
      (startOfDay(referenceDate).getTime() - startOfDay(monthStart).getTime()) / 86_400_000,
    ) + 1;
  const dailyAverage = monthTotal / Math.max(daysElapsed, 1);

  const categoryMap = new Map<string, number>();
  for (const transaction of monthTransactions) {
    categoryMap.set(
      transaction.category,
      (categoryMap.get(transaction.category) ?? 0) + transaction.amount,
    );
  }

  const byCategory = Array.from(categoryMap.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      share: monthTotal === 0 ? 0 : amount / monthTotal,
      color: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS],
    }))
    .sort((a, b) => b.amount - a.amount);

  const topCategory = byCategory[0]?.category ?? "其他";

  const last30Trend = eachDayOfInterval({ start: last30Start, end: last30End }).map((day) => {
    const key = format(day, "yyyy-MM-dd");
    const amount = expenseTransactions
      .filter(
        (item) =>
          isWithinInterval(item.transactionTime, { start: startOfDay(day), end: endOfDay(day) }) &&
          item.transactionType === "expense",
      )
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      date: key,
      label: format(day, "M/d"),
      amount,
    };
  });

  const merchantMap = new Map<string, { count: number; amount: number }>();
  for (const transaction of monthTransactions) {
    const current = merchantMap.get(transaction.merchant) ?? { count: 0, amount: 0 };
    merchantMap.set(transaction.merchant, {
      count: current.count + 1,
      amount: current.amount + transaction.amount,
    });
  }

  const topMerchants = Array.from(merchantMap.entries())
    .map(([merchant, value]) => ({
      merchant,
      count: value.count,
      amount: value.amount,
    }))
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }

      return b.amount - a.amount;
    })
    .slice(0, 5);

  return {
    referenceMonth: format(referenceDate, "yyyy-MM"),
    monthTotal,
    dailyAverage,
    topCategory,
    monthChangePercent: percentChange(monthTotal, previousMonthTotal),
    byCategory,
    last30Trend,
    topMerchants,
    anomalies: detectAnomalies(expenseTransactions, referenceDate),
  };
}

export async function getDashboardSnapshot(referenceDate = new Date()) {
  const transactions = await prisma.transaction.findMany({
    select: {
      merchant: true,
      amount: true,
      category: true,
      sourceType: true,
      transactionType: true,
      transactionTime: true,
    },
  });

  return buildDashboardSnapshot(
    transactions.map((item) => ({
      ...item,
      amount: Number(item.amount),
    })),
    referenceDate,
  );
}
