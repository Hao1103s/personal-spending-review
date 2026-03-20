import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { CATEGORIES, SOURCE_TYPE_LABELS } from "@/lib/types";

export function TransactionFilters({
  query,
}: {
  query: {
    category?: string;
    sourceType?: string;
    keyword?: string;
    amountMin?: number;
    amountMax?: number;
    startDate?: string;
    endDate?: string;
  };
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <div className="space-y-2 xl:col-span-2">
            <Label htmlFor="keyword">搜索</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/35" />
              <Input
                id="keyword"
                name="keyword"
                placeholder="商户 / 原始商户 / 备注"
                defaultValue={query.keyword}
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">分类</Label>
            <Select id="category" name="category" defaultValue={query.category}>
              <option value="">全部分类</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sourceType">来源</Label>
            <Select id="sourceType" name="sourceType" defaultValue={query.sourceType}>
              <option value="">全部来源</option>
              {Object.entries(SOURCE_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="startDate">开始时间</Label>
            <Input id="startDate" type="date" name="startDate" defaultValue={query.startDate} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">结束时间</Label>
            <Input id="endDate" type="date" name="endDate" defaultValue={query.endDate} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amountMin">最低金额</Label>
            <Input
              id="amountMin"
              type="number"
              step="0.01"
              name="amountMin"
              defaultValue={query.amountMin}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amountMax">最高金额</Label>
            <Input
              id="amountMax"
              type="number"
              step="0.01"
              name="amountMax"
              defaultValue={query.amountMax}
            />
          </div>
          <div className="flex items-end gap-3 xl:col-span-2">
            <Button type="submit">应用筛选</Button>
            <Button variant="ghost" asChild>
              <a href="/transactions">清空</a>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
