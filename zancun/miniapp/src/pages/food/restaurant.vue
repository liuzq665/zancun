<template>
  <view v-if="detail" class="restaurant">
    <image class="banner" :src="detail.mainImage" mode="aspectFill" lazy-load />

    <view class="card">
      <text class="name">{{ detail.name }}</text>
      <view class="meta">
        <text class="score">{{ detail.score }} 分</text>
        <text class="meta__item">人均 ¥{{ detail.avgPrice || '—' }}</text>
        <text v-if="detail.distance" class="meta__item">{{ detail.distance }}m</text>
      </view>
      <text class="addr">{{ detail.address }}</text>
      <text class="hours">营业时间：{{ detail.businessHours || '—' }}</text>
    </view>

    <view class="card">
      <text class="card__title">招牌菜品</text>
      <view v-for="d in detail.dishes" :key="d.id" class="dish">
        <text class="dish__name">{{ d.name }}</text>
        <text v-if="d.isSignature" class="dish__tag">招牌</text>
        <text class="dish__price">¥{{ d.price }}</text>
      </view>
      <wd-empty v-if="!detail.dishes?.length" text="暂无菜品" />
    </view>

    <view class="card">
      <text class="card__title">可预订时段</text>
      <view class="slots">
        <text
          v-for="s in detail.timeSlots"
          :key="s.id"
          :class="['slot', slotId === s.id ? 'slot--active' : '']"
          @click="slotId = s.id"
        >
          {{ s.name }}
        </text>
      </view>
      <text class="slots__tip">最多可预订 {{ currentSlot?.maxReserve || 0 }} 人</text>
    </view>

    <view class="footer">
      <view class="footer__btn" @click="goReserve">立即预订</view>
    </view>
  </view>
  <wd-loading v-else />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import * as foodApi from '@/api/modules/food';
import type { Restaurant } from '@/api/types';

const detail = ref<Restaurant | null>(null);
const slotId = ref<number | null>(null);

const currentSlot = computed(() => detail.value?.timeSlots?.find((s) => s.id === slotId.value));

function goReserve() {
  if (!detail.value) return;
  if (!slotId.value) {
    uni.showToast({ title: '请选择时段', icon: 'none' });
    return;
  }
  uni.navigateTo({
    url: `/pages/food/reserve?restaurantId=${detail.value.id}&timeSlotId=${slotId.value}`,
  });
}

onLoad(async (options) => {
  detail.value = await foodApi.restaurantDetail(Number(options?.id || 1));
  slotId.value = detail.value.timeSlots?.[0]?.id ?? null;
});
</script>

<style scoped>
.restaurant {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 130rpx;
}
.banner {
  width: 100%;
  height: 420rpx;
  background: #eee;
}
.card {
  background: #fff;
  padding: 24rpx;
  margin-bottom: 20rpx;
}
.name {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}
.meta {
  display: flex;
  align-items: center;
  margin-top: 14rpx;
}
.score {
  font-size: 26rpx;
  color: #ff9900;
}
.meta__item {
  font-size: 26rpx;
  color: #999;
  margin-left: 20rpx;
}
.addr,
.hours {
  display: block;
  font-size: 26rpx;
  color: #666;
  margin-top: 12rpx;
}
.card__title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
}
.dish {
  display: flex;
  align-items: center;
  padding: 18rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}
.dish__name {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}
.dish__tag {
  font-size: 22rpx;
  color: #e54d42;
  border: 1rpx solid #e54d42;
  border-radius: 6rpx;
  padding: 2rpx 10rpx;
  margin-right: 16rpx;
}
.dish__price {
  font-size: 28rpx;
  color: #e54d42;
}
.slots {
  display: flex;
  flex-wrap: wrap;
}
.slot {
  padding: 14rpx 30rpx;
  border: 1rpx solid #ddd;
  border-radius: 32rpx;
  font-size: 26rpx;
  color: #333;
  margin: 0 16rpx 16rpx 0;
}
.slot--active {
  border-color: #e54d42;
  color: #e54d42;
  background: #fdecea;
}
.slots__tip {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
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
</style>
