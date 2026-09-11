import { get, post } from '../request';
import type { Homestay, PageQuery, PageResult, RoomCalendarDay } from '../types';

const publicOpt = { auth: false };

/** 民宿列表 */
export const list = (query?: PageQuery & {
  checkin?: string;
  checkout?: string;
  peopleCount?: number;
  styleTag?: string;
  facilityTag?: string;
  sort?: string;
}) => get<PageResult<Homestay>>('/api/hotel/list', query, publicOpt);

/** 民宿详情 */
export const detail = (id: number) => get<Homestay>(`/api/hotel/detail/${id}`, undefined, publicOpt);

/** 房态日历 */
export const calendar = (roomTypeId: number, query?: { start?: string; end?: string; days?: number }) =>
  get<RoomCalendarDay[]>(`/api/hotel/calendar/${roomTypeId}`, query, publicOpt);

/** 民宿预订 */
export const reserve = (data: {
  roomTypeId: number;
  checkin: string;
  checkout: string;
  peopleCount: number;
  contactName: string;
  contactPhone: string;
  idCard: string;
}) => post<{ id: number; orderNo: string; status: string }>('/api/hotel/reserve', data);

/** 我的住宿订单 */
export const myOrder = (query?: PageQuery) => get<PageResult<any>>('/api/hotel/order/my', query);

/** 取消预订 */
export const cancelOrder = (orderId: number) => post<null>(`/api/hotel/order/cancel/${orderId}`);

/** 收藏 */
export const collect = (id: number) => post<null>(`/api/favorite/hotel/${id}`);
