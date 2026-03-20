import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { importCsvBatch, importSourceSchema } from "@/lib/import/service";

export async function GET() {
  const batches = await prisma.importBatch.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return NextResponse.json({ batches });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const sourceType = importSourceSchema.parse(formData.get("sourceType"));
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "请上传 CSV 文件" }, { status: 400 });
    }

    const content = await file.text();
    const summary = await importCsvBatch({
      fileName: file.name,
      sourceType,
      content,
    });

    return NextResponse.json(summary);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "导入失败",
      },
      { status: 400 },
    );
  }
}
