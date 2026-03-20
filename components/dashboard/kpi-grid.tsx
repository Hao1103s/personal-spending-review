import { ArrowDownRight, ArrowUpRight, CalendarClock, Landmark, Wallet } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/utils";

const kpiIcons = {
  total: Wallet,
  average: CalendarClock,
  category: Landmark,
  change: ArrowUpRight,
};

export function KpiGrid({
  totalExpense,
  dailyAverage,
  topCategory,
  changePercent,
}: {
  totalExpense: number;
  dailyAverage: number;
  topCategory: string;
  changePercent: number;
}) {
  const items: Array<{
    key: keyof typeof kpiIcons;
    label: string;
    value: string;
    description: string;
    tone?: "danger" | "success";
  }> = [
    {
      key: "total",
      label: "本月总支出",
      value: formatCurrency(totalExpense),
      description: "只统计 expense 类型流水",
    },
    {
      key: "average",
      label: "日均支出",
      value: formatCurrency(dailyAverage),
      description: "按本月已过去天数计算",
    },
    {
      key: "category",
      label: "最大支出类别",
      value: topCategory,
      description: "当前月金额占比最高的类别",
    },
    {
      key: "change",
      label: "相比上月",
      value: formatPercent(changePercent),
      description: "总支出环比变化",
      tone: changePercent > 0 ? "danger" : "success",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = kpiIcons[item.key];
        return (
          <Card key={item.label}>
            <CardHeader className="border-b-0 pb-0">
              <CardDescription>{item.label}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="flex items-start justify-between gap-4">
                <div className="text-3xl font-semibold tracking-tight">{item.value}</div>
                <div className="rounded-full bg-muted p-3 text-foreground/70">
                  <Icon
                    className={
                      item.key === "change" && changePercent < 0
                        ? "h-5 w-5 rotate-180"
                        : "h-5 w-5"
                    }
                  />
                </div>
              </div>
              <p
                className={
                  item.tone === "danger"
                    ? "text-sm text-danger"
                    : item.tone === "success"
                      ? "text-sm text-success"
                      : "text-sm text-foreground/60"
                }
              >
                {item.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
