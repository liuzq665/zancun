import { get } from '../request';

/**
 * 我的收藏（聚合）。
 * 说明：ADR-11 定的是「前端聚合各模块收藏接口，不单独建聚合表」，
 * 但文档第 7 章未枚举对应的 GET 端点，此处按 /api/mine/collect 约定，
 * 后端落地时需同步补进接口文档。
 */
export const collectList = (type: 'goods' | 'hotel' | 'post' = 'goods') =>
  get<any[]>('/api/mine/collect', { type });
