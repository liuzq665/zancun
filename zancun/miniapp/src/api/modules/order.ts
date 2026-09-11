import { get, post } from '../request';
import type { CreateOrderInput, Order, OrderStatus, OrderType, PageQuery, PageResult } from '../types';

/** 下单 */
export const create = (input: CreateOrderInput) =>
  post<{ id: number; orderNo: string; status: OrderStatus; payAmount: number }>(
    '/api/order/create',
    input,
  );

/** 我的订单列表 */
export const list = (query?: PageQuery & { orderType?: OrderType; status?: OrderStatus }) => {
  const params: Record<string, any> = { ...query };
  // 后端不支持空字符串状态筛选，只传有值的参数
  if (!params.status) delete params.status;
  return get<PageResult<Order>>('/api/order/list', params);
};

/** 订单详情 */
export const detail = (id: number) => get<Order>(`/api/order/detail/${id}`);

/** 取消订单（仅 PENDING） */
export const cancel = (id: number) => post<{ id: number; status: OrderStatus }>(`/api/order/cancel/${id}`);

/** 支付 */
export const pay = (orderNo: string) =>
  post<{ status: string; orderStatus: OrderStatus }>(`/api/order/pay/${orderNo}`);

/** 确认收货 / 完成 */
export const confirm = (id: number) =>
  post<{ id: number; status: OrderStatus }>(`/api/order/confirm/${id}`);

/** 申请退款 */
export const refund = (id: number) =>
  post<{ id: number; status: OrderStatus }>(`/api/order/refund/${id}`);
