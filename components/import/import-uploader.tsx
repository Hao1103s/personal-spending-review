"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileUp, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

type ImportSummary = {
  totalRows: number;
  importedRows: number;
  dedupedRows: number;
  pendingCategoryRows: number;
  batchId: string;
};

const sourceOptions = [
  { value: "wechat_csv", label: "微信 CSV" },
  { value: "alipay_csv", label: "支付宝 CSV" },
  { value: "generic_bank_csv", label: "银行卡 CSV" },
] as const;

export function ImportUploader() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [sourceType, setSourceType] = useState<(typeof sourceOptions)[number]["value"]>("wechat_csv");
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSummary(null);

    const response = await fetch("/api/import", {
      method: "POST",
      body: formData,
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error ?? "导入失败");
    }

    setSummary(payload);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>上传流水 CSV</CardTitle>
        <CardDescription>先选来源，再上传文件。系统会自动清洗、去重和分类。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            startTransition(async () => {
              try {
                await handleSubmit(formData);
              } catch (submitError) {
                setError(submitError instanceof Error ? submitError.message : "导入失败");
              }
            });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="sourceType">导入模式</Label>
            <Select
              id="sourceType"
              name="sourceType"
              value={sourceType}
              onChange={(event) => setSourceType(event.target.value as typeof sourceType)}
            >
              {sourceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">CSV 文件</Label>
            <label
              htmlFor="file"
              className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[28px] border border-dashed border-border bg-muted/50 px-6 py-10 text-center"
            >
              <FileUp className="h-8 w-8 text-foreground/55" />
              <div>
                <div className="font-medium">点击选择 CSV 文件</div>
                <div className="text-sm text-foreground/55">
                  推荐先用 `sample-data` 目录中的样例文件验证流程
                </div>
              </div>
              <input
                id="file"
                name="file"
                type="file"
                accept=".csv"
                required
                className="hidden"
              />
            </label>
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                正在导入
              </>
            ) : (
              "开始导入"
            )}
          </Button>
        </form>

        {error ? (
          <div className="rounded-3xl border border-danger/20 bg-danger/5 px-4 py-4 text-sm text-danger">
            {error}
          </div>
        ) : null}

        {summary ? (
          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-3xl bg-muted/55 px-4 py-4">
              <div className="text-xs uppercase tracking-[0.18em] text-foreground/45">总记录数</div>
              <div className="mt-2 text-2xl font-semibold">{summary.totalRows}</div>
            </div>
            <div className="rounded-3xl bg-muted/55 px-4 py-4">
              <div className="text-xs uppercase tracking-[0.18em] text-foreground/45">成功导入</div>
              <div className="mt-2 text-2xl font-semibold">{summary.importedRows}</div>
            </div>
            <div className="rounded-3xl bg-muted/55 px-4 py-4">
              <div className="text-xs uppercase tracking-[0.18em] text-foreground/45">去重数</div>
              <div className="mt-2 text-2xl font-semibold">{summary.dedupedRows}</div>
            </div>
            <div className="rounded-3xl bg-muted/55 px-4 py-4">
              <div className="text-xs uppercase tracking-[0.18em] text-foreground/45">待确认分类</div>
              <div className="mt-2 text-2xl font-semibold">{summary.pendingCategoryRows}</div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
