import { chromium } from 'playwright'

const BASE = 'http://localhost:3000'
const problems = []
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
const posts = []
page.on('pageerror', (e) => problems.push('PAGEERROR ' + String(e).slice(0, 150)))
page.on('request', (r) => { if (r.url().includes('/app/ticket/order')) posts.push(r.postData() || '(no body)') })
page.on('response', (r) => {
  const u = r.url()
  if (r.status() >= 400 && (u.includes('/app/') || u.includes('/adminapi/'))) problems.push(`HTTP ${r.status()} ${r.request().method()} ${u.replace(BASE, '')}`)
})
const visit = async (p) => { await page.goto(BASE + p, { waitUntil: 'networkidle' }); await page.waitForTimeout(900) }
const orders = () => page.evaluate(async () => {
  const r = await fetch('/app/ticket/order/list?page=1&pageSize=100', { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } })
  return (await r.json()).data.list.map((o) => o.orderType)
})

await visit('/login')
await page.getByPlaceholder('请输入手机号').fill('13800138001')
await page.getByPlaceholder('请输入密码').fill('123456')
await page.getByRole('button', { name: /登\s*录/ }).click()
await page.waitForTimeout(1600)

// ===== 路线预订（直接进详情页）=====
await visit('/routes/1')
console.log('route url =', new URL(page.url()).pathname)
const rBtn = page.getByRole('button', { name: /立即预订|预订/ }).first()
console.log('  route book btn =', (await rBtn.count()) > 0)
if (await rBtn.count()) {
  await rBtn.click(); await page.waitForTimeout(1100)
  const dlg = page.locator('.el-dialog:visible')
  const ins = dlg.locator('input.el-input__inner')
  const n = await ins.count()
  console.log('  dialog inputs =', n)
  // 日期通常是第一个
  for (let i = 0; i < n; i++) {
    const ph = await ins.nth(i).getAttribute('placeholder')
    if (ph && ph.includes('日期')) { await ins.nth(i).fill('2026-10-05'); await ins.nth(i).press('Enter'); await page.waitForTimeout(300) }
  }
  const nameIn = dlg.locator('input[placeholder*="姓名"], input[placeholder*="联系人"]').first()
  if (await nameIn.count()) await nameIn.fill('PC测试')
  const phoneIn = dlg.locator('input[placeholder*="电话"]').first()
  if (await phoneIn.count()) await phoneIn.fill('13900000000')
  const idIn = dlg.locator('input[placeholder*="身份证"]').first()
  if (await idIn.count()) await idIn.fill('520000199001010011')
  await dlg.getByRole('button', { name: /确认预订|确认/ }).first().click()
  await page.waitForTimeout(2500)
}
console.log('  order types =', JSON.stringify(await orders()))

// ===== 餐厅订座（直接进详情页）=====
await visit('/restaurants/1')
console.log('restaurant url =', new URL(page.url()).pathname)
const dish = page.getByRole('button', { name: /点餐/ }).first()
if (await dish.count()) { await dish.click(); await page.waitForTimeout(900) }
console.log('  预点菜标签 =', await page.locator('.selected-dishes .el-tag').count())

// 日期
const dInput = page.locator('input[placeholder*="选择日期"]').first()
if (await dInput.count()) { await dInput.fill('2026-10-06'); await dInput.press('Enter'); await page.waitForTimeout(400) }
// 时间：el-time-select 需要点选
const tInput = page.locator('input[placeholder*="选择时间"]').first()
if (await tInput.count()) {
  await tInput.click(); await page.waitForTimeout(700)
  const opt = page.locator('.el-select-dropdown__item:visible').first()
  if (await opt.count()) { await opt.click(); await page.waitForTimeout(400) }
}
const cName = page.locator('input[placeholder*="联系人"]').first()
if (await cName.count()) await cName.fill('PC测试')
const cPhone = page.locator('input[placeholder*="联系电话"]').first()
if (await cPhone.count()) await cPhone.fill('13900000000')
await page.getByRole('button', { name: /立即预订|提交预订|预订/ }).first().click()
await page.waitForTimeout(2500)
console.log('  order types =', JSON.stringify(await orders()))

console.log('\n=== order POST bodies ===')
console.log(posts.length ? posts.join('\n') : '(none)')
console.log('\n===== PROBLEMS =====')
console.log(problems.length ? [...new Set(problems)].join('\n') : 'NONE')
await browser.close()
