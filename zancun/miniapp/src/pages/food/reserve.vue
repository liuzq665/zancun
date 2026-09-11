<template>
  <view class="reserve">
    <view class="card">
      <view class="row">
        <text class="row__label">预订日期</text>
        <picker mode="date" :value="date" :start="today" @change="onDateChange">
          <text class="row__value">{{ date }}</text>
        </picker>
      </view>
      <view class="row">
        <text class="row__label">人数</text>
        <view class="stepper">
          <text class="stepper__btn" @click="changePeople(-1)">-</text>
          <text class="stepper__val">{{ peopleCount }}</text>
          <text class="stepper__btn" @click="changePeople(1)">+</text>
        </view>
      </view>
      <view class="row">
        <text class="row__label">姓名</text>
        <input v-model="name" class="row__input" placeholder="请输入姓名" />
      </view>
      <view class="row">
        <text class="row__label">电话</text>
        <input v-model="phone" class="row__input" type="number" maxlength="11" placeholder="请输入手机号" />
      </view>
      <view class="row">
        <text class="row__label">备注</text>
        <input v-model="remark" class="row__input" placeholder="口味/忌口等（选填）" />
      </view>
    </view>

    <text class="tip">需提前至少 2 小时预订；24 小时前取消免费，24 小时内取消扣 50%。</text>

    <view class="footer">
      <view :class="['footer__btn', submitting ? 'footer__btn--disabled' : '']" @click="submit">
        {{ submitting ? '提交中…' : '提交预订' }}
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import * as foodApi from '@/api/modules/food';
import { requireLogin } from '@/utils/guard';

const restaurantId = ref(0);
const timeSlotId = ref(0);
const today = new Date().toISOString().slice(0, 10);
const date = ref(today);
const peopleCount = ref(2);
const name = ref('');
const phone = ref('');
const remark = ref('');
const submitting = ref(false);

function onDateChange(e: any) {
  date.value = e.detail.value;
}

function changePeople(delta: number) {
  peopleCount.value = Math.max(1, peopleCount.value + delta);
}

async function submit() {
  if (!requireLogin()) return;
  if (!name.value.trim()) {
    uni.showToast({ title: '请填写姓名', icon: 'none' });
    return;
  }
  if (!/^1\d{10}$/.test(phone.value)) {
    uni.showToast({ title: '请填写正确手机号', icon: 'none' });
    return;
  }
  if (submitting.value) return;
  submitting.value = true;
  try {
    const order = await foodApi.reserve({
      restaurantId: restaurantId.value,
      timeSlotId: timeSlotId.value,
      date: date.value,
      peopleCount: peopleCount.value,
      name: name.value.trim(),
      phone: phone.value,
      remark: remark.value || undefined,
    });
    uni.showToast({ title: '预订成功', icon: 'success' });
    setTimeout(() => uni.redirectTo({ url: `/pages/order/list?status=${order.status}` }), 700);
  } catch {
    // 请求层已提示
  } finally {
    submitting.value = false;
  }
}

onLoad((options) => {
  restaurantId.value = Number(options?.restaurantId || 1);
  timeSlotId.value = Number(options?.timeSlotId || 1);
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
}
.row {
  display: flex;
  align-items: center;
  min-height: 96rpx;
  border-bottom: 1rpx solid #f5f5f5;
}
.row__label {
  width: 160rpx;
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
.tip {
  display: block;
  font-size: 24rpx;
  color: #999;
  padding: 20rpx 24rpx;
  line-height: 1.6;
}
.footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 16rpx 24rpx;
  background: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}
.footer__btn {
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  background: #e54d42;
  color: #fff;
  border-radius: 40rpx;
  font-size: 30rpx;
}
.footer__btn--disabled {
  opacity: 0.6;
}
</style>
