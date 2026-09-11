/**
 * DSH（Cordis）插件适配层。
 *
 * 这里是唯一依赖 DSH API 的文件：所有业务逻辑都在 ../core/ 里，与框架无关。
 * DSH 目前是 0.1.5-rc.1（开发者预览版），破坏性变更预期内 —— 真变了只改这个文件。
 *
 * 工具刻意做「粗」不做「细」：按域合并而不是一个端点一个工具，否则模型会串行发
 * 十几个 HTTP 请求、烧 token，并且容易自己拼出后端根本没有的组合。
 */

import { defineTool } from '@deepseek-ai/dsh-tools'

import {
  getFood,
  getPost,
  getProduct,
  getStay,
  getTravel,
  searchCommunity,
  searchFood,
  searchProducts,
  searchStays,
  searchTravel,
} from '../core/api.js'
import { buildItinerary } from '../core/itinerary.js'
import { GUIDE_RULES } from '../core/persona.js'

/** Cordis 插件名（加载器诊断用）。 */
export const name = 'wudong-guide'

/** 依赖的宿主服务：工具注册表 + 系统提示词注册表。 */
export const inject = ['tools', 'systemPrompt']

/**
 * 所有工具共用同一个输出形状：一段给模型读的中文文本。
 * 格式化在 core 层完成，插件不参与排版 —— 这样模型看到的内容完全由 core 决定。
 */
const TEXT_OUTPUT = {
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: { text: { type: 'string', required: true } },
  },
  render: (_args, value) => [{ type: 'text', text: value.text }],
}

/**
 * 包一层：core 的 `{ok,text,error}` 统一收敛成 `{text}`。
 * 失败**不抛异常**而是把错误原文当文本返回 —— 措辞由 core 掌控，
 * 且人格规则里明确要求模型如实转达这类信息，而不是拿它当数据用。
 */
function wrap(fn) {
  return async (args) => {
    const result = await fn(args)
    return { text: result.ok ? result.text : result.error }
  }
}

const idParam = { type: 'integer', required: true, description: '目标对象的数字 id，取自对应 search_* 工具返回的 [id=…]。' }
const sizeParam = { type: 'integer', description: '返回条数，1–20，默认 6。' }
const keywordParam = { type: 'string', description: '关键词。后端只做字面包含匹配，不是语义搜索；拿不准就先不传，取回目录后自己筛选。' }

function define(spec) {
  return defineTool({ ...spec, output: TEXT_OUTPUT, timeoutMs: 20000, isConcurrencySafe: () => true })
}

/**
 * @param {import('@deepseek-ai/cordis').Context} ctx
 */
export function apply(ctx) {
  ctx.tools.register(
    define({
      name: 'search_stays',
      description: '按关键词查找乌东的民宿/客栈，返回 id、名称、风格、设施、评分与每晚起价（元）。排行程时用它挑住宿。',
      parameters: { keyword: keywordParam, size: sizeParam },
      execute: wrap(searchStays),
    }),
  )

  ctx.tools.register(
    define({
      name: 'get_stay',
      description: '查看某个民宿的详情：简介、入住/退房时间、以及所有房型的名称、床型、可住人数、面积、价格（元）与剩余房间数。需要向游客报房型价格时用它。',
      parameters: { id: idParam },
      execute: wrap(getStay),
    }),
  )

  ctx.tools.register(
    define({
      name: 'search_travel',
      description: '查找景区景点与旅游路线，一次返回两类。景区含开放时间与门票价；路线含天数、价格与所含项目。注意路线没有逐日安排正文。',
      parameters: { keyword: keywordParam, size: sizeParam },
      execute: wrap(searchTravel),
    }),
  )

  ctx.tools.register(
    define({
      name: 'get_travel',
      description: '查看某个景区或某条路线的详情。kind 必须显式给 "scenic"（景区）或 "route"（路线），因为景区和路线是两套各自独立的 id 编号。',
      parameters: {
        kind: { type: 'string', required: true, enum: ['scenic', 'route'], description: '"scenic" 查景区，"route" 查旅游路线。' },
        id: idParam,
      },
      execute: wrap(getTravel),
    }),
  )

  ctx.tools.register(
    define({
      name: 'search_food',
      description: '按关键词查找餐厅/农家乐，返回 id、名称、地址、评分与人均消费（元）。',
      parameters: { keyword: keywordParam, size: sizeParam },
      execute: wrap(searchFood),
    }),
  )

  ctx.tools.register(
    define({
      name: 'get_food',
      description: '查看餐厅详情：简介、营业时间、地址，以及完整菜单（菜名与单价，元）。游客问「这家有什么菜、贵不贵」时用它。',
      parameters: { id: idParam },
      execute: wrap(getFood),
    }),
  )

  ctx.tools.register(
    define({
      name: 'search_products',
      description: '查找非遗/手工艺商品（银饰、蜡染、刺绣、芦笙、竹编、服饰等），返回 id、名称、非遗级别、价格与库存（元）。不传关键词时会附带品类清单，可用 categoryId 按品类筛。',
      parameters: {
        keyword: keywordParam,
        categoryId: { type: 'integer', description: '商品品类 id，取自本工具返回的品类清单。' },
        size: sizeParam,
      },
      execute: wrap(searchProducts),
    }),
  )

  ctx.tools.register(
    define({
      name: 'get_product',
      description: '查看非遗商品详情：价格、原价、库存与工艺介绍。回答「这件手工艺是怎么做的」时用它。',
      parameters: { id: idParam },
      execute: wrap(getProduct),
    }),
  )

  ctx.tools.register(
    define({
      name: 'search_community',
      description: '检索社区里的游客攻略与分享（含正文、地点、话题标签）。关于苗寨文化、景点背景、注意事项之类没有专门介绍字段的内容，在这里找依据。',
      parameters: { keyword: keywordParam, size: sizeParam },
      execute: wrap(searchCommunity),
    }),
  )

  ctx.tools.register(
    define({
      name: 'get_post',
      description: '查看单篇社区攻略的完整正文与作者、地点、标签、点赞评论数。',
      parameters: { id: idParam },
      execute: wrap(getPost),
    }),
  )

  ctx.tools.register(
    define({
      name: 'build_itinerary',
      description:
        '为一趟旅行并行收集真实候选：民宿、景区、路线、餐厅、非遗商品，并给出每人费用粗估。它**不返回逐日日程**——你需要自己把候选排成「上午/下午/晚上」的日程。安排行程时先用它，不要逐个 search_* 自己拼。',
      parameters: {
        days: { type: 'integer', required: true, description: '行程天数，1–7。' },
        interests: { type: 'array', items: { type: 'string' }, description: '游客的兴趣点，如 ["梯田","非遗","美食"]。用于你排序时的偏好提示。' },
        budgetLevel: { type: 'string', enum: ['budget', 'comfort', 'premium'], description: '预算档：budget 经济 / comfort 舒适（默认）/ premium 高端。' },
        keyword: { type: 'string', description: '游客原话里的关键诉求，原样传入。' },
      },
      execute: wrap(buildItinerary),
    }),
  )

  // 行为准则作为独立的 system prompt 段落注册；插件卸载时随 effect 自动注销。
  ctx.systemPrompt.section({
    name: 'wudong-guide:rules',
    order: 4500,
    text: GUIDE_RULES,
  })
}
