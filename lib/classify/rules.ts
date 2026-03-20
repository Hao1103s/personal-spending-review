import type { MatchType } from "@prisma/client";

import type { CategoryName } from "@/lib/types";

type SystemRule = {
  matchType: MatchType;
  pattern: string;
  category: CategoryName;
  priority: number;
};

export const SYSTEM_CATEGORY_RULES: SystemRule[] = [
  { matchType: "contains", pattern: "瑞幸", category: "餐饮", priority: 90 },
  { matchType: "contains", pattern: "星巴克", category: "餐饮", priority: 90 },
  { matchType: "contains", pattern: "喜茶", category: "餐饮", priority: 88 },
  { matchType: "contains", pattern: "麦当劳", category: "餐饮", priority: 88 },
  { matchType: "contains", pattern: "肯德基", category: "餐饮", priority: 88 },
  { matchType: "contains", pattern: "海底捞", category: "餐饮", priority: 88 },
  { matchType: "contains", pattern: "美团外卖", category: "餐饮", priority: 85 },
  { matchType: "contains", pattern: "叮咚买菜", category: "餐饮", priority: 78 },
  { matchType: "contains", pattern: "滴滴", category: "出行", priority: 90 },
  { matchType: "contains", pattern: "高德打车", category: "出行", priority: 88 },
  { matchType: "contains", pattern: "地铁", category: "出行", priority: 82 },
  { matchType: "contains", pattern: "铁路", category: "出行", priority: 82 },
  { matchType: "contains", pattern: "12306", category: "出行", priority: 82 },
  { matchType: "contains", pattern: "南方航空", category: "出行", priority: 82 },
  { matchType: "contains", pattern: "房租", category: "住房", priority: 95 },
  { matchType: "contains", pattern: "链家", category: "住房", priority: 86 },
  { matchType: "contains", pattern: "自如", category: "住房", priority: 86 },
  { matchType: "contains", pattern: "京东", category: "购物", priority: 85 },
  { matchType: "contains", pattern: "淘宝", category: "购物", priority: 85 },
  { matchType: "contains", pattern: "天猫", category: "购物", priority: 85 },
  { matchType: "contains", pattern: "盒马", category: "购物", priority: 82 },
  { matchType: "contains", pattern: "山姆", category: "购物", priority: 82 },
  { matchType: "contains", pattern: "Apple", category: "购物", priority: 82 },
  { matchType: "contains", pattern: "优衣库", category: "购物", priority: 82 },
  { matchType: "contains", pattern: "万达影城", category: "娱乐", priority: 84 },
  { matchType: "contains", pattern: "猫眼", category: "娱乐", priority: 82 },
  { matchType: "contains", pattern: "网易云游戏", category: "娱乐", priority: 74 },
  { matchType: "contains", pattern: "美团单车", category: "出行", priority: 75 },
  { matchType: "contains", pattern: "医院", category: "医疗", priority: 88 },
  { matchType: "contains", pattern: "药房", category: "医疗", priority: 86 },
  { matchType: "contains", pattern: "阿里健康", category: "医疗", priority: 86 },
  { matchType: "contains", pattern: "得到", category: "学习", priority: 83 },
  { matchType: "contains", pattern: "极客时间", category: "学习", priority: 83 },
  { matchType: "contains", pattern: "知识星球", category: "学习", priority: 83 },
  { matchType: "contains", pattern: "微信红包", category: "社交", priority: 85 },
  { matchType: "contains", pattern: "礼物", category: "社交", priority: 80 },
  { matchType: "contains", pattern: "聚餐AA", category: "社交", priority: 76 },
  { matchType: "contains", pattern: "Netflix", category: "订阅", priority: 88 },
  { matchType: "contains", pattern: "Spotify", category: "订阅", priority: 88 },
  { matchType: "contains", pattern: "iCloud", category: "订阅", priority: 88 },
  { matchType: "contains", pattern: "Notion", category: "订阅", priority: 85 },
  { matchType: "regex", pattern: ".*(会员|续费|包月).*", category: "订阅", priority: 72 },
];

export function matchRule(
  merchant: string,
  rule: Pick<SystemRule, "matchType" | "pattern">
) {
  const candidate = merchant.trim().toLowerCase();
  const pattern = rule.pattern.trim().toLowerCase();

  if (rule.matchType === "exact") {
    return candidate === pattern;
  }

  if (rule.matchType === "contains") {
    return candidate.includes(pattern);
  }

  try {
    return new RegExp(rule.pattern, "i").test(merchant);
  } catch {
    return false;
  }
}
