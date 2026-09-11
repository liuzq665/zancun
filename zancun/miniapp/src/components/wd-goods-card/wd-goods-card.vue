<template>
  <view class="wd-goods-card" @click="goDetail">
    <image class="wd-goods-card__img" :src="goods.mainImage" mode="aspectFill" lazy-load />
    <view class="wd-goods-card__body">
      <text class="wd-goods-card__title">{{ goods.title }}</text>
      <view class="wd-goods-card__tags">
        <uni-tag text="非遗" type="error" size="small" />
        <text v-if="goods.subtitle" class="wd-goods-card__subtitle">{{ goods.subtitle }}</text>
      </view>
      <view class="wd-goods-card__row">
        <text class="wd-goods-card__price">¥{{ goods.price }}</text>
        <text v-if="goods.marketPrice" class="wd-goods-card__market">¥{{ goods.marketPrice }}</text>
        <text class="wd-goods-card__sales">已售 {{ goods.sales || 0 }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { Goods } from '@/api/types';

const props = defineProps<{ goods: Goods }>();

function goDetail() {
  uni.navigateTo({ url: `/pages/goods/detail?id=${props.goods.id}` });
}
</script>

<style scoped>
.wd-goods-card {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
}
.wd-goods-card__img {
  width: 100%;
  height: 320rpx;
  background: #f5f5f5;
}
.wd-goods-card__body {
  padding: 20rpx;
}
.wd-goods-card__title {
  font-size: 30rpx;
  color: #333;
  display: block;
}
.wd-goods-card__tags {
  display: flex;
  align-items: center;
  margin-top: 10rpx;
}
.wd-goods-card__subtitle {
  font-size: 24rpx;
  color: #999;
  margin-left: 12rpx;
}
.wd-goods-card__row {
  display: flex;
  align-items: baseline;
  margin-top: 16rpx;
}
.wd-goods-card__price {
  font-size: 34rpx;
  color: #e54d42;
  font-weight: 600;
}
.wd-goods-card__market {
  font-size: 24rpx;
  color: #bbb;
  text-decoration: line-through;
  margin-left: 12rpx;
}
.wd-goods-card__sales {
  font-size: 22rpx;
  color: #999;
  margin-left: auto;
}
</style>
