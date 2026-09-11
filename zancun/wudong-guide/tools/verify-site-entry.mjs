/**
 * 验证站点里的「AI 向导」入口。
 *
 * 复用 miniapp 里已装好的 Playwright + 系统 Chrome。
 *
 * 覆盖：
 *   A. 站点用 127.0.0.1:3000 访问（与向导同 host）
 *      → 页面无报错、入口存在、1280~1600 不溢出、点击真的能打开向导
 *   B. 站点用 localhost:3000 访问（与向导跨站）
 *      → 被守卫拦下并给出明确指引，而不是打开一个 401 页面
 *
 * 用法：
 *   $env:DSH_TOKEN='<取自 dsh 启动日志的 ?token=>'
 *   node tools/verify-site-entry.mjs
 */

import { createRequire } from 'node:module'
import path from 'node:path'

const SITE = process.env.SITE_URL || 'http://127.0.0.1:3000'
const CROSS_SITE = process.env.CROSS_SITE_URL || 'http://localhost:3000'
const GUIDE = process.env.GUIDE_URL || 'http://127.0.0.1:3080'
const TOKEN = process.env.DSH_TOKEN
const PW_ROOT = process.env.PW_ROOT || 'C:/Users/24076/Desktop/wudong-project/wudong_project/miniapp'

if (!TOKEN) {
  console.error('缺少 DSH_TOKEN（取自 dsh 启动日志的 ?token=）。')
  process.exit(2)
}

const require = createRequire(path.join(PW_ROOT, 'package.json'))
const { chromium } = require('playwright')

let failed = 0
function check(label, condition, detail) {
  console.log(`  ${condition ? 'ok  ' : 'FAIL'} ${label}${condition || detail === undefined ? '' : `  → ${detail}`}`)
  if (!condition) failed += 1
}

const browser = await chromium.launch({ channel: 'chrome', headless: true })

/** 新开一个带向导 Cookie 的上下文（相当于"用户先访问过一次带 token 的地址"）。 */
async function freshContextWithGuideSession() {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const seed = await context.newPage()
  const response = await seed.goto(`${GUIDE}/?token=${TOKEN}`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  check('带 token 访问向导返回 200', response?.status() === 200, `HTTP ${response?.status()}`)
  const cookies = await context.cookies(GUIDE)
  check('服务端下发了 dsh-auth-* Cookie', cookies.some((c) => c.name.startsWith('dsh-auth-')), cookies.map((c) => c.name).join('、'))
  await seed.close()
  return context
}

/* ========================= A. 同 host 访问：应当完全可用 ========================= */
console.log(`\n===== A. 站点 ${SITE}（与向导同 host）=====`)
const context = await freshContextWithGuideSession()

const page = await context.newPage()
const pageErrors = []
const consoleErrors = []
page.on('pageerror', (error) => pageErrors.push(String(error)))
page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()) })

const siteResponse = await page.goto(SITE, { waitUntil: 'domcontentloaded', timeout: 30000 })
check('站点返回 200', siteResponse?.status() === 200, `HTTP ${siteResponse?.status()}`)
await page.waitForTimeout(2500)

console.log('\n-- 页面报错（图标名写错会整页崩）--')
check('没有未捕获的页面异常', pageErrors.length === 0, pageErrors.slice(0, 2).join(' | '))
check('没有 console.error', consoleErrors.length === 0, consoleErrors.slice(0, 2).join(' | '))

console.log('\n-- 入口元素 --')
const entry = page.locator('a.nav-item-external')
check('存在 a.nav-item-external', (await entry.count()) === 1, `count=${await entry.count()}`)
check('文字含「AI 向导」', (await entry.innerText()).includes('AI 向导'), (await entry.innerText()).replace(/\s+/g, ' '))
check('href 正确', (await entry.getAttribute('href')) === GUIDE, await entry.getAttribute('href'))
check('在新标签页打开', (await entry.getAttribute('target')) === '_blank')
check('带 rel=noopener', (await entry.getAttribute('rel')) === 'noopener')
check('图标渲染出来了', (await entry.locator('svg').count()) > 0)

console.log('\n-- 布局测量（导航新增一项后是否撑爆 / 重叠）--')
for (const width of [1280, 1366, 1440, 1600]) {
  await page.setViewportSize({ width, height: 900 })
  await page.waitForTimeout(600)
  const m = await page.evaluate(() => {
    const de = document.documentElement
    const nav = document.querySelector('nav.nav')
    const headerContent = document.querySelector('.header-content')
    const entryRect = document.querySelector('a.nav-item-external').getBoundingClientRect()
    const actionsRect = document.querySelector('.header-actions').getBoundingClientRect()
    return {
      docOverflow: de.scrollWidth - de.clientWidth,
      navOverflow: nav.scrollWidth - nav.clientWidth,
      entryRight: Math.round(entryRect.right),
      actionsLeft: Math.round(actionsRect.left),
    }
  })
  check(`${width}px 无横向溢出`, m.docOverflow <= 0, `溢出 ${m.docOverflow}px`)
  check(`${width}px 导航未被裁切`, m.navOverflow <= 0, `导航超出 ${m.navOverflow}px`)
  check(`${width}px 不与右侧操作区重叠`, m.entryRight <= m.actionsLeft, `入口右缘 ${m.entryRight} > 操作区左缘 ${m.actionsLeft}`)
}

console.log('\n-- 点击入口，看是否真的打开向导 --')
await page.setViewportSize({ width: 1440, height: 900 })
await page.waitForTimeout(500)
const [popup] = await Promise.all([
  page.waitForEvent('popup', { timeout: 20000 }).catch(() => null),
  entry.click(),
])
check('点击后打开了新标签页', popup !== null)
if (popup) {
  await popup.waitForLoadState('domcontentloaded', { timeout: 30000 })
  await popup.waitForTimeout(3000)
  const title = await popup.title()
  const bodyText = await popup.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 120))
  // 不耦合具体品牌文案（皮肤会改），只断言「渲染出了应用外壳」且「不是鉴权失败页」。
  check('向导外壳渲染出来了', bodyText.includes('新会话') && bodyText.includes('设置'), bodyText)
  check('不是鉴权失败页', !/authentication required|Unauthorized|未经授权/i.test(bodyText), bodyText)
  console.log(`  新标签页标题：${title}`)
  console.log(`  向导正文开头：${bodyText}`)
}
await context.close()

/* ====================== B. 跨站访问：应当被守卫拦下并给出指引 ====================== */
console.log(`\n===== B. 站点 ${CROSS_SITE}（与向导跨站）=====`)
const crossContext = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const crossPage = await crossContext.newPage()
await crossPage.goto(CROSS_SITE, { waitUntil: 'domcontentloaded', timeout: 30000 })
await crossPage.waitForTimeout(2500)

// 先挂监听再点击：不能用长超时等 popup，否则提示（3 秒自动消失）已经过去了。
let popupOpened = false
crossPage.on('popup', () => { popupOpened = true })
await crossPage.locator('a.nav-item-external').click()
const warning = await crossPage.locator('.el-message').first().innerText({ timeout: 4000 }).catch(() => '')
await crossPage.waitForTimeout(800)
check('没有打开注定 401 的新标签页', popupOpened === false)
check('给出了明确的同 host 指引', /同 host/.test(warning) && warning.includes('127.0.0.1'), warning || '(没有出现提示)')
if (warning) console.log(`  页面提示：${warning.replace(/\s+/g, ' ')}`)
await crossContext.close()

await browser.close()
console.log(`\n结果：${failed === 0 ? '全部通过' : `${failed} 项失败`}`)
if (failed > 0) process.exitCode = 1
