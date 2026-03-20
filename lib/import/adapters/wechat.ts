import type { AdaptedImportRow, RawImportRow } from "@/lib/types";

function getValue(row: RawImportRow, keys: string[]) {
  return keys.map((key) => row[key]).find((value) => value && value.trim())?.trim() ?? "";
}

function mapTransactionType(direction: string, tradeType: string) {
  const normalized = `${direction}${tradeType}`;
  if (normalized.includes("收入")) {
    return "income";
  }
  if (normalized.includes("转账")) {
    return "transfer";
  }
  if (normalized.includes("退款")) {
    return "refund";
  }
  return "expense";
}

export function adaptWeChatRow(row: RawImportRow): AdaptedImportRow | null {
  const rawTime = getValue(row, ["交易时间", "记账时间"]);
  const rawMerchant = getValue(row, ["交易对方", "商户", "交易对方(商户)"]);
  const merchant = getValue(row, ["商品", "商品说明", "交易对方", "商户"]);
  const rawAmount = getValue(row, ["金额(元)", "金额"]);
  const direction = getValue(row, ["收/支", "收支类型"]);
  const tradeType = getValue(row, ["交易类型"]);
  const status = getValue(row, ["当前状态", "交易状态"]);

  if (!rawTime || !rawMerchant || !rawAmount) {
    return null;
  }

  if (status && !["支付成功", "已完成", "SUCCESS"].includes(status)) {
    return null;
  }

  return {
    sourceType: "wechat_csv",
    sourceAccount: getValue(row, ["支付方式", "扣款账户"]) || null,
    rawMerchant,
    merchant: rawMerchant,
    rawAmount,
    rawTime,
    transactionType: mapTransactionType(direction, tradeType),
    note: merchant || getValue(row, ["备注", "资金状态"]) || null,
  };
}
