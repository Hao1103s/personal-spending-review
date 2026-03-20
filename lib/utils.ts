import { clsx, type ClassValue } from "clsx";
import { format, parse } from "date-fns";
import { zhCN } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function coerceDate(value: Date | string) {
  if (value instanceof Date) {
    return value;
  }

  if (/^\d{4}-\d{2}$/.test(value)) {
    return parse(`${value}-01`, "yyyy-MM-dd", new Date());
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return parse(value, "yyyy-MM-dd", new Date());
  }

  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
    return parse(value, "yyyy-MM-dd HH:mm:ss", new Date());
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(value)) {
    return parse(value, "yyyy-MM-dd'T'HH:mm:ss", new Date());
  }

  return new Date(value);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export function formatDateTime(date: Date | string) {
  return format(coerceDate(date), "M月d日 HH:mm", { locale: zhCN });
}

export function formatDayLabel(date: Date | string) {
  return format(coerceDate(date), "M月d日 EEEE", { locale: zhCN });
}

export function formatMonthLabel(date: Date | string) {
  return format(coerceDate(date), "yyyy年M月", { locale: zhCN });
}

export function formatMonthInputValue(date: Date) {
  return format(date, "yyyy-MM");
}

export function toTitleCase(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/(^|\s)\S/g, (match) => match.toUpperCase());
}
