import { Context } from '@midwayjs/koa';
import { AppUserService } from '../user/service/user';

/**
 * /api/* 兼容门面（对齐文档第 7 章契约）的公共工具。
 *
 * 注意与 /app/* 的差异：
 * - 分页参数是 page/size，列表信封是 {list,total,page,size}
 * - 金额单位是「元」，而实体存的是「分」
 */
export const ok = (data: any = null) => ({ code: 0, message: 'ok', data });

export const fail = (code: number, message: string) => ({ code, message, data: null });

export function pageArgs(query: any) {
  const pageNo = Math.max(1, Number(query?.page) || 1);
  const size = Math.max(1, Number(query?.size) || 10);
  return { page: pageNo, size, skip: (pageNo - 1) * size };
}

export const pageResult = (list: any[], total: number, page: number, size: number) => ({
  list,
  total,
  page,
  size,
});

/** 分 → 元，未提供时返回 undefined（前端字段多为可选） */
export function toYuan(fen: any): number | undefined {
  if (fen === null || fen === undefined || fen === '') return undefined;
  return Math.round(Number(fen)) / 100;
}

/** 格式化为 YYYY-MM-DD */
export function fmtDate(d: any): string | undefined {
  if (!d) return undefined;
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return undefined;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;
}

/** 实体里 JSON 字段以 text 存储，出参需要还原成数组/对象 */
export function json<T>(raw: any, fallback: T): T {
  if (raw === null || raw === undefined || raw === '') return fallback;
  if (typeof raw !== 'string') return raw as T;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * 解析登录用户 id。
 * 小程序发裸 JWT、PC 发 Bearer，这里都兼容。
 */
export function resolveUserId(ctx: Context, userService: AppUserService): number | null {
  const header: any =
    (ctx.get && ctx.get('authorization')) || (ctx.headers as any)?.authorization || '';
  const token = String(header).replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;
  const payload = userService.verifyToken(token);
  return (payload && payload.userId) || null;
}
