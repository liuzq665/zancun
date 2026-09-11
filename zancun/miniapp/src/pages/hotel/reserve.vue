<template>
  <view class="reserve">
    <view class="card">
      <view class="row"><text class="row__label">入住日期</text><text class="row__value">{{ checkin }}</text></view>
      <view class="row"><text class="row__label">离店日期</text><text class="row__value">{{ checkout }}</text></view>
      <view class="row"><text class="row__label">共</text><text class="row__value">{{ nights }} 晚</text></view>
      <view class="row">
        <text class="row__label">入住人数</text>
        <view class="stepper">
          <text class="stepper__btn" @click="changePeople(-1)">-</text>
          <text class="stepper__val">{{ peopleCount }}</text>
          <text class="stepper__btn" @click="changePeople(1)">+</text>
        </view>
      </view>
      <view class="row">
        <text class="row__label">联系人</text>
        <input v-model="contactName" class="row__input" placeholder="请输入姓名" />
      </view>
      <view class="row">
        <text class="row__label">联系电话</text>
        <input v-model="contactPhone" class="row__input" type="number" maxlength="11" placeholder="请输入手机号" />
      </view>
      <view class="row">
        <text class="row__label">身份证号</text>
        <input v-model="idCard" class="row__input" maxlength="18" placeholder="用于办理入住" />
      </view>
    </view>

    <view class="card summary">
      <view class="summary__row"><text>房费</text><text>¥{{ totalPrice.toFixed(2) }}</text></view>
      <view class="summary__row summary__row--total">
        <text>预付合计</text><text class="summary__pay">¥{{ totalPrice.toFixed(2) }}</text>
      </view>
    </view>

    <text class="tip">取消政策：入住前 3 天免费取消，1-3 天扣 30%，当天不可退。</text>

    <view class="footer">
      <text class="footer__amount">预付 ¥{{ totalPrice.toFixed(2) }}</text>
      <view :class="['footer__btn', submitting ? 'footer__btn--disabled' : '']" @click="submit">
        {{ submitting ? '提交中…' : '提交预订' }}
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import * as hotelApi from '@/api/modules/hotel';
import { requireLogin } from '@/utils/guard';
import type { RoomCalendarDay } from '@/api/types';

const roomTypeId = ref(0);
const checkin = ref('');
const checkout = ref('');
const days = ref<RoomCalendarDay[]>([]);
const peopleCount = ref(2);
const contactName = ref('');
const contactPhone = ref('');
const idCard = ref('');
const submitting = ref(false);

const rangeDays = computed(() =>
  days.value.filter((d) => d.date >= checkin.value && d.date < checkout.value),
);
const nights = computed(() => rangeDays.value.length);
const totalPrice = computed(() => rangeDays.value.reduce((sum, d) => sum + d.price, 0));

function changePeople(delta: number) {
  peopleCount.value = Math.max(1, peopleCount.value + delta);
}

async function submit() {
  if (!requireLogin()) return;
  if (!contactName.value.trim()) {
    uni.showToast({ title: '请填写联系人', icon: 'none' });
    return;
  }
  if (!/^1\d{10}$/.test(contactPhone.value)) {
    uni.showToast({ title: '请填写正确手机号', icon: 'none' });
    return;
  }
  if (!/^\d{17}[\dXx]$/.test(idCard.value)) {
    uni.showToast({ title: '请填写正确身份证号', icon: 'none' });
    return;
  }
  if (submitting.value) return;
  submitting.value = true;
  try {
    const order = await hotelApi.reserve({
      roomTypeId: roomTypeId.value,
      checkin: checkin.value,
      checkout: checkout.value,
      peopleCount: peopleCount.value,
      contactName: contactName.value.trim(),
      contactPhone: contactPhone.value,
      idCard: idCard.value,
    });
    uni.showToast({ title: '预订成功', icon: 'success' });
    setTimeout(() => uni.redirectTo({ url: `/pages/order/list?status=${order.status}` }), 700);
  } catch {
    // 请求层已提示
  } finally {
    submitting.value = false;
  }
}

onLoad(async (options) => {
  roomTypeId.value = Number(options?.roomTypeId || 1);
  checkin.value = options?.checkin || '';
  checkout.value = options?.checkout || '';
  days.value = await hotelApi.calendar(roomTypeId.value, { days: 30 });
});
</script>

<style scoped>
.reserve {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 130rpx;
}
.card {
  background: #fff;
  padding: 0 24rpx;
  margin-bottom: 20rpx;
}
.row {
  display: flex;
  align-items: center;
  min-height: 96rpx;
  border-bottom: 1rpx solid #f5f5f5;
}
.row__label {
  width: 170rpx;
  font-size: 28rpx;
  color: #333;
}
.row__value {
  font-size: 28rpx;
  color: #666;
}
.row__input {
  flex: 1;
  font-size: 28rpx;
  text-align: right;
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
.summary {
  padding: 20rpx 24rpx;
}
.summary__row {
  display: flex;
  justify-content: space-between;
  font-size: 28rpx;
  color: #666;
  padding: 10rpx 0;
}
.summary__row--total {
  color: #333;
  font-weight: 600;
}
.summary__pay {
  color: #e54d42;
  font-size: 32rpx;
}
.tip {
  display: block;
  font-size: 24rpx;
  color: #999;
  padding: 0 24rpx;
  line-height: 1.6;
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
