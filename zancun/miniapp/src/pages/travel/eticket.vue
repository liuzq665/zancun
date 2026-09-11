<template>
  <view class="eticket">
    <wd-loading v-if="loading" />
    <view v-else-if="ticket" class="card">
      <text class="card__title">电子票</text>
      <image class="qr" :src="ticket.qrCode" mode="aspectFit" />
      <text class="status" :class="statusClass">{{ statusText }}</text>
      <view class="row"><text class="row__label">有效期</text><text>{{ ticket.validDate || '—' }}</text></view>
      <view class="row"><text class="row__label">订单号</text><text>{{ ticket.orderId }}</text></view>
      <text class="tip">入园时向工作人员出示二维码核销</text>
    </view>
    <wd-empty v-else text="暂无电子票" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import * as travelApi from '@/api/modules/travel';
import type { Eticket } from '@/api/types';

const ticket = ref<Eticket | null>(null);
const loading = ref(true);

const STATUS_TEXT: Record<Eticket['status'], string> = {
  UNUSED: '未使用',
  USED: '已核销',
  REFUNDED: '已退款',
};

const statusText = computed(() => (ticket.value ? STATUS_TEXT[ticket.value.status] : ''));
const statusClass = computed(() =>
  ticket.value?.status === 'UNUSED' ? 'status--ok' : 'status--muted',
);

onLoad(async (options) => {
  try {
    ticket.value = await travelApi.eticket(Number(options?.orderId || 1));
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.eticket {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 40rpx 24rpx;
}
.card {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.card__title {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
}
.qr {
  width: 400rpx;
  height: 400rpx;
  margin: 30rpx 0;
  background: #f5f5f5;
}
.status {
  font-size: 28rpx;
  font-weight: 600;
}
.status--ok {
  color: #07c160;
}
.status--muted {
  color: #999;
}
.row {
  width: 100%;
  display: flex;
  justify-content: space-between;
  font-size: 26rpx;
  color: #666;
  padding: 18rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}
.row__label {
  color: #999;
}
.tip {
  margin-top: 30rpx;
  font-size: 24rpx;
  color: #bbb;
}
</style>
