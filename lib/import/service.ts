import Papa from "papaparse";
import { z } from "zod";

import { classifyMerchantWithDb } from "@/lib/classify/engine";
import { prisma } from "@/lib/db";
import { ADAPTERS } from "@/lib/import/adapters";
import { dedupeCandidates } from "@/lib/import/dedup";
import { normalizeAdaptedRow } from "@/lib/import/normalize";
import type { ImportResultSummary, RawImportRow } from "@/lib/types";

export const importSourceSchema = z.enum([
  "wechat_csv",
  "alipay_csv",
  "generic_bank_csv",
]);

export async function importCsvBatch(params: {
  fileName: string;
  sourceType: z.infer<typeof importSourceSchema>;
  content: string;
}): Promise<ImportResultSummary> {
  const parsedSourceType = importSourceSchema.parse(params.sourceType);
  const adapter = ADAPTERS[parsedSourceType];
  const parsedCsv = Papa.parse<RawImportRow>(params.content, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsedCsv.errors.length > 0) {
    throw new Error(parsedCsv.errors[0]?.message ?? "CSV 解析失败");
  }

  const totalRows = parsedCsv.data.length;
  const normalized = parsedCsv.data
    .map((row) => adapter(row))
    .filter((row): row is NonNullable<typeof row> => Boolean(row))
    .map((row) => normalizeAdaptedRow(row))
    .filter((row): row is NonNullable<typeof row> => Boolean(row));

  const existingKeys = new Set(
    (
      await prisma.transaction.findMany({
        where: { dedupKey: { in: normalized.map((item) => item.dedupKey) } },
        select: { dedupKey: true },
      })
    ).map((item) => item.dedupKey),
  );

  const { unique, dedupedRows } = dedupeCandidates(normalized, existingKeys);
  const classified = await Promise.all(
    unique.map(async (row) => {
      const classification = await classifyMerchantWithDb(prisma, row.merchant);

      return {
        ...row,
        category: classification.category,
        categoryConfidence: classification.confidence,
        categoryStatus: classification.status,
      };
    }),
  );

  const pendingCategoryRows = classified.filter((item) => item.categoryStatus === "pending").length;

  const batch = await prisma.importBatch.create({
    data: {
      sourceType: parsedSourceType,
      fileName: params.fileName,
      totalRows,
      importedRows: classified.length,
      dedupedRows,
      pendingCategoryRows,
    },
  });

  if (classified.length > 0) {
    await prisma.transaction.createMany({
      data: classified.map((item) => ({
        sourceType: item.sourceType,
        sourceAccount: item.sourceAccount ?? null,
        rawMerchant: item.rawMerchant,
        merchant: item.merchant,
        amount: item.amount,
        transactionTime: item.transactionTime,
        transactionType: item.transactionType,
        category: item.category,
        categoryConfidence: item.categoryConfidence,
        categoryStatus: item.categoryStatus,
        note: item.note ?? null,
        importBatchId: batch.id,
        dedupKey: item.dedupKey,
      })),
    });
  }

  return {
    totalRows,
    importedRows: classified.length,
    dedupedRows,
    pendingCategoryRows,
    batchId: batch.id,
  };
}
