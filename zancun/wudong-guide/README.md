# wudong-guide —— 乌东文旅的 DSH 游客向导

用 [DeepSeek Harness](https://www.npmjs.com/package/@deepseek-ai/dsh)（`dsh`）给乌东文旅平台
外挂一个**游客向智能体**：帮游客排行程、按需求找民宿/餐厅/路线/非遗商品，以及回答苗寨文化问题。

**对现有代码零侵入**：这是一个自带 `package.json` 的兄弟目录，根目录没有 workspace 配置，
现有四个目录（`wudong-platform` / `miniapp` / `cool-admin-vue` / `cool-admin-midway`）没有一个会 import 它。

数据面**只读**，全部走 `wudong-server` 的 `/api/*` 匿名门面 —— 不碰后端一行代码。

## 它长什么样

- 一个独立的网页对话界面：`http://127.0.0.1:3080`（自带访问令牌，不是裸奔的）。
- 11 个只读工具，**没有** shell、文件读写、网页抓取、子代理 —— 这些在 web profile 里默认就是停用的，
  本项目还用 `tools/verify-lockdown.mjs` 把它固化成了断言。
- 导游人格与行为准则由插件注入，**不能**下单/支付/预订（平台的下单接口要登录态）。

## 前置条件

| 依赖 | 要求 | 说明 |
|---|---|---|
| Node | `^22.19` 或 `>=24` | 本机实测 v24.16.0 |
| `wudong-server` | 监听 `127.0.0.1:8001` | 向导的数据来源；没起来它也会如实说查不到 |
| DeepSeek API key | — | 见下面「key 从哪来」 |
| `pnpm` | 仅安装插件时需要 | 本机只有 corepack，见下面的临时 shim 办法 |

## 一次性安装

```powershell
# 1) 装插件自己的依赖（@deepseek-ai/dsh-tools）
Set-Location <本目录>
npm install

# 2) 把它装进 dsh 的 web profile
#    本机 pnpm 不在 PATH 上，用一个只对本次调用生效的临时 shim：
$shim = "$env:TEMP\pnpm-shim"
New-Item -ItemType Directory -Force $shim | Out-Null
Set-Content "$shim\pnpm.cmd" "@echo off`r`ncorepack pnpm %*" -Encoding ASCII
$env:PATH = "$shim;$env:PATH"
npx --yes @deepseek-ai/dsh@0.1.5-rc.1 plugin --profile web add <本目录的绝对路径>

# 输出里应看到：+ wudong-guide link:...\wudong-guide
# 以及一条警告「declares no dsh.bundle」—— 这是预期的：它是普通依赖，
# 挂载由本目录的 cordis.patch.yml 负责，不是自动激活的 profile 层。
```

装好后，`~/.dsh/profiles/web/node_modules/wudong-guide` 是一个指向本目录的 **Junction**，
所以**改本目录的源码即时生效**，不用重装。

## 启动

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File launch.ps1              # 自动开浏览器
powershell -NoProfile -ExecutionPolicy Bypass -File launch.ps1 -NoOpen      # 不开浏览器
```

> 用 `powershell` 而不是 `pwsh`：这台机器上没装 PowerShell 7。
> `-ExecutionPolicy Bypass` 是必需的，否则 `-File` 会被执行策略拦住。

`launch.ps1` 会：解析并掩码打印 key → 探测 8001 可达性（只是提示，不阻断）→ 带 `cordis.patch.yml` 启动。

**首次使用需要在界面里选一个工作区**（点「选择工作区」或「添加工作区」）。这是 DSH 网页端的强制前置，
它用的是**原生目录对话框**，无法脚本化 —— 所以自动化测试走的是 headless profile（见下）。

### key 从哪来

只认一处，顺序如下：

1. 环境变量 `$env:DEEPSEEK_API_KEY`
2. 回落到 Claude Code 的 `~/.claude/settings.json` 里的 `env.ANTHROPIC_AUTH_TOKEN`（即「复用现有 key」）

**key 不落盘** —— `launch.ps1` 只把它放进进程环境变量。
`~/.dsh/.credentials.yaml` 里只有浏览器会话授权，没有模型 key。

> 注意 DSH 的凭据优先级是 `进程环境变量 > ~/.dsh/.credentials.yaml > 启动器 .env`。
> 只要环境变量里有一把有效 key，界面里填的就会被静默忽略 —— 所以刻意只保留这一处。

## 在网站里打开（顶栏「AI 向导」入口）

`wudong-web` 的顶栏新增了一项「AI 向导」，点击在新标签页打开向导。
站点侧只改了一个文件：`src/layouts/MainLayout.vue`（一个导航项 + 一个守卫），
地址可用 `VITE_GUIDE_URL` 覆盖。

### ⚠️ 必须用 `http://127.0.0.1:3000` 访问站点，不能用 `http://localhost:3000`

这不是矫情，是浏览器的硬限制，实测确认：

- DSH 下发的会话 Cookie 是 **`SameSite=Strict`**（`dsh-auth-*`，httpOnly，有效期一个月）。
- 浏览器把 **`localhost` 与 `127.0.0.1` 当作两个不同的站点** —— 所以从 `localhost:3000`
  点击跳转到 `127.0.0.1:3080`，属于**跨站导航**，Strict Cookie 不会被带上，向导会回一句英文的
  `dsh web authentication required`。
- 但 **SameSite 只比较站点、不比较端口** —— 所以 `127.0.0.1:3000` → `127.0.0.1:3080`
  是同站，Cookie 正常带上，能直接进。

已验证：站点用 `localhost:3000` 访问时**任何真实用户跳转**（同标签页点击、`window.location`、
新标签页）都失败，只有程序化导航能过。所以入口里加了守卫：host 对不上就拦下并提示该用哪个地址，
而不是打开一个注定 401 的页面。

**副作用（要提前知道）**：`localhost:3000` 与 `127.0.0.1:3000` 是不同的源，
localStorage 不共享 —— 如果你之前是在 `localhost:3000` 登录的，换到 `127.0.0.1:3000` 需要重新登录一次。

### 首次使用需要一次「带 token 的访问」

向导的 Cookie 要靠访问一次 `http://127.0.0.1:3080/?token=<每次启动都会变>` 来建立。
`launch.ps1` 默认会**自动打开浏览器**去访问这个地址，就是干这件事的。
如果不小心清掉了 Cookie，再跑一次 `launch.ps1` 即可。

## 界面皮肤（`ui/`）

向导的界面默认长着「DeepSeek Harness 开发者工具」的样子。`ui/` 这个包把它改成乌东文旅向导：
苗蓝 + 金的配色、自己的徽标与名称、干净的布局。

**改动清单**

| 做了什么 | 怎么做的 |
|---|---|
| 配色（苗蓝 #1a365d / 金 #d4af37 / 暖白底 #faf8f5） | `ctx.theme.overrideTokens(...)` 覆盖 25 个 `--dsw-alias-*` 令牌 |
| 侧栏徽标 + 名称「乌东文旅 · 向导」 | 占槽位 `sidebar.brand.mark` / `sidebar.brand.name`，`priority: -1` |
| 首屏徽标（替掉那只动画鱼） | 占槽位 `conversation.hero.brand.mark` |
| 标签页标题「乌东文旅 · AI 向导」 | 观察并改写 `ui-layout` 写出的标题（见下） |
| 裁掉开发者界面 | patch 里停用 17 个「叶子行」 |
| 隐藏首屏残留文案「探索未至之境」「预览版」 | 按精确文本隐藏叶子元素 |
### 三个值得记住的机制

1. **浏览器插件不需要打包器。** DSH 的客户端模块表只要求产物是「一段经典脚本」：
   顶层 `window.__ModuleLoader__.load({ id: '<包名>', factory })`，`id` 必须与
   `package.json.name` 完全一致。第一方包的 `lib/client.js` 是 tsdown 产物，但配置没随包发布 ——
   而我们直接手写产物形态即可。React 由宿主提供，用 `require('react/jsx-runtime')` 取，**不要打进 bundle**。
   包要进插件清单，需要 `dsh.client.platform === "web"` + `exports["./client"]`，
   并且所在行**已挂载且未停用**（扫描会跳过 `disabled` 的行，也会跳过还没有 fiber 的行）。

2. **配色要用 `overrideTokens`，不是「注册主题 + setTheme」。** 本机实测后者的令牌上不去；
   而 `overrideTokens` 是把我们的层折进**当前**主题（`composeActive` 按 seq 合并），
   不依赖 preference 是否切过去。值必须是 `{ light, dark }` 对；两侧同值 = 固定品牌配色。
   另外自定义主题 id **不会**出现在「外观」设置里（那里是写死的浅/深/跟随系统三个方块）。

3. **品牌要占槽位，且必须给 `priority: -1`。** `single` 槽位在同一 priority 上二次注册会**抛异常**；
   规则是「priority 最小者渲染」。官方品牌包在 0，我们用 -1 压过它 —— 所以**不必停用**
   `ui-brand-official`（它挂着还能在我们加载失败时兜底成鱼形 logo）。

### 已知残留（做不到的部分）

- **界面文案改不了**：首屏标题、输入框提示语、只读徽标「仅可查看」都是 `ui-conversation` 的
  locale 文案，而 locale 服务**不允许**对同一 (命名空间, 语言) 重复注册
  （`register` 会抛 `locale namespace "conversation" already has locale "zh"`）。
  所以前两句用「按精确文本隐藏」绕过去；**「仅可查看」有意保留** —— 它属于 ui-conversation
  自己的渲染，且按文本隐藏会命中 6 个元素（含容器），有误伤输入框整行的风险。
- **`ui-settings-models` 已停用**，所以设置里看不到「模型」页。key 由环境变量注入，游客不需要看到；
  要给向导换模型，改 `~/.dsh/settings.yaml` 或环境变量。
- **外观被固定在浅色**：深色底 + 这套浅色令牌会混成四不像。用户仍可在「外观」里改，但下次加载会被拉回浅色。

### 怎么回退

皮肤是纯叠加的，删掉即可恢复默认外观：

- 恢复默认界面：把 `cordis.patch.yml` 里那些 `disabled: true` 的行删掉。
- 整个皮肤关掉：删掉 `- insert:` 里的 `wudong-guide-ui` 那一行（或
  `dsh plugin --profile web remove wudong-guide-ui`），向导的功能完全不受影响 ——
  皮肤代码全在 `ui/` 里，与 `src/core/`（与框架无关的业务逻辑）严格分离。

### 工作区

DSH 网页端要求先有一个「工作区」才会渲染输入框。本机已经建好了，标题是「乌东文旅」，
记录在 `~/.dsh/storages/workspace.json`：

```json
{"tables":{"workspaces":{"<uuid>":{"path":"<已存在的绝对路径>","title":"乌东文旅","sessionIds":[],"createdAt":"…","updatedAt":"…"}}},
 "global":{"initialized":true,"workspaceIds":["<uuid>"],"archivedSessionIds":[]}}
```

`path` 必须是**已存在**的绝对路径（加载时走 `realpath`，不存在会报错）。
换台机器或清掉 `~/.dsh` 后，需要在界面上点一次「添加工作区」（原生目录对话框，选哪个目录都行 ——
向导不读文件，它只调后端接口）。

## 验证

四个脚本，都可独立重复运行：

```powershell
# 1) core 层：纯函数单测 + 真实 8001 接口断言（32 项）
node tools/verify-core.mjs

# 2) 降级：后端不可用时必须返回可读错误、不编造（不动你正在跑的后端，
#    用 WUDONG_API_BASE 指向坏地址来触发）
$env:WUDONG_API_BASE='http://127.0.0.1:9';     node tools/verify-degradation.mjs
$env:WUDONG_API_BASE='http://10.255.255.1:8001'; node tools/verify-degradation.mjs
Remove-Item Env:\WUDONG_API_BASE

# 3) 插件适配层：用桩 ctx 调 apply()，检查工具注册、schema 编译、每个 execute（53 项）
node tools/verify-plugin.mjs

# 4) 安全面：组合配置里所有危险工具必须停用、无 MCP 挂载、人格已替换
node tools/verify-lockdown.mjs

# 5) 站点入口：页面无报错、1280~1600 不溢出、点击真的能打开向导；
#    跨站（localhost:3000）时被守卫拦下并给出指引（需要前端 dev server 在 3000）
$env:DSH_TOKEN='<取自 dsh 启动日志的 ?token=>'
node tools/verify-site-entry.mjs

# 6) 皮肤：配色令牌、标签页标题、品牌槽位、界面裁剪、隐藏残留文案；
#    加 --chat 还会在真实 UI 里发一条消息（会花 token，需已选好工作区）
$env:DSH_TOKEN='<取自 dsh 启动日志的 ?token=>'
node tools/verify-ui.mjs --chat --screenshot ui.png
```

LLM 级端到端（走 headless profile，会真的调模型、花 token）：

```powershell
$env:DEEPSEEK_API_KEY = (Get-Content "$env:USERPROFILE\.claude\settings.json" -Raw | ConvertFrom-Json).env.ANTHROPIC_AUTH_TOKEN
node tools/e2e-agent.mjs          # 4 个用例：行程 / 搜索 / 文化问答 / 降级
node tools/e2e-agent.mjs 1        # 只跑第 1 个
```

> 提问为什么写在脚本里当 UTF-8 字面量？因为 **PowerShell 5.1 调原生程序时按 ANSI 码页编码命令行**，
> 中文参数会被写坏。脚本用 Node 的 `spawn` 以宽字符命令行传给子进程，才不会糟蹋中文。

浏览器里的那份（`tools/e2e-guide.mjs`）也能用，但受限于「必须先选工作区」，
需要你手工选完之后再把会话 token 传进来：

```powershell
$env:DSH_TOKEN='<取自 dsh 启动日志的 ?token=>'
node tools/e2e-guide.mjs --explore                    # 先看 DOM
node tools/e2e-guide.mjs "2 天 1 晚带老人，想爬梯田+看非遗"
```

## 已知边界（设计上的既有缺口，不是 bug）

1. **行程不落库**：平台没有 itinerary 表，日程只活在会话里，刷新即失。
2. **只能描述、不能下单**：所有下单/预订 POST 都需要登录态（`/app/*` 被全局 JWT 中间件拦住）。
3. **余房不是按日期的**：`/api/hotel/calendar/:roomTypeId` 返回的是由静态库存推导的**常量数组**，
   不是真实可用性 —— 所以它**没有被暴露成工具**，向导只能说「目前登记有房」。
4. **合成字段不暴露**：`goods.skus`、`scenic.ticketTypes`、`food.timeSlots` 都是后端拼出来的，
   喂给模型等于撒谎；另外 `travel/guide/list` 恒为空，也没暴露。
5. **景区没有介绍正文、路线没有逐日安排**：文化背景只能从社区攻略里检索。
6. **DSH 是 `0.1.5-rc.1` 开发者预览版**：破坏性变更预期内。所以业务逻辑全在 `src/core/`（与框架无关），
   `src/plugin/` 只做薄适配 —— 真变了只改那一个文件。

## 安全说明

- **工具面**：web profile 默认就停用了 `tool-bash` / `tool-pwsh` / `tool-fs` / `tool-fs-search` /
  `tool-web` / `tool-subagent` / `tool-workflow` / `tool-todo` / `tool-goal` / `tool-ralph` / `tool-skill`，
  也没挂载 `tool-cordis` 这类能改插件树的东西。本项目**不碰这些行**（改错会因 shell 栈配方不完整而启动失败），
  只断言它们确实是停用的。
- **安全边界是那个硬编码的 baseURL**：`src/core/http.js` 里的 `http://127.0.0.1:8001`。
  模型只能传业务参数，**永远不能传 URL 或路径**。
- **网页端有信任栅栏**：不带 `?token=` 访问返回 401。
- **对外暴露需另加防护**：目前只绑 `127.0.0.1`，是本机演示。若要公网访问，
  需要再加鉴权、限流和成本上限 —— 一个无鉴权的 LLM 端点等于把 key 的额度对外开放。

## 结构

```
wudong-guide/
  launch.ps1            启动（解析 key → 探测后端 → 带 patch 启动）
  cordis.patch.yml      挂载两个插件 + 换导游人格 + 停用 17 个开发者界面行
  src/core/             与框架无关的业务逻辑
    http.js             只读 HTTP：硬编码 baseURL、超时、按 code 判成败、JSON 安全解析
    normalize.js        形状归一化：裸数组/扁平信封、size 夹紧、字段裁剪
    api.js              按域的调用与中文渲染
    itinerary.js        并行收集候选 + 费用粗估（不产出逐日日程，排序交给模型）
    persona.js          行为准则
  src/plugin/index.js   注册 11 个工具 + 注入准则（依赖 DSH 服务端 API）
  ui/                   界面皮肤（依赖 DSH 浏览器端 API，与上面完全分离）
    package.json        dsh.client.platform=web + exports["./client"]
    lib/index.js        宿主半部：空 apply()（只为让所在的行走进插件清单）
    lib/client.js       手写的浏览器 bundle：配色 / 品牌 / 标题 / 文案清理
  tools/                验证脚本
```

## 卸载

```powershell
npx --yes @deepseek-ai/dsh@0.1.5-rc.1 plugin --profile web remove wudong-guide
```

或直接删掉 `~/.dsh/profiles/web/node_modules/wudong-guide` 这个 Junction。本目录可以整个删掉。
