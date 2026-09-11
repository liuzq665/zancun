import { chromium } from 'playwright'

const BASE = 'http://localhost:3000'
const problems = []
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
page.on('pageerror', (e) => problems.push('PAGEERROR ' + String(e).slice(0, 160)))
page.on('response', (r) => {
  if (r.status() >= 400 && r.url().includes('/app/')) problems.push(`HTTP ${r.status()} ${r.request().method()} ${r.url().replace(BASE, '')}`)
})

const visit = async (p) => { await page.goto(BASE + p, { waitUntil: 'networkidle' }); await page.waitForTimeout(700) }
const db = () => page.evaluate(async () => {
  const tk = localStorage.getItem('token')
  const l = await (await fetch('/app/cart/list', { headers: { Authorization: 'Bearer ' + tk } })).json()
  return l.data.map((d) => ({ id: d.id, name: d.name, qty: d.quantity, sel: d.selected }))
})
const itemBox = () => page.locator('.cart-item .el-checkbox').first()

// clear
await visit('/login')
const pre = await page.evaluate(async () => {
  const r = await fetch('/app/user/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: '13800138001', password: '123456' }) })
  const d = await r.json()
  await fetch('/app/cart/clear', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + d.data.token } })
  return d.code
})
console.log('api login+clear =', pre)

// UI login
await page.getByPlaceholder('请输入手机号').fill('13800138001')
await page.getByPlaceholder('请输入密码').fill('123456')
await page.getByRole('button', { name: /登\s*录/ }).click()
await page.waitForTimeout(1600)

// 1. 从商品详情 UI 加入购物车
await visit('/products')
await page.locator('.product-card').first().click()
await page.waitForTimeout(1400)
await page.getByRole('button', { name: /加入购物车/ }).first().click()
await page.waitForTimeout(1800)
console.log('1. add via UI  ->', JSON.stringify(await db()))

// 2. 进购物车，检查勾选与显示
await visit('/cart')
console.log(`2. cart rows=${await page.locator('.cart-item').count()}  itemChecked=${await itemBox().evaluate((el) => el.classList.contains('is-checked'))}  ${(await page.locator('.selected-count').innerText()).trim()}`)

// 3. 取消勾选 -> 应落库
await itemBox().click()
await page.waitForTimeout(1400)
const afterUncheck = await db()
console.log(`3. uncheck     -> DB selected=${afterUncheck[0]?.sel}  footer="${(await page.locator('.selected-count').innerText()).trim()}"  (expect sel=0)`)
if (afterUncheck[0]?.sel !== 0) problems.push('UNCHECK NOT PERSISTED')

// 4. 刷新后仍是未勾选
await visit('/cart')
const reloadSel = (await db())[0]?.sel
const reloadChecked = await itemBox().evaluate((el) => el.classList.contains('is-checked'))
console.log(`4. after reload-> DB selected=${reloadSel} renderedChecked=${reloadChecked}  (expect 0 / false)`)
if (reloadSel !== 0 || reloadChecked) problems.push('SELECTION NOT PERSISTED ACROSS RELOAD')

// 5. 重新勾选
await itemBox().click()
await page.waitForTimeout(1400)
console.log(`5. recheck     -> DB selected=${(await db())[0]?.sel}  (expect 1)`)

// 6. 改数量
const qty = page.locator('.cart-item .el-input-number input').first()
await qty.fill('2'); await qty.press('Enter'); await page.waitForTimeout(1400)
console.log(`6. qty -> 2    -> DB qty=${(await db())[0]?.qty}  (expect 2)`)

// 7. 删除
await page.locator('.cart-item .item-action button').first().click()
await page.waitForTimeout(800)
if (await page.locator('.el-message-box').count()) {
  await page.locator('.el-message-box__btns .el-button--primary').click()
  await page.waitForTimeout(1800)
}
const finalDb = await db()
console.log(`7. delete      -> DOM rows=${await page.locator('.cart-item').count()} DB=${finalDb.length} emptyShown=${(await page.locator('.cart-empty').count()) > 0}  (expect 0 / 0 / true)`)
if (finalDb.length !== 0) problems.push('DELETE FAILED')

console.log('\n===== PROBLEMS =====')
console.log(problems.length ? [...new Set(problems)].join('\n') : 'NONE')
await browser.close()
