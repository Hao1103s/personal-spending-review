import { addDays, format, startOfMonth, subMonths } from "date-fns";

import { detectAnomalies } from "@/lib/analytics/anomaly";
import { buildDashboardSnapshot } from "@/lib/analytics/dashboard";
import { buildMonthlyReport } from "@/lib/analytics/report";

const now = new Date("2025-03-20T12:00:00.000Z");
const currentMonth = startOfMonth(now);
const previousMonth = startOfMonth(subMonths(now, 1));

const baseTransactions = [
  {
    merchant: "瑞幸咖啡",
    amount: 18,
    category: "餐饮" as const,
    sourceType: "wechat_csv" as const,
    transactionType: "expense" as const,
    transactionTime: addDays(currentMonth, 1),
  },
  {
    merchant: "房租",
    amount: 3600,
    category: "住房" as const,
    sourceType: "generic_bank_csv" as const,
    transactionType: "expense" as const,
    transactionTime: addDays(currentMonth, 2),
  },
  {
    merchant: "Apple Store",
    amount: 2400,
    category: "购物" as const,
    sourceType: "alipay_csv" as const,
    transactionType: "expense" as const,
    transactionTime: addDays(currentMonth, 10),
  },
  {
    merchant: "瑞幸咖啡",
    amount: 16,
    category: "餐饮" as const,
    sourceType: "wechat_csv" as const,
    transactionType: "expense" as const,
    transactionTime: addDays(currentMonth, 11),
  },
  {
    merchant: "房租",
    amount: 3300,
    category: "住房" as const,
    sourceType: "generic_bank_csv" as const,
    transactionType: "expense" as const,
    transactionTime: addDays(previousMonth, 2),
  },
  {
    merchant: "瑞幸咖啡",
    amount: 18,
    category: "餐饮" as const,
    sourceType: "wechat_csv" as const,
    transactionType: "expense" as const,
    transactionTime: addDays(previousMonth, 3),
  },
];

describe("analytics", () => {
  it("builds dashboard snapshot from transactions", () => {
    const snapshot = buildDashboardSnapshot(baseTransactions, now);

    expect(snapshot.monthTotal).toBe(6034);
    expect(snapshot.topCategory).toBe("住房");
    expect(snapshot.byCategory[0]?.category).toBe("住房");
  });

  it("builds monthly report with generated insights", () => {
    const report = buildMonthlyReport(baseTransactions, format(now, "yyyy-MM"));

    expect(report.totalExpense).toBe(6034);
    expect(report.topMerchant?.merchant).toBe("房租");
    expect(report.insights.length).toBeGreaterThanOrEqual(3);
  });

  it("detects at least one anomaly", () => {
    const anomalies = detectAnomalies(baseTransactions, now);
    expect(anomalies.length).toBeGreaterThan(0);
  });
});
