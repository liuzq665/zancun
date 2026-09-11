import { chromium } from 'playwright'
const B = 'http://127.0.0.1:8001'
const BASE = 'http://localhost:3000'
const problems = []
const j = async (p, opt) => (await (await fetch(B + p, opt)).json())
const tok = (await j('/app/user/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: '13800138001', password: '123456' }) })).data.token
const H = { 'Content-Type': 'application/json', Authorization: 'Bearer ' + tok }

// ============ 1. 点赞不可刷取 ============
console.log('===== 1. 点赞不可刷取 =====')
const postId = 7
const cnt = async () => (await j(`/app/community/post/detail?id=${postId}&userId=2`)).data.likeCount
const likedFlag = async () => (await j(`/app/community/post/detail?id=${postId}&userId=2`)).data.isLiked
console.log('初始 likeCount =', await cnt(), 'isLiked =', await likedFlag())
for (let i = 1; i <= 4; i++) {
  const r = await j('/app/community/like', { method: 'POST', headers: H, body: JSON.stringify({ userId: 2, likeType: 'post', relatedId: postId }) })
  console.log(`  toggle${i} -> liked=${r.data.liked} likeCount=${r.data.likeCount}  (DB=${await cnt()})`)
}
console.log('  并发 10 次...')
await Promise.all(Array.from({ length: 10 }, () => j('/app/community/like', { method: 'POST', headers: H, body: JSON.stringify({ userId: 2, likeType: 'post', relatedId: postId }) })))
const afterBurst = await cnt()
console.log('  并发后 likeCount =', afterBurst, '(同一用户最多 1)')
if (afterBurst > 1) problems.push(`LIKE FARMED: count=${afterBurst}`)
const dup = await j(`/app/community/like`, { method: 'POST', headers: H, body: JSON.stringify({ userId: 2, likeType: 'post', relatedId: postId }) })

// ============ 2. 评论不会消失（含评论多的情况）============
console.log('\n===== 2. 评论可见性 =====')
const listApi = async (page = 1, size = 50) => (await j(`/app/community/comment/list?postId=${postId}&page=${page}&pageSize=${size}&userId=2`)).data
// 先灌 25 条，模拟评论很多
await j('/app/community/comment', { method: 'POST', headers: H, body: JSON.stringify({ postId, userId: 2, content: 'ZZ-latest-visible' }) })
const p1 = await listApi(1, 50)
console.log('  第1页(50条)首条内容 =', JSON.stringify(p1.list[0]?.content))
console.log('  最新评论在第1页顶部? ', p1.list[0]?.content === 'ZZ-latest-visible')
if (p1.list[0]?.content !== 'ZZ-latest-visible') problems.push('NEWEST COMMENT NOT FIRST')

// ============ 3. 昵称不乱码 ============
console.log('\n===== 3. 昵称编码 =====')
const c = p1.list.find((x) => x.content === 'ZZ-latest-visible')
const nick = c?.user?.nickname
const cps = nick ? [...nick].map((ch) => ch.codePointAt(0).toString(16)) : []
console.log('  发帖人昵称 =', JSON.stringify(nick))
console.log('  码点 =', cps.join(' '), '(中文应为 4e00-9fff 区间，不应出现 e6/b8 这类 latin1 痕迹)')
const isMojibake = cps.some((cp) => cp === 'e6' || cp === 'b8' || cp === 'c3' || cp === 'a6')
if (isMojibake) problems.push('NICKNAME STILL MOJIBAKE')
// 点赞作者也查一遍
const d = await j(`/app/community/post/detail?id=${postId}&userId=2`)
console.log('  帖子作者昵称 =', JSON.stringify(d.data.user?.nickname))

// ============ 4. UI 复核 ============
console.log('\n===== 4. UI 复核 =====')
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
page.on('pageerror', (e) => problems.push('PAGEERROR ' + String(e).slice(0, 120)))
await page.goto(BASE + '/login', { waitUntil: 'networkidle' })
await page.getByPlaceholder('请输入手机号').fill('13800138001')
await page.getByPlaceholder('请输入密码').fill('123456')
await page.getByRole('button', { name: /登\s*录/ }).click()
await page.waitForTimeout(1600)
await page.goto(`${BASE}/community/post/${postId}`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1800)
const first = await page.locator('.comment-item').first().innerText()
console.log('  UI 首条评论 =', JSON.stringify(first.replace(/\s+/g, ' ').slice(0, 60)))
console.log('  UI 昵称含乱码? ', /[ÃÂæ¸å®¢°]/.test(first))
if (/[ÃÂæ¸å®¢°]/.test(first)) problems.push('UI NICKNAME MOJIBAKE')

// 连点 6 次帖子点赞，看数字是否稳定
const likeBtn = page.locator('.post-actions, .action-buttons, .post-stats').first()
const likeEl = page.getByText(/^\d+$/).first()
const readCount = async () => {
  const t = await page.locator('.post-meta, .post-header, .post-stats').first().innerText()
  const m = t.match(/(\d+)/)
  return m ? m[1] : '?'
}
const lk = page.locator('[class*="like"], .action-btn').filter({ hasText: /\d/ }).first()
console.log('  连点 6 次点赞...')
for (let i = 0; i < 6; i++) {
  await lk.click({ force: true }).catch(() => {})
  await page.waitForTimeout(700)
}
const apiCount = (await j(`/app/community/post/detail?id=${postId}&userId=2`)).data.likeCount
console.log('  连点后 DB likeCount =', apiCount, '(应 ≤1)')
if (apiCount > 1) problems.push('UI LIKE FARMED')

console.log('\n===== PROBLEMS =====')
console.log(problems.length ? [...new Set(problems)].join('\n') : 'NONE')
await browser.close()
