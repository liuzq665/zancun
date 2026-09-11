<template>
  <view class="category">
    <scroll-view class="side" scroll-y>
      <view
        v-for="c in categories"
        :key="c.id"
        :class="['side__item', c.id === activeId ? 'side__item--active' : '']"
        @click="selectCategory(c)"
      >
        {{ c.name }}
      </view>
    </scroll-view>

    <scroll-view class="main" scroll-y>
      <wd-loading v-if="loading" />
      <wd-empty v-else-if="!goodsList.length" text="该分类下暂无商品" />
      <view v-else class="goods">
        <view v-for="g in goodsList" :key="g.id" class="goods-card" @click="goDetail(g)">
          <image class="goods-card__img" :src="g.coverImage || g.mainImage || ''" mode="aspectFill" lazy-load />
          <view class="goods-card__info">
            <text class="goods-card__name">{{ g.name }}</text>
            <text class="goods-card__desc">{{ g.description }}</text>
            <view class="goods-card__bottom">
              <text class="goods-card__price">¥{{ (g.price / 100).toFixed(2) }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import * as goodsApi from '@/api/modules/goods';
import type { GoodsCategory, Goods } from '@/api/types';

const categories = ref<GoodsCategory[]>([]);
const activeId = ref(0);
const loading = ref(true);
const goodsList = ref<Goods[]>([]);

function selectCategory(c: GoodsCategory) {
  activeId.value = c.id;
  loadGoods(c.id);
}

function goDetail(g: Goods) {
  uni.navigateTo({ url: `/pages/goods/detail?id=${g.id}` });
}

async function loadGoods(categoryId: number) {
  loading.value = true;
  try {
    const res = await goodsApi.list({ categoryId, page: 1, size: 50 });
    goodsList.value = res.list || [];
  } finally {
    loading.value = false;
  }
}

onLoad(async () => {
  try {
    categories.value = await goodsApi.categoryTree();
    if (categories.value.length) {
      activeId.value = categories.value[0].id;
      loadGoods(activeId.value);
    }
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.category {
  display: flex;
  height: 100vh;
}
.side {
  width: 180rpx;
  background: #f7f7f7;
}
.side__item {
  padding: 34rpx 20rpx;
  font-size: 26rpx;
  color: #333;
  text-align: center;
}
.side__item--active {
  background: #fff;
  color: #e54d42;
  font-weight: 600;
}
.main {
  flex: 1;
  background: #fff;
}
.goods {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  padding: 16rpx;
}
.goods-card {
  width: calc(50% - 8rpx);
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}
.goods-card__img {
  width: 100%;
  height: 260rpx;
}
.goods-card__info {
  padding: 12rpx;
}
.goods-card__name {
  font-size: 26rpx;
  color: #333;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.goods-card__desc {
  font-size: 22rpx;
  color: #999;
  display: block;
  margin-top: 6rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.goods-card__bottom {
  display: flex;
  align-items: center;
  margin-top: 10rpx;
}
.goods-card__price {
  font-size: 28rpx;
  color: #e54d42;
  font-weight: 600;
}
</style>
