<template>
  <view class="route">
    <wd-loading v-if="loading && !list.length" />
    <wd-empty v-else-if="!list.length" text="暂无路线" />
    <view v-else class="list">
      <view v-for="r in list" :key="r.id" class="card">
        <view class="card__head" @click="toggle(r.id)">
          <image class="card__img" :src="r.mainImage" mode="aspectFill" lazy-load />
          <view class="card__body">
            <text class="card__title">{{ r.title }}</text>
            <text class="card__meta">{{ r.days }} 天 · 含 {{ r.includedItems || '—' }}</text>
            <text class="card__price">¥{{ r.price }} / 人</text>
          </view>
          <text class="card__arrow">{{ expandedId === r.id ? '⌃' : '⌄' }}</text>
        </view>

        <view v-if="expandedId === r.id" class="card__detail">
          <view v-for="p in r.plans" :key="p.day" class="plan">
            <text class="plan__day">第 {{ p.day }} 天</text>
            <text class="plan__desc">{{ p.description }}</text>
            <text class="plan__meta">
              <text v-if="p.scenic">景点：{{ p.scenic }}</text>
              <text v-if="p.meal"> · 用餐：{{ p.meal }}</text>
              <text v-if="p.hotel"> · 住宿：{{ p.hotel }}</text>
            </text>
          </view>
          <view class="card__buy" @click="buy(r)">立即购买</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import * as travelApi from '@/api/modules/travel';
import { requireLogin } from '@/utils/guard';
import { setDraft } from '@/utils/order-draft';
import type { Route } from '@/api/types';

const list = ref<Route[]>([]);
const loading = ref(false);
const expandedId = ref(0);

function toggle(id: number) {
  expandedId.value = expandedId.value === id ? 0 : id;
}

function buy(r: Route) {
  if (!requireLogin()) return;
  setDraft({
    orderType: 'route',
    title: r.title,
    items: [
      {
        module: 'travel',
        entityType: 'route',
        entityId: r.id,
        title: r.title,
        image: r.mainImage,
        price: r.price,
        quantity: 1,
      },
    ],
    snapshot: { routeId: r.id, days: r.days },
  });
  uni.navigateTo({ url: '/pages/order/confirm' });
}

onLoad(async () => {
  loading.value = true;
  try {
    const res = await travelApi.routeList({ page: 1, size: 20 });
    list.value = res.list;
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.route {
  min-height: 100vh;
  background: #f5f5f5;
}
.list {
  padding: 20rpx;
}
.card {
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
}
.card__head {
  display: flex;
  padding: 20rpx;
}
.card__img {
  width: 200rpx;
  height: 160rpx;
  border-radius: 12rpx;
  background: #eee;
}
.card__body {
  flex: 1;
  padding-left: 20rpx;
  display: flex;
  flex-direction: column;
}
.card__title {
  font-size: 30rpx;
  color: #333;
  font-weight: 600;
}
.card__meta {
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
}
.card__price {
  margin-top: auto;
  font-size: 30rpx;
  color: #e54d42;
  font-weight: 600;
}
.card__arrow {
  font-size: 30rpx;
  color: #ccc;
  padding-left: 12rpx;
}
.card__detail {
  padding: 0 20rpx 20rpx;
  border-top: 1rpx solid #f5f5f5;
}
.plan {
  padding: 16rpx 0;
}
.plan__day {
  display: block;
  font-size: 26rpx;
  color: #e54d42;
  font-weight: 600;
}
.plan__desc {
  display: block;
  font-size: 26rpx;
  color: #666;
  margin-top: 6rpx;
  line-height: 1.5;
}
.plan__meta {
  display: block;
  font-size: 22rpx;
  color: #999;
  margin-top: 6rpx;
}
.card__buy {
  margin-top: 16rpx;
  height: 76rpx;
  line-height: 76rpx;
  text-align: center;
  background: #e54d42;
  color: #fff;
  border-radius: 38rpx;
  font-size: 28rpx;
}
</style>
