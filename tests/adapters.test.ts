import { adaptAlipayRow } from "@/lib/import/adapters/alipay";
import { adaptGenericBankRow } from "@/lib/import/adapters/genericBank";
import { adaptWeChatRow } from "@/lib/import/adapters/wechat";

describe("import adapters", () => {
  it("adapts wechat rows into unified fields", () => {
    const row = adaptWeChatRow({
      交易时间: "2025-03-03 08:20:00",
      交易类型: "餐饮消费",
      交易对方: "瑞幸咖啡",
      商品: "生椰拿铁",
      "收/支": "支出",
      "金额(元)": "18.00",
      支付方式: "零钱",
      当前状态: "支付成功",
      备注: "",
    });

    expect(row).toMatchObject({
      sourceType: "wechat_csv",
      rawMerchant: "瑞幸咖啡",
      merchant: "瑞幸咖啡",
      rawAmount: "18.00",
      transactionType: "expense",
    });
  });

  it("adapts alipay rows and recognizes refund", () => {
    const row = adaptAlipayRow({
      交易创建时间: "2025-03-12 10:00:00",
      交易对方: "淘宝",
      商品说明: "订单退款",
      "收/支": "退款",
      "金额（元）": "88.00",
      交易状态: "交易成功",
      资金渠道: "支付宝余额",
      备注: "",
    });

    expect(row?.transactionType).toBe("refund");
    expect(row?.sourceType).toBe("alipay_csv");
  });

  it("adapts generic bank rows", () => {
    const row = adaptGenericBankRow({
      date: "2025-03-01 09:00:00",
      description: "房租",
      amount: "3600.00",
      type: "expense",
      account: "招商银行储蓄卡",
      memo: "月租",
    });

    expect(row).toMatchObject({
      sourceType: "generic_bank_csv",
      rawMerchant: "房租",
      sourceAccount: "招商银行储蓄卡",
      transactionType: "expense",
    });
  });
});
