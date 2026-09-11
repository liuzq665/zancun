/**
 * 降级验证：后端不可用时，core 必须返回可读错误，而不是抛异常或给出空数据。
 *
 * 用 WUDONG_API_BASE 指向坏地址来触发，**不需要动正在运行的后端**。
 *   node tools/verify-degradation.mjs
 *   连接失败：$env:WUDONG_API_BASE='http://127.0.0.1:9'
 *   响应超时：$env:WUDONG_API_BASE='http://10.255.255.1:8001'
 */

import { searchFood, searchStays, getStay } from '../src/core/api.js'
import { buildItinerary } from '../src/core/itinerary.js'
import { BASE_URL } from '../src/core/http.js'

let failed = 0
function check(label, condition, detail) {
  console.log(`  ${condition ? 'ok  ' : 'FAIL'} ${label}${condition || detail === undefined ? '' : `  → ${detail}`}`)
  if (!condition) failed += 1
}

console.log(`\n== 降级验证（base=${BASE_URL}）==`)

const stays = await searchStays({ size: 3 })
check('search_stays 返回 ok:false', stays.ok === false, JSON.stringify(stays).slice(0, 100))
check('错误文本可读且非空', typeof stays.error === 'string' && stays.error.length > 0, stays.error)
check('错误文本提醒不要编造', /不要.*编造|不可用/.test(stays.error ?? ''), stays.error)

const food = await searchFood({ size: 3 })
check('search_food 同样优雅失败', food.ok === false && typeof food.error === 'string')

const detail = await getStay({ id: 1 })
check('详情接口优雅失败（id 合法但后端不可达）', detail.ok === false, JSON.stringify(detail).slice(0, 100))

const plan = await buildItinerary({ days: 2 })
check('build_itinerary 不编造行程', plan.ok === false, JSON.stringify(plan).slice(0, 120))
check('build_itinerary 的 text 就是错误说明', typeof plan.text === 'string' && plan.text.length > 0, plan.text)

console.log(`\n结果：${failed === 0 ? '全部通过' : `${failed} 项失败`}`)
if (failed > 0) process.exitCode = 1
