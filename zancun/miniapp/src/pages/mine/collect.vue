<template>
  <view class="collect">
    <view class="tabs">
      <text
        v-for="t in tabs"
        :key="t.value"
        :class="['tabs__item', type === t.value ? 'tabs__item--active' : '']"
        @click="changeType(t.value)"
      >
        {{ t.label }}
      </text>
    </view>

    <view class="body">
      <wd-loading v-if="loading" />
      <wd-empty v-else-if="!list.length" text="还没有收藏" />
      <view v-else class="list">
        <view v-for="item in list" :key="item.id" class="card" @click="goItem(item)">
          <image class="card__img" :src="item.mainImage || (item.images && item.images[0])" mode="aspectFill" lazy-load />
          <view class="card__body">
            <text class="card__title">{{ item.title || item.name }}</text>
            <text v-if="item.price || item.minPrice" class="card__price">
              ¥{{ item.price || item.minPrice }}
            </text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import * as mineApi from '@/api/modules/mine';
import { requireLogin } from '@/utils/guard';

type CollectType = 'goods' | 'hotel' | 'post';

const tabs: { label: string; value: CollectType }[] = [
  { label: '商品', value: 'goods' },
  { label: '民宿', value: 'hotel' },
  { label: '游记', value: 'post' },
];

const type = ref<CollectType>('goods');
const list = ref<any[]>([]);
const loading = ref(false);

async function load() {
  if (!requireLogin()) return;
  loading.value = true;
  try {
    list.value = await mineApi.collectList(type.value);
  } finally {
    loading.value = false;
  }
}

function changeType(value: CollectType) {
  type.value = value;
  load();
}

function goItem(item: any) {
  if (type.value === 'goods') uni.navigateTo({ url: `/pages/goods/detail?id=${item.id}` });
  else if (type.value === 'hotel') uni.navigateTo({ url: `/pages/hotel/detail?id=${item.id}` });
  else uni.navigateTo({ url: `/pages/community/detail?id=${item.id}` });
}

onLoad(() => {
  load();
});
</script>

<style scoped>
.collect {
  min-height: 100vh;
  background: #f5f5f5;
}
.tabs {
  display: flex;
  background: #fff;
}
.tabs__item {
  flex: 1;
  text-align: center;
  padding: 26rpx 0;
  font-size: 28rpx;
  color: #666;
}
.tabs__item--active {
  color: #e54d42;
  font-weight: 600;
}
.body {
  padding: 20rpx;
}
.card {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
}
.card__img {
  width: 200rpx;
  height: 160rpx;
  background: #eee;
}
.card__body {
  flex: 1;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
}
.card__title {
  font-size: 28rpx;
  color: #333;
}
.card__price {
  margin-top: auto;
  font-size: 30rpx;
  color: #e54d42;
  font-weight: 600;
}
</style>
