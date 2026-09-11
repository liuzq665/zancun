/**
 * 皮肤验证：主题配色 / 标签页标题 / 品牌槽位 / 界面裁剪。
 *
 * 复用 miniapp 里已装好的 Playwright + 系统 Chrome（channel: 'chrome'）。
 *
 * 用法：
 *   $env:DSH_TOKEN='<取自 dsh 启动日志的 ?token=>'
 *   node tools/verify-ui.mjs
 *   node tools/verify-ui.mjs --screenshot out.png
 */

import { createRequire } from 'node:module'
import path from 'node:path'

import { searchStays, searchTravel } from '../src/core/api.js'

const GUIDE = process.env.GUIDE_URL || 'http://127.0.0.1:3080'
const TOKEN = process.env.DSH_TOKEN
const PW_ROOT = process.env.PW_ROOT || 'C:/Users/24076/Desktop/wudong-project/wudong_project/miniapp'

const args = process.argv.slice(2)
const screenshotIndex = args.indexOf('--screenshot')
const screenshotPath = screenshotIndex !== -1 ? args[screenshotIndex + 1] : undefined

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
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

const pageErrors = []
page.on('pageerror', (error) => pageErrors.push(String(error)))

console.log(`\n打开 ${GUIDE} …`)
await page.goto(`${GUIDE}/?token=${TOKEN}`, { waitUntil: 'domcontentloaded', timeout: 30000 })
await page.waitForTimeout(7000)

console.log('\n-- 页面健康 --')
check('没有未捕获的页面异常', pageErrors.length === 0, pageErrors.slice(0, 2).join(' | '))
const shell = await page.evaluate(() => ({
  sidebar: document.querySelector('[aria-label="新建会话"]') !== null || document.body.innerText.includes('新会话'),
  settings: document.querySelector('[aria-label="设置"]') !== null,
  composer: document.querySelector('[aria-label="发送消息"]') !== null,
  bodyText: document.body.innerText.replace(/\s+/g, ' ').slice(0, 160),
}))
check('侧栏渲染了（外壳没被挂起）', shell.sidebar, shell.bodyText)
check('设置入口在', shell.settings)
check('输入区在', shell.composer)

console.log('\n-- 标签页标题 --')
const title = await page.title()
check('标题是「乌东文旅 · AI 向导」', title === '乌东文旅 · AI 向导', JSON.stringify(title))

console.log('\n-- 主题配色（body 内联样式里的 --dsw-alias-* 覆盖）--')
const tokens = await page.evaluate(() => {
  const expected = {
    '--dsw-alias-bg-base': '#faf8f5',
    '--dsw-alias-brand-primary': '#1a365d',
    '--dsw-alias-specific-sidebar-fill': '#f5f0e6',
    '--dsw-alias-state-error-primary': '#991b1b',
  }
  const actual = {}
  for (const name of Object.keys(expected)) actual[name] = document.body.style.getPropertyValue(name).trim()
  return { expected, actual, count: document.body.style.length }
})
for (const [name, want] of Object.entries(tokens.expected)) {
  check(`${name} = ${want}`, tokens.actual[name] === want, `实际 ${JSON.stringify(tokens.actual[name])}`)
}
const aliasCount = await page.evaluate(() => {
  let n = 0
  for (let i = 0; i < document.body.style.length; i += 1) if (document.body.style[i].startsWith('--dsw-alias-')) n += 1
  return n
})
check('alias 覆盖数量 ≥ 20', aliasCount >= 20, `实际 ${aliasCount}`)

console.log('\n-- 品牌槽位 --')
const brand = await page.evaluate(() => {
  const sidebar = document.querySelector('aside, .pI_x6G_sidebarCol')
  const hero = document.querySelector('[class*="hero"]')
  return {
    sidebarText: sidebar ? sidebar.innerText.replace(/\s+/g, ' ').slice(0, 120) : '(没找到侧栏)',
    hasOurName: document.body.innerText.includes('乌东文旅 · 向导'),
    heroSvg: hero ? hero.querySelectorAll('svg').length : -1,
  }
})
check('侧栏出现「乌东文旅 · 向导」', brand.hasOurName, brand.sidebarText)

console.log('\n-- 界面裁剪（被停用的行对应 UI 应消失）--')
const trimmed = await page.evaluate(() => {
  const text = document.body.innerText
  return {
    agentPreset: text.includes('标准模式'),
    modelSelector: /DeepSeek-V\d.*Flash/i.test(text),
    heroHeadline: text.includes('探索未至之境'),
    previewBadge: text.includes('预览版'),
    hasSession: text.includes('新会话'),
  }
})
check('「标准模式」已消失', trimmed.agentPreset === false)
check('模型选择器已消失', trimmed.modelSelector === false)
check('「探索未至之境」已隐藏', trimmed.heroHeadline === false)
check('「预览版」徽标已隐藏', trimmed.previewBadge === false)
check('侧栏仍在（外壳未挂起）', trimmed.hasSession)
// 已知残留：ui-conversation 自己渲染的只读徽标「仅可查看」不属于被停用的行，
// 且按文本隐藏有误伤容器的风险，故有意保留（见 README「已知残留」）。

if (args.includes('--chat')) {
  console.log('\n-- UI 里发一条消息（确认裁剪没破坏对话链路，会花 token）--')
  const stays = await searchStays({ size: 20 })
  const travel = await searchTravel({ size: 20 })
  const realNames = [...(stays.ok ? stays.items : []), ...(travel.ok ? travel.items : [])].map((it) => it.name).filter(Boolean)

  const composer = page.locator('[contenteditable="true"]').first()
  const sendButton = page.locator('[aria-label="发送消息"]').first()
  check('找到输入框', (await composer.count()) > 0)
  check('找到发送按钮', (await sendButton.count()) > 0)

  await composer.click()
  await composer.type('乌东有什么值得去的？一句话就好')
  await sendButton.click()

  let cited = false
  let toolCalled = false
  for (let i = 0; i < 45; i += 1) {
    await page.waitForTimeout(2000)
    const text = await page.evaluate(() => document.body.innerText)
    cited = realNames.some((name) => text.includes(name))
    // 「N 次工具调用」是 ui-tool 渲染的，是「模型真的走了工具链路」的直接证据。
    toolCalled = /次工具调用/.test(text)
    if (cited && toolCalled) break
  }
  check('模型在 UI 里调用了工具', toolCalled)
  check('回答引用了真实数据（不是空转）', cited, `候选名：${realNames.slice(0, 4).join('、')}`)
}

if (screenshotPath) {
  await page.screenshot({ path: screenshotPath, fullPage: false })
  console.log(`\n截图已保存：${screenshotPath}`)
}

await browser.close()
console.log(`\n结果：${failed === 0 ? '全部通过' : `${failed} 项失败`}`)
if (failed > 0) process.exitCode = 1
