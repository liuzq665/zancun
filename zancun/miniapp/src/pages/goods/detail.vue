<template>
  <view v-if="goods" class="detail">
    <swiper class="gallery" circular indicator-dots indicator-active-color="#e54d42">
      <swiper-item v-for="(img, i) in gallery" :key="i">
        <image class="gallery__img" :src="img" mode="aspectFill" lazy-load />
      </swiper-item>
    </swiper>

    <view class="card">
      <view class="price-row">
        <text class="price">¥{{ ((currentSku?.price ?? goods.price) / 100).toFixed(2) }}</text>
        <text v-if="goods.originalPrice" class="market">¥{{ (goods.originalPrice / 100).toFixed(2) }}</text>
        <text class="sales">已售 {{ goods.salesCount || 0 }}</text>
      </view>
      <text class="title">{{ goods.name }}</text>
      <text v-if="goods.description" class="subtitle">{{ goods.description }}</text>
    </view>

    <view class="card">
      <text class="card__title">选择规格</text>
      <view class="skus">
        <text
          v-for="s in goods.skus"
          :key="s.id"
          :class="['sku', currentSku?.id === s.id ? 'sku--active' : '']"
          @click="selectSku(s)"
        >
          {{ s.skuName }}
        </text>
      </view>
      <view class="qty">
        <text class="qty__label">数量</text>
        <view class="stepper">
          <text class="stepper__btn" @click="changeQty(-1)">-</text>
          <text class="stepper__val">{{ quantity }}</text>
          <text class="stepper__btn" @click="changeQty(1)">+</text>
        </view>
      </view>
      <text class="stock">库存 {{ currentSku?.stock ?? goods.stock ?? 0 }} 件</text>
    </view>

    <view class="card">
      <text class="card__title">工艺介绍</text>
      <text class="card__text">{{ goods.craftIntro || '暂无' }}</text>
      <text class="card__title">传承人</text>
      <text class="card__text">
        {{ goods.inheritorName || '—' }}<text v-if="goods.inheritorStory"> · {{ goods.inheritorStory }}</text>
      </text>
    </view>

    <view class="footer">
      <view class="footer__cart" @click="addToCart">加入购物车</view>
      <view class="footer__buy" @click="buyNow">立即购买</view>
    </view>
  </view>
  <wd-loading v-else />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import * as goodsApi from '@/api/modules/goods';
import { useCartStore } from '@/store/cart';
import { requireLogin } from '@/utils/guard';
import { setDraft } from '@/utils/order-draft';
import type { Goods, GoodsSku } from '@/api/types';

const cartStore = useCartStore();

const goods = ref<Goods | null>(null);
const currentSku = ref<GoodsSku | null>(null);
const quantity = ref(1);

const gallery = computed(() => {
  const images = goods.value?.images;
  if (images && images.length) return images;
  return goods.value?.mainImage ? [goods.value.mainImage] : [];
});

const unitPrice = computed(() => currentSku.value?.price ?? goods.value?.price ?? 0);

function selectSku(s: GoodsSku) {
  currentSku.value = s;
  quantity.value = 1;
}

function changeQty(delta: number) {
  const max = currentSku.value?.stock ?? goods.value?.stock ?? 99;
  quantity.value = Math.min(Math.max(1, quantity.value + delta), Math.max(1, max));
}

function buildItem() {
  const g = goods.value!;
  return {
    module: 'goods' as const,
    entityType: 'goods_sku' as const,
    entityId: currentSku.value?.id ?? g.id,
    title: g.name,
    specName: currentSku.value?.skuName,
    image: g.mainImage,
    price: unitPrice.value,
    quantity: quantity.value,
  };
}

async function addToCart() {
  if (!requireLogin() || !goods.value) return;
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
  if (!requireLogin() || !goods.value) return;
  setDraft({ orderType: 'goods', title: goods.value.name, items: [buildItem()] });
  uni.navigateTo({ url: '/pages/order/confirm' });
}

onLoad(async (options) => {
  const id = Number(options?.id || 1);
  goods.value = await goodsApi.detail(id);
  currentSku.value = goods.value.skus?.[0] ?? null;
});
</script>

<style scoped>
.detail {
  padding-bottom: 130rpx;
  background: #f5f5f5;
  min-height: 100vh;
}
.gallery {
  height: 750rpx;
}
.gallery__img {
  width: 100%;
  height: 750rpx;
  background: #eee;
}
.card {
  background: #fff;
  padding: 24rpx;
  margin-bottom: 20rpx;
}
.price-row {
  display: flex;
  align-items: baseline;
}
.price {
  font-size: 44rpx;
  color: #e54d42;
  font-weight: 600;
}
.market {
  font-size: 26rpx;
  color: #bbb;
  text-decoration: line-through;
  margin-left: 16rpx;
}
.sales {
  margin-left: auto;
  font-size: 24rpx;
  color: #999;
}
.title {
  display: block;
  font-size: 32rpx;
  color: #333;
  margin-top: 16rpx;
}
.subtitle {
  display: block;
  font-size: 26rpx;
  color: #999;
  margin-top: 8rpx;
}
.card__title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin: 16rpx 0 12rpx;
}
.card__text {
  display: block;
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
}
.skus {
  display: flex;
  flex-wrap: wrap;
}
.sku {
  padding: 14rpx 32rpx;
  border: 1rpx solid #ddd;
  border-radius: 32rpx;
  font-size: 26rpx;
  color: #333;
  margin: 0 16rpx 16rpx 0;
}
.sku--active {
  border-color: #e54d42;
  color: #e54d42;
  background: #fdecea;
}
.qty {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10rpx;
}
.qty__label {
  font-size: 28rpx;
  color: #333;
}
.stepper {
  display: flex;
  align-items: center;
}
.stepper__btn {
  width: 56rpx;
  height: 56rpx;
  line-height: 56rpx;
  text-align: center;
  background: #f5f5f5;
  border-radius: 8rpx;
  font-size: 32rpx;
  color: #333;
}
.stepper__val {
  width: 80rpx;
  text-align: center;
  font-size: 28rpx;
}
.stock {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-top: 12rpx;
}
.eval {
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}
.eval__score {
  display: block;
  color: #ff9900;
  font-size: 24rpx;
}
.eval__content {
  display: block;
  font-size: 26rpx;
  color: #666;
  margin-top: 6rpx;
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
