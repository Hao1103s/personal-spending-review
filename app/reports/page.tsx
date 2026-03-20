import { format } from "date-fns";

import { CategoryBreakdownChart, MerchantBreakdown, ReportInsights, ReportOverview } from "@/components/reports/report-panels";
import { MonthSelector } from "@/components/reports/month-selector";
import { EmptyState } from "@/components/ui/empty-state";
import { PageShell } from "@/components/ui/page-shell";
import { getAvailableMonths, getMonthlyReport } from "@/lib/analytics/report";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = await searchParams;
  const monthParam = Array.isArray(resolved.month) ? resolved.month[0] : resolved.month;
  const availableMonths = await getAvailableMonths();
  const month =
    monthParam && /^\d{4}-\d{2}$/.test(monthParam)
      ? monthParam
      : availableMonths[0] ?? format(new Date(), "yyyy-MM");
  const report = await getMonthlyReport(month);

  return (
    <PageShell
      title="月度复盘"
      description="重点不是流水罗列，而是回答“本月的钱主要花去哪了”以及“和上月相比有什么变化”。"
      actions={<MonthSelector availableMonths={availableMonths.length ? availableMonths : [month]} currentMonth={month} />}
    >
      {report.totalExpense === 0 ? (
        <EmptyState
          title="这个月份还没有支出数据"
          description="切换月份，或者先导入和 seed 一批样本流水。"
        />
      ) : (
        <>
          <ReportOverview
            totalExpense={report.totalExpense}
            changePercent={report.changePercent}
            topCategories={report.topThreeCategories}
            topMerchant={report.topMerchant}
            highestSpendDay={
              report.highestSpendDay
                ? {
                    day: report.highestSpendDay.day.toISOString(),
                    amount: report.highestSpendDay.amount,
                  }
                : null
            }
          />
          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <CategoryBreakdownChart data={report.categoryBreakdown} />
            <MerchantBreakdown data={report.merchantBreakdown} />
          </div>
          <ReportInsights insights={report.insights} />
        </>
      )}
    </PageShell>
  );
}
