<template>
  <view v-if="product" class="product">
    <image class="banner" :src="product.mainImage" mode="aspectFill" lazy-load />

    <view class="card">
      <text class="price">¥{{ product.price }}</text>
      <text class="name">{{ product.name }}</text>
      <text v-if="product.spec" class="spec">规格：{{ product.spec }}</text>
      <view class="tags">
        <text v-if="product.origin" class="tag">产地：{{ product.origin }}</text>
        <text v-if="product.shelfLife" class="tag">保质期：{{ product.shelfLife }}</text>
      </view>
      <text class="stock">库存 {{ product.stock }} 件</text>
    </view>

    <view class="card">
      <text class="card__title">商品详情</text>
      <text class="card__text">{{ product.detail || '产地直供，绿色农产品。' }}</text>
    </view>

    <view class="footer">
      <view class="footer__cart" @click="addToCart">加入购物车</view>
      <view class="footer__buy" @click="buyNow">立即购买</view>
    </view>
  </view>
  <wd-loading v-else />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import * as foodApi from '@/api/modules/food';
import { useCartStore } from '@/store/cart';
import { requireLogin } from '@/utils/guard';
import { setDraft } from '@/utils/order-draft';

const cartStore = useCartStore();
const product = ref<any>(null);

function buildItem() {
  const p = product.value;
  return {
    module: 'food' as const,
    entityType: 'product_sku' as const,
    entityId: p.id,
    title: p.name,
    specName: p.spec,
    image: p.mainImage,
    price: p.price,
    quantity: 1,
  };
}

async function addToCart() {
  if (!requireLogin() || !product.value) return;
  const item = buildItem();
  await cartStore.add({
    module: item.module,
    entityType: item.entityType,
    entityId: item.entityId,
    quantity: item.quantity,
    title: item.title,
    specName: item.specName,
    image: item.image,
    price: item.price,
  });
  uni.showToast({ title: '已加入购物车', icon: 'success' });
}

function buyNow() {
  if (!requireLogin() || !product.value) return;
  setDraft({ orderType: 'goods', title: product.value.name, items: [buildItem()] });
  uni.navigateTo({ url: '/pages/order/confirm' });
}

onLoad(async (options) => {
  product.value = await foodApi.productDetail(Number(options?.id || 1));
});
</script>

<style scoped>
.product {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 130rpx;
}
.banner {
  width: 100%;
  height: 620rpx;
  background: #eee;
}
.card {
  background: #fff;
  padding: 24rpx;
  margin-bottom: 20rpx;
}
.price {
  font-size: 42rpx;
  color: #e54d42;
  font-weight: 600;
}
.name {
  display: block;
  font-size: 32rpx;
  color: #333;
  margin-top: 12rpx;
}
.spec {
  display: block;
  font-size: 26rpx;
  color: #999;
  margin-top: 8rpx;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  margin-top: 16rpx;
}
.tag {
  font-size: 24rpx;
  color: #666;
  background: #f5f5f5;
  border-radius: 8rpx;
  padding: 8rpx 18rpx;
  margin: 0 16rpx 12rpx 0;
}
.stock {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
}
.card__title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 12rpx;
}
.card__text {
  display: block;
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
}
.footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  background: #fff;
  padding: 16rpx 24rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}
.footer__cart,
.footer__buy {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 40rpx;
  font-size: 30rpx;
}
.footer__cart {
  background: #fff2e8;
  color: #e54d42;
  border: 1rpx solid #e54d42;
  margin-right: 20rpx;
}
.footer__buy {
  background: #e54d42;
  color: #fff;
}
</style>
