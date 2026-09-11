import { get, post } from '../request';
import type { Eticket, PageQuery, PageResult, Route, Scenic } from '../types';

const publicOpt = { auth: false };

/** 景区列表 */
export const scenicList = (query?: PageQuery) =>
  get<PageResult<Scenic>>('/api/travel/scenic/list', query, publicOpt);

/** 景区详情 */
export const scenicDetail = (id: number) =>
  get<Scenic>(`/api/travel/scenic/detail/${id}`, undefined, publicOpt);

/** 门票购买 */
export const ticketBuy = (data: {
  ticketTypeId: number;
  useDate: string;
  quantity: number;
  visitors: { name: string; idCard: string }[];
}) => post<{ id: number; orderNo: string; status: string }>('/api/travel/ticket/buy', data);

/** 路线列表 */
export const routeList = (query?: PageQuery & { days?: number; theme?: string }) =>
  get<PageResult<Route>>('/api/travel/route/list', query, publicOpt);

/** 路线详情 */
export const routeDetail = (id: number) =>
  get<Route>(`/api/travel/route/detail/${id}`, undefined, publicOpt);

/** 路线购买 */
export const routeBuy = (data: {
  routeId: number;
  departureDate: string;
  peopleCount: number;
  visitors: { name: string; idCard: string }[];
}) => post<{ id: number; orderNo: string; status: string }>('/api/travel/route/buy', data);

/** 电子票 */
export const eticket = (orderId: number) => get<Eticket>(`/api/travel/eticket/${orderId}`);

/** 退票 */
export const refund = (orderId: number) => post<null>(`/api/travel/refund/${orderId}`);

/** 收藏（景区 / 路线） */
export const collect = (targetType: 'scenic' | 'route', id: number) =>
  post<null>(`/api/favorite/${targetType}/${id}`);
