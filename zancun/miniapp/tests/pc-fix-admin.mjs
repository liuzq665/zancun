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
const visit = async (p) => { await page.goto(BASE + p, { waitUntil: 'networkidle' }); await page.waitForTimeout(800) }

// admin login
await visit('/admin/login')
await page.getByPlaceholder('请输入管理员账号').fill('admin')
await page.getByPlaceholder('请输入密码').fill('admin123')
await page.getByRole('button', { name: /登\s*录/ }).click()
await page.waitForTimeout(2000)
console.log('admin login =', await page.evaluate(() => !!localStorage.getItem('admin_token')))

// ===== 1. Dashboard 真实数据 =====
await visit('/admin/dashboard')
await page.waitForTimeout(1500)
const statValues = await page.locator('.stat-value').allInnerTexts()
console.log('1. Dashboard 统计卡 =', JSON.stringify(statValues), '(期望不是 156/423/125680/89 那组假数据)')
if (statValues.includes('156') || statValues.includes('423')) problems.push('DASHBOARD STILL HARDCODED')

// ===== 2. Settings 保存 + 重新加载 =====
await visit('/admin/settings')
await page.waitForTimeout(1200)
const siteInput = page.getByPlaceholder(/乌东/).first().or(page.locator('.settings-form input').first())
await siteInput.fill('PC验证站点名')
const saveBtn = page.getByRole('button', { name: /保存设置|保存/ }).first()
await saveBtn.click()
await page.waitForTimeout(1600)
await visit('/admin/settings')
await page.waitForTimeout(1500)
const firstInputVal = await page.locator('.settings-form input').first().inputValue()
console.log(`2. Settings 持久化 -> 重载后第一个输入="${firstInputVal}" (expect PC验证站点名)`)
if (firstInputVal !== 'PC验证站点名') problems.push('SETTINGS NOT PERSISTED')

// ===== 3. Hotel manage 保存 / 删除 =====
await visit('/admin/hotels')
await page.waitForTimeout(1200)
const beforeRows = await page.locator('.el-table__row').count()
await page.getByRole('button', { name: /添加/ }).first().click()
await page.waitForTimeout(800)
const nameInput = page.locator('.el-dialog .el-input__inner').first()
await nameInput.fill('ZZTestHotel')
await page.locator('.el-dialog').getByRole('button', { name: /保存|确定/ }).first().click()
await page.waitForTimeout(2000)
const afterRows = await page.locator('.el-table__row').count()
console.log(`3. Hotel 保存 -> rows ${beforeRows} -> ${afterRows} (expect +1)`)
if (afterRows <= beforeRows) problems.push('ADMIN HOTEL SAVE FAILED')

// 删除它
const targetRow = page.locator('.el-table__row').filter({ hasText: 'ZZTestHotel' }).first()
if (await targetRow.count()) {
  await targetRow.getByRole('button', { name: /删除/ }).click()
  await page.waitForTimeout(700)
  const ok = page.locator('.el-message-box__btns .el-button--primary').first()
  if (await ok.count()) { await ok.click(); await page.waitForTimeout(2000) }
  console.log(`   删除后 rows=${await page.locator('.el-table__row').count()} (expect ${beforeRows})`)
} else problems.push('ADMIN HOTEL test row not found')

// ===== 4. 用户封禁/解封（是按钮不是开关）=====
await visit('/admin/users')
await page.waitForTimeout(1300)
const firstRow = page.locator('.el-table__row').first()
const statusTag = firstRow.locator('.el-tag').last()
const beforeTag = await statusTag.innerText()
const toggleBtn = firstRow.getByRole('button', { name: /禁用|启用/ }).first()
if (await toggleBtn.count()) {
  await toggleBtn.click()
  await page.waitForTimeout(1800)
  await visit('/admin/users')
  await page.waitForTimeout(1300)
  const afterTag = await page.locator('.el-table__row').first().locator('.el-tag').last().innerText()
  console.log(`4. 用户封禁 -> "${beforeTag.trim()}" => "${afterTag.trim()}" (expect 正常=>禁用)`)
  if (beforeTag.trim() === afterTag.trim()) problems.push('USER BAN NOT PERSISTED')
  // 解封
  await page.locator('.el-table__row').first().getByRole('button', { name: /禁用|启用/ }).first().click()
  await page.waitForTimeout(1800)
  console.log('   已解封')
} else problems.push('user toggle button not found')

// ===== 5. 帖子精华 =====
await visit('/admin/community')
await page.waitForTimeout(1300)
const starBtn = page.locator('.el-table__row').first().getByRole('button').first()
if (await starBtn.count()) {
  await starBtn.click()
  await page.waitForTimeout(1600)
  console.log('5. 帖子操作按钮点击完成')
}

// ===== 6. 订单处理（若有订单）=====
await visit('/admin/orders')
await page.waitForTimeout(1300)
const orderRows = await page.locator('.el-table__row').count()
console.log(`6. 订单管理 rows=${orderRows}`)
if (orderRows > 0) {
  const procBtn = page.locator('.el-table__row').first().getByRole('button', { name: /处理/ }).first()
  if (await procBtn.count()) {
    await procBtn.click()
    await page.waitForTimeout(700)
    const ok = page.locator('.el-message-box__btns .el-button--primary').first()
    if (await ok.count()) { await ok.click(); await page.waitForTimeout(1800) }
    console.log('   订单处理完成')
  }
}

console.log('\n===== PROBLEMS =====')
console.log(problems.length ? [...new Set(problems)].join('\n') : 'NONE')
await browser.close()
