<template>
  <view class="wd-loading">
    <text class="wd-loading__text">{{ text }}</text>
  </view>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ text?: string }>(), { text: '加载中…' });
</script>

<style scoped>
.wd-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
}
.wd-loading__text {
  font-size: 26rpx;
  color: #999;
}
</style>
