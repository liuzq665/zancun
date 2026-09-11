/**
 * 用真实浏览器驱动 DSH Web UI，做端到端验证。
 *
 * 复用 miniapp 里已经装好的 Playwright 和系统 Chrome（channel: 'chrome'），
 * 不额外下载浏览器。
 *
 * 用法：
 *   $env:DSH_TOKEN='<token>'                 # 取自 dsh 启动日志的 ?token=
 *   node tools/e2e-guide.mjs --explore        # 先看 DOM 结构，确认选择器
 *   node tools/e2e-guide.mjs "帮我排个 2 天行程"
 *
 * 可选环境变量：
 *   DSH_BASE   默认 http://127.0.0.1:3080
 *   PW_ROOT    默认指向 miniapp 目录（提供 playwright）
 */

import { createRequire } from 'node:module'
import path from 'node:path'

const BASE = process.env.DSH_BASE || 'http://127.0.0.1:3080'
const TOKEN = process.env.DSH_TOKEN
const PW_ROOT = process.env.PW_ROOT || 'C:/Users/24076/Desktop/wudong-project/wudong_project/miniapp'

if (!TOKEN) {
  console.error('缺少 DSH_TOKEN 环境变量（取自 dsh 启动日志里的 ?token=）。')
  process.exit(2)
}

const require = createRequire(path.join(PW_ROOT, 'package.json'))
const { chromium } = require('playwright')

const args = process.argv.slice(2)
const explore = args.includes('--explore')
const prompt = args.filter((a) => !a.startsWith('--')).join(' ')

/** 取 `--key value` 形式的参数值。 */
function valueOf(flag) {
  const index = args.indexOf(flag)
  return index !== -1 ? args[index + 1] : undefined
}

const url = `${BASE}/?token=${TOKEN}`

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1360, height: 950 } })

page.on('console', (message) => {
  if (message.type() === 'error') console.log(`  [console.error] ${message.text().slice(0, 200)}`)
})
page.on('pageerror', (error) => console.log(`  [pageerror] ${String(error).slice(0, 200)}`))

console.log(`打开 ${BASE} ...`)
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
await page.waitForTimeout(4000)

/** UI 首启有个内测声明页，必须先点「继续」才会出现会话界面。 */
async function dismissOnboarding() {
  for (const label of ['继续', '我知道了', '开始使用']) {
    const button = page.getByRole('button', { name: label })
    if (await button.count().catch(() => 0)) {
      try {
        await button.first().click({ timeout: 4000 })
        console.log(`已点击引导按钮「${label}」`)
        await page.waitForTimeout(2000)
        return true
      } catch { /* 继续尝试下一个 */ }
    }
  }
  return false
}

async function dumpDom(tag) {
  const dump = await page.evaluate(() => {
    const describe = (el) => ({
      tag: el.tagName.toLowerCase(),
      type: el.getAttribute('type') || undefined,
      placeholder: el.getAttribute('placeholder') || undefined,
      ariaLabel: el.getAttribute('aria-label') || undefined,
      contenteditable: el.getAttribute('contenteditable') || undefined,
      className: (el.getAttribute('class') || '').slice(0, 70) || undefined,
      text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 50) || undefined,
    })
    return {
      title: document.title,
      inputs: [...document.querySelectorAll('input, textarea, [contenteditable="true"]')].map(describe),
      buttons: [...document.querySelectorAll('button, [role="button"]')].map(describe).slice(0, 30),
      bodyTextHead: (document.body.innerText || '').replace(/\s+/g, ' ').slice(0, 400),
    }
  })
  console.log(`\n===== ${tag} =====`)
  console.log(JSON.stringify(dump, null, 2))
}

if (explore) {
  await dumpDom('引导页之后 / 点击前')
  await dismissOnboarding()
  await dumpDom('点击「继续」之后')
  const clickLabel = valueOf('--click-label')
  if (clickLabel) {
    const target = page.locator(`[aria-label="${clickLabel}"], button:has-text("${clickLabel}")`).first()
    if (await target.count().catch(() => 0)) {
      await target.click({ timeout: 5000 })
      console.log(`已点击「${clickLabel}」`)
      await page.waitForTimeout(2500)
      await dumpDom(`点击「${clickLabel}」之后`)
    } else {
      console.log(`没找到「${clickLabel}」`)
    }
  }
  await browser.close()
  process.exit(0)
}

// 非探索模式也要先翻过引导页
await dismissOnboarding()

if (!prompt) {
  console.error('没有给出提问。用法：node tools/e2e-guide.mjs "你的问题"')
  await browser.close()
  process.exit(2)
}

/* --------------------------- 找到输入框并发问 --------------------------- */
const inputSelectors = [
  'textarea',
  '[contenteditable="true"]',
  'input[type="text"]',
  'input:not([type])',
]

let composed = null
for (const selector of inputSelectors) {
  const candidate = page.locator(selector).last()
  if (await candidate.count().catch(() => 0)) {
    composed = candidate
    console.log(`使用输入框选择器：${selector}`)
    break
  }
}
if (!composed) {
  console.error('没找到输入框，请先 --explore 看 DOM。')
  await browser.close()
  process.exit(3)
}

const before = await page.evaluate(() => document.body.innerText.length)

await composed.click()
await composed.fill(prompt)
await page.keyboard.press('Enter')

// 等回答：轮询正文长度，连续多次不再增长即认为完成
let stable = 0
let last = before
for (let i = 0; i < 90; i += 1) {
  await page.waitForTimeout(2000)
  const now = await page.evaluate(() => document.body.innerText.length)
  if (now === last && now > before + 20) stable += 1
  else stable = 0
  last = now
  if (stable >= 4) break
}

const body = await page.evaluate(() => document.body.innerText)
console.log('\n=========== 页面正文（尾部 4000 字符）===========')
console.log(body.slice(-4000))

await browser.close()
