"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

function CurrencyTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number; payload?: { color?: string } }>;
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

export function CategoryBarChartCard({
  data,
}: {
  data: Array<{ category: string; amount: number; color: string }>;
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>分类支出结构</CardTitle>
        <CardDescription>按本月累计支出排序，颜色在全局保持稳定。</CardDescription>
      </CardHeader>
      <CardContent className="h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 12, right: 12, top: 8 }}>
            <CartesianGrid horizontal={false} stroke="#e7dfd5" />
            <XAxis type="number" tickFormatter={(value) => `${Math.round(value / 100) / 10}k`} />
            <YAxis dataKey="category" type="category" width={56} tickLine={false} axisLine={false} />
            <Tooltip content={<CurrencyTooltip />} />
            <Bar dataKey="amount" radius={[0, 14, 14, 0]} fill="#1f4f46">
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

export function TrendChartCard({
  data,
}: {
  data: Array<{ label: string; amount: number }>;
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>最近 30 天趋势</CardTitle>
        <CardDescription>用于观察消费节奏，而不是只看一个月的静态总额。</CardDescription>
      </CardHeader>
      <CardContent className="h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 4, right: 18, top: 8 }}>
            <CartesianGrid vertical={false} stroke="#ece5dc" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={18} />
            <YAxis tickFormatter={(value) => `${Math.round(value)}`} tickLine={false} axisLine={false} />
            <Tooltip content={<CurrencyTooltip />} />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#b96839"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 4, fill: "#b96839" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
