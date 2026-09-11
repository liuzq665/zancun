<template>
  <view class="topic">
    <wd-loading v-if="loading" />
    <wd-empty v-else-if="!list.length" text="暂无话题" />
    <view v-else class="list">
      <view v-for="t in list" :key="t.id" class="item">
        <view class="item__body">
          <text class="item__name">#{{ t.name }}</text>
          <text v-if="t.intro" class="item__intro">{{ t.intro }}</text>
          <text class="item__meta">{{ t.postCount || 0 }} 篇游记 · {{ t.followCount || 0 }} 人关注</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import * as communityApi from '@/api/modules/community';

const list = ref<any[]>([]);
const loading = ref(true);

onLoad(async () => {
  try {
    list.value = await communityApi.topicList();
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.topic {
  min-height: 100vh;
  background: #f5f5f5;
}
.list {
  padding: 20rpx;
}
.item {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}
.item__name {
  display: block;
  font-size: 30rpx;
  color: #e54d42;
  font-weight: 600;
}
.item__intro {
  display: block;
  font-size: 26rpx;
  color: #666;
  margin-top: 10rpx;
}
.item__meta {
  display: block;
  font-size: 22rpx;
  color: #999;
  margin-top: 12rpx;
}
</style>
