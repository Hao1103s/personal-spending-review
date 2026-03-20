import { NextResponse } from "next/server";
import { format } from "date-fns";
import { z } from "zod";

import { getMonthlyReport } from "@/lib/analytics/report";

const monthlyReportSchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .default(format(new Date(), "yyyy-MM")),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { month } = monthlyReportSchema.parse(Object.fromEntries(searchParams.entries()));
  const report = await getMonthlyReport(month);

  return NextResponse.json(report);
}
