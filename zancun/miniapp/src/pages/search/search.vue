<template>
  <view class="search">
    <view class="search__bar">
      <input
        v-model="keyword"
        class="search__input"
        placeholder="搜索非遗好物"
        confirm-type="search"
        @confirm="doSearch"
      />
      <text class="search__btn" @click="doSearch">搜索</text>
    </view>

    <view v-if="!searched" class="history">
      <view class="history__head">
        <text class="history__title">搜索历史</text>
        <text v-if="history.length" class="history__clear" @click="clearHistory">清空</text>
      </view>
      <view class="history__tags">
        <text v-for="h in history" :key="h" class="tag" @click="useKeyword(h)">{{ h }}</text>
      </view>
      <wd-empty v-if="!history.length" text="暂无搜索历史" />
    </view>

    <view v-else class="result">
      <wd-loading v-if="loading" />
      <wd-empty v-else-if="!list.length" text="没有找到相关商品" />
      <view v-else class="result__list">
        <wd-goods-card v-for="g in list" :key="g.id" :goods="g" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import * as goodsApi from '@/api/modules/goods';
import type { Goods } from '@/api/types';

const HISTORY_KEY = 'search_history';

const keyword = ref('');
const history = ref<string[]>(uni.getStorageSync(HISTORY_KEY) || []);
const list = ref<Goods[]>([]);
const loading = ref(false);
const searched = ref(false);

function saveHistory(kw: string) {
  const next = [kw, ...history.value.filter((h) => h !== kw)].slice(0, 10);
  history.value = next;
  uni.setStorageSync(HISTORY_KEY, next);
}

function clearHistory() {
  history.value = [];
  uni.removeStorageSync(HISTORY_KEY);
}

function useKeyword(kw: string) {
  keyword.value = kw;
  doSearch();
}

async function doSearch() {
  const kw = keyword.value.trim();
  if (!kw) {
    uni.showToast({ title: '请输入关键词', icon: 'none' });
    return;
  }
  saveHistory(kw);
  loading.value = true;
  searched.value = true;
  try {
    const res = await goodsApi.search({ keyword: kw, page: 1, size: 20 });
    list.value = res.list;
  } finally {
    loading.value = false;
  }
}

onLoad((options) => {
  if (options?.keyword) {
    keyword.value = decodeURIComponent(options.keyword);
    doSearch();
  }
});
</script>

<style scoped>
.search {
  min-height: 100vh;
  background: #f5f5f5;
}
.search__bar {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #fff;
}
.search__input {
  flex: 1;
  height: 72rpx;
  background: #f5f5f5;
  border-radius: 36rpx;
  padding: 0 28rpx;
  font-size: 28rpx;
}
.search__btn {
  margin-left: 20rpx;
  font-size: 30rpx;
  color: #e54d42;
}
.history {
  padding: 30rpx;
}
.history__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.history__title {
  font-size: 30rpx;
  color: #333;
  font-weight: 600;
}
.history__clear {
  font-size: 26rpx;
  color: #999;
}
.history__tags {
  display: flex;
  flex-wrap: wrap;
  margin-top: 20rpx;
}
.tag {
  padding: 10rpx 26rpx;
  background: #fff;
  border-radius: 30rpx;
  font-size: 26rpx;
  color: #666;
  margin: 0 16rpx 16rpx 0;
}
.result {
  padding: 20rpx;
}
</style>
