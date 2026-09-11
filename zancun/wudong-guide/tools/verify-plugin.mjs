/**
 * 插件适配层隔离验证：不启动 DSH，用桩 ctx 调 apply()。
 *
 * 这一步能抓住最容易静默失败的东西：parameters 的 schema DSL 写错、工具名拼错、
 * execute 返回值不符合 output.schema。`defineTool` 是真的（来自 @deepseek-ai/dsh-tools），
 * 所以 DSL 编译是真实发生的。
 *
 * 用法：node tools/verify-plugin.mjs        （需要 8001 在线，会真的调接口）
 */

import { apply, inject, name } from '../src/plugin/index.js'

let failed = 0
function check(label, condition, detail) {
  console.log(`  ${condition ? 'ok  ' : 'FAIL'} ${label}${condition || detail === undefined ? '' : `  → ${detail}`}`)
  if (!condition) failed += 1
}

const EXPECTED_TOOLS = [
  'search_stays',
  'get_stay',
  'search_travel',
  'get_travel',
  'search_food',
  'get_food',
  'search_products',
  'get_product',
  'search_community',
  'get_post',
  'build_itinerary',
]

/* ------------------------------ 用桩 ctx 加载 ------------------------------ */
const registered = new Map()
const sections = []
const ctx = {
  tools: { register: (definition) => { registered.set(definition.name, definition) } },
  systemPrompt: { section: (section) => { sections.push(section) } },
}

try {
  apply(ctx)
  check('apply() 未抛异常（schema DSL 编译通过）', true)
} catch (error) {
  check('apply() 未抛异常（schema DSL 编译通过）', false, error.message)
}

console.log('\n== 插件元信息 ==')
check('name 正确', name === 'wudong-guide', name)
check('inject 包含 tools 与 systemPrompt', inject.includes('tools') && inject.includes('systemPrompt'), JSON.stringify(inject))

console.log('\n== 工具注册表 ==')
check(`注册了 ${EXPECTED_TOOLS.length} 个工具`, registered.size === EXPECTED_TOOLS.length, `实际 ${registered.size}：${[...registered.keys()].join(', ')}`)
for (const toolName of EXPECTED_TOOLS) {
  check(`存在 ${toolName}`, registered.has(toolName))
}

console.log('\n== 工具定义形状 ==')
for (const [toolName, definition] of registered) {
  const problems = []
  if (typeof definition.description !== 'string' || !definition.description.trim()) problems.push('缺 description')
  if (definition.parameters?.type !== 'object') problems.push('parameters 不是编译后的 JSON Schema')
  if (definition.output?.schema?.type !== 'object') problems.push('output.schema 缺失')
  if (!Array.isArray(definition.output?.schema?.required) || !definition.output.schema.required.includes('text')) problems.push('output.schema 未把 text 标为必填')
  if (definition.output?.schema?.additionalProperties !== false) problems.push('output.schema 未封闭 additionalProperties')
  if (typeof definition.output?.render !== 'function') problems.push('缺 render')
  if (typeof definition.execute !== 'function') problems.push('缺 execute')
  if (typeof definition.isConcurrencySafe !== 'function') problems.push('缺 isConcurrencySafe')
  // render 必须产出 ContentBlock[]
  try {
    const blocks = definition.output.render({}, { text: '样例' })
    if (!Array.isArray(blocks) || blocks[0]?.type !== 'text' || blocks[0]?.text !== '样例') problems.push('render 输出不对')
  } catch (error) {
    problems.push(`render 抛异常：${error.message}`)
  }
  check(`${toolName} 定义完整`, problems.length === 0, problems.join('；'))
}

console.log('\n== 参数 DSL 的高级特性是否编译正确 ==')
check(
  'get_travel.kind 编译出 enum ["scenic","route"]',
  JSON.stringify(registered.get('get_travel').parameters.properties.kind?.enum) === JSON.stringify(['scenic', 'route']),
  JSON.stringify(registered.get('get_travel').parameters.properties.kind),
)
check(
  'build_itinerary.budgetLevel 编译出 enum',
  Array.isArray(registered.get('build_itinerary').parameters.properties.budgetLevel?.enum),
)
check(
  'build_itinerary.interests 编译成字符串数组',
  registered.get('build_itinerary').parameters.properties.interests?.items?.type === 'string',
)
check(
  'get_stay 的必填 id 进入 required 数组',
  JSON.stringify(registered.get('get_stay').parameters.required) === JSON.stringify(['id']),
  JSON.stringify(registered.get('get_stay').parameters.required),
)
check(
  'build_itinerary 的必填 days 进入 required 数组',
  JSON.stringify(registered.get('build_itinerary').parameters.required) === JSON.stringify(['days']),
  JSON.stringify(registered.get('build_itinerary').parameters.required),
)

console.log('\n== 系统提示词段落 ==')
const rules = sections.find((section) => section.name === 'wudong-guide:rules')
check('注册了 wudong-guide:rules', rules !== undefined)
check('order 是有限数字', Number.isFinite(rules?.order), String(rules?.order))
check('text 含数据纪律条款', typeof rules?.text === 'string' && rules.text.includes('绝不凭记忆编造'))

/* -------------------------- 真调后端：每个工具跑一遍 -------------------------- */
console.log('\n== 工具 execute 真跑（后端 8001）==')

async function run(toolName, args) {
  const definition = registered.get(toolName)
  const value = await definition.execute(args, { signal: undefined })
  return value
}

const stays = await run('search_stays', { size: 2 })
check('search_stays 返回 text', typeof stays.text === 'string' && stays.text.length > 0)

const stayId = Number((stays.text.match(/id=(\d+)/) ?? [])[1])
const stayDetail = await run('get_stay', { id: stayId })
check('get_stay 返回房型明细', stayDetail.text.includes('roomId='))

const travel = await run('search_travel', { size: 2 })
check('search_travel 同时给出景区与路线', travel.text.includes('景区景点') && travel.text.includes('旅游路线'))

const food = await run('search_food', { size: 2 })
const foodId = Number((food.text.match(/id=(\d+)/) ?? [])[1])
check('get_food 返回菜单', (await run('get_food', { id: foodId })).text.includes('菜品：'))

const routeDetail = await run('get_travel', { kind: 'route', id: 1 })
check('get_travel(route) 可用', typeof routeDetail.text === 'string' && routeDetail.text.includes('【路线】'))

const products = await run('search_products', { size: 2 })
check('search_products 没给筛选时附带品类清单', products.text.includes('categoryId='))
const productId = Number((products.text.match(/id=(\d+)/) ?? [])[1])
check('get_product 返回工艺介绍', (await run('get_product', { id: productId })).text.includes('工艺介绍'))

const community = await run('search_community', { size: 2 })
const postId = Number((community.text.match(/id=(\d+)/) ?? [])[1])
check('get_post 返回正文', (await run('get_post', { id: postId })).text.length > 20)

const plan = await run('build_itinerary', { days: 2, interests: ['梯田'] })
check('build_itinerary 返回候选与预算', plan.text.includes('粗估') && plan.text.includes('民宿'))

// 类型非法的参数由 harness 在进入 execute 之前拒绝 —— 严格校验，期望行为
let rejectedByHarness = false
try {
  await run('get_stay', { id: 'not-a-number' })
} catch (error) {
  rejectedByHarness = error?.name === 'ToolArgsError' || error?.code === 'INVALID_ARGS'
}
check('类型非法的参数被 harness 拒绝（不会进 execute）', rejectedByHarness)

// 合法但后端不存在的 id → core 返回可读错误文本，不抛异常
const missingId = await run('get_stay', { id: 999999 })
check('不存在的 id 返回可读错误文本', typeof missingId.text === 'string' && missingId.text.length > 0, missingId.text)

console.log(`\n结果：${failed === 0 ? '全部通过' : `${failed} 项失败`}（工具 ${registered.size} 个）`)
if (failed > 0) process.exitCode = 1
