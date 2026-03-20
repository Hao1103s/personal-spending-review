import { prisma } from "@/lib/db";
import { CATEGORY_COLORS } from "@/lib/types";

import {
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  format,
  isWithinInterval,
  parse,
  startOfDay,
  startOfMonth,
  subMonths,
} from "date-fns";

import type { AnalyticsTransaction } from "./anomaly";

function percentChange(current: number, previous: number) {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }

  return ((current - previous) / previous) * 100;
}

export function buildMonthlyReport(
  transactions: AnalyticsTransaction[],
  month: string,
) {
  const referenceDate = parse(`${month}-01`, "yyyy-MM-dd", new Date());
  const monthStart = startOfMonth(referenceDate);
  const monthEnd = endOfMonth(referenceDate);
  const previousMonthStart = startOfMonth(subMonths(referenceDate, 1));
  const previousMonthEnd = endOfMonth(subMonths(referenceDate, 1));
  const expenseTransactions = transactions.filter((item) => item.transactionType === "expense");
  const currentMonth = expenseTransactions.filter((item) =>
    isWithinInterval(item.transactionTime, { start: monthStart, end: monthEnd }),
  );
  const previousMonth = expenseTransactions.filter((item) =>
    isWithinInterval(item.transactionTime, {
      start: previousMonthStart,
      end: previousMonthEnd,
    }),
  );

  const totalExpense = currentMonth.reduce((sum, item) => sum + item.amount, 0);
  const previousExpense = previousMonth.reduce((sum, item) => sum + item.amount, 0);

  const categoryMap = new Map<string, number>();
  const merchantMap = new Map<string, number>();
  for (const transaction of currentMonth) {
    categoryMap.set(
      transaction.category,
      (categoryMap.get(transaction.category) ?? 0) + transaction.amount,
    );
    merchantMap.set(
      transaction.merchant,
      (merchantMap.get(transaction.merchant) ?? 0) + transaction.amount,
    );
  }

  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      share: totalExpense === 0 ? 0 : amount / totalExpense,
      color: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS],
    }))
    .sort((a, b) => b.amount - a.amount);

  const merchantBreakdown = Array.from(merchantMap.entries())
    .map(([merchant, amount]) => ({ merchant, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8);

  const highestSpendDay =
    eachDayOfInterval({ start: monthStart, end: monthEnd })
      .map((day) => {
        const amount = currentMonth
          .filter((item) =>
            isWithinInterval(item.transactionTime, {
              start: startOfDay(day),
              end: endOfDay(day),
            }),
          )
          .reduce((sum, item) => sum + item.amount, 0);

        return { day, amount };
      })
      .sort((a, b) => b.amount - a.amount)[0] ?? null;

  const topMerchant = merchantBreakdown[0] ?? null;
  const topThreeCategories = categoryBreakdown.slice(0, 3);
  const changePercent = percentChange(totalExpense, previousExpense);

  const insights: string[] = [];
  if (totalExpense > 0) {
    insights.push(`本月总支出为 ${totalExpense.toFixed(2)} 元，较上月${changePercent >= 0 ? "增加" : "下降"} ${Math.abs(changePercent).toFixed(1)}%。`);
  }
  if (topThreeCategories.length > 0) {
    const categorySummary = topThreeCategories
      .map((item) => `${item.category}${(item.share * 100).toFixed(0)}%`)
      .join("、");
    insights.push(`前三大支出类别为 ${categorySummary}，说明你的主要花费集中在这些场景。`);
  }
  if (topMerchant) {
    insights.push(`花钱最多的商户是 ${topMerchant.merchant}，累计支出 ${topMerchant.amount.toFixed(2)} 元。`);
  }
  if (highestSpendDay && highestSpendDay.amount > 0) {
    insights.push(`支出峰值出现在 ${format(highestSpendDay.day, "M月d日")}，当天共花费 ${highestSpendDay.amount.toFixed(2)} 元。`);
  }
  if (categoryBreakdown[0] && categoryBreakdown[0].share >= 0.35) {
    insights.push(`最高类别 ${categoryBreakdown[0].category} 占本月支出的 ${(categoryBreakdown[0].share * 100).toFixed(0)}%，需要留意结构是否过于集中。`);
  }

  return {
    month,
    totalExpense,
    previousExpense,
    changePercent,
    topThreeCategories,
    topMerchant,
    highestSpendDay,
    categoryBreakdown,
    merchantBreakdown,
    insights: insights.slice(0, 5),
  };
}

export async function getMonthlyReport(month: string) {
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

  return buildMonthlyReport(
    transactions.map((item) => ({
      ...item,
      amount: Number(item.amount),
    })),
    month,
  );
}

export async function getAvailableMonths() {
  const records = await prisma.transaction.findMany({
    select: { transactionTime: true },
    orderBy: { transactionTime: "desc" },
  });

  return Array.from(
    new Set(records.map((item) => format(item.transactionTime, "yyyy-MM"))),
  );
}
