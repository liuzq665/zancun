import { chromium } from 'playwright'

const BASE = 'http://localhost:3000'
const problems = []
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
page.on('pageerror', (e) => problems.push('PAGEERROR ' + String(e).slice(0, 150)))
page.on('response', (r) => {
  const u = r.url()
  if (r.status() >= 400 && (u.includes('/app/') || u.includes('/adminapi/'))) {
    problems.push(`HTTP ${r.status()} ${r.request().method()} ${u.replace(BASE, '')}`)
  }
})
const visit = async (p) => { await page.goto(BASE + p, { waitUntil: 'networkidle' }); await page.waitForTimeout(700) }

// --- login ---
await visit('/login')
await page.getByPlaceholder('请输入手机号').fill('13800138001')
await page.getByPlaceholder('请输入密码').fill('123456')
await page.getByRole('button', { name: /登\s*录/ }).click()
await page.waitForTimeout(1600)
console.log('login =', await page.evaluate(() => !!localStorage.getItem('token')))

// ===== 1. 个人中心：保存修改 =====
await visit('/user')
await page.waitForTimeout(800)
await page.getByPlaceholder('请输入昵称').fill('PC测试昵称')
await page.getByPlaceholder('介绍一下自己...').fill('来自浏览器验证')
await page.getByPlaceholder('请输入地区').fill('贵州')
await page.getByRole('button', { name: /保存修改/ }).click()
await page.waitForTimeout(1800)
const dbUser = await page.evaluate(async () => {
  const r = await fetch('/app/user/info', { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } })
  const d = await r.json()
  // /app/user/info 历史上是双层嵌套 {code,data:{code,data:{...}}}
  return d.data?.data ?? d.data
})
console.log(`1. 保存修改 -> DB nickname="${dbUser.nickname}" bio="${dbUser.bio}" region="${dbUser.region}"  (expect PC测试昵称)`)
if (dbUser.nickname !== 'PC测试昵称') problems.push('PROFILE SAVE NOT PERSISTED')

// ===== 2. 我的收藏 =====
await page.evaluate(async () => {
  const H = { 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') }
  await fetch('/app/community/favorite', { method: 'POST', headers: H, body: JSON.stringify({ userId: 2, favoriteType: 'product', relatedId: 7 }) })
})
await visit('/user')
await page.locator('.user-nav .nav-item').filter({ hasText: '我的收藏' }).click()
await page.waitForTimeout(1600)
const favRows = await page.locator('.favorite-item').count()
console.log(`2. 我的收藏 -> rows=${favRows} (expect 1)`)
if (favRows < 1) problems.push('FAVORITES NOT LOADED')
if (favRows > 0) {
  const txt = await page.locator('.favorite-item').first().innerText()
  console.log('   row =', txt.replace(/\s+/g, ' ').slice(0, 50))
  // 取消收藏
  await page.getByRole('button', { name: /取消收藏/ }).first().click()
  await page.waitForTimeout(1700)
  console.log(`   after 取消收藏 -> rows=${await page.locator('.favorite-item').count()} (expect 0)`)
}

// ===== 3. 商品收藏 + 立即购买 =====
await visit('/products')
await page.locator('.product-card').first().click()
await page.waitForTimeout(1400)
const prodUrl = new URL(page.url()).pathname
await page.getByRole('button', { name: /收藏/ }).nth(0).click().catch(async () => {
  await page.locator('.action-buttons button').last().click()
})
await page.waitForTimeout(1400)
console.log(`3. 商品 ${prodUrl} 收藏点击完成`)

await visit('/products')
await page.locator('.product-card').first().click()
await page.waitForTimeout(1400)
await page.getByRole('button', { name: /立即购买/ }).click()
await page.waitForTimeout(2200)
const ordersAfterBuy = await page.evaluate(async () => {
  const r = await fetch('/app/ticket/order/list?userId=2&page=1&pageSize=50', { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } })
  return (await r.json()).data
})
console.log(`4. 立即购买 -> 订单数=${ordersAfterBuy.list.length} url=${new URL(page.url()).pathname}`)
if (ordersAfterBuy.list.length < 1) problems.push('BUY NOW DID NOT CREATE ORDER')

// ===== 5. 订单页：状态/金额/退款 =====
await visit('/orders')
await page.waitForTimeout(1200)
const cards = await page.locator('.order-card').count()
const firstTag = cards ? await page.locator('.order-card .status-tag').first().innerText() : ''
const firstPrice = cards ? await page.locator('.order-card .price').first().innerText() : ''
console.log(`5. 订单页 -> cards=${cards} status="${firstTag}" amount="${firstPrice}"`)
if (cards > 0 && firstPrice.includes('NaN')) problems.push('ORDER AMOUNT RENDERS NaN')

// 支付该订单
if (cards > 0) {
  const payBtn = page.getByRole('button', { name: /立即支付/ }).first()
  if (await payBtn.count()) {
    await payBtn.click()
    await page.waitForTimeout(700)
    const ok = page.locator('.el-message-box__btns .el-button--primary').first()
    if (await ok.count()) { await ok.click(); await page.waitForTimeout(1800) }
    console.log(`   after pay status="${await page.locator('.order-card .status-tag').first().innerText()}"`)
  }
  // 退款
  const refBtn = page.getByRole('button', { name: /申请退款/ }).first()
  if (await refBtn.count()) {
    await refBtn.click()
    await page.waitForTimeout(700)
    const ok = page.locator('.el-message-box__btns .el-button--primary').first()
    if (await ok.count()) { await ok.click(); await page.waitForTimeout(1800) }
    console.log(`   after refund status="${await page.locator('.order-card .status-tag').first().innerText()}"`)
  }
}

// ===== 6. 帖子收藏 + 分享 =====
await visit('/community')
await page.locator('.post-card').first().click()
await page.waitForTimeout(1500)
const favBtn = page.getByRole('button', { name: /收藏|已收藏/ }).first()
if (await favBtn.count()) { await favBtn.click(); await page.waitForTimeout(1400); console.log('6. 帖子收藏点击完成') }
const shareBtn = page.getByRole('button', { name: /分享/ }).first()
if (await shareBtn.count()) { await shareBtn.click(); await page.waitForTimeout(800); console.log('   分享点击完成') }

console.log('\n===== PROBLEMS =====')
console.log(problems.length ? [...new Set(problems)].join('\n') : 'NONE')
await browser.close()
