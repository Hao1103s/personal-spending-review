# 个人消费整理与复盘工具

基于 Next.js 15 + Prisma + SQLite 的本地单用户 MVP。核心目标不是传统手动记账，而是把“导入流水 -> 自动分类 -> 可视化 -> 月度复盘”这条链路先跑通。

## 功能范围

- CSV 导入：支持 `wechat_csv`、`alipay_csv`、`generic_bank_csv`
- 数据清洗：时间解析、金额标准化、消费过滤、去重
- 自动分类：内置规则 + Merchant Memory
- 流水管理：筛选、搜索、分页、按天分组、编辑分类/备注/商户
- 首页看板：KPI、分类条形图、30 天趋势、Top merchants、异常提示
- 月度复盘：月概览、分类拆解、商户拆解、自然语言总结

## 技术栈

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- shadcn/ui 风格基础组件
- Prisma
- SQLite
- Recharts
- date-fns
- Zod
- Papa Parse
- lucide-react
- Vitest

## 目录结构

```text
app/
  (dashboard)/page.tsx
  transactions/page.tsx
  reports/page.tsx
  import/page.tsx
  api/...
components/
  dashboard/
  import/
  reports/
  transactions/
  ui/
lib/
  analytics/
  classify/
  import/
  db.ts
  transactions.ts
  types.ts
  utils.ts
prisma/
  schema.prisma
  seed.ts
sample-data/
tests/
```

## 本地运行

1. 安装依赖

```bash
npm install
```

2. 初始化环境变量

```bash
cp .env.example .env
```

默认数据库路径为：

```bash
DATABASE_URL="file:./dev.db"
```

3. 建库并写入 seed

```bash
npm run db:push
npm run db:seed
```

4. 启动开发环境

```bash
npm run dev
```

默认访问 [http://localhost:3000](http://localhost:3000)。

## 桌面应用

项目现在已经支持桌面封装，使用 Electron 把现有 Next.js 应用打成桌面版。

### 桌面开发模式

```bash
npm run desktop:dev
```

这会同时启动：

- Next.js 开发服务
- Electron 桌面窗口

### 打包桌面版

先确认当前数据库已经准备好。如果你想把当前本地数据一起带进安装包，直接打包即可；如果你想用一份干净的样例数据库打包，先执行：

```bash
npm run db:reset
```

然后打包：

```bash
npm run desktop:dist
```

按平台单独打包：

```bash
npm run desktop:dist:mac
npm run desktop:dist:win
```

同时尝试产出 macOS 和 Windows 版本：

```bash
npm run desktop:dist:all
```

产物输出目录：

```bash
release/
```

默认目标：

- macOS：`.dmg`
- Windows：`.exe`（NSIS 安装包，默认 `x64`）

### 桌面版运行方式

桌面版不是去访问外部网站，而是在应用内部启动一个本地内嵌服务，然后由 Electron 窗口加载它。SQLite 数据库不会写到应用安装目录，而是首次启动时复制到用户目录后再使用。

### 构建注意事项

- 打包前需要先有可用的 `prisma/dev.db`
- Prisma 已配置 `macOS + Windows` 二进制目标，便于生成两个桌面版本
- macOS 安装包若未签名，首次打开会被系统提示安全告警，这是正常现象
- 若你要发布给其他人使用，后续还需要补应用签名与公证

## 样例 CSV

仓库内提供两份位置相同的样例文件：

- `sample-data/*.csv`：方便直接查看或手动上传
- `public/sample-data/*.csv`：方便在导入页点击下载

### `wechat_csv`

使用这些字段：

- `交易时间`
- `交易类型`
- `交易对方`
- `商品`
- `收/支`
- `金额(元)`
- `支付方式`
- `当前状态`
- `备注`

### `alipay_csv`

使用这些字段：

- `交易创建时间`
- `交易对方`
- `商品说明`
- `收/支`
- `金额（元）`
- `交易状态`
- `资金渠道`
- `备注`

### `generic_bank_csv`

使用这些字段：

- `date`
- `description`
- `amount`
- `type`
- `account`
- `memo`

说明：

- 导入时只保留消费类记录，收入/退款/转账会被识别后跳过
- 去重键由 `sourceType + 原始时间 + 原始商户 + 原始金额` 的哈希组成
- 分类优先级：`MerchantMemory > CategoryRule > 其他/待确认`

## 测试

```bash
npm test
```

当前测试覆盖：

- 导入 adapter
- dedup 逻辑
- classify engine
- analytics 聚合

## 页面说明

- `/`：首页看板
- `/transactions`：流水页
- `/import`：导入页
- `/reports`：月度复盘页

## 开发脚本

```bash
npm run dev
npm run build
npm run lint
npm test
npm run db:push
npm run db:seed
npm run db:reset
npm run desktop:dev
npm run desktop:dist
npm run desktop:dist:mac
npm run desktop:dist:win
```

## Future Work

- 支持更多账单模板和字段自动识别
- 支持更强的分类规则管理界面
- 增加预算、标签和周期性支出分析
- 支持 PostgreSQL 与云端部署
