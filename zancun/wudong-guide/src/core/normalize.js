/**
 * 响应形状归一化。
 *
 * wudong-server 的 /api/* 门面有三处形状不一致，全在这里抹平，不让模型看见：
 *   - 列表信封是扁平 `{list,total,page,size}`；
 *   - 但 `goods/category/tree`、`hotel/calendar/:id`、`community/topic/list`、`admin/banner`
 *     返回的是**裸数组**；
 *   - `goods/search` 不回 `page/size`。
 */

/** 单页返回上限。门面不限制 `size`，不夹紧会被模型用来拉全表。 */
export const MAX_PAGE_SIZE = 20

/** @param {unknown} value @param {number} [fallback] */
export function clampSize(value, fallback = 8) {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(MAX_PAGE_SIZE, Math.max(1, Math.trunc(n)))
}

/** @param {unknown} value */
export function clampPage(value) {
  const n = Number(value)
  return Number.isFinite(n) && n >= 1 ? Math.trunc(n) : 1
}

/**
 * 把任意列表响应收敛成 `{items,total}`，兼容扁平信封与裸数组。
 *
 * @param {unknown} data
 * @returns {{items: unknown[], total: number}}
 */
export function toItems(data) {
  if (Array.isArray(data)) return { items: data, total: data.length }
  if (data !== null && typeof data === 'object' && Array.isArray(data.list)) {
    const total = Number(data.total)
    return { items: data.list, total: Number.isFinite(total) ? total : data.list.length }
  }
  return { items: [], total: 0 }
}

/**
 * 去掉 undefined / null / 空串 / 空数组的字段，让喂给模型的 JSON 更短。
 *
 * @param {Record<string, unknown>} object
 */
export function compact(object) {
  const out = {}
  for (const [key, value] of Object.entries(object)) {
    if (value === undefined || value === null || value === '') continue
    if (Array.isArray(value) && value.length === 0) continue
    out[key] = value
  }
  return out
}

/**
 * 压平空白并截断，返回 undefined 表示这个字段没有内容。
 *
 * @param {unknown} value
 * @param {number} [max]
 */
export function shorten(value, max = 120) {
  if (value === undefined || value === null) return undefined
  const text = String(value).replace(/\s+/g, ' ').trim()
  if (!text) return undefined
  return text.length > max ? `${text.slice(0, max)}…` : text
}

/** 门面已把「分」换算成「元」，这里只做数字校验。 @param {unknown} value */
export function money(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

/** 整数 id 校验 —— 模型可能传字符串，非法一律 undefined 由调用方决定怎么处理。 @param {unknown} value */
export function intId(value) {
  const n = Number(value)
  return Number.isInteger(n) && n > 0 ? n : undefined
}
