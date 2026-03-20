"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2, PencilLine } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  CATEGORIES,
  CATEGORY_STATUS_LABELS,
  SOURCE_TYPE_LABELS,
  type CategoryName,
} from "@/lib/types";
import { formatCurrency, formatDayLabel } from "@/lib/utils";

type TransactionRecord = {
  id: string;
  merchant: string;
  rawMerchant: string;
  amount: number;
  category: CategoryName | string;
  categoryStatus: "confirmed" | "auto" | "pending";
  note: string | null;
  sourceType: keyof typeof SOURCE_TYPE_LABELS;
  transactionDay: string;
  transactionTimeLabel: string;
};

function statusVariant(status: TransactionRecord["categoryStatus"]) {
  if (status === "confirmed") {
    return "success" as const;
  }
  if (status === "pending") {
    return "warning" as const;
  }
  return "default" as const;
}

export function TransactionsList({
  transactions,
}: {
  transactions: TransactionRecord[];
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { merchant: string; category: string; note: string }>>(
    {},
  );

  const grouped = useMemo(() => {
    return transactions.reduce<Record<string, TransactionRecord[]>>((acc, transaction) => {
      const key = transaction.transactionDay;
      acc[key] = acc[key] ?? [];
      acc[key].push(transaction);
      return acc;
    }, {});
  }, [transactions]);

  function getDraft(transaction: TransactionRecord) {
    return (
      drafts[transaction.id] ?? {
        merchant: transaction.merchant,
        category: transaction.category,
        note: transaction.note ?? "",
      }
    );
  }

  async function handleSave(transaction: TransactionRecord) {
    const draft = getDraft(transaction);
    const response = await fetch(`/api/transactions/${transaction.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        merchant: draft.merchant,
        category: draft.category,
        note: draft.note,
      }),
    });

    if (!response.ok) {
      const payload = await response.json();
      throw new Error(payload.error ?? "保存失败");
    }

    setEditingId(null);
    setSaveError(null);
    router.refresh();
  }

  return (
    <div className="space-y-5">
      {saveError ? (
        <div className="rounded-3xl border border-danger/20 bg-danger/5 px-4 py-4 text-sm text-danger">
          {saveError}
        </div>
      ) : null}
      {Object.entries(grouped).map(([dateKey, items]) => {
        const dayTotal = items.reduce((sum, item) => sum + item.amount, 0);

        return (
          <section key={dateKey} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">{formatDayLabel(`${dateKey}T00:00:00`)}</div>
              <div className="text-sm text-foreground/55">日支出 {formatCurrency(dayTotal)}</div>
            </div>
            <div className="space-y-3">
              {items.map((transaction) => {
                const draft = getDraft(transaction);
                const isEditing = editingId === transaction.id;

                return (
                  <Card key={transaction.id}>
                    <CardContent className="space-y-4 py-5">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="text-lg font-medium">{transaction.merchant}</div>
                            <Badge variant={statusVariant(transaction.categoryStatus)}>
                              {CATEGORY_STATUS_LABELS[transaction.categoryStatus]}
                            </Badge>
                            <Badge variant="outline">{transaction.category}</Badge>
                          </div>
                          <div className="flex flex-wrap gap-3 text-sm text-foreground/55">
                            <span>原始商户：{transaction.rawMerchant}</span>
                            <span>{SOURCE_TYPE_LABELS[transaction.sourceType]}</span>
                            <span>{transaction.transactionTimeLabel}</span>
                          </div>
                          {transaction.note ? (
                            <p className="text-sm text-foreground/65">备注：{transaction.note}</p>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-2xl font-semibold">{formatCurrency(transaction.amount)}</div>
                            <div className="text-sm text-foreground/50">支出</div>
                          </div>
                          <Button
                            variant="outline"
                            onClick={() =>
                              setEditingId((current) =>
                                current === transaction.id ? null : transaction.id,
                              )
                            }
                          >
                            <PencilLine className="h-4 w-4" />
                            编辑
                          </Button>
                        </div>
                      </div>

                      {isEditing ? (
                        <div className="grid gap-4 rounded-[28px] bg-muted/50 p-4 md:grid-cols-3">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">商户名</label>
                            <Input
                              value={draft.merchant}
                              onChange={(event) =>
                                setDrafts((current) => ({
                                  ...current,
                                  [transaction.id]: { ...draft, merchant: event.target.value },
                                }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">分类</label>
                            <Select
                              value={draft.category}
                              onChange={(event) =>
                                setDrafts((current) => ({
                                  ...current,
                                  [transaction.id]: { ...draft, category: event.target.value },
                                }))
                              }
                            >
                              {CATEGORIES.map((category) => (
                                <option key={category} value={category}>
                                  {category}
                                </option>
                              ))}
                            </Select>
                          </div>
                          <div className="space-y-2 md:col-span-3">
                            <label className="text-sm font-medium">备注</label>
                            <Textarea
                              value={draft.note}
                              onChange={(event) =>
                                setDrafts((current) => ({
                                  ...current,
                                  [transaction.id]: { ...draft, note: event.target.value },
                                }))
                              }
                            />
                          </div>
                          <div className="flex gap-3 md:col-span-3">
                            <Button
                              onClick={() =>
                                startTransition(async () => {
                                  try {
                                    await handleSave(transaction);
                                  } catch (error) {
                                    setSaveError(
                                      error instanceof Error ? error.message : "保存失败，请稍后重试",
                                    );
                                  }
                                })
                              }
                              disabled={isPending}
                            >
                              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                              保存修改
                            </Button>
                            <Button variant="ghost" onClick={() => setEditingId(null)}>
                              收起
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
