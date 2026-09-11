<template>
  <view class="hotel-list">
    <view class="filter">
      <picker mode="date" :value="checkin" :start="today" @change="(e: any) => (checkin = e.detail.value)">
        <view class="filter__item">
          <text class="filter__label">入住</text>
          <text class="filter__value">{{ checkin }}</text>
        </view>
      </picker>
      <picker mode="date" :value="checkout" :start="checkin" @change="(e: any) => (checkout = e.detail.value)">
        <view class="filter__item">
          <text class="filter__label">离店</text>
          <text class="filter__value">{{ checkout }}</text>
        </view>
      </picker>
      <view class="filter__item" @click="changePeople">
        <text class="filter__label">人数</text>
        <text class="filter__value">{{ peopleCount }} 人</text>
      </view>
    </view>

    <view class="body">
      <wd-loading v-if="loading && !list.length" />
      <wd-empty v-else-if="!list.length" text="暂无民宿" />
      <view v-else class="list">
        <view v-for="h in list" :key="h.id" class="card" @click="goDetail(h)">
          <image class="card__img" :src="h.mainImage" mode="aspectFill" lazy-load />
          <view class="card__body">
            <text class="card__name">{{ h.name }}</text>
            <view class="card__tags">
              <text v-if="h.styleTag" class="tag">{{ h.styleTag }}</text>
              <text v-if="h.facilityTag" class="tag">{{ h.facilityTag }}</text>
            </view>
            <view class="card__row">
              <text class="card__score">{{ h.score }} 分</text>
              <text class="card__price">¥{{ h.minPrice }} 起</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import * as hotelApi from '@/api/modules/hotel';
import type { Homestay } from '@/api/types';

const today = new Date().toISOString().slice(0, 10);
const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

const checkin = ref(today);
const checkout = ref(tomorrow);
const peopleCount = ref(2);
const list = ref<Homestay[]>([]);
const loading = ref(false);

function changePeople() {
  peopleCount.value = peopleCount.value >= 6 ? 1 : peopleCount.value + 1;
  load();
}

async function load() {
  loading.value = true;
  try {
    const res = await hotelApi.list({
      checkin: checkin.value,
      checkout: checkout.value,
      peopleCount: peopleCount.value,
      page: 1,
      size: 20,
    });
    list.value = res.list;
  } finally {
    loading.value = false;
  }
}

function goDetail(h: Homestay) {
  uni.navigateTo({
    url: `/pages/hotel/detail?id=${h.id}&checkin=${checkin.value}&checkout=${checkout.value}`,
  });
}

onLoad(() => {
  load();
});
</script>

<style scoped>
.hotel-list {
  min-height: 100vh;
  background: #f5f5f5;
}
.filter {
  display: flex;
  background: #fff;
  padding: 20rpx 0;
}
.filter__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.filter__label {
  font-size: 22rpx;
  color: #999;
}
.filter__value {
  font-size: 26rpx;
  color: #333;
  margin-top: 6rpx;
}
.body {
  padding: 20rpx;
}
.card {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
}
.card__img {
  width: 100%;
  height: 340rpx;
  background: #eee;
}
.card__body {
  padding: 20rpx;
}
.card__name {
  font-size: 30rpx;
  color: #333;
  font-weight: 600;
}
.card__tags {
  display: flex;
  flex-wrap: wrap;
  margin-top: 12rpx;
}
.tag {
  font-size: 22rpx;
  color: #666;
  background: #f5f5f5;
  border-radius: 6rpx;
  padding: 4rpx 12rpx;
  margin: 0 12rpx 8rpx 0;
}
.card__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16rpx;
}
.card__score {
  font-size: 24rpx;
  color: #ff9900;
}
.card__price {
  font-size: 30rpx;
  color: #e54d42;
  font-weight: 600;
}
</style>
