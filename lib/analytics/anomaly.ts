import type { SourceType, TransactionType } from "@prisma/client";
import {
  eachDayOfInterval,
  endOfDay,
  format,
  isWithinInterval,
  startOfDay,
  subDays,
} from "date-fns";

import type { CategoryName } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export type AnalyticsTransaction = {
  merchant: string;
  amount: number;
  category: CategoryName | string;
  sourceType: SourceType;
  transactionType: TransactionType;
  transactionTime: Date;
};

export type SpendingAnomaly = {
  id: string;
  type: "daily_spike" | "category_growth" | "merchant_frequency";
  title: string;
  description: string;
};

function toExpenseTransactions(transactions: AnalyticsTransaction[]) {
  return transactions.filter((item) => item.transactionType === "expense");
}

export function detectAnomalies(
  transactions: AnalyticsTransaction[],
  referenceDate = new Date(),
): SpendingAnomaly[] {
  const expenseTransactions = toExpenseTransactions(transactions);
  const anomalies: SpendingAnomaly[] = [];
  const last30Start = startOfDay(subDays(referenceDate, 29));
  const last30End = endOfDay(referenceDate);
  const recentTransactions = expenseTransactions.filter((item) =>
    isWithinInterval(item.transactionTime, { start: last30Start, end: last30End }),
  );

  const last30Days = eachDayOfInterval({ start: last30Start, end: last30End });
  const dailyAmounts = last30Days.map((day) => {
    const key = format(day, "yyyy-MM-dd");
    const amount = recentTransactions
      .filter((item) => format(item.transactionTime, "yyyy-MM-dd") === key)
      .reduce((sum, item) => sum + item.amount, 0);

    return { key, day, amount };
  });

  const dailyAverage =
    dailyAmounts.reduce((sum, item) => sum + item.amount, 0) / Math.max(dailyAmounts.length, 1);
  const highestDay = [...dailyAmounts].sort((a, b) => b.amount - a.amount)[0];

  if (highestDay && highestDay.amount > Math.max(180, dailyAverage * 2.2)) {
    anomalies.push({
      id: `day-${highestDay.key}`,
      type: "daily_spike",
      title: "单日支出异常放大",
      description: `${format(highestDay.day, "M月d日")}支出 ${formatCurrency(highestDay.amount)}，明显高于最近 30 天日均 ${formatCurrency(dailyAverage)}。`,
    });
  }

  const previous30Start = startOfDay(subDays(last30Start, 30));
  const previous30End = endOfDay(subDays(last30Start, 1));
  const previousTransactions = expenseTransactions.filter((item) =>
    isWithinInterval(item.transactionTime, { start: previous30Start, end: previous30End }),
  );

  const categories = Array.from(new Set(expenseTransactions.map((item) => item.category)));
  for (const category of categories) {
    const current = recentTransactions
      .filter((item) => item.category === category)
      .reduce((sum, item) => sum + item.amount, 0);
    const previous = previousTransactions
      .filter((item) => item.category === category)
      .reduce((sum, item) => sum + item.amount, 0);

    if (current > 200 && current > Math.max(100, previous * 1.6)) {
      const base = previous === 0 ? 100 : ((current - previous) / previous) * 100;
      anomalies.push({
        id: `category-${category}`,
        type: "category_growth",
        title: `${category}支出增长明显`,
        description: `最近 30 天 ${category}支出 ${formatCurrency(current)}，较此前 30 天提升 ${base.toFixed(0)}%。`,
      });
      break;
    }
  }

  const merchants = Array.from(new Set(expenseTransactions.map((item) => item.merchant)));
  for (const merchant of merchants) {
    const currentCount = recentTransactions.filter((item) => item.merchant === merchant).length;
    const previousCount = previousTransactions.filter((item) => item.merchant === merchant).length;

    if (currentCount >= 4 && currentCount >= Math.max(3, previousCount * 2)) {
      anomalies.push({
        id: `merchant-${merchant}`,
        type: "merchant_frequency",
        title: `${merchant}交易频次升高`,
        description: `最近 30 天你在 ${merchant} 发生了 ${currentCount} 笔支出，相比此前 30 天明显增加。`,
      });
      break;
    }
  }

  return anomalies.slice(0, 3);
}
