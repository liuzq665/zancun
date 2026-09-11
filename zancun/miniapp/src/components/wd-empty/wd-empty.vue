<template>
  <view class="wd-empty">
    <text class="wd-empty__text">{{ text }}</text>
  </view>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ text?: string }>(), { text: '暂无数据' });
</script>

<style scoped>
.wd-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}
.wd-empty__text {
  font-size: 28rpx;
  color: #999;
}
</style>
