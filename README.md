# 屿光 YUGUANG · 静态作品集站点

一个**零依赖、零构建**的纯静态网站：原生 HTML + CSS + JavaScript，没有任何 CDN、字体或图片外链。整个仓库根目录就是发布目录，推到 GitHub 后由 Cloudflare Pages 直接托管即可访问。

> 当前内容为示例文案（独立创意工作室作品集），后续改主题、改文案、换项目都只需要改 `index.html`。

---

## 目录结构

```
.
├── index.html              # 整站页面（所有文案都在这里）
├── 404.html                # 404 页，自包含样式，任意路径下都能显示
├── _headers                # Cloudflare Pages 响应头（仅安全头，不设缓存）
├── .gitignore
├── README.md
└── assets/
    ├── css/style.css       # 全部样式、配色变量、响应式
    ├── js/main.js          # 主题切换 / 菜单 / 筛选 / 动效
    └── favicon.svg         # 站点图标
```

页面内所有资源都使用**相对路径**，因此双击 `index.html` 用 `file://` 直接打开也能正常显示；部署到 `*.pages.dev` 根域名、GitHub Pages 或自定义域名同样适用。

---

## 本地预览

任选一种：

```bash
# Python（本机已装）
python -m http.server 8000

# 或 Node
npx serve .
```

然后打开 <http://localhost:8000>。也可以直接用浏览器打开 `index.html`。

---

## 部署到 Cloudflare Pages（推荐：连 GitHub 仓库）

### 1. 在 GitHub 新建空仓库

登录 GitHub → 右上角 **+** → **New repository** → 填仓库名、选 Public / Private 都行 → **不要**勾选 `Add a README file`、`.gitignore`、`license`（空仓库可避免首次 push 冲突）→ **Create repository**。复制页面给出的仓库地址，形如 `https://github.com/<用户名>/<仓库名>.git`。

### 2. 把代码推到 GitHub

本仓库已通过 SSH 推送到 `git@github.com:blauesj/onlin_website.git` 的 `main` 分支。若从零开始或换一台机器重来，完整流程如下（已有仓库可跳过前三步）：

```bash
cd <项目目录>

# 仅全新目录需要
git init -b main
git add .

# 首次使用 Git 需设置提交身份，替换成你自己的
git config user.name "你的名字"
git config user.email "你的邮箱"

git commit -m "init: static site"
git remote add origin git@github.com:blauesj/onlin_website.git
git push -u origin main
```

仓库可以是 Public 也可以是 Private，Cloudflare Pages 都支持。若 22 端口被网络阻断，见下方「常见问题」中的 SSH over 443 配置。

### 3. 在 Cloudflare 创建 Pages 项目

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/) → 左侧 **Workers & Pages** → **Create** → **Pages** → **Connect to Git**。
2. 授权并选择你的 GitHub 账号与仓库（如未看到仓库，需在 GitHub 授权页把该仓库加入允许列表）。
3. 构建设置**保持无框架**，按下面填写：

   | 项目 | 填写值 |
   | --- | --- |
   | Production branch | `main` |
   | Framework preset | `None` |
   | Build command | **留空** |
   | Build output directory | **留空**（或填 `/`） |
   | Root directory | `/` |

   > 这是纯静态站点，没有 `package.json`，**不要**填 `npm run build`，否则构建会失败。

4. 点 **Save and Deploy**。约 1–2 分钟后即可通过 `https://<项目名>.pages.dev` 打开。
5. 之后每次 `git push` 到 `main`，Cloudflare 会自动重新部署；其他分支会生成预览地址。

### 4. 绑定自定义域名

1. Pages 项目 → **Custom domains** → **Set up a custom domain** → 输入域名（如 `www.example.com`）→ **Continue** → **Activate domain**。
2. 按面板提示添加 DNS 记录：

   | 想绑定的地址 | 需要的记录 |
   | --- | --- |
   | 子域名（推荐，如 `www`） | `CNAME  www  →  <项目名>.pages.dev`，任意 DNS 服务商都可以 |
   | 根域名（`example.com`） | 域名必须接入 Cloudflare 并使用其 DNS，靠 CNAME Flattening 实现，面板里会直接给出 A 记录 |

3. 如果域名已经在你的 Cloudflare 账号里，CNAME 记录会自动添加；在别家 DNS 就手动加一条，代理状态保持默认的「仅 DNS」或按提示设置即可。
4. 等状态变成 **Active**（通常几分钟，SSL 证书自动签发），即可用 `https://你的域名` 打开。原 `*.pages.dev` 地址仍然可用。

> 若希望把 `example.com` 与 `www.example.com` 统一到一个地址，可在 Pages 的 **Bulk Redirects** 里配置，或按需要在仓库根目录新增 `_redirects`（Cloudflare Pages 会读取）。暂不添加是为了避免未知域名产生错误跳转。

### 5. 部署后自检

- 打开 `https://<项目名>.pages.dev` 与自定义域名，确认首页、深浅色切换、作品筛选都正常。
- 浏览器开发者工具 → Network，确认 `style.css` / `main.js` / `favicon.svg` 都是 200。
- 随便访问一个不存在的路径，应显示 `404.html`。
- 改一行 `index.html` 再 `git push`，Cloudflare 应自动生成一次新部署。

---

## 日常更新：改完网页怎么上线

连了 Git 之后**没有传统服务器要上传文件**：改完代码推到 `main`，Cloudflare 自动重新部署。

```bash
cd <项目目录>

# 1. 可选：先本地预览确认改动
python -m http.server 8000

# 2. 提交并推送
git add .
git commit -m "update: 修改首页文案"
git push
```

流程：`git push` → GitHub 通知 Cloudflare → 拉取最新代码 → 构建（本项目无构建步骤）→ 切换到全球边缘节点。通常 **30 秒 ~ 2 分钟**生效，**域名、SSL、DNS 全部不用重新配置**。

| 场景 | 怎么做 |
| --- | --- |
| 看进度 / 排错 | Pages 项目 → **Deployments**（部署），每次 push 一条记录，点开有日志和该次部署的独立 URL |
| 先试后发 | 推到 `main` 以外的分支或开 PR，会生成独立预览地址，不影响正式站点；确认后再合并 |
| 改出问题要退回 | 在部署记录里选中上一次成功的部署做 **Rollback**（回滚） |
| 不想每次 push 都部署 | 项目 → **Settings → Builds → Branch control**，关掉 `Enable automatic production branch deployments`；之后改用 Wrangler 手动部署 |
| 部署失败 | 旧版本会继续在线，站点不会挂；看构建日志修完再 push |

> 注意：这不是字面意义的「实时」，有一分钟左右的构建延迟。若 Cloudflare 项目还没创建，push 只是更新了 GitHub 仓库，等项目创建时会自动用最新代码。

### 为什么改完刷新就能看到新内容

本项目**故意不设置任何自定义缓存**：`_headers` 里只放安全头，不给 `/assets/*` 或 `/*` 加 `Cache-Control`。Cloudflare Pages 默认对静态资源返回 `Cache-Control: public, max-age=0, must-revalidate` 并附带 `Etag`，浏览器每次都会回源校验，文件变了拿新的、没变返回 304。

> 千万别加 `max-age=86400` 或 `s-maxage=604800` 这类规则：它会覆盖默认值，导致「部署成功但页面还是旧的」；`pages.dev` 又没有可清缓存的 zone，可能要等很久才恢复。若已加了长缓存，先删掉规则重新部署，再到自定义域名所在 zone 执行 `Purge Everything`。

排查技巧：`Ctrl/Cmd + Shift + R` 强刷、开发者工具 Network 勾选 `Disable cache`、或直接打开该次部署的独立 URL 确认新构建本身是对的；也检查自定义域名所在 zone 的 Cache Rules 有没有缓存 HTML。

---

## 备选：用 Wrangler 直接上传（不连 Git）

```bash
npx wrangler pages deploy . --project-name=yuguang-site
```

首次运行会跳浏览器登录 Cloudflare。适合快速验证，但没有 Git 自动部署。

---

## 修改内容指引

| 想改什么 | 改哪里 |
| --- | --- |
| 品牌名、标题、所有文案、项目卡片 | `index.html` |
| 主色 / 深浅色配色 | `assets/css/style.css` 顶部 `:root` 与 `html[data-theme="dark"]` 里的 `--accent` 等变量 |
| 作品分类 | `index.html` 中 `.filter` 的 `data-filter` 与 `.work-card` 的 `data-category` 保持一致 |
| 联系邮箱 | `index.html` 中搜索 `hello@yuguang.studio`（`mailto:` 与 `#copy-email` 的 `data-email` 两处） |
| 站点图标 | `assets/favicon.svg` |
| 安全头 | `_headers`（只加安全头，不要加缓存规则） |

**替换作品缩略图**：目前用纯 CSS 渐变占位，不依赖任何图片。若要放真实图片，在 `assets/` 下新建 `img/` 目录，把 `.work-thumb` 里的 `<span>` 换成 `<img>`，并在 CSS 中补一条 `.work-thumb img { width:100%; height:100%; object-fit:cover; }`。注意 `_headers` 的 CSP 只允许 `img-src 'self' data:`，用本地图片无需改动；若改用外部图床，需把域名加入 CSP。

---

## 常见问题

- **页面 404 / 样式丢失**：确认仓库根目录直接就是 `index.html`（不是嵌套了一层文件夹），且 Root directory 填的是 `/`。
- **改了代码但线上没变**：先看 `Deployments` 里这次 push 是否部署成功；成功后强刷（Ctrl/Cmd + Shift + R）。若仍不变，确认 `_headers` 没给 HTML 或资源加 `max-age` / `s-maxage`（本项目故意不加），并检查自定义域名所在 zone 的 Cache Rules 是否缓存了 HTML。详见「日常更新」。
- **构建报错 `npm: command not found` / 找不到 build**：说明 Build command 没留空，按上表清空即可。
- **GitHub Pages 也能用吗**：可以，Settings → Pages → Deploy from a branch → `main` / `root`，同样零构建。
- **SSH 推送报 `Connection closed ... port 22` / `Connection timed out`**：部分网络会封 22 端口。在 `~/.ssh/config` 加入下面几行，即可继续用 `git@github.com:...` 形式的地址，自动走 GitHub 官方的 SSH over 443：

  ```sshconfig
  Host github.com
      HostName ssh.github.com
      Port 443
      User git
      IdentityFile ~/.ssh/id_ed25519
      IdentitiesOnly yes
  ```

  用 `ssh -T git@github.com` 验证，看到 `Hi <用户名>! You've successfully authenticated` 即成功（GitHub 不提供 shell，返回码 1 属正常）。

---

## 技术说明

- 支持浅色 / 深色主题（右上角按钮，偏好存 `localStorage`）、移动端菜单、作品分类筛选、滚动出现与数字动画。
- 遵循 `prefers-reduced-motion`，含跳转主内容链接、语义化标签与键盘可见焦点。
- 全部资源同源，无第三方请求；`_headers` 配置了 `nosniff`、Referrer-Policy、Permissions-Policy 与 CSP。
