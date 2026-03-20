"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="zh-CN">
      <body className="bg-background">
        <div className="mx-auto flex min-h-screen max-w-xl items-center px-6">
          <Card className="w-full">
            <CardContent className="space-y-4 py-10 text-center">
              <div className="text-2xl font-semibold">页面加载失败</div>
              <p className="text-sm leading-6 text-foreground/60">
                可能是数据库尚未初始化，或者当前请求参数有问题。错误信息：{error.message}
              </p>
              <Button onClick={reset}>重试</Button>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  );
}
