import { NextResponse } from "next/server";
import { z } from "zod";

import { upsertMerchantMemory } from "@/lib/classify/engine";
import { prisma } from "@/lib/db";
import { CATEGORIES, type CategoryName } from "@/lib/types";

const updateTransactionSchema = z.object({
  merchant: z.string().trim().min(1).max(120).optional(),
  category: z.enum(CATEGORIES).optional(),
  note: z.string().max(500).optional().nullable(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = updateTransactionSchema.parse(await request.json());
    const existing = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "交易不存在" }, { status: 404 });
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        merchant: body.merchant ?? existing.merchant,
        category: body.category ?? existing.category,
        note: body.note === undefined ? existing.note : body.note,
        categoryStatus: body.category ? "confirmed" : existing.categoryStatus,
        categoryConfidence: body.category ? 1 : existing.categoryConfidence,
      },
    });

    if (body.category || body.merchant) {
      const nextCategory: CategoryName =
        body.category ??
        (CATEGORIES.includes(existing.category as CategoryName)
          ? (existing.category as CategoryName)
          : "其他");

      await upsertMerchantMemory(
        prisma,
        body.merchant ?? existing.merchant,
        nextCategory,
      );
    }

    return NextResponse.json({
      transaction: {
        ...updated,
        amount: Number(updated.amount),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "更新失败",
      },
      { status: 400 },
    );
  }
}
