import type { AdaptedImportRow, RawImportRow } from "@/lib/types";

function getValue(row: RawImportRow, keys: string[]) {
  return keys.map((key) => row[key]).find((value) => value && value.trim())?.trim() ?? "";
}

function mapTransactionType(direction: string, status: string) {
  const normalized = `${direction}${status}`;
  if (normalized.includes("收入")) {
    return "income";
  }
  if (normalized.includes("退款")) {
    return "refund";
  }
  if (normalized.includes("转账")) {
    return "transfer";
  }
  return "expense";
}

export function adaptAlipayRow(row: RawImportRow): AdaptedImportRow | null {
  const rawTime = getValue(row, ["交易创建时间", "付款时间"]);
  const rawMerchant = getValue(row, ["交易对方", "对方名称", "商家名称"]);
  const merchant = getValue(row, ["商品说明", "商品名称", "备注"]);
  const rawAmount = getValue(row, ["金额（元）", "金额(元)", "订单金额（元）"]);
  const direction = getValue(row, ["收/支", "收支"]);
  const status = getValue(row, ["交易状态", "状态"]);

  if (!rawTime || !rawMerchant || !rawAmount) {
    return null;
  }

  if (status && !["交易成功", "支付成功", "SUCCESS", "已完成"].includes(status)) {
    return null;
  }

  return {
    sourceType: "alipay_csv",
    sourceAccount: getValue(row, ["资金渠道", "付款方式"]) || null,
    rawMerchant,
    merchant: rawMerchant,
    rawAmount,
    rawTime,
    transactionType: mapTransactionType(direction, status),
    note: merchant || getValue(row, ["备注", "商品说明"]) || null,
  };
}
