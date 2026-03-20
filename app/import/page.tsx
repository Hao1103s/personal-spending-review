import { Download } from "lucide-react";
import Link from "next/link";

import { ImportBatches } from "@/components/import/import-batches";
import { ImportUploader } from "@/components/import/import-uploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageShell } from "@/components/ui/page-shell";
import { prisma } from "@/lib/db";

export default async function ImportPage() {
  const batches = await prisma.importBatch.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <PageShell
      title="导入流水"
      description="导入模式使用独立 adapter，把不同来源的原始字段转成统一结构后再入库。"
      actions={
        <Button variant="outline" asChild>
          <Link href="/sample-data/wechat_sample.csv">
            <Download className="h-4 w-4" />
            样例文件
          </Link>
        </Button>
      }
    >
      <div className="grid gap-4 xl:grid-cols-[1fr_1.05fr]">
        <ImportUploader />
        <Card>
          <CardHeader>
            <CardTitle>导入说明</CardTitle>
            <CardDescription>第一版支持三种模式，每种模式都在 `lib/import/adapters` 下独立实现。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-foreground/70">
            <p>`wechat_csv`：读取交易时间、交易对方、商品、收支方向、金额和状态。</p>
            <p>`alipay_csv`：读取创建时间、交易对方、商品说明、金额、收支方向和状态。</p>
            <p>`generic_bank_csv`：读取 date、description、amount、type、account 等通用字段。</p>
            <p>导入时会执行时间解析、金额标准化、消费过滤、哈希去重和规则分类。</p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/sample-data/wechat_sample.csv">微信样例</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/sample-data/alipay_sample.csv">支付宝样例</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/sample-data/generic_bank_sample.csv">银行卡样例</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <ImportBatches batches={batches} />
    </PageShell>
  );
}
