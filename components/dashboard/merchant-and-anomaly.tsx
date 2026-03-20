import { AlertTriangle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export function TopMerchantsCard({
  merchants,
}: {
  merchants: Array<{ merchant: string; count: number; amount: number }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 商户</CardTitle>
        <CardDescription>按本月交易次数排序，同次数时按金额排序。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {merchants.length === 0 ? (
          <div className="rounded-3xl bg-muted/70 px-4 py-8 text-center text-sm text-foreground/60">
            暂无交易，先导入一批 CSV 再看常去商户。
          </div>
        ) : (
          merchants.map((merchant, index) => (
            <div
              key={merchant.merchant}
              className="flex items-center justify-between rounded-3xl bg-muted/55 px-4 py-4"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-card px-3 py-2 text-sm font-semibold text-foreground/70">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div>
                  <div className="font-medium">{merchant.merchant}</div>
                  <div className="text-sm text-foreground/55">{merchant.count} 笔交易</div>
                </div>
              </div>
              <div className="text-right text-sm font-medium">{formatCurrency(merchant.amount)}</div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function AnomalyCard({
  anomalies,
}: {
  anomalies: Array<{ id: string; title: string; description: string; type: string }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>异常消费提示</CardTitle>
        <CardDescription>基于最近 30 天与上一个窗口的规则对比。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {anomalies.length === 0 ? (
          <div className="rounded-3xl bg-muted/55 px-4 py-8 text-sm text-foreground/60">
            最近没有识别到明显异常，消费波动还算平稳。
          </div>
        ) : (
          anomalies.map((anomaly) => (
            <div
              key={anomaly.id}
              className="rounded-3xl border border-warning/20 bg-warning/5 px-4 py-4"
            >
              <div className="mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <div className="font-medium">{anomaly.title}</div>
                <Badge variant="warning">{anomaly.type}</Badge>
              </div>
              <p className="text-sm leading-6 text-foreground/65">{anomaly.description}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardSummaryStrip({
  pendingCount,
  importCount,
}: {
  pendingCount: number;
  importCount: number;
}) {
  return (
    <Card className="overflow-hidden bg-primary text-white">
      <CardContent className="flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="text-sm uppercase tracking-[0.24em] text-white/60">Workspace Status</div>
          <div className="text-2xl font-semibold">流水已经就绪，可以直接开始复盘。</div>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="rounded-full bg-white/12 px-4 py-3 text-sm">
            <div className="text-white/60">待确认分类</div>
            <div className="font-semibold">{pendingCount} 条</div>
          </div>
          <div className="rounded-full bg-white/12 px-4 py-3 text-sm">
            <div className="text-white/60">导入批次</div>
            <div className="font-semibold">{importCount} 批</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
