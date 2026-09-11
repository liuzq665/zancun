import { get, post } from '../request';
import type { PageQuery, PageResult, Restaurant } from '../types';

const publicOpt = { auth: false };

/** 餐厅列表 */
export const restaurantList = (query?: PageQuery & { sort?: string; longitude?: number; latitude?: number }) =>
  get<PageResult<Restaurant>>('/api/food/restaurant/list', query, publicOpt);

/** 餐厅详情 */
export const restaurantDetail = (id: number) =>
  get<Restaurant>(`/api/food/restaurant/detail/${id}`, undefined, publicOpt);

/** 餐位预订 */
export const reserve = (data: {
  restaurantId: number;
  timeSlotId: number;
  date: string;
  peopleCount: number;
  name: string;
  phone: string;
  remark?: string;
}) => post<{ id: number; orderNo: string; status: string }>('/api/food/reserve', data);

/** 农产品列表 */
export const productList = (query?: PageQuery & { categoryId?: number; sort?: string }) =>
  get<PageResult<any>>('/api/food/product/list', query, publicOpt);

/** 农产品详情 */
export const productDetail = (id: number) => get<any>(`/api/food/product/detail/${id}`, undefined, publicOpt);

/** 收藏（餐厅 / 商品） */
export const collect = (targetType: 'restaurant' | 'product', id: number) =>
  post<null>(`/api/favorite/${targetType}/${id}`);

/** 我的预订 */
export const myReserve = (query?: PageQuery) => get<PageResult<any>>('/api/food/reserve/my', query);

/** 取消预订 */
export const cancelReserve = (orderId: number) => post<null>(`/api/food/reserve/cancel/${orderId}`);
