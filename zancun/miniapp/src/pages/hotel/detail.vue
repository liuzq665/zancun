<template>
  <view v-if="detail" class="hotel-detail">
    <image class="banner" :src="detail.mainImage" mode="aspectFill" lazy-load />

    <view class="card">
      <text class="name">{{ detail.name }}</text>
      <view class="tags">
        <text v-if="detail.styleTag" class="tag">{{ detail.styleTag }}</text>
        <text v-if="detail.facilityTag" class="tag">{{ detail.facilityTag }}</text>
      </view>
      <text class="score">{{ detail.score }} 分</text>
      <text class="intro">{{ detail.intro }}</text>
    </view>

    <view class="card">
      <text class="card__title">入住须知</text>
      <view class="notice">
        <view class="notice__row"><text>入住时间</text><text>{{ detail.notice?.checkinTime || '—' }}</text></view>
        <view class="notice__row"><text>离店时间</text><text>{{ detail.notice?.checkoutTime || '—' }}</text></view>
        <view class="notice__row"><text>是否含早</text><text>{{ detail.notice?.hasBreakfast ? '含早餐' : '不含早餐' }}</text></view>
        <view class="notice__row"><text>押金</text><text>¥{{ detail.notice?.deposit ?? 0 }}</text></view>
      </view>
    </view>

    <view class="card">
      <text class="card__title">房型</text>
      <view v-for="r in detail.roomTypes" :key="r.id" class="room">
        <view class="room__body">
          <text class="room__name">{{ r.name }}</text>
          <text class="room__meta">
            {{ r.bedType || '—' }} · {{ r.area }}㎡ · 可住 {{ r.capacity }} 人
          </text>
          <text class="room__stock">剩余 {{ r.stock }} 间</text>
        </view>
        <view class="room__right">
          <text class="room__price">¥{{ r.price }}</text>
          <view class="room__btn" @click="goCalendar(r)">选日期</view>
        </view>
      </view>
      <wd-empty v-if="!detail.roomTypes?.length" text="暂无可订房型" />
    </view>
  </view>
  <wd-loading v-else />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import * as hotelApi from '@/api/modules/hotel';
import type { Homestay, RoomType } from '@/api/types';

const detail = ref<Homestay | null>(null);
const checkin = ref('');
const checkout = ref('');

function goCalendar(room: RoomType) {
  uni.navigateTo({
    url: `/pages/hotel/calendar?roomTypeId=${room.id}&checkin=${checkin.value}&checkout=${checkout.value}`,
  });
}

onLoad(async (options) => {
  checkin.value = options?.checkin || '';
  checkout.value = options?.checkout || '';
  detail.value = await hotelApi.detail(Number(options?.id || 1));
});
</script>

<style scoped>
.hotel-detail {
  min-height: 100vh;
  background: #f5f5f5;
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
.tags {
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
.score {
  display: block;
  font-size: 26rpx;
  color: #ff9900;
  margin-top: 10rpx;
}
.intro {
  display: block;
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
  margin-top: 12rpx;
}
.card__title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
}
.notice__row {
  display: flex;
  justify-content: space-between;
  font-size: 26rpx;
  color: #666;
  padding: 12rpx 0;
}
.room {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}
.room__body {
  flex: 1;
}
.room__name {
  display: block;
  font-size: 28rpx;
  color: #333;
  font-weight: 600;
}
.room__meta {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}
.room__stock {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}
.room__right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.room__price {
  font-size: 30rpx;
  color: #e54d42;
  font-weight: 600;
}
.room__btn {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #fff;
  background: #e54d42;
  border-radius: 28rpx;
  padding: 10rpx 28rpx;
}
</style>
