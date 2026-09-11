import { del, get, post, put } from '../request';
import type { CartItem } from '../types';

/** 购物车列表 */
export const list = () => get<CartItem[]>('/api/cart/list');

/** 加入购物车 */
export const add = (data: {
  module: 'goods' | 'food';
  entityType: 'goods_sku' | 'product_sku';
  entityId: number;
  quantity: number;
  title?: string;
  specName?: string;
  image?: string;
  price?: number;
}) => post<null>('/api/cart/add', data);

/** 修改数量 / 勾选 */
export const update = (id: number, data: { quantity?: number; checked?: 0 | 1 }) =>
  put<null>(`/api/cart/update/${id}`, data);

/** 删除项 */
export const remove = (id: number) => del<null>(`/api/cart/remove/${id}`);
