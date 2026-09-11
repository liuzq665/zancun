/**
 * 浏览器端 bundle —— **手写的，不经任何打包器**。
 *
 * DSH 的客户端模块表对文件形态的要求就是一段经典脚本：顶层调用
 * `window.__ModuleLoader__.load({ id, factory })`，`factory` 返回 CJS exports。
 * 发布包的 lib/client.js 是 tsdown 的产物，但配置没随包发布，而我们也不需要 ——
 * 直接写产物形态即可。
 *
 * 三条硬约束：
 *   1. `id` 必须与 package.json 的 `name` **完全一致**（否则 loader 报
 *      "bundle <url> loaded without registering <id>"）。
 *   2. 只能 require 基线种子模块（react / react/jsx-runtime / cordis /
 *      dsh-client-ui-slots / dsh-client-ui-primitives …）或另一个已挂载的
 *      dsh.client 包；其他 import 会在 materialize 时抛错。
 *   3. **不要把 React 打进来** —— 它由宿主提供，用 require 取。
 *
 * 组织方式：一件事一段 —— 配色、标签页标题、品牌槽位。
 */

window.__ModuleLoader__.load({
  id: 'wudong-guide-ui',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })

    /** React 由宿主以种子模块提供 —— 只 require，不要打包进来。 */
    const { jsx, jsxs } = require('react/jsx-runtime')

    /* ============================== 配色 ============================== */

    /** 覆盖层的来源标识（也用于卸载时撤回）。 */
    const OVERRIDE_SOURCE = 'wudong-guide-ui'

    /** 取自站点自身的变量：苗蓝 #1a365d / 金 #d4af37 / 暖白底 #faf8f5。 */
    const PALETTE = {
      '--dsw-alias-bg-base': '#faf8f5',
      '--dsw-alias-bg-layer-1': '#ffffff',
      '--dsw-alias-bg-layer-2': '#f6f2ea',
      '--dsw-alias-bg-layer-3': '#efe9dc',
      '--dsw-alias-bg-overlay': '#ffffff',
      '--dsw-alias-border-l1': '#e6ddcb',
      '--dsw-alias-border-l2': '#d9cdb4',
      '--dsw-alias-brand-primary': '#1a365d',
      '--dsw-alias-link': '#2d5a87',
      '--dsw-alias-label-primary': '#22303f',
      '--dsw-alias-label-secondary': '#5b6b7c',
      '--dsw-alias-label-tertiary': '#8b98a6',
      '--dsw-alias-button-primary-fill': '#1a365d',
      '--dsw-alias-button-primary-hover': '#2d5a87',
      '--dsw-alias-interactive-bg-hover': 'rgba(212, 175, 55, 0.12)',
      '--dsw-alias-interactive-bg-active': 'rgba(212, 175, 55, 0.2)',
      '--dsw-alias-specific-sidebar-fill': '#f5f0e6',
      '--dsw-alias-specific-sidebar-nav-item-active': '#e9e0cc',
      '--dsw-alias-state-error-primary': '#991b1b',
      '--dsw-alias-state-success-primary': '#2f7d4f',
      '--dsw-alias-state-warn-primary': '#b8860b',
      '--dsw-alias-markdown-inline-code': '#f1e9d8',
      '--dsw-alias-markdown-code-block': '#f7f2e7',
      '--dsw-alias-toast-bg': '#22303f',
      '--dsw-alias-tooltip-bg': '#22303f',
    }

    /**
     * 用 `overrideTokens` 而不是「注册自定义主题 + setTheme」。
     *
     * overrideTokens 是 token 层的「槽位遮蔽」：它把我们的层折进**当前**主题
     * （`composeActive` 按 seq 合并），所以不依赖 preference 是否切到我们的 id。
     * 值必须是 `{ light, dark }` 对 —— 两侧给同一个值就是一套固定的品牌配色。
     */
    function installPalette(ctx) {
      const pairs = {}
      for (const [name, value] of Object.entries(PALETTE)) pairs[name] = { light: value, dark: value }
      ctx.theme.overrideTokens(OVERRIDE_SOURCE, pairs)
      // 配色的前提是浅色底：深色底 + 这套浅色 token 会混成四不像。
      // 用户仍可在「外观」里改，但那属于有意覆盖品牌样式的例外情况。
      ctx.theme.setTheme('light')
    }

    /* ============================ 标签页标题 ============================ */

    const PRODUCT_TITLE = '乌东文旅 · AI 向导'
    /** 外壳里烘焙的标题（构建期 DSH_CLIENT_TITLE，发布包里改不了）。 */
    const SHELL_TITLE = 'DeepSeek Harness'

    /**
     * ui-layout 的 DocumentTitle 组件用 useEffect 掌管 document.title，
     * 形如 `${会话名} — ${productTitle}`，其中 productTitle 是构建期常量。
     * 所以这里不硬抢，而是**观察并改写它的输出** —— 顺带把
     * 「会话名 — 乌东文旅 · AI 向导」这个原有行为也保留下来。
     */
    function installTitle() {
      const rewrite = () => {
        const current = document.title
        const suffix = ` — ${SHELL_TITLE}`
        if (current === SHELL_TITLE) document.title = PRODUCT_TITLE
        else if (current.endsWith(suffix)) document.title = current.slice(0, -suffix.length) + ` — ${PRODUCT_TITLE}`
      }
      rewrite()
      // 改写是幂等的（只在匹配到外壳标题时才写），不会自激成死循环。
      const observer = new MutationObserver(rewrite)
      observer.observe(document.head, { childList: true, characterData: true, subtree: true })
      return () => observer.disconnect()
    }

    /* ============================== 品牌 ============================== */

    /** 我们占槽位的优先级：数值越小越优先 —— 官方品牌包在 0，我们用 -1 压过它，
     *  所以**不必停用** ui-brand-official（它挂着还能在我们加载失败时兜底）。 */
    const BRAND_PRIORITY = -1
    const BRAND_NAME = '乌东文旅 · 向导'

    const GOLD = '#d4af37'
    const GOLD_DEEP = '#b8860b'
    const INDIGO = '#1a365d'

    /** 银饰蝴蝶 + 梯田：一眼能认的乌东意象，且在 24px 下仍可辨。 */
    function brandMarkSvg(size, className) {
      return jsxs(
        'svg',
        {
          className,
          width: size,
          height: size,
          viewBox: '0 0 48 48',
          fill: 'none',
          'aria-hidden': 'true',
          children: [
            jsx('circle', { key: 'ring', cx: 24, cy: 24, r: 21, stroke: GOLD, strokeWidth: 2.5 }),
            jsx('path', { key: 't1', d: 'M9 31 Q24 23 39 31', stroke: INDIGO, strokeWidth: 2, strokeLinecap: 'round' }),
            jsx('path', { key: 't2', d: 'M12 36 Q24 29 36 36', stroke: INDIGO, strokeWidth: 2, strokeLinecap: 'round' }),
            jsx('path', {
              key: 'wings',
              d: 'M24 23 C18 14 8 15 8 21 C8 27 17 28 24 25 C31 28 40 27 40 21 C40 15 30 14 24 23 Z',
              fill: GOLD,
            }),
            jsx('path', { key: 'body', d: 'M24 23 L24 30', stroke: GOLD_DEEP, strokeWidth: 2, strokeLinecap: 'round' }),
          ],
        },
      )
    }

    /** 侧栏品牌标记（owner props: { size }）。 */
    function BrandMark({ size }) {
      return brandMarkSvg(size ?? 24)
    }

    /** 侧栏品牌名称（该槽位无 owner props，占位者自己负责内容与宽度）。 */
    function BrandName() {
      return jsx('span', {
        style: {
          fontWeight: 600,
          fontSize: 14,
          letterSpacing: '0.5px',
          whiteSpace: 'nowrap',
          color: 'var(--dsw-alias-label-primary)',
        },
        children: BRAND_NAME,
      })
    }

    /** 会话首屏的品牌标记（owner props: { size, className? }）——替掉那只动画鱼。 */
    function HeroBrandMark({ size, className }) {
      return brandMarkSvg(size ?? 34, className)
    }

    /**
     * 注册写法照搬第一方的 brand-official：嵌套 inject 等外层槽位被声明，
     * 内层用**生成器一次 yield 两个 disposer**，保证事务性装卸 ——
     * 槽位撤销时两个填充一起撤回，HMR 期间不会留下半截品牌。
     */
    function installBrand(ctx) {
      ctx.slots.inject('sidebar.brand.mark', () =>
        ctx.slots.inject('sidebar.brand.name', function* () {
          yield ctx.slots.register({ name: 'sidebar.brand.mark', priority: BRAND_PRIORITY }, BrandMark)
          yield ctx.slots.register({ name: 'sidebar.brand.name', priority: BRAND_PRIORITY }, BrandName)
        }),
      )
      ctx.slots.inject('conversation.hero.brand.mark', () =>
        ctx.slots.register({ name: 'conversation.hero.brand.mark', priority: BRAND_PRIORITY }, HeroBrandMark),
      )
    }

    /* ============================ 残留文案清理 ============================ */

    /**
     * ui-conversation 的首屏标题是它自己的 locale 文案，而 locale 服务**不允许**
     * 对同一 (命名空间, 语言) 重复注册（`register` 会抛
     * `locale namespace "conversation" already has locale "zh"`），所以改不了文案本身。
     * 按**精确文本**把这些叶子元素隐藏掉是稳妥的替代：
     * 只匹配 `children.length === 0` 且文本完全相等的 span，不会误伤容器。
     *
     * 定时扫而不是 MutationObserver：一次 querySelectorAll 的开销可忽略，
     * 而且对「切回空会话时重新渲染出来」这种情况也能自动补上。
     */
    const HIDDEN_TEXTS = ['探索未至之境', '预览版']

    function installCopyTrim() {
      const apply = () => {
        for (const el of document.querySelectorAll('span')) {
          if (el.children.length === 0 && HIDDEN_TEXTS.includes((el.textContent ?? '').trim()) && el.style.display !== 'none') {
            el.style.display = 'none'
          }
        }
      }
      apply()
      const timer = setInterval(apply, 1000)
      return () => clearInterval(timer)
    }

    /* ============================== 装配 ============================== */

    const inject = ['theme', 'slots']

    function apply(ctx) {
      ctx.effect(() => installPalette(ctx), 'wudong-guide-ui: palette')
      ctx.effect(installTitle, 'wudong-guide-ui: document title')
      ctx.effect(() => installBrand(ctx), 'wudong-guide-ui: brand slots')
      ctx.effect(installCopyTrim, 'wudong-guide-ui: copy trim')
    }

    exports.apply = apply
    exports.inject = inject
    return module.exports
  },
})
