import { NextResponse } from "next/server";

import { getTransactions, transactionsQuerySchema } from "@/lib/transactions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = transactionsQuerySchema.parse(Object.fromEntries(searchParams.entries()));
  const result = await getTransactions(query);

  return NextResponse.json(result);
}
