<template>
  <view class="orders">
    <view class="tabs">
      <text
        v-for="t in tabs"
        :key="t.value"
        :class="['tabs__item', status === t.value ? 'tabs__item--active' : '']"
        @click="changeTab(t.value)"
      >
        {{ t.label }}
      </text>
    </view>

    <view class="body">
      <wd-loading v-if="loading && !list.length" />
      <wd-empty v-else-if="!list.length" text="暂无订单" />
      <view v-else class="list">
        <view v-for="o in list" :key="o.id" class="order">
          <view class="order__head">
            <text class="order__no">{{ o.orderNo }}</text>
            <text class="order__status">{{ statusText(o.status) }}</text>
          </view>
          <view class="order__body">
            <text class="order__title">{{ o.title || o.items?.[0]?.title || '订单' }}</text>
            <text class="order__amount">¥{{ o.payAmount }}</text>
          </view>
          <text v-if="o.createTime" class="order__time">{{ o.createTime }}</text>
          <view class="order__actions">
            <text v-if="o.status === 'PENDING'" class="btn" @click="cancelOrder(o)">取消订单</text>
            <text v-if="o.status === 'PENDING'" class="btn btn--primary" @click="payOrder(o)">
              去支付
            </text>
            <text v-if="o.status === 'PAID'" class="btn" @click="refundOrder(o)">申请退款</text>
            <text v-if="o.status === 'PAID'" class="btn btn--primary" @click="confirmOrder(o)">
              确认收货
            </text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import * as orderApi from '@/api/modules/order';
import { requireLogin } from '@/utils/guard';
import type { Order, OrderStatus } from '@/api/types';

const tabs = [
  { label: '全部', value: '' },
  { label: '待支付', value: 'PENDING' },
  { label: '已支付', value: 'PAID' },
  { label: '已完成', value: 'FINISHED' },
];

const STATUS_TEXT: Record<OrderStatus, string> = {
  PENDING: '待支付',
  PAID: '已支付',
  CONFIRMED: '已确认',
  IN_PROGRESS: '进行中',
  FINISHED: '已完成',
  CANCELED: '已取消',
  REFUND_PENDING: '退款审批中',
  REFUNDED: '已退款',
};

const list = ref<Order[]>([]);
const loading = ref(false);
const status = ref('');

const statusText = (s: OrderStatus) => STATUS_TEXT[s] || s;

async function load() {
  if (!requireLogin()) return;
  loading.value = true;
  try {
    const res = await orderApi.list({
      status: (status.value || undefined) as OrderStatus | undefined,
      page: 1,
      size: 20,
    });
    list.value = res.list;
  } finally {
    loading.value = false;
  }
}

function changeTab(value: string) {
  status.value = value;
  load();
}

function payOrder(o: Order) {
  uni.showModal({
    title: '支付',
    content: `确认支付 ¥${o.payAmount}？`,
    success: async (res) => {
      if (!res.confirm) return;
      await orderApi.pay(o.orderNo);
      uni.showToast({ title: '支付成功', icon: 'success' });
      load();
    },
  });
}

function cancelOrder(o: Order) {
  uni.showModal({
    title: '提示',
    content: '确定取消该订单吗？',
    success: async (res) => {
      if (res.confirm) {
        await orderApi.cancel(o.id);
        load();
      }
    },
  });
}

function confirmOrder(o: Order) {
  uni.showModal({
    title: '提示',
    content: '确认已收到商品/完成履约？',
    success: async (res) => {
      if (res.confirm) {
        await orderApi.confirm(o.id);
        load();
      }
    },
  });
}

function refundOrder(o: Order) {
  uni.showModal({
    title: '申请退款',
    content: '确定对该订单申请退款吗？',
    success: async (res) => {
      if (res.confirm) {
        await orderApi.refund(o.id);
        load();
      }
    },
  });
}

onLoad((options) => {
  if (options?.status) status.value = options.status;
});

onShow(() => {
  load();
});
</script>

<style scoped>
.orders {
  min-height: 100vh;
  background: #f5f5f5;
}
.tabs {
  display: flex;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
}
.tabs__item {
  flex: 1;
  text-align: center;
  padding: 26rpx 0;
  font-size: 28rpx;
  color: #666;
}
.tabs__item--active {
  color: #e54d42;
  font-weight: 600;
}
.body {
  padding: 20rpx;
}
.order {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}
.order__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.order__no {
  font-size: 24rpx;
  color: #999;
}
.order__status {
  font-size: 26rpx;
  color: #e54d42;
}
.order__body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20rpx;
}
.order__title {
  font-size: 30rpx;
  color: #333;
  flex: 1;
}
.order__amount {
  font-size: 30rpx;
  color: #e54d42;
  font-weight: 600;
}
.order__time {
  display: block;
  font-size: 24rpx;
  color: #bbb;
  margin-top: 12rpx;
}
.order__actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20rpx;
}
.btn {
  font-size: 26rpx;
  color: #666;
  border: 1rpx solid #ddd;
  border-radius: 32rpx;
  padding: 10rpx 30rpx;
  margin-left: 16rpx;
}
.btn--primary {
  color: #e54d42;
  border-color: #e54d42;
}
</style>
