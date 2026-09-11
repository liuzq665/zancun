<template>
  <view class="list">
    <wd-loading v-if="loading" />
    <wd-empty v-else-if="!restaurants.length" text="暂无餐厅" />
    <view v-else class="restaurants">
      <view
        v-for="r in restaurants"
        :key="r.id"
        class="restaurant-card"
        @click="goDetail(r)"
      >
        <image class="restaurant-card__img" :src="r.mainImage || ''" mode="aspectFill" lazy-load />
        <view class="restaurant-card__info">
          <text class="restaurant-card__name">{{ r.name }}</text>
          <view class="restaurant-card__meta">
            <text v-if="r.score" class="score">⭐ {{ r.score }}</text>
            <text v-if="r.avgPrice" class="price">人均 ¥{{ r.avgPrice }}</text>
          </view>
          <text v-if="r.address" class="restaurant-card__addr">{{ r.address }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import * as foodApi from '@/api/modules/food';
import type { Restaurant } from '@/api/types';

const restaurants = ref<Restaurant[]>([]);
const loading = ref(true);

function goDetail(r: Restaurant) {
  uni.navigateTo({ url: `/pages/food/restaurant?id=${r.id}` });
}

onLoad(async () => {
  try {
    const res = await foodApi.restaurantList({ page: 1, size: 20 });
    restaurants.value = res.list || [];
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.list {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}
.restaurants {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
.restaurant-card {
  display: flex;
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}
.restaurant-card__img {
  width: 240rpx;
  height: 180rpx;
  flex-shrink: 0;
}
.restaurant-card__info {
  flex: 1;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.restaurant-card__name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.restaurant-card__meta {
  display: flex;
  align-items: center;
  margin-top: 10rpx;
}
.score {
  font-size: 24rpx;
  color: #ff9900;
}
.price {
  font-size: 24rpx;
  color: #999;
  margin-left: 20rpx;
}
.restaurant-card__addr {
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
