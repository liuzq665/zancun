<template>
  <view class="list">
    <view class="tabs">
      <text
        v-for="s in sorts"
        :key="s.value"
        :class="['tabs__item', sort === s.value ? 'tabs__item--active' : '']"
        @click="changeSort(s.value)"
      >
        {{ s.label }}
      </text>
    </view>

    <view class="body">
      <wd-loading v-if="loading && !list.length" />
      <wd-empty v-else-if="!list.length" text="暂无商品" />
      <view v-else class="grid">
        <wd-goods-card v-for="g in list" :key="g.id" :goods="g" />
      </view>
      <text v-if="finished && list.length" class="body__end">没有更多了</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad, onReachBottom } from '@dcloudio/uni-app';
import * as goodsApi from '@/api/modules/goods';
import type { Goods } from '@/api/types';

const sorts = [
  { label: '综合', value: '' },
  { label: '销量', value: 'sales' },
  { label: '价格↑', value: 'price_asc' },
  { label: '价格↓', value: 'price_desc' },
];

const list = ref<Goods[]>([]);
const loading = ref(false);
const finished = ref(false);
const page = ref(1);
const size = 10;
const sort = ref('');
const categoryId = ref<number | undefined>();

async function load(reset = false) {
  if (loading.value || (finished.value && !reset)) return;
  loading.value = true;
  if (reset) {
    page.value = 1;
    finished.value = false;
    list.value = [];
  }
  try {
    const res = await goodsApi.list({
      categoryId: categoryId.value,
      sort: sort.value || undefined,
      page: page.value,
      size,
    });
    list.value = list.value.concat(res.list);
    if (list.value.length >= res.total) finished.value = true;
    else page.value += 1;
  } finally {
    loading.value = false;
  }
}

function changeSort(value: string) {
  if (sort.value === value) return;
  sort.value = value;
  load(true);
}

onLoad((options) => {
  if (options?.categoryId) categoryId.value = Number(options.categoryId);
  if (options?.name) {
    uni.setNavigationBarTitle({ title: decodeURIComponent(options.name) });
  }
  load(true);
});

onReachBottom(() => load());
</script>

<style scoped>
.list {
  min-height: 100vh;
  background: #f5f5f5;
}
.tabs {
  display: flex;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
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
.grid {
  display: flex;
  flex-direction: column;
}
.body__end {
  display: block;
  text-align: center;
  font-size: 24rpx;
  color: #bbb;
  padding: 30rpx 0;
}
</style>
