<template>
  <view class="message">
    <wd-loading v-if="loading && !list.length" />
    <wd-empty v-else-if="!list.length" text="暂无消息" />

    <view v-else class="list">
      <view v-for="m in list" :key="m.id" class="card" @click="markRead(m)">
        <view class="card__head">
          <text class="card__type">{{ typeText(m.type) }}</text>
          <text v-if="m.isRead === 0" class="card__dot" />
        </view>
        <text class="card__title">{{ m.title }}</text>
        <text class="card__content">{{ m.content }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import * as messageApi from '@/api/modules/message';
import { requireLogin } from '@/utils/guard';
import type { Message } from '@/api/types';

const TYPE_TEXT: Record<Message['type'], string> = {
  system: '系统通知',
  order: '订单消息',
  interact: '互动消息',
};

const list = ref<Message[]>([]);
const loading = ref(false);

const typeText = (t: Message['type']) => TYPE_TEXT[t] || t;

async function load() {
  if (!requireLogin()) return;
  loading.value = true;
  try {
    const res = await messageApi.list({ page: 1, size: 20 });
    list.value = res.list;
  } finally {
    loading.value = false;
  }
}

async function markRead(m: Message) {
  if (m.isRead === 1) return;
  await messageApi.read(m.id);
  m.isRead = 1;
}

onLoad(() => {
  load();
});
</script>

<style scoped>
.message {
  min-height: 100vh;
  background: #f5f5f5;
}
.list {
  padding: 20rpx;
}
.card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}
.card__head {
  display: flex;
  align-items: center;
}
.card__type {
  font-size: 22rpx;
  color: #e54d42;
  background: #fdecea;
  border-radius: 6rpx;
  padding: 4rpx 12rpx;
}
.card__dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: #e54d42;
  margin-left: 12rpx;
}
.card__title {
  display: block;
  font-size: 30rpx;
  color: #333;
  font-weight: 600;
  margin-top: 16rpx;
}
.card__content {
  display: block;
  font-size: 26rpx;
  color: #666;
  margin-top: 10rpx;
  line-height: 1.5;
}
</style>
