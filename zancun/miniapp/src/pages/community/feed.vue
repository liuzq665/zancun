<template>
  <view class="feed">
    <view class="tabs">
      <text
        v-for="t in tabs"
        :key="t.value"
        :class="['tabs__item', sort === t.value ? 'tabs__item--active' : '']"
        @click="changeSort(t.value)"
      >
        {{ t.label }}
      </text>
      <text class="tabs__publish" @click="goPublish">＋ 发布</text>
    </view>

    <view class="body">
      <wd-loading v-if="loading && !list.length" />
      <wd-empty v-else-if="!list.length" text="还没有游记" />
      <view v-else class="waterfall">
        <view v-for="p in list" :key="p.id" class="post" @click="goDetail(p)">
          <image
            v-if="p.images && p.images.length"
            class="post__img"
            :src="p.images[0]"
            mode="widthFix"
            lazy-load
          />
          <view class="post__body">
            <text class="post__title">{{ p.title }}</text>
            <text class="post__content">{{ p.content }}</text>
            <view class="post__foot">
              <image class="post__avatar" :src="p.author?.avatar" mode="aspectFill" />
              <text class="post__name">{{ p.author?.nickname }}</text>
              <text class="post__count">♡ {{ p.likeCount }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import * as communityApi from '@/api/modules/community';
import type { Post } from '@/api/types';

const tabs = [
  { label: '推荐', value: 'hot' as const },
  { label: '最新', value: 'latest' as const },
];

const sort = ref<'latest' | 'hot'>('hot');
const list = ref<Post[]>([]);
const loading = ref(false);

async function load() {
  loading.value = true;
  try {
    const res = await communityApi.feed({ sort: sort.value, page: 1, size: 20 });
    list.value = res.list;
  } finally {
    loading.value = false;
  }
}

function changeSort(value: 'latest' | 'hot') {
  if (sort.value === value) return;
  sort.value = value;
  load();
}

function goDetail(p: Post) {
  uni.navigateTo({ url: `/pages/community/detail?id=${p.id}` });
}

function goPublish() {
  uni.navigateTo({ url: '/pages/community/publish' });
}

onShow(() => {
  load();
});
</script>

<style scoped>
.feed {
  min-height: 100vh;
  background: #f5f5f5;
}
.tabs {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 0 24rpx;
  position: sticky;
  top: 0;
  z-index: 10;
}
.tabs__item {
  padding: 26rpx 24rpx;
  font-size: 28rpx;
  color: #666;
}
.tabs__item--active {
  color: #e54d42;
  font-weight: 600;
}
.tabs__publish {
  margin-left: auto;
  font-size: 26rpx;
  color: #e54d42;
}
.body {
  padding: 20rpx;
}
.waterfall {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}
.post {
  width: 48.5%;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
}
.post__img {
  width: 100%;
  display: block;
  background: #eee;
}
.post__body {
  padding: 16rpx;
}
.post__title {
  display: block;
  font-size: 28rpx;
  color: #333;
  font-weight: 600;
}
.post__content {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.post__foot {
  display: flex;
  align-items: center;
  margin-top: 16rpx;
}
.post__avatar {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: #eee;
}
.post__name {
  font-size: 22rpx;
  color: #666;
  margin-left: 10rpx;
}
.post__count {
  margin-left: auto;
  font-size: 22rpx;
  color: #999;
}
</style>
