# Personal Spending Review / 个人消费整理与复盘工具

**English**  
Local-first MVP built with Next.js 15 + Prisma + SQLite. Goal: import transactions -> clean -> auto categorize -> visualize -> monthly review.

**中文**  
基于 Next.js 15 + Prisma + SQLite 的本地单用户 MVP，目标是路通“导入流水→数据清洗→自动分类→可视化→月度复盘”全链路。

## Preview / 预览

![Dashboard](https://placehold.co/1200x700/png?text=Dashboard+Preview)
![Monthly%20Review](https://placehold.co/1200x700/png?text=Monthly+Review)

## Features / 功能

- CSV import (WeChat/Alipay/Generic bank)
- Cleaning: time parsing, amount normalization, spending filters, dedup
- Auto categorization: rules + Merchant Memory
- Transaction management: filter/search/pagination, daily group, edit category/notes/merchant
- Dashboard: KPIs, category bar chart, 30-day trend, top merchants, anomaly hints
- Monthly review: overview, category breakdown, merchant breakdown, natural-language summary

**注：功能清单与上面公司心一致，详见源码。**

## Quick start / 快速开始

1. Clone repo
2. Copy `.env.example` to `.env` and fill in required vars
3. Install dependencies
   ```bash
   npm install
   ```
4. Start dev server
   ```bash
   npm run dev
   ```
5. Import sample CSV from `public/sample-data` (or your own)

## Notes / 注意事项

- SQLite data is stored locally.
- Merchant Memory helps auto-complete categories for repeat merchants.
- For screenshots in README, replace the placeholder image URLs with real images you upload to the repo.
