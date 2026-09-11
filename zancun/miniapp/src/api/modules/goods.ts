import { get, post } from '../request';
import type { Goods, GoodsCategory, PageQuery, PageResult } from '../types';

const publicOpt = { auth: false };

// 后端分页参数名
interface BackendPageResult<T> {
  list: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/** 分类树 */
export const categoryTree = () => get<GoodsCategory[]>('/api/goods/category/tree', undefined, publicOpt);

/** 商品列表 */
export const list = (query: PageQuery & { categoryId?: number; minPrice?: number; maxPrice?: number; sort?: string }) =>
  get<BackendPageResult<Goods>>('/api/goods/list', {
    page: query.page || 1,
    pageSize: query.size || 10,
    ...query
  }, publicOpt) as unknown as Promise<PageResult<Goods>>;

/** 商品搜索 */
export const search = (query: { keyword: string } & PageQuery) =>
  get<BackendPageResult<Goods>>('/api/goods/list', {
    page: query.page || 1,
    pageSize: query.size || 10,
    keyword: query.keyword
  }, publicOpt) as unknown as Promise<PageResult<Goods>>;

/** 商品详情 - 后端接口是 /api/goods/detail/:id */
export const detail = (id: number) => get<Goods>(`/api/goods/detail/${id}`, undefined, publicOpt);

/** 评价列表 */
export const evaluations = (goodsId: number, query?: PageQuery & { hasImage?: boolean }) =>
  get<any>(`/api/goods/${goodsId}/evaluation`, query, publicOpt);

/** 收藏（幂等切换） */
export const collect = (goodsId: number) => post<null>(`/api/goods/${goodsId}/favorite`);

/** 评价 */
export const evaluate = (data: {
  orderId: number;
  goodsId: number;
  score: number;
  content?: string;
  images?: string[];
}) => post<{ id: number }>('/api/goods/evaluate', data);

/** 追评 */
export const appendEvaluate = (data: { evaluationId: number; content?: string; images?: string[] }) =>
  post<null>('/api/goods/evaluate/append', data);
