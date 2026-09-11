/**
 * 只读 HTTP 传输层。
 *
 * baseURL 固定指向本机后端，这是本插件唯一的外部依赖，也是安全边界：
 * 模型只能传业务参数，永远不能传 URL 或路径。
 */

const DEFAULT_BASE = 'http://127.0.0.1:8001'
const TIMEOUT_MS = 8000

/** 允许运维通过环境变量改指别处；模型无法影响这一项。 */
export const BASE_URL = process.env.WUDONG_API_BASE || DEFAULT_BASE

function unavailable(error) {
  const why = error?.name === 'TimeoutError' ? '响应超时' : '连接失败'
  return `数据服务${why}（${BASE_URL}）。请直接告诉用户「数据服务暂时不可用」，不要凭记忆编造民宿、餐厅、路线或商品。`
}

/**
 * GET 一个 /api/* 只读端点。
 *
 * 成败按响应体里的 `code` 判定，不按 HTTP 状态码 —— 门面的业务错误也是 HTTP 200。
 * 任何失败都返回 `{ok:false,error}` 而不是抛异常，这样工具能把它变成一句人话。
 *
 * @param {string} path 以 / 开头的固定端点路径
 * @param {Record<string, unknown>} [params] 查询参数；undefined/null/'' 会被丢弃
 * @returns {Promise<{ok:true,data:unknown}|{ok:false,error:string}>}
 */
export async function apiGet(path, params) {
  const url = new URL(path, BASE_URL)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === '') continue
      url.searchParams.set(key, String(value))
    }
  }

  let response
  try {
    response = await fetch(url, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch (error) {
    return { ok: false, error: unavailable(error) }
  }

  let raw
  try {
    raw = await response.text()
  } catch {
    return { ok: false, error: '读取数据服务响应失败。请告诉用户稍后重试。' }
  }

  let body
  try {
    body = JSON.parse(raw)
  } catch {
    return { ok: false, error: `数据服务返回了非 JSON 响应（HTTP ${response.status}）。` }
  }

  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: '数据服务返回了意外的响应结构。' }
  }
  if (body.code !== 0) {
    const message = typeof body.message === 'string' && body.message.trim() ? body.message.trim() : `数据服务返回错误码 ${body.code}。`
    return { ok: false, error: message }
  }
  return { ok: true, data: body.data }
}
