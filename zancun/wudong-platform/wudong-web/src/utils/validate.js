/**
 * 手机号 / 身份证号 的输入限制与校验。
 *
 * 两层防护：
 * 1. sanitizeXxx —— 绑在 @input 上，边输边过滤非法字符并截断长度（治本，用户根本敲不进去）
 * 2. 正则 + 提示 —— 提交前拦住不完整/不合法的值（给明确原因）
 */

// 手机号：11 位，1 开头，第二位 3-9
export const PHONE_RE = /^1[3-9]\d{9}$/

// 身份证号：18 位，前 17 位数字，末位数字或 X（大小写均可，入库统一大写）
export const ID_CARD_RE = /^\d{17}[\dXx]$/

/** 只保留数字，最多 11 位（手机号输入框用） */
export const sanitizePhone = (v) => String(v ?? '').replace(/\D/g, '').slice(0, 11)

/** 只保留数字与 x/X（统一转大写），最多 18 位（身份证输入框用） */
export const sanitizeIdCard = (v) =>
  String(v ?? '')
    .replace(/[^0-9xX]/g, '')
    .toUpperCase()
    .slice(0, 18)

/** 校验手机号，通过返回 ''，否则返回提示语 */
export const validatePhone = (v) => {
  const s = String(v ?? '').trim()
  if (!s) return '请输入手机号'
  if (!/^\d+$/.test(s)) return '手机号只能包含数字'
  if (s.length !== 11) return '手机号必须是 11 位数字'
  if (!PHONE_RE.test(s)) return '手机号格式不正确'
  return ''
}

/** 校验身份证号，通过返回 ''，否则返回提示语 */
export const validateIdCard = (v) => {
  const s = String(v ?? '').trim()
  if (!s) return '请输入身份证号'
  if (s.length !== 18) return '身份证号必须是 18 位'
  if (!ID_CARD_RE.test(s)) return '身份证号格式不正确（前 17 位数字，末位数字或 X）'
  return ''
}

/**
 * 商家联系电话：允许手机号，也允许座机（区号-号码，如 0855-8234567）。
 * 商家的对外电话本来就是座机居多，强制 11 位手机号反而不合理。
 */
export const sanitizeBusinessPhone = (v) =>
  String(v ?? '')
    .replace(/[^\d-]/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 20)

export const validateBusinessPhone = (v) => {
  const s = String(v ?? '').trim()
  if (!s) return '' // 选填
  if (PHONE_RE.test(s)) return ''
  if (/^0\d{2,3}-?\d{7,8}$/.test(s)) return ''
  return '请填写有效的手机号或座机号（如 0855-8234567）'
}
