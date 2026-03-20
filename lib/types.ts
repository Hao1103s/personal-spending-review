import type { CategoryStatus, MatchType, SourceType, TransactionType } from "@prisma/client";

export const CATEGORIES = [
  "餐饮",
  "出行",
  "住房",
  "购物",
  "娱乐",
  "医疗",
  "学习",
  "社交",
  "订阅",
  "其他",
] as const;

export type CategoryName = (typeof CATEGORIES)[number];

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  wechat_csv: "微信账单",
  alipay_csv: "支付宝账单",
  generic_bank_csv: "银行卡流水",
};

export const CATEGORY_LABELS: Record<CategoryName, string> = {
  餐饮: "餐饮",
  出行: "出行",
  住房: "住房",
  购物: "购物",
  娱乐: "娱乐",
  医疗: "医疗",
  学习: "学习",
  社交: "社交",
  订阅: "订阅",
  其他: "其他",
};

export const CATEGORY_COLORS: Record<CategoryName, string> = {
  餐饮: "#c06b37",
  出行: "#3d7a7a",
  住房: "#7666b1",
  购物: "#b54867",
  娱乐: "#7a8441",
  医疗: "#5a95c8",
  学习: "#b38b3f",
  社交: "#c0563a",
  订阅: "#4e5bc3",
  其他: "#7e7c75",
};

export const CATEGORY_STATUS_LABELS: Record<CategoryStatus, string> = {
  confirmed: "已确认",
  auto: "自动分类",
  pending: "待确认",
};

export const MATCH_TYPE_LABELS: Record<MatchType, string> = {
  exact: "精确匹配",
  contains: "关键词",
  regex: "正则",
};

export type NormalizedCandidate = {
  sourceType: SourceType;
  sourceAccount?: string | null;
  rawMerchant: string;
  merchant: string;
  amount: number;
  transactionTime: Date;
  transactionType: TransactionType;
  dedupKey: string;
  note?: string | null;
  metadata?: Record<string, string | number | null>;
};

export type ClassificationResult = {
  category: CategoryName;
  confidence: number;
  status: CategoryStatus;
  reason: string;
};

export type RawImportRow = Record<string, string>;

export type AdaptedImportRow = {
  sourceType: SourceType;
  sourceAccount?: string | null;
  rawMerchant: string;
  merchant: string;
  rawAmount: string;
  rawTime: string;
  transactionType: TransactionType;
  note?: string | null;
};

export type ImportResultSummary = {
  totalRows: number;
  importedRows: number;
  dedupedRows: number;
  pendingCategoryRows: number;
  batchId: string;
};
