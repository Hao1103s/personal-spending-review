import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
        <div className="text-lg font-semibold">{title}</div>
        <p className="max-w-md text-sm text-foreground/60">{description}</p>
        {action}
      </CardContent>
    </Card>
  );
}
