import type { OrderItem, OrderType } from '@/api/types';

const KEY = 'order_draft';

/** 下单草稿：购物车结算 / 立即购买统一走这里，避免超长 URL 传参 */
export interface OrderDraft {
  orderType: OrderType;
  items: OrderItem[];
  title?: string;
  merchantId?: number;
  snapshot?: Record<string, any>;
}

export function setDraft(draft: OrderDraft): void {
  uni.setStorageSync(KEY, draft);
}

export function getDraft(): OrderDraft | null {
  return uni.getStorageSync(KEY) || null;
}

export function clearDraft(): void {
  uni.removeStorageSync(KEY);
}
