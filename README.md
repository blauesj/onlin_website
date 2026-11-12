# 霓虹连击 NEON COMBO · 30 秒挑战

一个**零构建**的纯前端小游戏：原生 HTML + CSS + JavaScript，没有任何框架、CDN、字体或图片外链。玩家输入名字后开始 30 秒挑战，成绩自动上榜，**排行榜存在 Cloudflare D1**。

站点跑在 **Cloudflare Workers + 静态资源**（`assets`）上：静态文件由边缘节点直出，只有 `/api/*` 进 Worker。

> 线上地址形如 `https://<Worker 项目名>.<你的子域>.workers.dev`。首次部署后还需要**创建 D1 数据库并把 ID 写进配置**，否则游戏能玩、但排行榜会显示「离线模式」，成绩只存本机。见下方「D1 排行榜配置」。

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

---

## 目录结构

```
.
├── public/                     # ← 静态资源目录（wrangler.jsonc 的 assets.directory）
│   ├── index.html              # 游戏主页：开始 / 游戏中 / 结算 三个视图 + 侧栏排行榜
│   ├── 404.html                # 404 页，中英双语、样式自包含
│   ├── _headers                # 响应头（仅安全头，不设缓存）
│   └── assets/
│       ├── css/style.css       # 全部样式、配色变量、霓虹场地、响应式
│       ├── js/i18n.js          # 中英文字典 + 语言检测与切换（改文案只动这里）
│       ├── js/game-core.js     # 纯逻辑：计分 / 倍率 / 难度曲线 / 评级 / 名字清洗
│       ├── js/game.js          # 游戏主逻辑：生成目标、计时、音效、提交、排行榜
│       └── favicon.svg         # 站点图标
├── src/
│   ├── index.js                # Worker 入口：/api/scores 路由 + 其余交给 ASSETS
│   └── scores.js               # 排行榜逻辑：GET 读榜 / POST 提交（含校验与节流）
├── wrangler.jsonc              # Workers 配置：项目名、入口、静态资源、D1 绑定
├── schema.sql                  # D1 建表脚本（在 D1 控制台执行一次）
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

- 返回 `{"error":"db_not_configured","scores":[]}` → 部署成功，只是还没接 D1（正常，见下一节）
- 返回 `{"scores":[]}` → D1 已接好

---

## D1 排行榜配置

### 1. 创建数据库

控制台左侧 **Storage & Databases / 存储和数据库** → **D1 SQL Database** → **Create database** → 名称填 `neon-combo`（随意，记下来）。

### 2. 建表

进入数据库 → **Console / 控制台** → 粘贴 `schema.sql` 全部内容 → **Execute / 执行**。会创建 `scores` 表和两个索引（`CREATE TABLE IF NOT EXISTS`，重复执行不报错）。

也可以用 Wrangler：

```bash
npx wrangler d1 execute neon-combo --remote --file=./schema.sql
```

### 3. 把 database_id 写进配置

在数据库详情页复制 **Database ID**，然后在 `wrangler.jsonc` 里取消注释并填入：

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "neon-combo",
    "database_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  }
]
```

提交并 push，构建完成后 D1 就生效了。

> ⚠️ **不要在 Dashboard 里单独加 D1 绑定**。Workers 以 `wrangler.jsonc` 为准，每次部署都会按配置同步绑定，Dashboard 手动加的会被覆盖掉。
> `binding` 必须是 `DB`，代码里读的是 `env.DB`，填错会一直返回 503。

### 4. 验证

```bash
curl -s https://<项目名>.<子域>.workers.dev/api/scores
```

返回 `{"scores":[]}` 即成功。玩一局，结算应显示「已上榜 · 第 N 名」，换设备打开还是同一份榜单。

### 接口说明

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/api/scores?limit=10` | 返回前 N 名（`limit` 1–50，默认 10） |
| `GET` | `/api/scores?name=<名字>` | 额外返回该名字的 `best` / `plays` |
| `POST` | `/api/scores` | 提交 `{ name, score, bestCombo, hits, misses }`，返回 `rank` 与最新榜单 |

服务端校验（`src/scores.js`）：

- 名字：去控制字符、压缩空格、按字符截断到 16、拒绝纯符号
- 分数上限 20000、连击上限 400、命中/失误上限各 600
- 一致性：`0 命中却有分`、`连击数 > 命中数`、`分数 ÷ 命中 > 250`（金环 + 倍率 5 的理论极值）都会被拒
- 同名 3 秒内重复提交返回 `429`，避免刷新页面刷榜
- 错误码：`400 bad_name / bad_score / bad_combo / bad_counts / bad_json`、`429 too_fast`、`503 db_not_configured`、`500 insert_failed`

> 这是**好友之间的排行榜**，不是严格反作弊系统：分数由前端上报，服务端只能挡住明显不合理的值。要更强的保证，得把整局逻辑搬到 Worker 里跑。

---

## 多语言（中文 / English）

站点内置 `zh` / `en` 两套文案（当前各 67 个 key），**无需构建、无需两套 HTML**。

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
| 页面结构 / 新增视图 | `public/index.html` |
| 主色、场地配色、深浅色 | `public/assets/css/style.css` 顶部 `:root` 与 `html[data-theme="dark"]` |
| 站点图标 | `public/assets/favicon.svg` |
| 安全头 | `public/_headers`（只加安全头，不加缓存） |
| 表结构 | `schema.sql`（改完要在 D1 重新执行） |
| 新增 API 路由 | `src/index.js` 里加分支，再加到 `run_worker_first` |
| Worker 项目名 / D1 绑定 | `wrangler.jsonc` |

> **改难度或分数上限时，前后端要一起改**：`game-core.js` 的 `CONFIG.maxScore` 与 `src/scores.js` 的 `MAX_SCORE` 保持一致，否则可能出现「本地能玩、提交却被拒」。同理，如果调高了金环收益，`MAX_POINTS_PER_HIT`（默认 250）也要跟着调。

---

## 常见问题

- **构建报错 `This project has a functions directory and static files in its root...`**：这是把仓库当 Pages 项目部署了。本项目已改成 Workers 结构（静态文件在 `public/`、API 在 `src/`），确认 Deploy command 是 `npx wrangler deploy`、且仓库里没有 `functions/` 目录。
- **部署成功但打开是空白 / 404**：`assets.directory` 指错了。确认 `public/index.html` 存在，`wrangler.jsonc` 里是 `"directory": "./public"`。
- **排行榜显示「离线模式」**：D1 没接好。检查 `wrangler.jsonc` 的 `d1_databases` → `binding` 是否为 `DB` → `database_id` 是否正确 → `schema.sql` 是否执行过。`curl .../api/scores` 返回 `503` 表示没有绑定，`500` 表示表不存在。
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
