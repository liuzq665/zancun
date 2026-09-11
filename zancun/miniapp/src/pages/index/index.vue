<template>
  <view class="home">
    <!-- 顶部图片展示 -->
    <image
      class="banner"
      src="https://images.pexels.com/photos/6129969/pexels-photo-6129969.jpeg?auto=compress&cs=tinysrgb&w=750&h=400&fit=crop"
      mode="aspectFill"
      lazy-load
    />

    <view class="entries">
      <view v-for="e in entries" :key="e.name" class="entry" @click="goEntry(e)">
        <text class="entry__icon">{{ e.icon }}</text>
        <text class="entry__name">{{ e.name }}</text>
      </view>
    </view>

    <view class="section">
      <text class="section__title">非遗好物</text>
      <wd-loading v-if="loading" />
      <wd-empty v-else-if="!goods.length" text="暂无商品" />
      <view v-else class="goods">
        <view v-for="g in goods" :key="g.id" class="goods-card" @click="goDetail(g)">
          <image class="goods-card__img" :src="g.coverImage || g.mainImage || ''" mode="aspectFill" lazy-load />
          <view class="goods-card__info">
            <text class="goods-card__name">{{ g.name }}</text>
            <text class="goods-card__desc">{{ g.description }}</text>
            <view class="goods-card__bottom">
              <text class="goods-card__price">¥{{ (g.price / 100).toFixed(2) }}</text>
              <text class="goods-card__original" v-if="g.originalPrice">¥{{ (g.originalPrice / 100).toFixed(2) }}</text>
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
import * as goodsApi from '@/api/modules/goods';
import type { Goods } from '@/api/types';

const goods = ref<Goods[]>([]);
const loading = ref(true);

const entries = [
  { name: '衣', icon: '🧣', url: '/pages/category/category', tab: false },
  { name: '食', icon: '🍲', url: '/pages/food/list', tab: false },
  { name: '住', icon: '🏡', url: '/pages/hotel/list', tab: false },
  { name: '行', icon: '🎫', url: '/pages/travel/ticket', tab: false },
  { name: '社区', icon: '📷', url: '/pages/community/feed', tab: true },
];

function goEntry(e: (typeof entries)[number]) {
  if (e.tab) uni.switchTab({ url: e.url });
  else uni.navigateTo({ url: e.url });
}

function goDetail(g: Goods) {
  uni.navigateTo({ url: `/pages/goods/detail?id=${g.id}` });
}

onLoad(async () => {
  try {
    const res = await goodsApi.list({ page: 1, size: 10 });
    goods.value = res.list || [];
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.home {
  padding-bottom: 40rpx;
}
.banner {
  width: 100%;
  height: 340rpx;
  display: block;
}
.entries {
  display: flex;
  background: #fff;
  padding: 30rpx 0;
  margin-bottom: 20rpx;
}
.entry {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.entry__icon {
  font-size: 52rpx;
}
.entry__name {
  margin-top: 10rpx;
  font-size: 26rpx;
  color: #333;
}
.section {
  padding: 0 20rpx;
}
.section__title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin: 20rpx 0;
}
.goods {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}
.goods-card {
  width: calc(50% - 10rpx);
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}
.goods-card__img {
  width: 100%;
  height: 320rpx;
}
.goods-card__info {
  padding: 16rpx;
}
.goods-card__name {
  font-size: 28rpx;
  color: #333;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.goods-card__desc {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-top: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.goods-card__bottom {
  display: flex;
  align-items: center;
  margin-top: 12rpx;
}
.goods-card__price {
  font-size: 32rpx;
  color: #e54d42;
  font-weight: 600;
}
.goods-card__original {
  font-size: 24rpx;
  color: #999;
  text-decoration: line-through;
  margin-left: 12rpx;
}
</style>
