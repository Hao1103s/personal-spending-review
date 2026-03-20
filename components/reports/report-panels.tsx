"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/utils";

function TooltipCard({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-panel">
      <div className="mb-1 text-xs text-foreground/55">{label}</div>
      <div className="text-sm font-semibold">{formatCurrency(payload[0]?.value ?? 0)}</div>
    </div>
  );
}

export function ReportOverview({
  totalExpense,
  changePercent,
  topCategories,
  topMerchant,
  highestSpendDay,
}: {
  totalExpense: number;
  changePercent: number;
  topCategories: Array<{ category: string; amount: number }>;
  topMerchant: { merchant: string; amount: number } | null;
  highestSpendDay: { day: string; amount: number } | null;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-4">
      <Card>
        <CardHeader className="border-b-0 pb-0">
          <CardDescription>本月总支出</CardDescription>
        </CardHeader>
        <CardContent className="pt-4 text-3xl font-semibold">{formatCurrency(totalExpense)}</CardContent>
      </Card>
      <Card>
        <CardHeader className="border-b-0 pb-0">
          <CardDescription>与上月对比</CardDescription>
        </CardHeader>
        <CardContent
          className={changePercent > 0 ? "pt-4 text-3xl font-semibold text-danger" : "pt-4 text-3xl font-semibold text-success"}
        >
          {formatPercent(changePercent)}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="border-b-0 pb-0">
          <CardDescription>前三大分类</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 pt-4">
          {topCategories.map((item) => (
            <Badge key={item.category} variant="outline">
              {item.category} {formatCurrency(item.amount)}
            </Badge>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="border-b-0 pb-0">
          <CardDescription>花钱最多商户 / 最高消费日</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 pt-4 text-sm">
          <div>{topMerchant ? `${topMerchant.merchant} · ${formatCurrency(topMerchant.amount)}` : "暂无数据"}</div>
          <div>
            {highestSpendDay
              ? `${new Date(highestSpendDay.day).getMonth() + 1}月${new Date(highestSpendDay.day).getDate()}日 · ${formatCurrency(highestSpendDay.amount)}`
              : "暂无数据"}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function CategoryBreakdownChart({
  data,
}: {
  data: Array<{ category: string; amount: number; color: string }>;
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>分类拆解</CardTitle>
        <CardDescription>本月每个一级分类的金额分布。</CardDescription>
      </CardHeader>
      <CardContent className="h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#ece5dc" />
            <XAxis dataKey="category" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
            <Tooltip content={<TooltipCard />} />
            <Bar dataKey="amount" radius={[14, 14, 0, 0]} fill="#1f4f46">
              {data.map((entry) => (
                <Cell key={entry.category} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function MerchantBreakdown({
  data,
}: {
  data: Array<{ merchant: string; amount: number }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>商户拆解</CardTitle>
        <CardDescription>按本月累计支出排序的前 8 个商户。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.length === 0 ? (
          <div className="rounded-3xl bg-muted/55 px-4 py-8 text-sm text-foreground/60">
            这个月还没有足够的商户数据。
          </div>
        ) : (
          data.map((item, index) => (
            <div
              key={item.merchant}
              className="flex items-center justify-between rounded-3xl bg-muted/55 px-4 py-4"
            >
              <div>
                <div className="font-medium">
                  {index + 1}. {item.merchant}
                </div>
              </div>
              <div className="text-sm font-medium">{formatCurrency(item.amount)}</div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function ReportInsights({
  insights,
}: {
  insights: string[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>自动总结</CardTitle>
        <CardDescription>总结只基于当前数据库里的真实聚合结果生成。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.length === 0 ? (
          <div className="rounded-3xl bg-muted/55 px-4 py-8 text-sm text-foreground/60">
            当前月份没有足够的数据生成总结。
          </div>
        ) : (
          insights.map((insight, index) => (
            <div key={insight} className="rounded-3xl bg-muted/55 px-4 py-4 text-sm leading-6">
              <span className="mr-2 font-semibold">{index + 1}.</span>
              {insight}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
