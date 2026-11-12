# 霓虹连击 NEON COMBO · 30 秒挑战

一个**零构建**的纯前端小游戏：原生 HTML + CSS + JavaScript，没有任何框架、CDN、字体或图片外链。玩家输入名字后开始 30 秒挑战，成绩自动上榜，**排行榜存在 Cloudflare D1**（通过 Pages Functions 访问）。

> 线上地址：`https://<你的项目名>.pages.dev`。首次部署后还需要**手动创建 D1 数据库并绑定**，否则游戏能玩、但排行榜会显示「离线模式」，成绩只存本机。配置步骤见下方「D1 排行榜配置」。

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
├── index.html                  # 游戏主页：开始 / 游戏中 / 结算 三个视图 + 侧栏排行榜
├── 404.html                    # 404 页，中英双语、样式自包含，任意路径下都能显示
├── _headers                    # 响应头（仅安全头，不设缓存）
├── _routes.json                # 只让 /api/* 走 Pages Functions，其余静态直出
├── schema.sql                  # D1 建表脚本（在 D1 控制台执行一次）
├── .gitignore
├── .gitattributes
├── README.md
├── functions/
│   └── api/
│       └── scores.js           # 排行榜接口：GET 读榜 / POST 提交（含校验与节流）
└── assets/
    ├── css/style.css           # 全部样式、配色变量、霓虹场地、响应式
    ├── js/i18n.js              # 中英文字典 + 语言检测与切换（改文案只动这里）
    ├── js/game-core.js         # 纯逻辑：计分 / 倍率 / 难度曲线 / 评级 / 名字清洗
    ├── js/game.js              # 游戏主逻辑：生成目标、计时、音效、提交、排行榜
    └── favicon.svg             # 站点图标
```

---

## 本地预览

```bash
cd /d/onlin_website
python -m http.server 8000
```

打开 <http://localhost:8000>，游戏可以完整玩（含音效、连击、结算）。

> **本地排行榜一定是「离线模式」**，这是正常的：纯静态服务器不会执行 `functions/` 里的代码，`/api/scores` 请求会失败，前端自动降级为本机成绩（`localStorage`）。排行榜要等部署到 Cloudflare Pages 并绑定 D1 后才会真正生效。

双击 `index.html` 用 `file://` 打开也能玩单机，同样没有排行榜。加 `?lang=en` 可预览英文。

---

## 部署到 Cloudflare Pages（连 GitHub 仓库）

### 1. 在 GitHub 新建空仓库

登录 GitHub → 右上角 **+** → **New repository** → 填仓库名、Public / Private 都行 → **不要**勾选 `Add a README file`、`.gitignore`、`license`（空仓库避免首次 push 冲突）→ **Create repository**。

### 2. 推到 GitHub

本仓库已通过 SSH 推到 `git@github.com:blauesj/onlin_website.git` 的 `main` 分支。换机器重来时：

```bash
cd <项目目录>
git init -b main
git add .
git config user.name "你的名字"
git config user.email "你的邮箱"
git commit -m "feat: neon combo game"
git remote add origin git@github.com:blauesj/onlin_website.git
git push -u origin main
```

若 22 端口被网络阻断，见「常见问题」中的 SSH over 443 配置。

### 3. 创建 Pages 项目

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) → 左侧 **Workers & Pages**（中文界面在「计算」下）→ **Create**/**创建应用程序** → 切到 **Pages** 标签 → **Connect to Git**。
2. 授权 GitHub，选择仓库 `onlin_website`。
3. 构建设置：

   | 项目 | 填写值 |
   | --- | --- |
   | Production branch | `main` |
   | Framework preset | `None` |
   | Build command | **留空** |
   | Build output directory | **留空**（或填 `/`） |
   | Root directory | `/` |

   > 本项目没有 `package.json`，**不要**填 `npm run build`。`functions/` 目录会被 Cloudflare 自动识别为 Pages Functions，不需要构建。

4. **Save and Deploy**，约 1–2 分钟后可用 `https://<项目名>.pages.dev` 打开。此时游戏可玩，但排行榜还是离线模式——继续下一步。

---

## D1 排行榜配置（必需）

三步：建库 → 建表 → 绑定给 Pages 项目。都在 Cloudflare 控制台点几下，不用装任何工具。

### 1. 创建 D1 数据库

控制台左侧 **Storage & Databases / 存储和数据库** → **D1 SQL Database / D1 SQL 数据库** → **Create database / 创建数据库** → 名称填 `neon-combo`（随意，记下来）→ **Create**。

### 2. 建表

进入刚建的数据库 → 顶部 **Console / 控制台** → 把仓库里 `schema.sql` 的**全部内容**粘贴进去 → **Execute / 执行**。

执行成功会创建 `scores` 表（字段：`id`、`name`、`score`、`best_combo`、`hits`、`misses`、`created_at`）和两个索引。脚本是 `CREATE TABLE IF NOT EXISTS`，重复执行不会出错。

也可以在本地用 Wrangler 执行：

```bash
npx wrangler d1 execute neon-combo --remote --file=./schema.sql
```

### 3. 绑定到 Pages 项目

1. Pages 项目 → **Settings / 设置** → **Functions / 函数** → **D1 database bindings / D1 数据库绑定** → **Add binding / 添加**。
2. **Variable name / 变量名** 必须填 `DB`（代码里读的是 `env.DB`，填错会一直 503）。
3. **D1 database** 选择第 1 步建的库 → **Save / 保存**。
4. 回到 **Deployments / 部署**，对最新一次部署点 **Retry deployment / 重新部署**——绑定只在**新部署**里生效，不重新部署的话线上仍是旧版本。

### 4. 验证

```bash
# 应该返回 {"scores":[]} 而不是 503
curl -s https://<项目名>.pages.dev/api/scores
```

然后打开站点玩一局，结算应显示「已上榜 · 第 N 名」，右侧排行榜出现你的名字。换台设备打开还是同一份榜单，说明 D1 已生效。

### 接口说明

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/api/scores?limit=10` | 返回前 N 名（`limit` 1–50，默认 10） |
| `GET` | `/api/scores?name=<名字>` | 额外返回该名字的 `best` / `plays` |
| `POST` | `/api/scores` | 提交 `{ name, score, bestCombo, hits, misses }`，返回 `rank` 与最新榜单 |

服务端会做这些校验（`functions/api/scores.js`）：

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
2. 上次手动切换的记录（`localStorage` 的 `yuguang-lang`）
3. 浏览器语言 `navigator.language`：`zh-*` 中文，`en-*` 英文，其他回退中文

右上角 `EN / 中` 可随时切换，切换时同步更新正文、`placeholder`、`aria-label` / `title`、`<title>`、meta、`<html lang>`、游戏内动态文案（评级、结算状态、排行榜）以及地址栏 `?lang=`。

### 改文案

所有可见文案都在 `assets/js/i18n.js` 的 `DICT.zh` / `DICT.en`，同名 key 一一对应。

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

通常 **30 秒 ~ 2 分钟**生效，域名、SSL、D1 绑定都不受影响。

| 场景 | 怎么做 |
| --- | --- |
| 看进度 / 排错 | 项目 → **Deployments**，每条 push 一条记录，可看日志和该次部署的独立 URL |
| 先试后发 | 推到非 `main` 分支或开 PR，会生成独立预览地址 |
| 改坏了退回 | 在部署记录里对上一次成功的部署做 **Rollback** |
| 部署失败 | 旧版本继续在线，站点不会挂 |
| 改了函数代码 | 同样 push 即可，Functions 会随部署一起更新 |

### 为什么刷新就能看到新内容

项目**故意不设置任何自定义缓存**：`_headers` 只放安全头。Pages 默认给静态资源 `Cache-Control: public, max-age=0, must-revalidate` + `Etag`，浏览器每次回源校验。**不要加 `max-age` / `s-maxage`**——那会让「部署成功但页面还是旧的」，而 `pages.dev` 没有可清缓存的 zone。

API 响应则由函数自己声明 `cache-control: no-store`，保证排行榜永远是最新的。

---

## 修改内容指引

| 想改什么 | 改哪里 |
| --- | --- |
| 所有文案（含游戏提示、评级用语） | `assets/js/i18n.js` 的 `DICT.zh` / `DICT.en` |
| 一局时长、生成间隔、存活时间、目标大小 | `assets/js/game-core.js` 的 `CONFIG` |
| 基础分、金环分数、加时、金环概率 | `CONFIG.baseScore` / `goldBonus` / `goldTimeBonus` / `goldChance` |
| 倍率节奏与上限 | `CONFIG.comboStep` / `maxMultiplier` |
| 评级分数线（S/A/B/C/D） | `assets/js/game-core.js` 的 `GRADES` |
| 排行榜条数、校验上限 | `functions/api/scores.js`（`LIMIT_DEFAULT`、`MAX_SCORE` 等） |
| 页面结构 / 新增视图 | `index.html` |
| 主色、场地配色、深浅色 | `assets/css/style.css` 顶部 `:root` 与 `html[data-theme="dark"]` |
| 站点图标 | `assets/favicon.svg` |
| 安全头 | `_headers`（只加安全头，不加缓存） |
| 表结构 | `schema.sql`（改完要在 D1 重新执行） |

> **改难度或分数上限时，前后端要一起改**：`game-core.js` 的 `CONFIG.maxScore` 与 `functions/api/scores.js` 的 `MAX_SCORE` 保持一致，否则可能出现「本地能玩、提交却被拒」。同理，如果调高了金环收益，`MAX_POINTS_PER_HIT`（默认 250）也要跟着调，否则正常成绩会被判为异常。

---

## 常见问题

- **排行榜显示「离线模式 / 连不上服务器」**：99% 是 D1 没配好。依次检查：D1 库建了吗 → `schema.sql` 执行了吗 → Pages 的 Functions 绑定里变量名是不是 `DB` → 绑定后有没有**重新部署**。用 `curl https://<项目名>.pages.dev/api/scores` 看返回：`503` 表示没绑定，`500` 表示表不存在或 SQL 出错。
- **提交后没上榜**：打开开发者工具 Network 看 `/api/scores` 的 POST 响应码。`400` 说明字段校验没过（看返回的 `error`），`429` 是 3 秒内重复提交，`503` 是没绑定。
- **名字被截断 / 存不进去**：上限 16 个字符（按字符算，不是字节），纯符号会被拒绝。
- **游戏卡顿**：目标用 DOM + CSS 动画，正常设备不会卡；如果开了「减少动效」系统设置，浮分和粒子会自动关闭，这不影响计分。
- **没有声音**：浏览器要求用户交互后才能播放音频，点「开始挑战」之后才会出声；也可以点右上角喇叭图标确认没静音。
- **页面 404 / 样式丢失**：确认仓库根目录直接就是 `index.html`，且 Root directory 填 `/`。
- **改了代码线上没变**：看 `Deployments` 是否部署成功，再强刷（Ctrl/Cmd + Shift + R）；确认没在 `_headers` 加缓存规则。
- **构建报错 `npm: command not found`**：Build command 没留空，清空即可。
- **想本地调试 Functions**：`python -m http.server` 不会执行 `functions/`。要用 `npx wrangler pages dev . --d1=DB` 并先初始化本地 D1，参考 [Pages Functions 本地开发](https://developers.cloudflare.com/pages/functions/local-development/)。日常改前端不必折腾这个。
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

- 纯前端游戏，无框架、无构建、无第三方请求；`functions/` 用 Pages Functions（ES Module），只有 `/api/*` 走函数。
- 排行榜存 D1，SQL 全部参数化绑定；读取 `no-store`，写入前做字段与一致性校验。
- WebAudio 实时合成音效，不加载任何音频文件，可一键静音（偏好存 `localStorage`）。
- 支持中 / 英双语、浅 / 深主题、`prefers-reduced-motion`、键盘操作（回车/空格再来一局、Esc 结束本局）、移动端 `touch-action: none` 防误滑。
- `_headers` 配置 `nosniff`、Referrer-Policy、Permissions-Policy 与 CSP（`connect-src 'self'` 正好够调用同源 API）。
