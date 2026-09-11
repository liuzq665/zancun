<template>
  <view class="cart">
    <wd-loading v-if="loading && !cart.items.length" />
    <wd-empty v-else-if="!cart.items.length" text="购物车还是空的" />

    <view v-else class="list">
      <view v-for="item in cart.items" :key="item.id" class="item">
        <view class="item__check" @click="toggle(item)">
          <text :class="['check', item.checked ? 'check--on' : '']">{{ item.checked ? '✓' : '' }}</text>
        </view>
        <image class="item__img" :src="item.image" mode="aspectFill" lazy-load />
        <view class="item__body">
          <text class="item__title">{{ item.title }}</text>
          <text v-if="item.specName" class="item__spec">{{ item.specName }}</text>
          <view class="item__row">
            <text class="item__price">¥{{ item.price }}</text>
            <view class="stepper">
              <text class="stepper__btn" @click="changeQty(item, -1)">-</text>
              <text class="stepper__val">{{ item.quantity }}</text>
              <text class="stepper__btn" @click="changeQty(item, 1)">+</text>
            </view>
          </view>
        </view>
        <text class="item__del" @click="removeItem(item)">删除</text>
      </view>
    </view>

    <view v-if="cart.items.length" class="footer">
      <text class="footer__all" @click="toggleAll">
        <text :class="['check', allChecked ? 'check--on' : '']">{{ allChecked ? '✓' : '' }}</text>
        <text class="footer__all-text">全选</text>
      </text>
      <text class="footer__amount">合计 ¥{{ cart.checkedAmount.toFixed(2) }}</text>
      <view class="footer__btn" @click="checkout">去结算</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { useCartStore } from '@/store/cart';
import { requireLogin } from '@/utils/guard';
import { setDraft } from '@/utils/order-draft';
import type { CartItem } from '@/api/types';

const cart = useCartStore();
const loading = ref(false);

const allChecked = computed(
  () => cart.items.length > 0 && cart.items.every((i) => i.checked === 1),
);

async function refresh() {
  if (!requireLogin()) return;
  loading.value = true;
  try {
    await cart.load();
  } finally {
    loading.value = false;
  }
}

async function toggle(item: CartItem) {
  await cart.update(item.id, { checked: item.checked === 1 ? 0 : 1 });
}

async function toggleAll() {
  const target = allChecked.value ? 0 : 1;
  await Promise.all(cart.items.map((i) => cart.update(i.id, { checked: target as 0 | 1 })));
}

async function changeQty(item: CartItem, delta: number) {
  const next = item.quantity + delta;
  if (next < 1) return;
  await cart.update(item.id, { quantity: next });
}

function removeItem(item: CartItem) {
  uni.showModal({
    title: '提示',
    content: '确定删除该商品吗？',
    success: async (res) => {
      if (res.confirm) await cart.remove(item.id);
    },
  });
}

function checkout() {
  const items = cart.checkedItems;
  if (!items.length) {
    uni.showToast({ title: '请先勾选商品', icon: 'none' });
    return;
  }
  setDraft({
    orderType: 'goods',
    title: items[0].title,
    items: items.map((i) => ({
      module: i.module,
      entityType: i.entityType,
      entityId: i.entityId,
      title: i.title || '',
      specName: i.specName,
      image: i.image,
      price: i.price || 0,
      quantity: i.quantity,
    })),
  });
  uni.navigateTo({ url: '/pages/order/confirm' });
}

onShow(() => {
  refresh();
});
</script>

<style scoped>
.cart {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 130rpx;
}
.list {
  padding: 20rpx;
}
.item {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}
.item__check {
  padding-right: 16rpx;
}
.check {
  display: inline-block;
  width: 40rpx;
  height: 40rpx;
  line-height: 40rpx;
  text-align: center;
  border: 1rpx solid #ccc;
  border-radius: 50%;
  font-size: 24rpx;
  color: #fff;
}
.check--on {
  background: #e54d42;
  border-color: #e54d42;
}
.item__img {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  background: #f5f5f5;
}
.item__body {
  flex: 1;
  padding-left: 20rpx;
}
.item__title {
  display: block;
  font-size: 28rpx;
  color: #333;
}
.item__spec {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}
.item__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20rpx;
}
.item__price {
  font-size: 30rpx;
  color: #e54d42;
}
.item__del {
  font-size: 24rpx;
  color: #bbb;
  padding-left: 16rpx;
}
.stepper {
  display: flex;
  align-items: center;
}
.stepper__btn {
  width: 48rpx;
  height: 48rpx;
  line-height: 48rpx;
  text-align: center;
  background: #f5f5f5;
  border-radius: 8rpx;
  font-size: 28rpx;
}
.stepper__val {
  width: 64rpx;
  text-align: center;
  font-size: 26rpx;
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
.footer__all {
  display: flex;
  align-items: center;
}
.footer__all-text {
  font-size: 26rpx;
  color: #666;
  margin-left: 10rpx;
}
.footer__amount {
  flex: 1;
  text-align: right;
  font-size: 28rpx;
  color: #e54d42;
  margin-right: 20rpx;
}
.footer__btn {
  background: #e54d42;
  color: #fff;
  font-size: 28rpx;
  padding: 16rpx 44rpx;
  border-radius: 40rpx;
}
</style>
