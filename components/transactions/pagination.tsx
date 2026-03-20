import Link from "next/link";

import { Button } from "@/components/ui/button";

function buildHref(
  pathname: string,
  searchParams: Record<string, string | undefined>,
  page: number,
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...searchParams, page: String(page) })) {
    if (value) {
      params.set(key, value);
    }
  }

  return `${pathname}?${params.toString()}`;
}

export function Pagination({
  pathname,
  searchParams,
  page,
  pageCount,
}: {
  pathname: string;
  searchParams: Record<string, string | undefined>;
  page: number;
  pageCount: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-[28px] bg-muted/50 px-4 py-4">
      <div className="text-sm text-foreground/55">
        第 {page} / {pageCount} 页
      </div>
      <div className="flex gap-3">
        {page <= 1 ? (
          <Button variant="outline" disabled>
            上一页
          </Button>
        ) : (
          <Button variant="outline" asChild>
            <Link href={buildHref(pathname, searchParams, page - 1)}>上一页</Link>
          </Button>
        )}
        {page >= pageCount ? (
          <Button variant="outline" disabled>
            下一页
          </Button>
        ) : (
          <Button variant="outline" asChild>
            <Link href={buildHref(pathname, searchParams, page + 1)}>下一页</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
