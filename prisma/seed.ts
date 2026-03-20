import { Prisma } from "@prisma/client";
import { addDays, format, startOfMonth, subMonths, subDays } from "date-fns";

import { prisma } from "../lib/db";
import { SYSTEM_CATEGORY_RULES } from "../lib/classify/rules";
import { buildDedupKey } from "../lib/import/dedup";

const sourceTypes = ["wechat_csv", "alipay_csv", "generic_bank_csv"] as const;

function amount(value: number) {
  return new Prisma.Decimal(value.toFixed(2));
}

async function main() {
  await prisma.transaction.deleteMany();
  await prisma.importBatch.deleteMany();
  await prisma.categoryRule.deleteMany();
  await prisma.merchantMemory.deleteMany();

  await prisma.categoryRule.createMany({
    data: SYSTEM_CATEGORY_RULES.map((rule) => ({
      ...rule,
      isSystem: true,
    })),
  });

  const batchMap = {
    wechat_csv: await prisma.importBatch.create({
      data: {
        sourceType: "wechat_csv",
        fileName: "seed_wechat.csv",
        totalRows: 0,
        importedRows: 0,
        dedupedRows: 0,
        pendingCategoryRows: 0,
      },
    }),
    alipay_csv: await prisma.importBatch.create({
      data: {
        sourceType: "alipay_csv",
        fileName: "seed_alipay.csv",
        totalRows: 0,
        importedRows: 0,
        dedupedRows: 0,
        pendingCategoryRows: 0,
      },
    }),
    generic_bank_csv: await prisma.importBatch.create({
      data: {
        sourceType: "generic_bank_csv",
        fileName: "seed_bank.csv",
        totalRows: 0,
        importedRows: 0,
        dedupedRows: 0,
        pendingCategoryRows: 0,
      },
    }),
  };

  const transactions: Prisma.TransactionCreateManyInput[] = [];
  const currentMonthStart = startOfMonth(new Date());
  const previousMonthStart = startOfMonth(subMonths(new Date(), 1));

  for (let i = 0; i < 70; i += 1) {
    const day = subDays(new Date(), i);
    const sourceType = sourceTypes[i % sourceTypes.length];
    const importBatchId = batchMap[sourceType].id;

    const coffeeCount = i < 30 ? 1 + (i % 2) : i % 3 === 0 ? 1 : 0;
    for (let c = 0; c < coffeeCount; c += 1) {
      const rawTime = `${format(day, "yyyy-MM-dd")} ${String(8 + c).padStart(2, "0")}:25:00`;
      const merchant = "瑞幸咖啡";
      const rawAmount = (18 + (i % 4) * 2).toFixed(2);
      transactions.push({
        sourceType,
        sourceAccount: sourceType === "generic_bank_csv" ? "招商银行储蓄卡" : "零钱",
        rawMerchant: merchant,
        merchant,
        amount: amount(Number(rawAmount)),
        transactionTime: new Date(rawTime),
        transactionType: "expense",
        category: "餐饮",
        categoryConfidence: 0.92,
        categoryStatus: "auto",
        note: "seed coffee",
        importBatchId,
        dedupKey: buildDedupKey({ sourceType, rawTime, rawMerchant: merchant, rawAmount }),
      });
    }

    if (i % 2 === 0) {
      const rawTime = `${format(day, "yyyy-MM-dd")} 12:30:00`;
      const merchant = i % 6 === 0 ? "海底捞" : "美团外卖";
      const rawAmount = (32 + (i % 5) * 9).toFixed(2);
      transactions.push({
        sourceType,
        sourceAccount: "零钱",
        rawMerchant: merchant,
        merchant,
        amount: amount(Number(rawAmount)),
        transactionTime: new Date(rawTime),
        transactionType: "expense",
        category: "餐饮",
        categoryConfidence: 0.89,
        categoryStatus: "auto",
        note: null,
        importBatchId,
        dedupKey: buildDedupKey({ sourceType, rawTime, rawMerchant: merchant, rawAmount }),
      });
    }

    if (i % 3 === 0) {
      const rawTime = `${format(day, "yyyy-MM-dd")} 18:40:00`;
      const merchant = i % 4 === 0 ? "滴滴出行" : "地铁出行";
      const rawAmount = (9 + (i % 4) * 8).toFixed(2);
      transactions.push({
        sourceType,
        sourceAccount: "支付宝余额",
        rawMerchant: merchant,
        merchant,
        amount: amount(Number(rawAmount)),
        transactionTime: new Date(rawTime),
        transactionType: "expense",
        category: "出行",
        categoryConfidence: 0.86,
        categoryStatus: "auto",
        note: null,
        importBatchId,
        dedupKey: buildDedupKey({ sourceType, rawTime, rawMerchant: merchant, rawAmount }),
      });
    }

    if (i % 7 === 0) {
      const rawTime = `${format(day, "yyyy-MM-dd")} 20:20:00`;
      const merchant = i % 14 === 0 ? "万达影城" : "Switch 游戏";
      const rawAmount = (49 + (i % 3) * 35).toFixed(2);
      transactions.push({
        sourceType,
        sourceAccount: "花呗",
        rawMerchant: merchant,
        merchant,
        amount: amount(Number(rawAmount)),
        transactionTime: new Date(rawTime),
        transactionType: "expense",
        category: "娱乐",
        categoryConfidence: 0.82,
        categoryStatus: "auto",
        note: null,
        importBatchId,
        dedupKey: buildDedupKey({ sourceType, rawTime, rawMerchant: merchant, rawAmount }),
      });
    }
  }

  for (const monthStart of [previousMonthStart, currentMonthStart]) {
    const rentTime = addDays(monthStart, 1);
    const sourceType = "generic_bank_csv";
    const merchant = "房租";
    const rawTime = `${format(rentTime, "yyyy-MM-dd")} 09:00:00`;
    const rawAmount = "3600.00";
    transactions.push({
      sourceType,
      sourceAccount: "招商银行储蓄卡",
      rawMerchant: merchant,
      merchant,
      amount: amount(3600),
      transactionTime: new Date(rawTime),
      transactionType: "expense",
      category: "住房",
      categoryConfidence: 0.97,
      categoryStatus: "auto",
      note: "月租",
      importBatchId: batchMap[sourceType].id,
      dedupKey: buildDedupKey({ sourceType, rawTime, rawMerchant: merchant, rawAmount }),
    });

    for (const [index, subscription] of ["Netflix", "Spotify", "iCloud"].entries()) {
      const time = addDays(monthStart, 3 + index * 5);
      const subRawTime = `${format(time, "yyyy-MM-dd")} 07:15:00`;
      const subRawAmount = (15 + index * 8).toFixed(2);
      transactions.push({
        sourceType: "alipay_csv",
        sourceAccount: "支付宝余额",
        rawMerchant: subscription,
        merchant: subscription,
        amount: amount(Number(subRawAmount)),
        transactionTime: new Date(subRawTime),
        transactionType: "expense",
        category: "订阅",
        categoryConfidence: 0.88,
        categoryStatus: "auto",
        note: "自动续费",
        importBatchId: batchMap.alipay_csv.id,
        dedupKey: buildDedupKey({
          sourceType: "alipay_csv",
          rawTime: subRawTime,
          rawMerchant: subscription,
          rawAmount: subRawAmount,
        }),
      });
    }
  }

  const anomalyDay = addDays(currentMonthStart, 11);
  const anomalyRawTime = `${format(anomalyDay, "yyyy-MM-dd")} 15:30:00`;
  transactions.push({
    sourceType: "alipay_csv",
    sourceAccount: "花呗",
    rawMerchant: "Apple Store",
    merchant: "Apple Store",
    amount: amount(3980),
    transactionTime: new Date(anomalyRawTime),
    transactionType: "expense",
    category: "购物",
    categoryConfidence: 0.84,
    categoryStatus: "auto",
    note: "耳机和配件",
    importBatchId: batchMap.alipay_csv.id,
    dedupKey: buildDedupKey({
      sourceType: "alipay_csv",
      rawTime: anomalyRawTime,
      rawMerchant: "Apple Store",
      rawAmount: "3980.00",
    }),
  });

  for (let i = 0; i < 4; i += 1) {
    const day = addDays(currentMonthStart, 8 + i * 4);
    const rawTime = `${format(day, "yyyy-MM-dd")} 19:12:00`;
    const merchant = i % 2 === 0 ? "淘宝" : "京东";
    const rawAmount = (120 + i * 65).toFixed(2);
    transactions.push({
      sourceType: "wechat_csv",
      sourceAccount: "微信零钱",
      rawMerchant: merchant,
      merchant,
      amount: amount(Number(rawAmount)),
      transactionTime: new Date(rawTime),
      transactionType: "expense",
      category: "购物",
      categoryConfidence: 0.83,
      categoryStatus: "auto",
      note: "家居补货",
      importBatchId: batchMap.wechat_csv.id,
      dedupKey: buildDedupKey({
        sourceType: "wechat_csv",
        rawTime,
        rawMerchant: merchant,
        rawAmount,
      }),
    });
  }

  for (const offset of [6, 20, 33, 48]) {
    const day = subDays(new Date(), offset);
    const rawTime = `${format(day, "yyyy-MM-dd")} 10:10:00`;
    const merchant = offset % 2 === 0 ? "得到课程" : "极客时间";
    const rawAmount = (79 + (offset % 3) * 20).toFixed(2);
    const sourceType = "wechat_csv";
    transactions.push({
      sourceType,
      sourceAccount: "零钱",
      rawMerchant: merchant,
      merchant,
      amount: amount(Number(rawAmount)),
      transactionTime: new Date(rawTime),
      transactionType: "expense",
      category: "学习",
      categoryConfidence: 0.82,
      categoryStatus: "auto",
      note: "课程购买",
      importBatchId: batchMap[sourceType].id,
      dedupKey: buildDedupKey({ sourceType, rawTime, rawMerchant: merchant, rawAmount }),
    });
  }

  for (const offset of [10, 24, 39]) {
    const day = subDays(new Date(), offset);
    const rawTime = `${format(day, "yyyy-MM-dd")} 16:10:00`;
    const merchant = "同仁医院";
    const rawAmount = (138 + offset).toFixed(2);
    const sourceType = "generic_bank_csv";
    transactions.push({
      sourceType,
      sourceAccount: "招商银行储蓄卡",
      rawMerchant: merchant,
      merchant,
      amount: amount(Number(rawAmount)),
      transactionTime: new Date(rawTime),
      transactionType: "expense",
      category: "医疗",
      categoryConfidence: 0.88,
      categoryStatus: "auto",
      note: "门诊和药费",
      importBatchId: batchMap[sourceType].id,
      dedupKey: buildDedupKey({ sourceType, rawTime, rawMerchant: merchant, rawAmount }),
    });
  }

  await prisma.transaction.createMany({ data: transactions });

  await prisma.merchantMemory.createMany({
    data: [
      {
        merchant: "盒马鲜生".toLowerCase(),
        category: "购物",
        hitCount: 4,
        lastUsedAt: new Date(),
      },
      {
        merchant: "瑞幸咖啡".toLowerCase(),
        category: "餐饮",
        hitCount: 10,
        lastUsedAt: new Date(),
      },
    ],
  });

  for (const sourceType of sourceTypes) {
    const count = transactions.filter((item) => item.sourceType === sourceType).length;
    await prisma.importBatch.update({
      where: { id: batchMap[sourceType].id },
      data: {
        totalRows: count,
        importedRows: count,
        pendingCategoryRows: 0,
      },
    });
  }

  console.log(`Seeded ${transactions.length} transactions.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
