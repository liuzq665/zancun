<template>
  <view class="user">
    <view v-if="profile" class="header">
      <image class="header__avatar" :src="profile.avatar" mode="aspectFill" />
      <text class="header__name">{{ profile.nickname }}</text>
      <text v-if="profile.bio" class="header__bio">{{ profile.bio }}</text>
      <view class="header__stats">
        <view class="stat"><text class="stat__num">{{ profile.postCount || 0 }}</text><text class="stat__label">游记</text></view>
        <view class="stat"><text class="stat__num">{{ profile.likeCount || 0 }}</text><text class="stat__label">获赞</text></view>
        <view class="stat"><text class="stat__num">{{ profile.followCount || 0 }}</text><text class="stat__label">关注</text></view>
        <view class="stat"><text class="stat__num">{{ profile.fansCount || 0 }}</text><text class="stat__label">粉丝</text></view>
      </view>
      <view class="header__btn" @click="toggleFollow">{{ followed ? '已关注' : '关注' }}</view>
    </view>
    <wd-loading v-else />

    <view class="posts">
      <text class="posts__title">TA 的游记</text>
      <wd-empty v-if="!posts.length" text="还没有发布游记" />
      <view v-for="p in posts" :key="p.id" class="post" @click="goDetail(p)">
        <image v-if="p.images && p.images.length" class="post__img" :src="p.images[0]" mode="aspectFill" />
        <view class="post__body">
          <text class="post__title">{{ p.title }}</text>
          <text class="post__count">♡ {{ p.likeCount }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import * as communityApi from '@/api/modules/community';
import { requireLogin } from '@/utils/guard';
import type { Post } from '@/api/types';

const userId = ref(0);
const profile = ref<any>(null);
const posts = ref<Post[]>([]);
const followed = ref(false);

async function toggleFollow() {
  if (!requireLogin()) return;
  await communityApi.follow(userId.value);
  followed.value = !followed.value;
}

function goDetail(p: Post) {
  uni.navigateTo({ url: `/pages/community/detail?id=${p.id}` });
}

onLoad(async (options) => {
  userId.value = Number(options?.id || 1);
  const res = await communityApi.userHome(userId.value);
  profile.value = res;
  posts.value = res.posts || [];
  followed.value = !!res.followed;
});
</script>

<style scoped>
.user {
  min-height: 100vh;
  background: #f5f5f5;
}
.header {
  background: #fff;
  padding: 40rpx 24rpx 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.header__avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: #eee;
}
.header__name {
  font-size: 32rpx;
  color: #333;
  font-weight: 600;
  margin-top: 16rpx;
}
.header__bio {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}
.header__stats {
  display: flex;
  width: 100%;
  margin-top: 30rpx;
}
.stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.stat__num {
  font-size: 30rpx;
  color: #333;
  font-weight: 600;
}
.stat__label {
  font-size: 22rpx;
  color: #999;
  margin-top: 6rpx;
}
.header__btn {
  margin-top: 30rpx;
  padding: 14rpx 60rpx;
  background: #e54d42;
  color: #fff;
  border-radius: 36rpx;
  font-size: 28rpx;
}
.posts {
  padding: 20rpx;
}
.posts__title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
}
.post {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
}
.post__img {
  width: 200rpx;
  height: 160rpx;
  background: #eee;
}
.post__body {
  flex: 1;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
}
.post__title {
  font-size: 28rpx;
  color: #333;
}
.post__count {
  margin-top: auto;
  font-size: 22rpx;
  color: #999;
}
</style>
