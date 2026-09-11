<template>
  <view v-if="post" class="detail">
    <view class="card">
      <view class="author" @click="goUser">
        <image class="author__avatar" :src="post.author?.avatar" mode="aspectFill" />
        <text class="author__name">{{ post.author?.nickname }}</text>
      </view>
      <text v-if="post.title" class="title">{{ post.title }}</text>
      <text class="content">{{ post.content }}</text>
      <image
        v-for="(img, i) in post.images"
        :key="i"
        class="image"
        :src="img"
        mode="widthFix"
        lazy-load
      />
      <view v-if="post.topicTags?.length" class="topics">
        <text v-for="t in post.topicTags" :key="t" class="topic">#{{ t }}</text>
      </view>
    </view>

    <view class="card">
      <text class="card__title">评论（{{ post.commentCount }}）</text>
      <view v-for="c in comments" :key="c.id" class="comment">
        <text class="comment__name">{{ c.nickname || '游客' }}</text>
        <text class="comment__content">{{ c.content }}</text>
      </view>
      <wd-empty v-if="!comments.length" text="还没有评论" />
    </view>

    <view class="footer">
      <input v-model="commentText" class="footer__input" placeholder="说点什么…" />
      <text class="footer__action" @click="doLike">{{ liked ? '♥' : '♡' }} {{ likeCount }}</text>
      <text class="footer__action" @click="doCollect">收藏</text>
      <view class="footer__btn" @click="doComment">发送</view>
    </view>
  </view>
  <wd-loading v-else />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import * as communityApi from '@/api/modules/community';
import { requireLogin } from '@/utils/guard';
import type { Post } from '@/api/types';

const post = ref<Post | null>(null);
const comments = ref<any[]>([]);
const commentText = ref('');
const liked = ref(false);
const likeCount = ref(0);

async function doLike() {
  if (!requireLogin() || !post.value) return;
  const res = await communityApi.like('post', post.value.id);
  liked.value = res.liked;
  likeCount.value = res.likeCount;
}

async function doCollect() {
  if (!requireLogin() || !post.value) return;
  await communityApi.collect(post.value.id);
  uni.showToast({ title: '已收藏', icon: 'success' });
}

async function doComment() {
  if (!requireLogin() || !post.value) return;
  const content = commentText.value.trim();
  if (!content) {
    uni.showToast({ title: '请输入评论内容', icon: 'none' });
    return;
  }
  await communityApi.comment({ postId: post.value.id, content });
  commentText.value = '';
  uni.showToast({ title: '评论成功', icon: 'success' });
}

function goUser() {
  if (post.value?.author?.id) {
    uni.navigateTo({ url: `/pages/community/user?id=${post.value.author.id}` });
  }
}

onLoad(async (options) => {
  post.value = await communityApi.postDetail(Number(options?.id || 1));
  likeCount.value = post.value.likeCount;
});
</script>

<style scoped>
.detail {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 130rpx;
}
.card {
  background: #fff;
  padding: 24rpx;
  margin-bottom: 20rpx;
}
.author {
  display: flex;
  align-items: center;
}
.author__avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: #eee;
}
.author__name {
  font-size: 28rpx;
  color: #333;
  margin-left: 16rpx;
}
.title {
  display: block;
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
  margin-top: 20rpx;
}
.content {
  display: block;
  font-size: 28rpx;
  color: #444;
  line-height: 1.7;
  margin-top: 16rpx;
}
.image {
  width: 100%;
  border-radius: 12rpx;
  margin-top: 16rpx;
  background: #eee;
}
.topics {
  display: flex;
  flex-wrap: wrap;
  margin-top: 16rpx;
}
.topic {
  font-size: 24rpx;
  color: #e54d42;
  margin-right: 16rpx;
}
.card__title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
}
.comment {
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}
.comment__name {
  display: block;
  font-size: 24rpx;
  color: #999;
}
.comment__content {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-top: 6rpx;
}
.footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  background: #fff;
  padding: 16rpx 24rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}
.footer__input {
  flex: 1;
  height: 68rpx;
  background: #f5f5f5;
  border-radius: 34rpx;
  padding: 0 24rpx;
  font-size: 26rpx;
}
.footer__action {
  font-size: 26rpx;
  color: #666;
  margin-left: 20rpx;
}
.footer__btn {
  margin-left: 20rpx;
  background: #e54d42;
  color: #fff;
  font-size: 26rpx;
  padding: 12rpx 30rpx;
  border-radius: 34rpx;
}
</style>
