<template>
  <view class="publish">
    <view class="card">
      <input v-model="title" class="title-input" placeholder="给游记起个标题（选填）" maxlength="50" />
      <textarea
        v-model="content"
        class="content-input"
        placeholder="分享你的苗寨见闻…（最多 5000 字）"
        maxlength="5000"
        auto-height
      />
      <text class="counter">{{ content.length }}/5000</text>
    </view>

    <view class="card">
      <text class="card__title">图片（{{ images.length }}/9）</text>
      <view class="images">
        <view v-for="(img, i) in images" :key="i" class="image-item">
          <image class="image-item__img" :src="img" mode="aspectFill" />
          <text class="image-item__del" @click="removeImage(i)">×</text>
        </view>
        <view v-if="images.length < 9" class="image-add" @click="chooseImage">＋</view>
      </view>
    </view>

    <view class="card">
      <view class="row">
        <text class="row__label">关联地点</text>
        <input v-model="relatedLocation" class="row__input" placeholder="如：乌东苗寨" />
      </view>
      <view class="row">
        <text class="row__label">话题标签</text>
        <input v-model="topicInput" class="row__input" placeholder="用空格分隔，如：苗寨 梯田" />
      </view>
    </view>

    <view class="footer">
      <view :class="['footer__btn', submitting ? 'footer__btn--disabled' : '']" @click="submit">
        {{ submitting ? '发布中…' : '发布游记' }}
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import * as communityApi from '@/api/modules/community';
import * as uploadApi from '@/api/modules/upload';
import { requireLogin } from '@/utils/guard';

const title = ref('');
const content = ref('');
const images = ref<string[]>([]);
const relatedLocation = ref('');
const topicInput = ref('');
const submitting = ref(false);

function chooseImage() {
  uni.chooseImage({
    count: 9 - images.value.length,
    sizeType: ['compressed'],
    success: async (res) => {
      const paths = res.tempFilePaths as string[];
      uni.showLoading({ title: '上传中' });
      try {
        const uploaded = await Promise.all(paths.map((p) => uploadApi.uploadImage(p)));
        images.value = images.value.concat(uploaded.map((u) => u.url)).slice(0, 9);
      } finally {
        uni.hideLoading();
      }
    },
  });
}

function removeImage(index: number) {
  images.value.splice(index, 1);
}

async function submit() {
  if (!requireLogin()) return;
  if (!content.value.trim() && !images.value.length) {
    uni.showToast({ title: '写点内容或传张图吧', icon: 'none' });
    return;
  }
  if (submitting.value) return;
  submitting.value = true;
  try {
    const res = await communityApi.publish({
      title: title.value.trim() || undefined,
      content: content.value.trim() || undefined,
      images: images.value.length ? images.value : undefined,
      relatedLocation: relatedLocation.value.trim() || undefined,
      topicTags: topicInput.value.trim() ? topicInput.value.trim().split(/\s+/) : undefined,
    });
    uni.showToast({
      title: res.status === 'NORMAL' ? '发布成功' : '已提交审核',
      icon: 'success',
    });
    setTimeout(() => uni.switchTab({ url: '/pages/community/feed' }), 700);
  } catch {
    // 请求层已提示
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.publish {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 130rpx;
}
.card {
  background: #fff;
  padding: 24rpx;
  margin-bottom: 20rpx;
}
.title-input {
  font-size: 30rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f5f5f5;
}
.content-input {
  width: 100%;
  min-height: 240rpx;
  font-size: 28rpx;
  margin-top: 20rpx;
  line-height: 1.6;
}
.counter {
  display: block;
  text-align: right;
  font-size: 22rpx;
  color: #bbb;
}
.card__title {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
}
.images {
  display: flex;
  flex-wrap: wrap;
}
.image-item {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  margin: 0 16rpx 16rpx 0;
}
.image-item__img {
  width: 100%;
  height: 100%;
  border-radius: 12rpx;
  background: #eee;
}
.image-item__del {
  position: absolute;
  top: -12rpx;
  right: -12rpx;
  width: 40rpx;
  height: 40rpx;
  line-height: 36rpx;
  text-align: center;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  border-radius: 50%;
  font-size: 28rpx;
}
.image-add {
  width: 200rpx;
  height: 200rpx;
  border: 1rpx dashed #ddd;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  color: #ccc;
}
.row {
  display: flex;
  align-items: center;
  min-height: 88rpx;
  border-bottom: 1rpx solid #f5f5f5;
}
.row__label {
  width: 170rpx;
  font-size: 28rpx;
  color: #333;
}
.row__input {
  flex: 1;
  font-size: 28rpx;
  text-align: right;
}
.footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 16rpx 24rpx;
  background: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}
.footer__btn {
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  background: #e54d42;
  color: #fff;
  border-radius: 40rpx;
  font-size: 30rpx;
}
.footer__btn--disabled {
  opacity: 0.6;
}
</style>
