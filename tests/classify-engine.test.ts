import { classifyMerchant } from "@/lib/classify/engine";

describe("classify engine", () => {
  it("prefers merchant memory over rules", () => {
    const result = classifyMerchant({
      merchant: "盒马鲜生",
      memories: [{ merchant: "盒马鲜生", category: "购物", hitCount: 4 }],
      rules: [{ matchType: "contains", pattern: "盒马", category: "餐饮", priority: 99 }],
    });

    expect(result.category).toBe("购物");
    expect(result.reason).toBe("merchant_memory");
  });

  it("marks low confidence rules as pending", () => {
    const result = classifyMerchant({
      merchant: "某某会员包月",
      rules: [{ matchType: "regex", pattern: ".*(会员|续费|包月).*", category: "订阅", priority: 60 }],
    });

    expect(result.category).toBe("订阅");
    expect(result.status).toBe("pending");
  });

  it("falls back to 其他 when nothing matches", () => {
    const result = classifyMerchant({ merchant: "完全未知商户" });
    expect(result.category).toBe("其他");
    expect(result.status).toBe("pending");
  });
});
