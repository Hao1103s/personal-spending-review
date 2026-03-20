import { format } from "date-fns";

import { EmptyState } from "@/components/ui/empty-state";
import { PageShell } from "@/components/ui/page-shell";
import { Pagination } from "@/components/transactions/pagination";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TransactionsList } from "@/components/transactions/transaction-list";
import { transactionsQuerySchema, getTransactions } from "@/lib/transactions";
import { formatDateTime } from "@/lib/utils";

function toSearchParamRecord(searchParams: Record<string, string | string[] | undefined>) {
  return Object.fromEntries(
    Object.entries(searchParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawSearchParams = await searchParams;
  const normalizedSearchParams = toSearchParamRecord(rawSearchParams);
  const query = transactionsQuerySchema.parse(normalizedSearchParams);
  const result = await getTransactions(query);

  return (
    <PageShell
      title="流水列表"
      description="按天分组查看消费流水，支持搜索、筛选和分类纠正。手动纠正后会写入 merchant memory。"
    >
      <TransactionFilters query={query} />
      {result.transactions.length === 0 ? (
        <EmptyState
          title="没有匹配的流水"
          description="你可以调整筛选条件，或者先去导入页导入一批流水。"
        />
      ) : (
        <>
          <TransactionsList
            transactions={result.transactions.map((item) => ({
              ...item,
              transactionDay: format(item.transactionTime, "yyyy-MM-dd"),
              transactionTimeLabel: formatDateTime(item.transactionTime),
            }))}
          />
          <Pagination
            pathname="/transactions"
            searchParams={normalizedSearchParams}
            page={result.page}
            pageCount={result.pageCount}
          />
        </>
      )}
    </PageShell>
  );
}
