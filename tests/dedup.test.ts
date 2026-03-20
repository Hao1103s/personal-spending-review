import { buildDedupKey, dedupeCandidates } from "@/lib/import/dedup";

describe("dedup helpers", () => {
  it("builds stable dedup keys", () => {
    const first = buildDedupKey({
      sourceType: "wechat_csv",
      rawTime: "2025-03-03 08:20:00",
      rawMerchant: "瑞幸咖啡",
      rawAmount: "18.00",
    });
    const second = buildDedupKey({
      sourceType: "wechat_csv",
      rawTime: "2025-03-03 08:20:00",
      rawMerchant: "瑞幸咖啡",
      rawAmount: "18.00",
    });

    expect(first).toBe(second);
  });

  it("filters duplicates from existing keys and same batch", () => {
    const key = buildDedupKey({
      sourceType: "wechat_csv",
      rawTime: "2025-03-03 08:20:00",
      rawMerchant: "瑞幸咖啡",
      rawAmount: "18.00",
    });

    const result = dedupeCandidates(
      [{ dedupKey: key }, { dedupKey: key }, { dedupKey: "other" }],
      new Set<string>(),
    );

    expect(result.unique).toHaveLength(2);
    expect(result.dedupedRows).toBe(1);
  });
});
