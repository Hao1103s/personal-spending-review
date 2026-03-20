import type { AdaptedImportRow, RawImportRow } from "@/lib/types";

function getValue(row: RawImportRow, keys: string[]) {
  return keys.map((key) => row[key]).find((value) => value && value.trim())?.trim() ?? "";
}

function mapTransactionType(type: string) {
  const candidate = type.toLowerCase();
  if (candidate.includes("income") || candidate.includes("credit")) {
    return "income";
  }
  if (candidate.includes("refund")) {
    return "refund";
  }
  if (candidate.includes("transfer")) {
    return "transfer";
  }
  return "expense";
}

export function adaptGenericBankRow(row: RawImportRow): AdaptedImportRow | null {
  const rawTime = getValue(row, ["date", "transaction_date", "time"]);
  const rawMerchant = getValue(row, ["description", "merchant", "counterparty"]);
  const rawAmount = getValue(row, ["amount", "debit_amount"]);

  if (!rawTime || !rawMerchant || !rawAmount) {
    return null;
  }

  return {
    sourceType: "generic_bank_csv",
    sourceAccount: getValue(row, ["account", "card_no"]) || null,
    rawMerchant,
    merchant: getValue(row, ["merchant", "description"]) || rawMerchant,
    rawAmount,
    rawTime,
    transactionType: mapTransactionType(getValue(row, ["type", "transaction_type"])),
    note: getValue(row, ["memo", "category_hint"]) || null,
  };
}
