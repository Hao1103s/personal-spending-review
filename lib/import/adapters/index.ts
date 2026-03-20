import type { SourceType } from "@prisma/client";

import type { AdaptedImportRow, RawImportRow } from "@/lib/types";

import { adaptAlipayRow } from "./alipay";
import { adaptGenericBankRow } from "./genericBank";
import { adaptWeChatRow } from "./wechat";

export type ImportAdapter = (row: RawImportRow) => AdaptedImportRow | null;

export const ADAPTERS: Record<SourceType, ImportAdapter> = {
  wechat_csv: adaptWeChatRow,
  alipay_csv: adaptAlipayRow,
  generic_bank_csv: adaptGenericBankRow,
};
