<template>
  <view class="ticket">
    <view class="card">
      <text class="card__title">选择景区</text>
      <view class="chips">
        <text
          v-for="s in scenics"
          :key="s.id"
          :class="['chip', scenicId === s.id ? 'chip--active' : '']"
          @click="selectScenic(s)"
        >
          {{ s.name }}
        </text>
      </view>

      <text class="card__title">选择票种</text>
      <view
        v-for="t in tickets"
        :key="t.id"
        :class="['ticket-item', ticketTypeId === t.id ? 'ticket-item--active' : '']"
        @click="ticketTypeId = t.id"
      >
        <view class="ticket-item__body">
          <text class="ticket-item__name">{{ t.name }}</text>
          <text class="ticket-item__stock">剩余 {{ t.stock }} 张</text>
        </view>
        <text class="ticket-item__price">¥{{ t.price }}</text>
      </view>

      <view class="row">
        <text class="row__label">使用日期</text>
        <picker mode="date" :value="useDate" :start="today" @change="(e: any) => (useDate = e.detail.value)">
          <text class="row__value">{{ useDate }}</text>
        </picker>
      </view>
      <view class="row">
        <text class="row__label">数量</text>
        <view class="stepper">
          <text class="stepper__btn" @click="changeQty(-1)">-</text>
          <text class="stepper__val">{{ quantity }}</text>
          <text class="stepper__btn" @click="changeQty(1)">+</text>
        </view>
      </view>
    </view>

    <view class="card">
      <text class="card__title">游客信息</text>
      <view v-for="(v, i) in visitors" :key="i" class="visitor">
        <input v-model="v.name" class="visitor__input" placeholder="姓名" />
        <input v-model="v.idCard" class="visitor__input" maxlength="18" placeholder="身份证号" />
      </view>
    </view>

    <view class="footer">
      <text class="footer__amount">合计 ¥{{ total.toFixed(2) }}</text>
      <view :class="['footer__btn', submitting ? 'footer__btn--disabled' : '']" @click="submit">
        {{ submitting ? '提交中…' : '提交订单' }}
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import * as travelApi from '@/api/modules/travel';
import { requireLogin } from '@/utils/guard';
import type { Scenic, TicketType } from '@/api/types';

const today = new Date().toISOString().slice(0, 10);

const scenics = ref<Scenic[]>([]);
const scenicId = ref(0);
const ticketTypeId = ref(0);
const useDate = ref(today);
const quantity = ref(1);
const visitors = ref<{ name: string; idCard: string }[]>([{ name: '', idCard: '' }]);
const submitting = ref(false);

const tickets = computed(() => scenics.value.find((s) => s.id === scenicId.value)?.ticketTypes ?? []);
const currentTicket = computed<TicketType | undefined>(() =>
  tickets.value.find((t) => t.id === ticketTypeId.value),
);
const total = computed(() => (currentTicket.value?.price ?? 0) * quantity.value);

watch(quantity, (n) => {
  const next = [...visitors.value];
  while (next.length < n) next.push({ name: '', idCard: '' });
  visitors.value = next.slice(0, n);
});

function selectScenic(s: Scenic) {
  scenicId.value = s.id;
  ticketTypeId.value = s.ticketTypes?.[0]?.id ?? 0;
}

function changeQty(delta: number) {
  quantity.value = Math.max(1, Math.min(quantity.value + delta, 10));
}

async function submit() {
  if (!requireLogin()) return;
  if (!ticketTypeId.value) {
    uni.showToast({ title: '请选择票种', icon: 'none' });
    return;
  }
  for (const v of visitors.value) {
    if (!v.name.trim() || !/^\d{17}[\dXx]$/.test(v.idCard)) {
      uni.showToast({ title: '请完整填写游客姓名和身份证号', icon: 'none' });
      return;
    }
  }
  if (submitting.value) return;
  submitting.value = true;
  try {
    const order = await travelApi.ticketBuy({
      ticketTypeId: ticketTypeId.value,
      useDate: useDate.value,
      quantity: quantity.value,
      visitors: visitors.value,
    });
    uni.showToast({ title: '下单成功', icon: 'success' });
    setTimeout(() => uni.redirectTo({ url: `/pages/order/list?status=${order.status}` }), 700);
  } catch {
    // 请求层已提示
  } finally {
    submitting.value = false;
  }
}

onLoad(async () => {
  const res = await travelApi.scenicList({ page: 1, size: 20 });
  scenics.value = res.list;
  if (res.list.length) selectScenic(res.list[0]);
});
</script>

<style scoped>
.ticket {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 130rpx;
}
.card {
  background: #fff;
  padding: 24rpx;
  margin-bottom: 20rpx;
}
.card__title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin: 16rpx 0 14rpx;
}
.chips {
  display: flex;
  flex-wrap: wrap;
}
.chip {
  padding: 12rpx 28rpx;
  border: 1rpx solid #ddd;
  border-radius: 30rpx;
  font-size: 26rpx;
  color: #333;
  margin: 0 16rpx 12rpx 0;
}
.chip--active {
  border-color: #e54d42;
  color: #e54d42;
  background: #fdecea;
}
.ticket-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1rpx solid #eee;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 16rpx;
}
.ticket-item--active {
  border-color: #e54d42;
  background: #fff8f7;
}
.ticket-item__name {
  display: block;
  font-size: 28rpx;
  color: #333;
}
.ticket-item__stock {
  display: block;
  font-size: 22rpx;
  color: #999;
  margin-top: 6rpx;
}
.ticket-item__price {
  font-size: 30rpx;
  color: #e54d42;
  font-weight: 600;
}
.row {
  display: flex;
  align-items: center;
  min-height: 92rpx;
  border-top: 1rpx solid #f5f5f5;
}
.row__label {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}
.row__value {
  font-size: 28rpx;
  color: #666;
}
.stepper {
  display: flex;
  align-items: center;
}
.stepper__btn {
  width: 52rpx;
  height: 52rpx;
  line-height: 52rpx;
  text-align: center;
  background: #f5f5f5;
  border-radius: 8rpx;
  font-size: 30rpx;
}
.stepper__val {
  width: 72rpx;
  text-align: center;
  font-size: 28rpx;
}
.visitor {
  display: flex;
  margin-bottom: 16rpx;
}
.visitor__input {
  flex: 1;
  height: 76rpx;
  background: #f7f7f7;
  border-radius: 10rpx;
  padding: 0 20rpx;
  font-size: 26rpx;
  margin-right: 16rpx;
}
.visitor__input:last-child {
  margin-right: 0;
}
.footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  background: #fff;
  padding: 16rpx 24rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}
.footer__amount {
  flex: 1;
  font-size: 30rpx;
  color: #e54d42;
}
.footer__btn {
  background: #e54d42;
  color: #fff;
  font-size: 28rpx;
  padding: 16rpx 44rpx;
  border-radius: 40rpx;
}
.footer__btn--disabled {
  opacity: 0.6;
}
</style>
