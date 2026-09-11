import { chromium } from 'playwright'

const BASE = 'http://localhost:3000'
const problems = []
const note = (m) => console.log(m)

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()

page.on('console', (m) => {
  if (m.type() === 'error') problems.push(`CONSOLE ${page.url()} :: ${m.text().slice(0, 200)}`)
})
page.on('pageerror', (e) => problems.push(`PAGEERROR ${page.url()} :: ${String(e).slice(0, 200)}`))
page.on('response', (r) => {
  if (r.status() >= 400) problems.push(`HTTP ${r.status()} ${r.request().method()} ${r.url().replace(BASE, '')}`)
})

const visit = async (path) => {
  await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForTimeout(600)
}

// ---------- 1. public pages ----------
const publicPages = ['/', '/products', '/restaurants', '/hotels', '/tickets', '/community']
for (const p of publicPages) {
  await visit(p)
  const h = await page.locator('body').innerText()
  note(`public ${p.padEnd(12)} bodyChars=${h.length}`)
}
await page.screenshot({ path: 'tests/shot-home.png', fullPage: false })

// product / hotel / post detail
await visit('/products')
const firstCard = page.locator('.product-card').first()
if (await firstCard.count()) {
  await firstCard.click()
  await page.waitForTimeout(1200)
  note(`product detail url=${new URL(page.url()).pathname}`)
} else problems.push('NO product card found on /products')

// ---------- 2. user login ----------
await visit('/login')
await page.getByPlaceholder('请输入手机号').fill('13800138001')
await page.getByPlaceholder('请输入密码').fill('123456')
await page.getByRole('button', { name: /登\s*录/ }).click()
await page.waitForTimeout(1800)
const loggedIn = await page.evaluate(() => !!localStorage.getItem('token'))
note(`user logged in = ${loggedIn}`)
if (!loggedIn) problems.push('USER LOGIN FAILED')

// ---------- 3. cart: seed via API then exercise UI ----------
if (loggedIn) {
  const seed = await page.evaluate(async () => {
    const tk = localStorage.getItem('token')
    const r = await fetch('/app/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + tk },
      body: JSON.stringify({ productId: 8, quantity: 2 }),
    })
    return (await r.json()).code
  })
  note(`cart seed code=${seed}`)

  await visit('/cart')
  const cartText = await page.locator('body').innerText()
  note(`cart page rendered, hasProductName=${cartText.includes('蜡染') || cartText.includes('银饰')}`)
  await page.screenshot({ path: 'tests/shot-cart.png' })

  // click a quantity "+" to trigger updateCartItem (the call I fixed)
  const plus = page.locator('.el-input-number__increase').first()
  if (await plus.count()) {
    const before = problems.length
    await plus.click()
    await page.waitForTimeout(1600)
    const newProblems = problems.slice(before)
    note(`cart quantity + clicked; newProblems=${newProblems.length ? newProblems.join(' | ') : 'none'}`)
  } else problems.push('cart: no quantity stepper found')

  // delete item (removeCartItem fix)
  const del = page.getByRole('button', { name: /删除/ }).first()
  if (await del.count()) {
    const before = problems.length
    page.once('dialog', (d) => d.accept())
    await del.click()
    await page.waitForTimeout(800)
    const confirmBtn = page.locator('.el-message-box__btns .el-button--primary').first()
    if (await confirmBtn.count()) { await confirmBtn.click(); await page.waitForTimeout(1600) }
    note(`cart delete; newProblems=${problems.length - before ? problems.slice(before).join(' | ') : 'none'}`)
  }
}

// ---------- 4. post detail: comments render + comment submit ----------
try {
  await visit('/community')
  // 站点用 @click 跳转（.post-card），不是 <a>
  const postLink = page.locator('.post-card').first()
  const altCard = page.locator('.post-item, .waterfall-item').first()
  if (await postLink.count()) {
    await postLink.click()
  } else if (await altCard.count()) {
    await altCard.click()
  } else {
    const body = await page.locator('body').innerText()
    problems.push(`NO post entry on /community. body="${body.replace(/\s+/g, ' ').slice(0, 180)}"`)
  }
  await page.waitForTimeout(1800)
  note(`after click url=${new URL(page.url()).pathname}`)
  if (page.url().includes('/community/post/')) {
    const t = await page.locator('body').innerText()
    const m = t.match(/评论\s*\(?\s*(\d+)/)
    note(`post detail commentCount shown=${m ? m[1] : 'n/a'}`)
    await page.screenshot({ path: 'tests/shot-post.png' })
    const ta = page.locator('textarea').first()
    if (await ta.count()) {
      const before = problems.length
      await ta.fill('PC 浏览器验证评论')
      const btn = page.getByRole('button', { name: /发表评论|评\s*论|发\s*布|发\s*送/ }).first()
      if (await btn.count()) await btn.click()
      await page.waitForTimeout(2200)
      note(`comment submit; newProblems=${problems.length - before ? problems.slice(before).join(' | ') : 'none'}`)
    } else problems.push('post detail: no textarea')
  }
} catch (e) { problems.push('post-detail block: ' + String(e).slice(0, 150)) }

// ---------- 5. orders + user center ----------
try { await visit('/orders'); note('orders page ok') } catch (e) { problems.push('orders: ' + String(e).slice(0, 120)) }
try { await visit('/user'); note('user page ok') } catch (e) { problems.push('user: ' + String(e).slice(0, 120)) }

// ---------- 6. admin ----------
try {
  await visit('/admin/login')
  note(`admin login url=${new URL(page.url()).pathname}`)
  const phs = await page.evaluate(() => [...document.querySelectorAll('input')].map((i) => i.placeholder))
  note(`admin login input placeholders = ${JSON.stringify(phs)}`)
  const userPh = phs.find((p) => p && p.includes('账号')) || phs[0]
  const passPh = phs.find((p) => p && p.includes('密码'))
  if (userPh && passPh) {
    await page.getByPlaceholder(userPh).fill('admin')
    await page.getByPlaceholder(passPh).fill('admin123')
    await page.getByRole('button', { name: /登\s*录/ }).first().click()
    await page.waitForTimeout(2200)
  } else problems.push(`admin login: unexpected inputs ${JSON.stringify(phs)}`)
  const adminToken = await page.evaluate(() => !!localStorage.getItem('admin_token'))
  note(`admin logged in = ${adminToken}`)
  if (!adminToken) problems.push('ADMIN LOGIN FAILED')

  for (const p of ['/admin/dashboard', '/admin/products', '/admin/orders', '/admin/users', '/admin/hotels', '/admin/restaurants', '/admin/tickets', '/admin/community']) {
    await visit(p)
    const rows = await page.locator('.el-table__row').count()
    note(`admin ${p.padEnd(20)} tableRows=${rows} url=${new URL(page.url()).pathname}`)
  }
  await page.screenshot({ path: 'tests/shot-admin-products.png' })
} catch (e) { problems.push('admin block: ' + String(e).slice(0, 150)) }

// ---------- summary ----------
console.log('\n================ PROBLEMS ================')
if (!problems.length) console.log('NONE')
else [...new Set(problems)].forEach((p) => console.log('- ' + p))

await browser.close()
