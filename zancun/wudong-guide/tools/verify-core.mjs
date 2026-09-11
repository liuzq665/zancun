/**
 * core 层验证：纯函数单测 + 真实 8001 接口集成断言。
 *
 * 用法：node tools/verify-core.mjs
 * 需要 wudong-server 在 127.0.0.1:8001 上运行（除了专门的降级测试）。
 */

import { searchCommunity, searchFood, searchProductCategories, searchProducts, searchStays, searchTravel, getFood, getPost, getProduct, getStay, getTravel } from '../src/core/api.js'
import { buildItinerary } from '../src/core/itinerary.js'
import { clampPage, clampSize, intId, toItems } from '../src/core/normalize.js'

let passed = 0
const failures = []

function check(label, condition, detail) {
  if (condition) {
    passed += 1
    console.log(`  ok   ${label}`)
  } else {
    failures.push(label)
    console.log(`  FAIL ${label}${detail === undefined ? '' : `  → ${detail}`}`)
  }
}

/* ------------------------------ 纯函数单测 ------------------------------ */
console.log('\n== normalize 纯函数 ==')
check('clampSize(999) 夹到上限 20', clampSize(999) === 20, clampSize(999))
check('clampSize(0) 抬到下限 1', clampSize(0) === 1, clampSize(0))
check('clampSize("x") 用默认值', clampSize('x', 6) === 6, clampSize('x', 6))
check('clampPage(-3) 归 1', clampPage(-3) === 1, clampPage(-3))
check('BARE ARRAY → {items,total}', JSON.stringify(toItems([1, 2, 3])) === JSON.stringify({ items: [1, 2, 3], total: 3 }))
check('扁平信封 → 用 total', toItems({ list: [1], total: 5 }).total === 5)
check('null → 空列表', toItems(null).total === 0)
check('intId("7") → 7', intId('7') === 7)
check('intId(-1) → undefined', intId(-1) === undefined)

/* ------------------------------- 集成断言 ------------------------------- */
console.log('\n== 集成（真实 127.0.0.1:8001）==')

async function ok(label, promise, assert) {
  const result = await promise
  if (!result.ok) {
    check(label, false, result.error)
    return result
  }
  const problem = assert ? assert(result) : undefined
  check(label, problem === undefined, problem)
  return result
}

const stays = await ok('search_stays', searchStays({ size: 3 }), (r) => (r.items.length ? undefined : '返回 0 条'))
const travel = await ok('search_travel 合并 scenic+route', searchTravel({ size: 3 }), (r) =>
  r.items.some((i) => i.kind === 'scenic') && r.items.some((i) => i.kind === 'route') ? undefined : '两个 kind 没都出现',
)
await ok('search_food', searchFood({ size: 3 }), (r) => (r.items.length ? undefined : '返回 0 条'))
await ok('search_products', searchProducts({ size: 3 }), (r) => (r.items.length ? undefined : '返回 0 条'))
const categories = await ok('search_product_categories（裸数组）', searchProductCategories(), (r) => (r.items.length ? undefined : '返回 0 条'))
await ok('search_community', searchCommunity({ size: 5 }), (r) => (r.items.length ? undefined : '返回 0 条'))

// 详情：用上一步拿到的真实 id
const stayId = stays.items[0]?.id
const stayDetail = await ok(`get_stay(${stayId})`, getStay({ id: stayId }), (r) =>
  r.items[0]?.rooms?.length ? undefined : 'roomTypes 没映射出来',
)
check('民宿详情价格是「元」量级（<10000）', (stayDetail.items[0]?.pricePerNight ?? 1e9) < 10000, stayDetail.items[0]?.pricePerNight)

const scenic = travel.items.find((i) => i.kind === 'scenic')
await ok(`get_travel(scenic,${scenic?.id})`, getTravel({ kind: 'scenic', id: scenic?.id }), (r) => (r.items[0]?.name ? undefined : '缺 name'))
const route = travel.items.find((i) => i.kind === 'route')
await ok(`get_travel(route,${route?.id})`, getTravel({ kind: 'route', id: route?.id }), (r) => (r.items[0]?.name ? undefined : '缺 name'))

const foods = await searchFood({ size: 5 })
const foodDetail = await ok(`get_food(${foods.items[0]?.id})`, getFood({ id: foods.items[0]?.id }), (r) =>
  r.items[0]?.dishes?.length ? undefined : 'dishes 没映射出来',
)
check('菜品价格是「元」量级（<1000）', (foodDetail.items[0]?.dishes?.[0]?.price ?? 1e9) < 1000, foodDetail.items[0]?.dishes?.[0]?.price)

const products = await searchProducts({ size: 3 })
await ok(`get_product(${products.items[0]?.id})`, getProduct({ id: products.items[0]?.id }), (r) => (r.items[0]?.name ? undefined : '缺 name'))

const community = await searchCommunity({ size: 5 })
await ok(`get_post(${community.items[0]?.id})`, getPost({ id: community.items[0]?.id }), (r) => (r.items[0]?.content ? undefined : '缺正文'))

// 合成字段必须没被带出来
const productDetail = await getProduct({ id: products.items[0]?.id })
check('商品详情未暴露合成的 skus', productDetail.items[0]?.skus === undefined)
check('景区未暴露合成的 ticketTypes 数组', scenic?.ticketTypes === undefined)

// 不存在的 id 必须是明确错误而不是抛异常
const missing = await getStay({ id: 999999 })
check('不存在的 id 返回 ok:false（不抛异常）', missing.ok === false && typeof missing.error === 'string', JSON.stringify(missing).slice(0, 120))
const badId = await getStay({ id: 'abc' })
check('非法 id 返回可读错误', badId.ok === false && badId.error.includes('id'), badId.error)

/* ------------------------------- 行程组合 ------------------------------- */
console.log('\n== build_itinerary ==')
const plan = await buildItinerary({ days: 2, interests: ['梯田', '非遗'], budgetLevel: 'comfort' })
check('返回 ok', plan.ok === true, plan.error)
check('给出四个域的候选', ['stays', 'scenics', 'routes', 'foods', 'products'].every((k) => Array.isArray(plan.candidates?.[k])))
check('算出预算估算', plan.budget?.total > 0, JSON.stringify(plan.budget))
check('正文包含真实民宿名', stays.items.some((s) => plan.text.includes(s.name)), '正文里没有出现 search_stays 的任一名称')
check('正文声明不落库', plan.text.includes('无法保存'))

/* --------------------------------- 汇总 --------------------------------- */
console.log(`\n结果：${passed} 通过，${failures.length} 失败`)
if (failures.length > 0) {
  console.log('失败项：')
  for (const label of failures) console.log(`  - ${label}`)
  process.exitCode = 1
}
