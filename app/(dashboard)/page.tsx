import Link from "next/link";

import { getDashboardSnapshot } from "@/lib/analytics/dashboard";
import { prisma } from "@/lib/db";
import { CategoryBarChartCard, TrendChartCard } from "@/components/dashboard/spending-charts";
import {
  AnomalyCard,
  DashboardSummaryStrip,
  TopMerchantsCard,
} from "@/components/dashboard/merchant-and-anomaly";
import { KpiGrid } from "@/components/dashboard/kpi-grid";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageShell } from "@/components/ui/page-shell";

export default async function DashboardPage() {
  const [snapshot, totalTransactions, pendingCount, importCount] = await Promise.all([
    getDashboardSnapshot(),
    prisma.transaction.count(),
    prisma.transaction.count({
      where: { categoryStatus: "pending" },
    }),
    prisma.importBatch.count(),
  ]);

  if (totalTransactions === 0) {
    return (
      <PageShell
        title="首页看板"
        description="先导入一份流水，再从分类、趋势和月度复盘开始整理你的消费。"
        actions={
          <Button asChild>
            <Link href="/import">去导入</Link>
          </Button>
        }
      >
        <EmptyState
          title="当前还没有可展示的流水"
          description="导入页支持微信、支付宝和银行卡 CSV。导入后这里会展示基于真实数据的看板。"
          action={
            <Button asChild>
              <Link href="/import">导入样例 CSV</Link>
            </Button>
          }
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="首页看板"
      description="优先回答三个问题：这个月总共花了多少、主要花在哪、相比上月有没有明显变化。"
      actions={
        <Button asChild>
          <Link href="/reports">查看月度复盘</Link>
        </Button>
      }
    >
      <DashboardSummaryStrip pendingCount={pendingCount} importCount={importCount} />
      <KpiGrid
        totalExpense={snapshot.monthTotal}
        dailyAverage={snapshot.dailyAverage}
        topCategory={snapshot.topCategory}
        changePercent={snapshot.monthChangePercent}
      />
      <div className="grid gap-4 xl:grid-cols-[1.15fr_1fr]">
        <CategoryBarChartCard data={snapshot.byCategory} />
        <TrendChartCard data={snapshot.last30Trend} />
      </div>
      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <TopMerchantsCard merchants={snapshot.topMerchants} />
        <AnomalyCard anomalies={snapshot.anomalies} />
      </div>
    </PageShell>
  );
}
