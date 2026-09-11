<template>
  <view class="calendar">
    <view class="head">
      <text class="head__tip">选择入住与离店日期</text>
      <text class="head__range">
        {{ checkin || '入住' }} → {{ checkout || '离店' }}
      </text>
    </view>

    <wd-loading v-if="loading" />
    <view v-else class="grid">
      <view
        v-for="d in days"
        :key="d.date"
        :class="[
          'day',
          d.stock <= 0 ? 'day--disabled' : '',
          isSelected(d.date) ? 'day--selected' : '',
          isInRange(d.date) ? 'day--range' : '',
        ]"
        @click="pick(d)"
      >
        <text class="day__date">{{ d.date.slice(5) }}</text>
        <text class="day__price">¥{{ d.price }}</text>
        <text class="day__stock">{{ d.stock > 0 ? `剩${d.stock}` : '满房' }}</text>
      </view>
    </view>

    <view class="footer">
      <view class="footer__info">
        <text class="footer__nights">{{ nights }} 晚</text>
        <text class="footer__total">¥{{ totalPrice.toFixed(2) }}</text>
      </view>
      <view class="footer__btn" @click="goReserve">去预订</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import * as hotelApi from '@/api/modules/hotel';
import type { RoomCalendarDay } from '@/api/types';

const roomTypeId = ref(0);
const days = ref<RoomCalendarDay[]>([]);
const loading = ref(true);
const checkin = ref('');
const checkout = ref('');

const rangeDays = computed(() =>
  days.value.filter((d) => checkin.value && checkout.value && d.date >= checkin.value && d.date < checkout.value),
);
const nights = computed(() => rangeDays.value.length);
const totalPrice = computed(() => rangeDays.value.reduce((sum, d) => sum + d.price, 0));

function isSelected(date: string) {
  return date === checkin.value || date === checkout.value;
}

function isInRange(date: string) {
  return !!checkin.value && !!checkout.value && date > checkin.value && date < checkout.value;
}

function pick(d: RoomCalendarDay) {
  if (d.stock <= 0) return;
  if (!checkin.value || checkout.value) {
    checkin.value = d.date;
    checkout.value = '';
  } else if (d.date > checkin.value) {
    checkout.value = d.date;
  } else {
    checkin.value = d.date;
  }
}

function goReserve() {
  if (!checkin.value || !checkout.value) {
    uni.showToast({ title: '请选择完整的入住和离店日期', icon: 'none' });
    return;
  }
  uni.navigateTo({
    url: `/pages/hotel/reserve?roomTypeId=${roomTypeId.value}&checkin=${checkin.value}&checkout=${checkout.value}`,
  });
}

onLoad(async (options) => {
  roomTypeId.value = Number(options?.roomTypeId || 1);
  checkin.value = options?.checkin || '';
  checkout.value = options?.checkout || '';
  try {
    days.value = await hotelApi.calendar(roomTypeId.value, { days: 30 });
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.calendar {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 140rpx;
}
.head {
  background: #fff;
  padding: 24rpx;
  margin-bottom: 20rpx;
}
.head__tip {
  display: block;
  font-size: 24rpx;
  color: #999;
}
.head__range {
  display: block;
  font-size: 30rpx;
  color: #333;
  font-weight: 600;
  margin-top: 10rpx;
}
.grid {
  display: flex;
  flex-wrap: wrap;
  background: #fff;
  padding: 10rpx;
}
.day {
  width: 14.28%;
  box-sizing: border-box;
  padding: 14rpx 4rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 8rpx;
}
.day--disabled {
  opacity: 0.35;
}
.day--selected {
  background: #e54d42;
}
.day--selected .day__date,
.day--selected .day__price,
.day--selected .day__stock {
  color: #fff;
}
.day--range {
  background: #fdecea;
}
.day__date {
  font-size: 24rpx;
  color: #333;
}
.day__price {
  font-size: 20rpx;
  color: #e54d42;
  margin-top: 4rpx;
}
.day__stock {
  font-size: 18rpx;
  color: #999;
  margin-top: 2rpx;
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
.footer__info {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.footer__nights {
  font-size: 22rpx;
  color: #999;
}
.footer__total {
  font-size: 32rpx;
  color: #e54d42;
  font-weight: 600;
}
.footer__btn {
  background: #e54d42;
  color: #fff;
  font-size: 28rpx;
  padding: 16rpx 44rpx;
  border-radius: 40rpx;
}
</style>
