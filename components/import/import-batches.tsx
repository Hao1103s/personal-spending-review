import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SOURCE_TYPE_LABELS } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export function ImportBatches({
  batches,
}: {
  batches: Array<{
    id: string;
    sourceType: keyof typeof SOURCE_TYPE_LABELS;
    fileName: string;
    totalRows: number;
    importedRows: number;
    dedupedRows: number;
    pendingCategoryRows: number;
    createdAt: Date;
  }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>最近导入批次</CardTitle>
        <CardDescription>可快速检查导入效果和待确认分类数量。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {batches.length === 0 ? (
          <div className="rounded-3xl bg-muted/55 px-4 py-8 text-sm text-foreground/60">
            还没有导入批次，先上传一份 CSV。
          </div>
        ) : (
          batches.map((batch) => (
            <div
              key={batch.id}
              className="grid gap-3 rounded-3xl bg-muted/55 px-4 py-4 md:grid-cols-[1.4fr_1fr_1fr_1fr_auto]"
            >
              <div>
                <div className="font-medium">{batch.fileName}</div>
                <div className="mt-1 text-sm text-foreground/55">{formatDateTime(batch.createdAt)}</div>
              </div>
              <div className="text-sm">
                <div className="text-foreground/45">来源</div>
                <div>{SOURCE_TYPE_LABELS[batch.sourceType]}</div>
              </div>
              <div className="text-sm">
                <div className="text-foreground/45">导入 / 总数</div>
                <div>
                  {batch.importedRows} / {batch.totalRows}
                </div>
              </div>
              <div className="text-sm">
                <div className="text-foreground/45">去重</div>
                <div>{batch.dedupedRows}</div>
              </div>
              <div className="flex items-start justify-end">
                <Badge variant={batch.pendingCategoryRows > 0 ? "warning" : "success"}>
                  待确认 {batch.pendingCategoryRows}
                </Badge>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
