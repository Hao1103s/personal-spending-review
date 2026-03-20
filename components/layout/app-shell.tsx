"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, FileClock, Home, ReceiptText, Upload } from "lucide-react";

import { cn } from "@/lib/utils";

const navigation = [
  { href: "/", label: "看板", icon: Home },
  { href: "/transactions", label: "流水", icon: ReceiptText },
  { href: "/import", label: "导入", icon: Upload },
  { href: "/reports", label: "复盘", icon: FileClock },
];

export function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background bg-page-gradient">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 md:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-4 rounded-[32px] border border-border/70 bg-card/95 px-5 py-5 shadow-panel backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm uppercase tracking-[0.28em] text-foreground/45">
              <BarChart3 className="h-4 w-4" />
              消费整理与复盘
            </div>
            <p className="text-sm text-foreground/60">
              导入流水，自动分类，按月复盘你的真实消费结构。
            </p>
          </div>
          <nav className="flex flex-wrap gap-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-primary text-white"
                      : "bg-muted/75 text-foreground/75 hover:bg-muted",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
