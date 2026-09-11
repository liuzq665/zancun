/**
 * 按域封装的只读调用（wudong-server 的 /api/* 匿名门面）。
 *
 * 每个函数返回 `{ok:true, total, items, text}` 或 `{ok:false, error}`：
 * `items` 是结构化字段（供 build_itinerary 组合），`text` 是已经排好版的中文清单
 * （模型真正读到的东西）。两者都在这里生成，插件层只负责转发。
 *
 * 刻意不暴露的东西（后端拼出来的假字段/假能力，喂给模型等于撒谎）：
 *   - `goods.skus`：由商品行合成出来的单 SKU；
 *   - `hotel/calendar/:roomTypeId`：由静态库存推导的**常量数组**，不是按日期的可用性；
 *   - `food.timeSlots`：恒为 `[]`；
 *   - `travel/guide/list`：恒为空。
 */

import { apiGet } from './http.js'
import { clampPage, clampSize, compact, intId, money, shorten, toItems } from './normalize.js'

const AVAILABILITY_NOTE = '注：房态是静态库存，不是按日期的真实可用性，不要向用户承诺某个具体日期一定有房。'

function fail(error) {
  return { ok: false, error }
}

/* ---------------------------------- 民宿 ---------------------------------- */

function mapStay(row) {
  return compact({
    id: row.id,
    kind: 'stay',
    name: shorten(row.name, 40),
    style: shorten(row.styleTag, 24),
    facility: shorten(row.facilityTag, 60),
    score: money(row.score),
    pricePerNight: money(row.minPrice),
    city: shorten(row.city, 20),
  })
}

function renderStays(items, total) {
  if (items.length === 0) return '没有找到匹配的民宿/客栈。换个关键词或去掉筛选条件再试。'
  const lines = items.map((it) =>
    `- [id=${it.id}] ${it.name}${it.style ? `（${it.style}）` : ''}｜每晚起价 ¥${it.pricePerNight ?? '未标价'}${it.score ? `｜评分 ${it.score}` : ''}${it.facility ? `｜${it.facility}` : ''}`,
  )
  return [`民宿/客栈（共 ${total} 条，返回 ${items.length} 条）`, ...lines, '', AVAILABILITY_NOTE].join('\n')
}

/** @param {{keyword?:string,size?:number,page?:number}} [args] */
export async function searchStays(args = {}) {
  const result = await apiGet('/api/hotel/list', {
    page: clampPage(args.page),
    size: clampSize(args.size, 6),
    keyword: shorten(args.keyword, 30),
  })
  if (!result.ok) return fail(result.error)
  const { items, total } = toItems(result.data)
  const mapped = items.map(mapStay)
  return { ok: true, total, items: mapped, text: renderStays(mapped, total) }
}

/** @param {{id?:unknown}} args */
export async function getStay(args = {}) {
  const id = intId(args.id)
  if (id === undefined) return fail('需要一个正整数 id。可以先调 search_stays 拿到 id。')
  const result = await apiGet(`/api/hotel/detail/${id}`)
  if (!result.ok) return fail(result.error)
  const row = result.data
  if (row === null || typeof row !== 'object') return fail(`没有找到 id=${id} 的民宿。`)

  const item = compact({
    id: row.id,
    kind: 'stay',
    name: shorten(row.name, 40),
    style: shorten(row.styleTag, 24),
    facility: shorten(row.facilityTag, 60),
    score: money(row.score),
    pricePerNight: money(row.minPrice),
    intro: shorten(row.intro, 300),
    checkinTime: shorten(row.notice?.checkinTime, 10),
    checkoutTime: shorten(row.notice?.checkoutTime, 10),
    rooms: (Array.isArray(row.roomTypes) ? row.roomTypes : []).map((room) =>
      compact({
        id: room.id,
        name: shorten(room.name, 30),
        bedType: shorten(room.bedType, 20),
        area: money(room.area),
        capacity: money(room.capacity),
        pricePerNight: money(room.price),
        stock: money(room.stock),
      }),
    ),
  })

  const parts = [`【民宿】${item.name}（id=${item.id}）`]
  if (item.style) parts.push(`风格：${item.style}`)
  if (item.score) parts.push(`评分：${item.score}`)
  if (item.intro) parts.push(`简介：${item.intro}`)
  if (item.checkinTime || item.checkoutTime) parts.push(`入住 ${item.checkinTime ?? '—'} / 退房 ${item.checkoutTime ?? '—'}`)
  if (item.facility) parts.push(`设施：${item.facility}`)
  if (item.rooms?.length) {
    parts.push('房型：')
    for (const room of item.rooms) {
      parts.push(
        `- [roomId=${room.id}] ${room.name}｜${room.bedType ?? '—'}｜可住 ${room.capacity ?? '—'} 人｜${room.area ? `${room.area}㎡｜` : ''}¥${room.pricePerNight ?? '未标价'}/晚｜剩 ${room.stock ?? '—'} 间`,
      )
    }
    parts.push(``, AVAILABILITY_NOTE)
  } else {
    parts.push('（该民宿暂未登记房型）')
  }
  return { ok: true, total: 1, items: [item], text: parts.join('\n') }
}

/* ------------------------------- 景区 / 路线 ------------------------------- */

function mapScenic(row) {
  // 景区的 ticketTypes 是后端由 ticketPrice 合成的单一「成人票」，价格为 0 表示未定价。
  const ticket = Array.isArray(row.ticketTypes) ? row.ticketTypes[0] : undefined
  const price = money(ticket?.price)
  return compact({
    id: row.id,
    kind: 'scenic',
    name: shorten(row.name, 40),
    openTime: shorten(row.openTime, 24),
    ticketPrice: price !== undefined && price > 0 ? price : undefined,
  })
}

function mapRoute(row) {
  return compact({
    id: row.id,
    kind: 'route',
    name: shorten(row.title, 40),
    days: money(row.days),
    price: money(row.price),
    includedItems: shorten(row.includedItems, 80),
  })
}

/** scenic 与 route 挂在同一个工具下，但打上不同的 kind，后续 get_travel 靠它区分。 */
export async function searchTravel(args = {}) {
  const size = clampSize(args.size, 6)
  const keyword = shorten(args.keyword, 30)
  const [scenicResult, routeResult] = await Promise.all([
    apiGet('/api/travel/scenic/list', { page: 1, size, keyword }),
    apiGet('/api/travel/route/list', { page: 1, size, keyword }),
  ])
  if (!scenicResult.ok && !routeResult.ok) return fail(scenicResult.error)

  const scenic = scenicResult.ok ? toItems(scenicResult.data) : { items: [], total: 0 }
  const route = routeResult.ok ? toItems(routeResult.data) : { items: [], total: 0 }
  const scenics = scenic.items.map(mapScenic)
  const routes = route.items.map(mapRoute)
  const items = [...scenics, ...routes]

  const parts = []
  parts.push(scenics.length ? ['景区景点：', ...scenics.map((it) => `- [id=${it.id}] ${it.name}${it.openTime ? `｜开放时间 ${it.openTime}` : ''}${it.ticketPrice !== undefined ? `｜门票 ¥${it.ticketPrice}` : ''}`)].join('\n') : '景区景点：没有匹配结果。')
  parts.push(
    routes.length
      ? ['旅游路线：', ...routes.map((it) => `- [id=${it.id}] ${it.name}${it.days ? `｜${it.days} 天` : ''}${it.price !== undefined ? `｜¥${it.price}` : ''}${it.includedItems ? `｜含 ${it.includedItems}` : ''}`)].join('\n')
      : '旅游路线：没有匹配结果。',
  )
  parts.push('', '注：路线详情只有行程天数与所含项目，**没有逐日安排正文**，不要替它编造每天的具体景点。')
  return { ok: true, total: scenic.total + route.total, items, text: parts.join('\n') }
}

/** @param {{kind?:string,id?:unknown}} args */
export async function getTravel(args = {}) {
  const kind = args.kind === 'route' ? 'route' : args.kind === 'scenic' ? 'scenic' : undefined
  if (kind === undefined) return fail('kind 必须是 "scenic" 或 "route"。')
  const id = intId(args.id)
  if (id === undefined) return fail('需要一个正整数 id。可以先调 search_travel 拿到 id。')

  const result = await apiGet(`/api/travel/${kind}/detail/${id}`)
  if (!result.ok) return fail(result.error)
  const row = result.data
  if (row === null || typeof row !== 'object') return fail(`没有找到 id=${id} 的${kind === 'scenic' ? '景区' : '路线'}。`)

  if (kind === 'scenic') {
    const item = mapScenic(row)
    const parts = [`【景区】${item.name}（id=${item.id}）`]
    if (item.openTime) parts.push(`开放时间：${item.openTime}`)
    parts.push(item.ticketPrice !== undefined ? `门票：¥${item.ticketPrice}` : '门票：未定价')
    parts.push('', '注：后端未提供该景点的介绍正文，文化背景请改从社区攻略（search_community）中检索。')
    return { ok: true, total: 1, items: [item], text: parts.join('\n') }
  }

  const item = mapRoute(row)
  const planDays = (Array.isArray(row.plans) ? row.plans : []).map((plan) => money(plan?.day)).filter((day) => day !== undefined)
  const parts = [`【路线】${item.name}（id=${item.id}）`]
  if (item.days) parts.push(`行程天数：${item.days} 天${planDays.length ? `（后端登记了第 ${planDays.join('、')} 天，但每天没有正文）` : ''}`)
  if (item.price !== undefined) parts.push(`价格：¥${item.price}`)
  if (item.includedItems) parts.push(`包含：${item.includedItems}`)
  parts.push('', '注：该路线没有逐日安排正文，编排日程时只能引用上面的「包含」清单，不要编造每天的景点顺序。')
  return { ok: true, total: 1, items: [item], text: parts.join('\n') }
}

/* ---------------------------------- 餐饮 ---------------------------------- */

function mapRestaurant(row) {
  return compact({
    id: row.id,
    kind: 'food',
    name: shorten(row.name, 40),
    address: shorten(row.address, 40),
    score: money(row.score),
    avgPrice: money(row.avgPrice),
  })
}

/** @param {{keyword?:string,size?:number,page?:number}} [args] */
export async function searchFood(args = {}) {
  const result = await apiGet('/api/food/restaurant/list', {
    page: clampPage(args.page),
    size: clampSize(args.size, 6),
    keyword: shorten(args.keyword, 30),
  })
  if (!result.ok) return fail(result.error)
  const { items, total } = toItems(result.data)
  const mapped = items.map(mapRestaurant)
  const text = mapped.length
    ? [`餐厅/农家乐（共 ${total} 条，返回 ${mapped.length} 条）`, ...mapped.map((it) => `- [id=${it.id}] ${it.name}｜人均 ¥${it.avgPrice ?? '未标价'}${it.score ? `｜评分 ${it.score}` : ''}${it.address ? `｜${it.address}` : ''}`)].join('\n')
    : '没有找到匹配的餐厅。换个关键词再试。'
  return { ok: true, total, items: mapped, text }
}

/** @param {{id?:unknown}} args */
export async function getFood(args = {}) {
  const id = intId(args.id)
  if (id === undefined) return fail('需要一个正整数 id。可以先调 search_food 拿到 id。')
  const result = await apiGet(`/api/food/restaurant/detail/${id}`)
  if (!result.ok) return fail(result.error)
  const row = result.data
  if (row === null || typeof row !== 'object') return fail(`没有找到 id=${id} 的餐厅。`)

  const dishes = (Array.isArray(row.dishes) ? row.dishes : []).map((dish) =>
    compact({ id: dish.id, name: shorten(dish.name, 30), price: money(dish.price) }),
  )
  const item = compact({
    ...mapRestaurant(row),
    intro: shorten(row.intro, 300),
    businessHours: shorten(row.businessHours, 24),
    dishes,
  })

  const parts = [`【餐厅】${item.name}（id=${item.id}）`]
  if (item.avgPrice !== undefined) parts.push(`人均：¥${item.avgPrice}`)
  if (item.businessHours) parts.push(`营业时间：${item.businessHours}`)
  if (item.address) parts.push(`地址：${item.address}`)
  if (item.intro) parts.push(`简介：${item.intro}`)
  parts.push(
    dishes.length
      ? ['菜品：', ...dishes.map((dish) => `- ${dish.name}｜¥${dish.price ?? '未标价'}`)].join('\n')
      : '（该餐厅暂未登记菜品）',
  )
  return { ok: true, total: 1, items: [item], text: parts.join('\n') }
}

/* -------------------------------- 非遗商品 -------------------------------- */

function mapProduct(row) {
  return compact({
    id: row.id,
    kind: 'product',
    name: shorten(row.title, 40),
    subtitle: shorten(row.subtitle, 40),
    price: money(row.price),
    marketPrice: money(row.marketPrice),
    stock: money(row.stock),
  })
}

/** @param {{keyword?:string,categoryId?:unknown,size?:number,page?:number}} [args] */
export async function searchProducts(args = {}) {
  const keyword = shorten(args.keyword, 30)
  const categoryId = intId(args.categoryId)
  const result = await apiGet('/api/goods/list', {
    page: clampPage(args.page),
    size: clampSize(args.size, 6),
    keyword,
    categoryId,
  })
  if (!result.ok) return fail(result.error)
  const { items, total } = toItems(result.data)
  const mapped = items.map(mapProduct)
  const parts = mapped.length
    ? [`非遗/手工艺商品（共 ${total} 条，返回 ${mapped.length} 条）`, ...mapped.map((it) => `- [id=${it.id}] ${it.name}${it.subtitle ? `｜${it.subtitle}` : ''}｜¥${it.price ?? '未标价'}${it.stock !== undefined ? `｜库存 ${it.stock}` : ''}`)]
    : ['没有找到匹配的商品。']

  // 没给任何筛选条件时顺带把品类清单给出来 —— 省掉模型再问一次，
  // 也让「随便看看有什么手工艺」这类话有东西可答。
  if (!keyword && categoryId === undefined) {
    const categories = await searchProductCategories()
    if (categories.ok && categories.items.length > 0) {
      parts.push('', '可用的商品品类（可用 categoryId 筛选）：')
      for (const category of categories.items) parts.push(`- ${category.name}（categoryId=${category.id}）`)
    }
  }

  return { ok: true, total, items: mapped, text: parts.join('\n') }
}

/** 品类树是裸数组。 */
export async function searchProductCategories() {
  const result = await apiGet('/api/goods/category/tree')
  if (!result.ok) return fail(result.error)
  const { items } = toItems(result.data)
  const mapped = items.map((row) => compact({ id: row.id, name: shorten(row.name, 20) }))
  const text = mapped.length
    ? ['非遗商品品类：', ...mapped.map((it) => `- ${it.name}（categoryId=${it.id}）`)].join('\n')
    : '后端没有返回任何商品品类。'
  return { ok: true, total: mapped.length, items: mapped, text }
}

/** @param {{id?:unknown}} args */
export async function getProduct(args = {}) {
  const id = intId(args.id)
  if (id === undefined) return fail('需要一个正整数 id。可以先调 search_products 拿到 id。')
  const result = await apiGet(`/api/goods/detail/${id}`)
  if (!result.ok) return fail(result.error)
  const row = result.data
  if (row === null || typeof row !== 'object') return fail(`没有找到 id=${id} 的商品。`)

  const item = compact({
    ...mapProduct(row),
    craftIntro: shorten(row.craftIntro, 400),
  })

  const parts = [`【非遗商品】${item.name}（id=${item.id}）`]
  if (item.subtitle) parts.push(`级别：${item.subtitle}`)
  if (item.price !== undefined) parts.push(`价格：¥${item.price}${item.marketPrice !== undefined ? `（原价 ¥${item.marketPrice}）` : ''}`)
  if (item.stock !== undefined) parts.push(`库存：${item.stock}`)
  if (item.craftIntro) parts.push(`工艺介绍：${item.craftIntro}`)
  parts.push('', '注：该商品的详细介绍字段目前为空（后端 `detail` 为 null），工艺背景只能引用上面的「工艺介绍」。')
  return { ok: true, total: 1, items: [item], text: parts.join('\n') }
}

/* --------------------------------- 社区 --------------------------------- */

function mapPost(row) {
  return compact({
    id: row.id,
    kind: 'post',
    content: shorten(row.content, 400),
    location: shorten(row.location, 30),
    topicTags: Array.isArray(row.topicTags) ? row.topicTags.slice(0, 6).map((tag) => shorten(tag, 12)).filter(Boolean) : undefined,
    likeCount: money(row.likeCount),
    commentCount: money(row.commentCount),
    author: shorten(row.author?.nickname, 24),
  })
}

/**
 * 社区攻略检索。这里只做**关键词包含**过滤 —— 后端没有全文检索，
 * 语义匹配交给模型自己读内容判断，所以宁可多取一些再让它筛。
 *
 * @param {{keyword?:string,size?:number}} [args]
 */
export async function searchCommunity(args = {}) {
  const size = clampSize(args.size, 10)
  const keyword = shorten(args.keyword, 30)
  const result = await apiGet('/api/community/feed', { page: 1, size })
  if (!result.ok) return fail(result.error)
  const { items, total } = toItems(result.data)
  let mapped = items.map(mapPost)

  if (keyword) {
    const needle = keyword.toLowerCase()
    const hit = mapped.filter((post) =>
      [post.content, post.location, post.author, ...(post.topicTags ?? [])].filter(Boolean).some((field) => String(field).toLowerCase().includes(needle)),
    )
    // 关键词没命中时保留原始结果并说明，免得模型以为社区是空的。
    if (hit.length > 0) mapped = hit
    else if (mapped.length > 0) {
      const body = [`没有帖子在正文或标签里包含「${keyword}」，下面是社区最新 ${mapped.length} 条，请你自己阅读判断相关性。`, ...mapped.map(renderPostLine)].join('\n')
      return { ok: true, total, items: mapped, text: body }
    }
  }

  const text = mapped.length
    ? [`社区攻略（共 ${total} 条，返回 ${mapped.length} 条）`, ...mapped.map(renderPostLine)].join('\n')
    : '社区目前没有帖子。'
  return { ok: true, total, items: mapped, text }
}

function renderPostLine(post) {
  const tags = post.topicTags?.length ? `〔${post.topicTags.join('、')}〕` : ''
  return `- [id=${post.id}]${tags}${post.location ? `@${post.location}` : ''}：${post.content ?? ''}`
}

/** @param {{id?:unknown}} args */
export async function getPost(args = {}) {
  const id = intId(args.id)
  if (id === undefined) return fail('需要一个正整数 id。可以先调 search_community 拿到 id。')
  const result = await apiGet(`/api/community/post/${id}`)
  if (!result.ok) return fail(result.error)
  const row = result.data
  if (row === null || typeof row !== 'object') return fail(`没有找到 id=${id} 的帖子。`)

  const item = compact({ ...mapPost(row), imageCount: Array.isArray(row.images) ? row.images.length : undefined })
  const parts = [`【社区攻略】id=${item.id}`]
  if (item.author) parts.push(`作者：${item.author}`)
  if (item.location) parts.push(`地点：${item.location}`)
  if (item.topicTags?.length) parts.push(`标签：${item.topicTags.join('、')}`)
  parts.push(`点赞 ${item.likeCount ?? 0}｜评论 ${item.commentCount ?? 0}`)
  parts.push('', item.content ?? '（无正文）')
  parts.push('', '注：后端不返回评论列表，所以只能引用正文。')
  return { ok: true, total: 1, items: [item], text: parts.join('\n') }
}
