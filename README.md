# 霓虹连击 NEON COMBO · 30 秒挑战

一个**零构建**的纯前端小游戏：原生 HTML + CSS + JavaScript，没有任何框架、CDN、字体或图片外链。玩家输入名字后开始 30 秒挑战，成绩自动上榜，**排行榜存在 Cloudflare D1**。

站点跑在 **Cloudflare Workers + 静态资源**（`assets`）上：静态文件由边缘节点直出，只有 `/api/*` 进 Worker。

> 线上地址形如 `https://<Worker 项目名>.<你的子域>.workers.dev`。D1 已绑定在 `wrangler.jsonc`（`binding: DB`），只需在数据库里执行建表脚本：**新库用 `schema.sql`，之前建过表的老库用 `migrations/001-add-region-device.sql`**。表不存在或缺列时接口返回 500，游戏里会退成「离线模式」，成绩只存本机。见下方「D1 排行榜配置」。

---

## 玩法

30 秒内点掉所有发光的目标：

| 机制 | 规则 |
| --- | --- |
| 基础得分 | 每次命中 +10 分 |
| 连击倍率 | 每连续 5 次命中升一档：×1 → ×2 → ×3 → ×4 → ×5（封顶） |
| 金环 | 约 12% 概率出现，命中 +50 分 ×当前倍率，并**额外加 1 秒** |
| 断连击 | 点空场地，或目标超时消失，连击与倍率立刻清零 |
| 难度 | 随时间推进，目标变小、生成变密、存活时间变短；最后 5 秒进入红色警示 |
| 评级 | 按总分给 S / A / B / C / D，附命中率与最高连击 |

一局只有 30 秒，结算页的「再来一局」默认聚焦，按回车或空格即可直接开下一局。

## 排行榜

- **前 50 名**，每人只显示自己**最好的一局**（不会一个人占满整榜）
- 两个视角：**全球**（所有玩家）和**本区**（自动识别访客所在地区）
- 侧栏顶部常驻「**我的排名**」卡片：全球名次、本区名次、个人最高分

**同名玩家怎么区分**：名字允许重复，身份和地区都由服务端自动判断，前端不用填任何额外内容。

| 信息 | 来源 | 展示 |
| --- | --- | --- |
| 玩家身份 | 服务端取访客 IP，SHA-256 后取前 16 位（不存明文 IP） | 名字后的 `#A3F9` 短标签 |
| 地区 | 服务端读 `request.cf.country`（Cloudflare 提供，ISO 国家码） | 榜单第二行显示「中国 / 日本 / …」 |

同一网络下用同一个名字，换手机、换电脑都会认成同一个人，名次和最高分连在一起；同名但不同网络的两个玩家，靠 `#` 标签区分。同一 WiFi 下用不同名字的人各自独立成条，不会互相覆盖成绩。

地区与身份都由**服务端**从请求里取，前端传了也不作数，所以既无法伪装地区，也不会上传个人信息——数据库里只有 IP 的哈希片段，没有明文 IP。

> 因为身份基于公网出口 IP，公司、学校、咖啡馆这类共用出口下，同名的人会被合并成一条。要精确到设备得改回浏览器本地标识（`public/assets/js/game.js` 里生成、随请求提交）。

**每周清空**：榜单由 Cloudflare 定时任务在每周一 00:00（美东时间）自动清零，配置见下方「每周清空排行榜」。

---

## 目录结构

```
.
├── public/                     # ← 静态资源目录（wrangler.jsonc 的 assets.directory）
│   ├── index.html              # 游戏主页：三个视图 + 侧栏排行榜 + 页尾介绍/问答区
│   ├── 404.html                # 404 页，中英双语、样式自包含
│   ├── robots.txt              # 抓取规则：全站放行，显式允许主流 AI 爬虫，指向 sitemap
│   ├── sitemap.xml             # 站点地图（只有一个 URL）
│   ├── llms.txt                # 给语言模型的站点摘要（llmstxt.org 约定）
│   ├── site.webmanifest        # PWA 清单：名称、图标、主题色
│   ├── _headers                # 响应头（仅安全头，不设缓存）
│   └── assets/
│       ├── css/style.css       # 全部样式、配色变量、霓虹场地、介绍区、响应式
│       ├── js/i18n.js          # 中英文字典 + 语言检测与切换（改文案只动这里）
│       ├── js/game-core.js     # 纯逻辑：计分 / 倍率 / 难度曲线 / 评级 / 名字清洗
│       ├── js/game.js          # 游戏主逻辑：生成目标、计时、音效、提交、排行榜
│       ├── js/seo.js           # 结构化数据：把页面问答拼成 FAQPage JSON-LD（跟随语言）
│       ├── og-cover.png        # 社交分享封面 1200×630
│       ├── icon-512.png        # 应用图标（manifest / 结构化数据用）
│       ├── icon-192.png        # 应用图标
│       ├── icon-180.png        # iOS 添加到主屏的图标
│       └── favicon.svg         # 站点图标
├── scripts/
│   └── seo-assets/             # 生成封面与图标用的源 HTML（用 Chrome 无头截图，见下方 SEO 章节）
├── src/
│   ├── index.js                # Worker 入口：/api/scores 路由、scheduled 定时清空、其余交给 ASSETS
│   └── scores.js               # 排行榜逻辑：GET 读榜 / POST 提交（含校验与节流）
├── wrangler.jsonc              # Workers 配置：项目名、入口、静态资源、D1 绑定
├── schema.sql                  # D1 建表脚本（全新数据库用）
├── migrations/
│   └── 001-add-region-device.sql  # 增量升级：给早期版本建过的表补 地域/设备/玩家标识
├── .gitignore
├── .gitattributes
└── README.md
```

> **没有 `package.json`，也没有构建步骤**。`wrangler` 由 Cloudflare 构建环境提供，本地需要时用 `npx wrangler`。

---

## 本地预览

纯看页面（排行榜会是离线模式）：

```bash
cd /d/onlin_website
python -m http.server 8000 --directory public
```

打开 <http://localhost:8000>，游戏可以完整玩（含音效、连击、结算）。

想连 API 一起调（需要 Node，会临时下载 wrangler）：

```bash
npx wrangler dev        # 默认 http://localhost:8787，/api/* 与静态资源都可用
```

本地 D1 需要先建表：`npx wrangler d1 execute neon-combo --local --file=./schema.sql`。

> 用 `python -m http.server` 时 `/api/scores` 会失败，前端自动降级为本机成绩（`localStorage`），这是**预期行为**，不是 bug。

---

## 部署到 Cloudflare Workers

### 0. 先确认项目类型

这个仓库必须部署为 **Worker**（静态资源 + 脚本），**不是 Pages**。两者差异：

| | Pages | Workers（本项目） |
| --- | --- | --- |
| 静态资源位置 | 仓库根目录 | `public/`（`assets.directory`） |
| API 代码 | `functions/` 目录（文件路由） | `src/index.js`（`main`）+ 自己的路由 |
| 路由白名单 | `_routes.json` | `assets.run_worker_first` |
| 默认域名 | `*.pages.dev` | `*.<子域>.workers.dev` |

如果你之前建的是 Pages 项目，需要新建一个 Workers 项目（或参照官方[迁移指南](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/)）。

### 1. 核对项目名

`wrangler.jsonc` 第一行的 `name` **必须与 Cloudflare 上的 Worker 项目名完全一致**：

```jsonc
"name": "onlin-website"
```

不一致的话，`wrangler deploy` 会部署到另一个（甚至新建的）Worker 上，你会在错误的域名看到站点。改名只需改这一行再 push。

### 2. 连接仓库并设置构建

1. Cloudflare Dashboard → **Workers & Pages**（中文界面在「计算」下）→ **Create application / 创建应用程序** → **Connect to Git / 连接到 Git**。
2. 选仓库 `onlin_website`、分支 `main`。
3. 构建设置：

   | 项目 | 填写值 |
   | --- | --- |
   | Build command | **留空** |
   | Deploy command | `npx wrangler deploy`（默认值，不用改） |
   | Root directory | **留空**（仓库根） |

   > 本项目没有 `package.json`，**不要**填 `npm run build` / `npm install`。也**不要**填 `wrangler pages deploy`——那是 Pages 的命令。

4. **Save and Deploy**。构建日志里应看到 `Uploading... ` 和 `Deployed` 字样，1–2 分钟后即可访问。

### 3. 上线后自检

```bash
curl -s https://<项目名>.<子域>.workers.dev/api/scores
```

- 返回 `{"scores":[]}` → 全部就绪
- 返回 `500` → D1 绑定已生效，但还没执行 `schema.sql`（表不存在），见下一节
- 返回 `{"error":"db_not_configured","scores":[]}` → 绑定没生效，检查 `wrangler.jsonc` 的 `d1_databases` 并确认这次部署用的是最新配置

---

## D1 排行榜配置

### 1. 创建数据库

控制台左侧 **Storage & Databases / 存储和数据库** → **D1 SQL Database** → **Create database** → 名称填 `neon-combo`（随意，记下来）。

### 2. 建表

**全新数据库**（从没建过表）→ 执行根目录的 `schema.sql`：

```
控制台 → D1 → 选中数据库 → Console / 控制台 → 粘贴 schema.sql 全部内容 → Execute / 执行
```

**已经有 `scores` 表**（之前建过）→ 不要用 `schema.sql`，执行增量迁移：

```
控制台 → D1 → 选中数据库 → Console / 控制台 → 粘贴 migrations/001-add-region-device.sql → Execute
```

迁移会给旧表补上 `country` / `device` / `player_id` 三列并加索引；旧数据自动填成 `XX` / `desktop` / 空，仍按名字合并显示，不影响使用。其中 `device` 现在只是历史遗留列，代码不再写入也不再展示，留着不影响任何功能。

也可以用 Wrangler：

```bash
# 全新库
npx wrangler d1 execute neon-combo --remote --file=./schema.sql
# 已有表的库（增量升级）
npx wrangler d1 execute neon-combo --remote --file=./migrations/001-add-region-device.sql
```

两种脚本都只做 `CREATE ... IF NOT EXISTS` 或一次性 `ALTER`，重复执行新建部分不报错；但 `ALTER` 在列已存在时会报 `duplicate column name`，属正常提示，说明已经升级过了。

### 3. database_id 已写进配置

`wrangler.jsonc` 里已经绑定好了，无需再改：

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "neon-combo",
    "database_id": "ebc0b10e-fd9f-4cba-a8ae-0823f8e2b5d3"
  }
]
```

换数据库时只改 `database_id`（顺便把 `database_name` 改成实际库名），然后 push，构建完成后生效。

> ⚠️ **不要在 Dashboard 里单独加 D1 绑定**。Workers 以 `wrangler.jsonc` 为准，每次部署都会按配置同步绑定，Dashboard 手动加的会被覆盖掉。
> `binding` 必须是 `DB`，代码里读的是 `env.DB`，填错会一直返回 503。
> `database_name` 只影响 `wrangler d1` 系列命令（备份、执行 SQL）的默认目标，绑定时按 `database_id` 走，名字不一致不会导致部署失败——但建议保持一致，免得以后用 CLI 时对不上。

### 4. 验证

```bash
curl -s https://<项目名>.<子域>.workers.dev/api/scores
```

返回 `{"scores":[],"scope":"global","country":"CN"}` 即成功（`country` 是你自己的地区码）。玩一局，结算应显示「已上榜 · 第 N 名」，换设备打开还是同一份榜单。

### 接口说明

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/api/scores` | 全球前 50 名，每人只取最好一局 |
| `GET` | `/api/scores?scope=region` | 本区前 50 名（地区由请求自动识别，不接受传参） |
| `GET` | `/api/scores?name=<名字>` | 额外返回 `player`：`best` / `plays` / `rank`（全球）/ `regionRank`（本区） |
| `GET` | `/api/scores?limit=N` | 自定义条数，1–50，默认 50 |
| `POST` | `/api/scores` | 提交 `{ name, score, bestCombo, hits, misses }`，返回 `rank`、`regionRank`、`best` 与最新榜单 |

榜单里的每条记录形如 `{ name, tag, score, bestCombo, country, createdAt }`。玩家身份完全由服务端按 IP 推导，**前端既不传也不拿 `playerId`**，只回传 4 位 `tag` 用于展示。

服务端校验（`src/scores.js`）：

- 名字：去控制字符、压缩空格、按字符截断到 16、拒绝纯符号
- 分数上限 20000、连击上限 400、命中/失误上限各 600
- 一致性：`0 命中却有分`、`连击数 > 命中数`、`分数 ÷ 命中 > 250`（金环 + 倍率 5 的理论极值）都会被拒
- 同一个人 3 秒内重复提交返回 `429`，避免刷新页面刷榜
- 错误码：`400 bad_name / bad_score / bad_combo / bad_counts / bad_json`、`429 too_fast`、`503 db_not_configured`、`500 insert_failed`

> 这是**好友之间的排行榜**，不是严格反作弊系统：分数由前端上报，服务端只能挡住明显不合理的值。要更强的保证，得把整局逻辑搬到 Worker 里跑。

---

## 每周清空排行榜（Cron Trigger）

清空逻辑在 `src/index.js` 的 `scheduled` 里，调用 `src/scores.js` 的 `resetScores()` 执行 `DELETE FROM scores`；触发频率写在 `wrangler.jsonc`：

```jsonc
"triggers": {
  "crons": ["0 * * * *"]
}
```

**cron 每小时跑一次，但只有「美东时间周一 00:00」这一小时才真的清空**，判断在 `src/index.js` 的 `isResetMoment()`：

```js
const RESET_ZONE = 'America/New_York';   // 换时区改这里
const RESET_WEEKDAY = 'Mon';             // 换星期改这里
const RESET_HOUR = '00';                 // 换时刻改这里（24 小时制，两位）
```

为什么不在 cron 里直接写一个固定的 UTC 时间：北美有夏令时。写死 `0 4 * * 1` 会在冬令时变成周日 23:00，写死 `0 5 * * 1` 又会在夏令时变成周一 01:00，页面上承诺的「每周一 00:00（美东）」就有一半时间是错的。交给 `Intl` 按 `America/New_York` 换算，夏令时切换那一周也不会偏。

> 代价是每周多 167 次空转（每次只做一次时间判断就返回），对免费额度可以忽略。

### 部署后确认是否生效

Workers 以 `wrangler.jsonc` 为准，push 之后 Cron 会自动创建，不需要在控制台点任何东西。想核对：

```
控制台 → Workers & Pages → 选中项目 → 设置 / Settings → 触发器 / Trigger Events
```

「Cron 触发器 / Cron Triggers」里应看到 `0 * * * *`。想改就在这里删掉旧的再加新的——但注意下次部署会用 `wrangler.jsonc` 覆盖回去，**长期改请改配置文件**。

### 想换时间 / 关掉

| 目标 | 改法 |
| --- | --- |
| 换时区（比如美西） | `src/index.js` 的 `RESET_ZONE` 改成 `America/Los_Angeles` |
| 换到周一 20:00（美东） | `RESET_HOUR` 改成 `'20'` |
| 换到周日清 | `RESET_WEEKDAY` 改成 `'Sun'` |
| 暂时不清理 | 删掉整个 `triggers` 字段，或 `"crons": []` |

### 想立刻清一次（不等周一）

```bash
npx wrangler d1 execute neon-combo --remote --command "DELETE FROM scores;"
```

### 怎么验证判断逻辑对不对

`isResetMoment()` 是导出的纯函数，可以直接用 node 跑，不用连 Cloudflare：

```bash
node -e "import('./src/index.js').then(({isResetMoment})=>{
  console.log(isResetMoment(new Date('2026-11-16T05:00:00Z')));  // 冬令时 周一 00:00 → true
  console.log(isResetMoment(new Date('2026-07-13T04:00:00Z')));  // 夏令时 周一 00:00 → true
  console.log(isResetMoment(new Date('2026-07-13T05:00:00Z')));  // 夏令时 周一 01:00 → false
})"
```

> `npx wrangler dev --test-scheduled` 也能手动触发 `scheduled`，但因为有时区判断，不在「美东周一 00:00」那一小时时它只会返回 `{ skipped: true }`，不会删数据。

## 多语言（中文 / English）

站点内置 `zh` / `en` 两套文案（当前各 77 个 key），**无需构建、无需两套 HTML**。

### 默认语言怎么选

1. URL 参数 `?lang=zh` / `?lang=en`
2. 上次手动切换的记录（`localStorage`）
3. 浏览器语言 `navigator.language`：`zh-*` 中文，`en-*` 英文，其他回退中文

右上角 `EN / 中` 可随时切换，切换时同步更新正文、`placeholder`、`aria-label` / `title`、`<title>`、meta、`<html lang>`、游戏内动态文案（评级、结算状态、排行榜）以及地址栏 `?lang=`。

### 改文案

所有可见文案都在 `public/assets/js/i18n.js` 的 `DICT.zh` / `DICT.en`，同名 key 一一对应。

| 场景 | 做法 |
| --- | --- |
| 改现有文字 | 在 `i18n.js` 找到 key，中英各改一遍 |
| 加一句新文案 | HTML 元素加 `data-i18n="my.key"`，再给 `zh` / `en` 补上 |
| 文案含 `<br>` / 高亮 `<span>` | 用 `data-i18n-html` |
| 翻译 `aria-label` / `title` | `data-i18n-aria` / `data-i18n-title` |
| 翻译输入框提示语 | `data-i18n-ph` |
| 带变量的文案 | 字典里写 `{n}` 占位，JS 用 `i18n.tf('key', { n: 12 })` |

> 两种语言的 key 必须一致，缺失会自动回退中文。`404.html` 不依赖脚本，直接中英并列。

---

## SEO 与 GEO（搜索引擎 / 生成式引擎优化）

站点是单页面游戏，天然缺可索引的正文，所以分两层做：**技术层**保证能被正常抓取和摘要，**内容层**提供可被直接引用的自包含事实。

### 已经做了的

| 项目 | 位置 | 说明 |
| --- | --- | --- |
| 标题与描述 | `index.html` + `i18n.js` 的 `meta.title` / `meta.description` | 含「30 秒」「连击」「免注册」等检索词，长度控制在不会被截断的范围 |
| canonical | `index.html` | 固定指向 `https://home.prettylife.pw/`，`?lang=en` 之类的参数变体不会被当成重复页面 |
| Open Graph / Twitter | `index.html` | 含 1200×630 封面与 `og:locale`，分享出去不会是没有封面的裸链接 |
| 结构化数据 | `index.html`（WebSite / Organization / VideoGame）+ `seo.js`（FAQPage） | FAQ 直接从页面问答生成，中英切换时一起换 |
| 语言标记 | `<html lang>` | 切换语言时同步改写，英文页不会被标成中文 |
| 抓取文件 | `robots.txt` / `sitemap.xml` / `llms.txt` / `site.webmanifest` | 见下 |
| 可索引正文 | `index.html` 的 `.about` 区块 | 定义段 + 规则明细 + 6 条问答，全部走 i18n |

### GEO 部分的取舍

- **给结论，不给形容词。** 正文第一句就是定义（「霓虹连击是一个 30 秒的连击点击小游戏」），后面每条都带具体数字（+10 / ×5 / +50 / 前 50 名 / 每周一 00:00 美东时间），模型引用时不需要再推理。
- **事实只写一遍。** 数字写在 `i18n.js` 的 `about.*` / `faq.*`，`llms.txt` 与 JSON-LD 是它的摘要。改规则时三处要一起改，否则会出现「页面写 ×5、llms.txt 写 ×3」这种自相矛盾。
- **问答用 `<details>` 折叠。** 内容仍在 HTML 里能被抓取，但不会把首屏撑长。
- **`robots.txt` 显式列出 AI 爬虫**（GPTBot、ClaudeBot、PerplexityBot、Google-Extended 等），避免被平台默认策略挡掉。

### 域名写在哪

换域名时要一起改，全站只有这些绝对地址：

```bash
grep -rln "home.prettylife.pw" public/ README.md
```

涉及 `public/index.html`（canonical、og:url、og:image、twitter:image、JSON-LD 的 `@id`）、`public/assets/js/seo.js` 的 `ORIGIN`、`public/robots.txt` 的 `Sitemap`、`public/sitemap.xml`、`public/llms.txt`。

### 重新生成封面与图标

源文件是 `scripts/seo-assets/` 下的两个 HTML，用本机 Chrome 无头截图即可，不需要装依赖：

```bash
CHROME="/c/Program Files/Google/Chrome/Application/chrome.exe"

"$CHROME" --headless=new --hide-scrollbars --force-device-scale-factor=1 \
  --window-size=1200,630 --screenshot=public/assets/og-cover.png \
  "file:///D:/onlin_website/scripts/seo-assets/og-cover.html"

for s in 512 192 180; do
  "$CHROME" --headless=new --hide-scrollbars --force-device-scale-factor=1 \
    --window-size=$s,$s --screenshot=public/assets/icon-$s.png \
    "file:///D:/onlin_website/scripts/seo-assets/icon.html"
done
```

### 上线后怎么确认生效

1. 三个文件都要能直接打开：`/robots.txt`、`/sitemap.xml`、`/llms.txt`，返回 200。
2. 结构化数据：把首页 URL 贴进 [Rich Results Test](https://search.google.com/test/rich-results) 或 `validator.schema.org`，应识别出 `VideoGame` 与 `FAQPage`。
3. 收录：在 Google Search Console / Bing Webmaster Tools 里提交 `sitemap.xml`，并请求编入索引。
4. 分享预览：把首页链接发到任意聊天窗口，卡片应显示封面图与中文摘要。

---

## 日常更新：改完怎么上线

连了 Git 之后没有「上传服务器」这一步：推到 `main`，Cloudflare 自动重新部署。

```bash
cd /d/onlin_website
git add .
git commit -m "update: 调整游戏难度"
git push
```

通常 **30 秒 ~ 2 分钟**生效。

| 场景 | 怎么做 |
| --- | --- |
| 看进度 / 排错 | 项目 → **Deployments**，每条 push 一条记录，可看构建日志 |
| 改坏了退回 | 部署记录里对上一次成功的部署做 **Rollback** |
| 部署失败 | 旧版本继续在线，站点不会挂 |
| 改了 API 代码 | 同样 push，Worker 随部署一起更新 |

### 为什么刷新就能看到新内容

项目**故意不设置任何自定义缓存**：`_headers` 只放安全头。Cloudflare 默认给静态资源 `Etag` + `max-age=0, must-revalidate`，浏览器每次回源校验。**不要加 `max-age` / `s-maxage`**，那会导致「部署成功但页面还是旧的」。

API 响应由 Worker 声明 `cache-control: no-store`，保证排行榜永远是最新的。

---

## 修改内容指引

| 想改什么 | 改哪里 |
| --- | --- |
| 所有文案（含游戏提示、评级用语） | `public/assets/js/i18n.js` 的 `DICT.zh` / `DICT.en` |
| 一局时长、生成间隔、存活时间、目标大小 | `public/assets/js/game-core.js` 的 `CONFIG` |
| 基础分、金环分数、加时、金环概率 | `CONFIG.baseScore` / `goldBonus` / `goldTimeBonus` / `goldChance` |
| 倍率节奏与上限 | `CONFIG.comboStep` / `maxMultiplier` |
| 评级分数线（S/A/B/C/D） | `public/assets/js/game-core.js` 的 `GRADES` |
| 排行榜条数、校验上限 | `src/scores.js`（`LIMIT_DEFAULT`、`MAX_SCORE` 等） |
| 榜单条数（前端） | `public/assets/js/game.js` 的 `BOARD_LIMIT` |
| 玩家身份的哈希长度 | `src/scores.js` 的 `playerIdFor`（默认取 SHA-256 前 16 位） |
| 清空时间 / 时区 | `src/index.js` 的 `isResetMoment()`（`RESET_ZONE` / `RESET_WEEKDAY` / `RESET_HOUR`），cron 保持每小时即可 |
| 玩家标签位数 | `src/scores.js` 的 `tagFor`（默认取前 4 位） |
| 页面结构 / 新增视图 | `public/index.html` |
| 页面下方介绍区与问答的文案 | `public/assets/js/i18n.js` 的 `about.*` / `faq.*`（同时记得同步 `public/llms.txt`） |
| 标题、描述、分享卡片文案 | `public/assets/js/i18n.js` 的 `meta.*` / `og.*`（`index.html` 里的原始值是给不跑 JS 的爬虫的兜底） |
| 域名（canonical / og:url / sitemap） | `index.html` + `seo.js` 的 `ORIGIN` + `robots.txt` + `sitemap.xml` + `llms.txt`，用 `grep -rln "home.prettylife.pw"` 找全 |
| 分享封面、图标 | `scripts/seo-assets/*.html` 改完按上方命令重新截图 |
| 主色、场地配色、深浅色 | `public/assets/css/style.css` 顶部 `:root` 与 `html[data-theme="dark"]` |
| 站点图标 | `public/assets/favicon.svg` |
| 安全头 | `public/_headers`（只加安全头，不加缓存） |
| 表结构 | `schema.sql`（全新库）+ `migrations/`（已有库增量升级） |
| 新增 API 路由 | `src/index.js` 里加分支，再加到 `run_worker_first` |
| Worker 项目名 / D1 绑定 | `wrangler.jsonc` |

> **改难度或分数上限时，前后端要一起改**：`game-core.js` 的 `CONFIG.maxScore` 与 `src/scores.js` 的 `MAX_SCORE` 保持一致，否则可能出现「本地能玩、提交却被拒」。同理，如果调高了金环收益，`MAX_POINTS_PER_HIT`（默认 250）也要跟着调。

---

## 常见问题

- **构建报错 `This project has a functions directory and static files in its root...`**：这是把仓库当 Pages 项目部署了。本项目已改成 Workers 结构（静态文件在 `public/`、API 在 `src/`），确认 Deploy command 是 `npx wrangler deploy`、且仓库里没有 `functions/` 目录。
- **部署成功但打开是空白 / 404**：`assets.directory` 指错了。确认 `public/index.html` 存在，`wrangler.jsonc` 里是 `"directory": "./public"`。
- **排行榜显示「离线模式」**：D1 没接好。检查 `wrangler.jsonc` 的 `d1_databases` → `binding` 是否为 `DB` → `database_id` 是否正确 → 建表脚本是否执行过。`curl .../api/scores` 返回 `503` 表示没有绑定，`500` 表示表不存在或还是旧表结构（缺 `country` / `player_id` 列，需执行 `migrations/001-add-region-device.sql`）。
- **两个同名玩家分不开**：身份按 IP 哈希区分，同一网络下同名会被合并成一个人。这种情况让对方换个名字即可；不建议加设备指纹，那属于过度追踪。
- **本区榜是空的**：说明这个地区还没有人提交成绩。地区由 Cloudflare 判定，本地预览或非 Cloudflare 环境会显示「未知地区」，这些记录会归到 `XX`。
- **提交后没上榜**：开发者工具 Network 看 `/api/scores` 的 POST 响应码。`400` 是字段校验没过（看 `error`），`429` 是 3 秒内重复提交，`503` 是没绑定。
- **部署到了别的域名**：`wrangler.jsonc` 的 `name` 与 Cloudflare 项目名不一致，改成一致再 push。
- **名字被截断 / 存不进去**：上限 16 个字符（按字符算，不是字节），纯符号会被拒绝。
- **游戏卡顿**：目标用 DOM + CSS 动画，正常设备不会卡；开了「减少动效」系统设置时，浮分和粒子会自动关闭，不影响计分。
- **没有声音**：浏览器要求用户交互后才能播放音频，点「开始挑战」之后才会出声；也可点右上角喇叭确认没静音。
- **改了代码线上没变**：看 Deployments 是否成功，再强刷（Ctrl/Cmd + Shift + R）；确认没在 `_headers` 加缓存规则。
- **SSH 报 `Connection closed ... port 22`**：部分网络封 22 端口。在 `~/.ssh/config` 加：

  ```sshconfig
  Host github.com
      HostName ssh.github.com
      Port 443
      User git
      IdentityFile ~/.ssh/id_ed25519
      IdentitiesOnly yes
  ```

  用 `ssh -T git@github.com` 验证，看到 `Hi <用户名>! You've successfully authenticated` 即成功（返回码 1 属正常）。

---

## 技术说明

- 纯前端游戏，无框架、无构建、无第三方请求；Worker 只处理 `/api/*`，静态资源由边缘直出。
- `assets.run_worker_first: ["/api/*"]` 明确限定路由，其余请求不经过 Worker，不额外增加延迟。
- 排行榜存 D1，SQL 全部参数化绑定；读取 `no-store`，写入前做字段与一致性校验。
- WebAudio 实时合成音效，不加载任何音频文件，可一键静音（偏好存 `localStorage`）。
- 支持中 / 英双语、浅 / 深主题、`prefers-reduced-motion`、键盘操作（回车/空格再来一局、Esc 结束本局）、移动端 `touch-action: none` 防误滑。
- `_headers` 配置 `nosniff`、Referrer-Policy、Permissions-Policy 与 CSP（`connect-src 'self'` 正好够调用同源 API）。
