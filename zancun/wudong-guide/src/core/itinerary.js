/**
 * 行程候选收集。
 *
 * 这个工具**不产出逐日日程** —— 它并行拉齐四个域的候选、算一个粗估预算，
 * 把「排序和叙事」留给模型。原因：日程是自然语言产物，规则化的编排既僵硬又
 * 容易编造，而模型拿齐真实候选后排序能力更强。
 *
 * 平台没有 itinerary 表，所以结果**不落库**：只活在当前会话里。
 */

import { searchFood, searchProducts, searchStays, searchTravel } from './api.js'
import { clampSize, money, shorten } from './normalize.js'

const BUDGET_LEVELS = {
  budget: { label: '经济', lodgingFactor: 0.7, foodFactor: 0.7 },
  comfort: { label: '舒适', lodgingFactor: 1, foodFactor: 1 },
  premium: { label: '高端', lodgingFactor: 1.6, foodFactor: 1.4 },
}

function estimate(days, level, stays, foods, routes) {
  const cheapestStay = Math.min(...stays.map((s) => s.pricePerNight).filter((p) => p !== undefined))
  const cheapestFood = Math.min(...foods.map((f) => f.avgPrice).filter((p) => p !== undefined))
  if (!Number.isFinite(cheapestStay) || !Number.isFinite(cheapestFood)) return undefined

  const nights = Math.max(1, days - 1)
  const lodging = cheapestStay * nights * level.lodgingFactor
  const meals = cheapestFood * 2 * days * level.foodFactor
  const ticket = Math.min(...routes.map((r) => r.price).filter((p) => p !== undefined)) || 0
  const total = Math.round((lodging + meals + ticket) / 10) * 10
  return { nights, lodging: Math.round(lodging), meals: Math.round(meals), ticket: Math.round(ticket), total }
}

/**
 * @param {{days?:unknown, interests?:unknown, budgetLevel?:unknown, keyword?:unknown}} [args]
 */
export async function buildItinerary(args = {}) {
  const days = Math.min(7, Math.max(1, Math.trunc(Number(args.days)) || 2))
  const levelKey = typeof args.budgetLevel === 'string' && args.budgetLevel in BUDGET_LEVELS ? args.budgetLevel : 'comfort'
  const level = BUDGET_LEVELS[levelKey]
  const interests = Array.isArray(args.interests) ? args.interests.map((v) => shorten(v, 20)).filter(Boolean).slice(0, 6) : []
  const keyword = shorten(args.keyword, 30)

  const [stays, travel, foods, products] = await Promise.all([
    searchStays({ size: clampSize(20, 20) }),
    searchTravel({ size: clampSize(10, 10) }),
    searchFood({ size: clampSize(20, 20) }),
    searchProducts({ size: clampSize(20, 20) }),
  ])

  const failures = [
    ['民宿', stays],
    ['景区/路线', travel],
    ['餐饮', foods],
    ['非遗商品', products],
  ].filter(([, result]) => !result.ok)

  // 四个域全军覆没 = 后端不可用，直接如实上报，绝不现场编一个行程。
  if (failures.length === 4) {
    return { ok: false, error: failures[0][1].error, text: failures[0][1].error }
  }

  const stayItems = stays.ok ? stays.items : []
  const travelItems = travel.ok ? travel.items : []
  const foodItems = foods.ok ? foods.items : []
  const productItems = products.ok ? products.items : []
  const routeItems = travelItems.filter((it) => it.kind === 'route')
  const budget = estimate(days, level, stayItems, foodItems, routeItems)

  const parts = [`已按「${days} 天」收集到以下真实候选（预算档：${level.label}）。请你自己完成排序与逐日编排。`]
  if (interests.length) parts.push(`用户提到的兴趣：${interests.join('、')}。排序时优先考虑，但只能从下面的候选中挑。`)
  if (keyword) parts.push(`用户给的关键词：${keyword}。注意上面是完整目录，没有按关键词过滤，请自行判断相关性。`)

  if (failures.length > 0) {
    parts.push('', `⚠️ 有 ${failures.length} 个域查询失败（${failures.map(([name]) => name).join('、')}），相关推荐请明确告知用户暂时拿不到。`)
  }

  parts.push('', stays.ok ? stays.text : `民宿：查询失败 —— ${stays.error}`)
  parts.push('', travel.ok ? travel.text : `景区/路线：查询失败 —— ${travel.error}`)
  parts.push('', foods.ok ? foods.text : `餐饮：查询失败 —— ${foods.error}`)
  parts.push('', products.ok ? products.text : `非遗商品：查询失败 —— ${products.error}`)

  if (budget) {
    parts.push(
      '',
      `粗估每人不含大交通的费用：住宿约 ¥${budget.lodging}（${budget.nights} 晚）＋ 餐饮约 ¥${budget.meals}（${days} 天 × 2 餐）＋ 路线/门票约 ¥${budget.ticket} ≈ **¥${budget.total}**。`,
      '这是按各域最低价算的下限，不是报价；告诉用户时要说清是估算。',
    )
  }

  const names = [...stayItems, ...routeItems, ...productItems].map((it) => it.name).filter(Boolean).slice(0, 6)
  if (names.length > 0) {
    parts.push('', `编排时请只使用上面出现过的名字，例如：${names.join('、')}。`)
  }
  parts.push('', '注：平台没有行程存储，「我的行程」无法保存；只能把日程写在回答里。')

  return {
    ok: true,
    text: parts.join('\n'),
    candidates: {
      stays: stayItems,
      scenics: travelItems.filter((it) => it.kind === 'scenic'),
      routes: routeItems,
      foods: foodItems,
      products: productItems,
    },
    budget: budget ? { ...budget, level: levelKey } : undefined,
    failedDomains: failures.map(([name]) => name),
    money: { lodging: money(stayItems[0]?.pricePerNight) },
  }
}
