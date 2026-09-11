<template>
  <view class="confirm">
    <view class="card address" @click="chooseAddress">
      <view v-if="address" class="address__body">
        <text class="address__name">{{ address.receiverName }} {{ address.receiverPhone }}</text>
        <text class="address__detail">
          {{ address.province }}{{ address.city }}{{ address.district }}{{ address.detail }}
        </text>
      </view>
      <text v-else class="address__empty">请选择收货地址</text>
      <text class="address__arrow">›</text>
    </view>

    <view class="card">
      <view v-for="(it, idx) in items" :key="idx" class="item">
        <image class="item__img" :src="it.image" mode="aspectFill" lazy-load />
        <view class="item__body">
          <text class="item__title">{{ it.title }}</text>
          <text v-if="it.specName" class="item__spec">{{ it.specName }}</text>
          <view class="item__row">
            <text class="item__price">¥{{ it.price }}</text>
            <text class="item__qty">x{{ it.quantity }}</text>
          </view>
        </view>
      </view>
      <wd-empty v-if="!items.length" text="没有待结算的商品" />
    </view>

    <view class="card">
      <view class="summary__row"><text>商品金额</text><text>¥{{ totalAmount.toFixed(2) }}</text></view>
      <view class="summary__row"><text>运费</text><text>¥{{ freight.toFixed(2) }}</text></view>
      <view class="summary__row summary__row--total">
        <text>实付</text><text class="summary__pay">¥{{ payAmount.toFixed(2) }}</text>
      </view>
    </view>

    <view class="footer">
      <text class="footer__amount">实付 ¥{{ payAmount.toFixed(2) }}</text>
      <view :class="['footer__btn', submitting ? 'footer__btn--disabled' : '']" @click="submit">
        {{ submitting ? '提交中…' : '提交订单' }}
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import * as orderApi from '@/api/modules/order';
import * as addressApi from '@/api/modules/address';
import { getDraft, clearDraft, type OrderDraft } from '@/utils/order-draft';
import type { Address } from '@/api/types';

const draft = ref<OrderDraft | null>(null);
const address = ref<Address | null>(null);
const submitting = ref(false);

const items = computed(() => draft.value?.items ?? []);
const totalAmount = computed(() =>
  items.value.reduce((sum, it) => sum + it.price * it.quantity, 0),
);
/** 运费规则由服务端最终裁定，这里仅作展示（默认 0，见 7.3.3） */
const freight = computed(() => 0);
const payAmount = computed(() => totalAmount.value + freight.value);

async function loadAddress() {
  const list = await addressApi.list();
  address.value = list.find((a) => a.isDefault === 1) ?? list[0] ?? null;
}

function chooseAddress() {
  uni.navigateTo({ url: '/pages/mine/address?select=1' });
}

async function submit() {
  if (!draft.value || !items.value.length) {
    uni.showToast({ title: '没有待结算的商品', icon: 'none' });
    return;
  }
  if (submitting.value) return;
  submitting.value = true;
  try {
    const order = await orderApi.create({
      orderType: draft.value.orderType,
      title: draft.value.title,
      merchantId: draft.value.merchantId,
      items: items.value,
      totalAmount: totalAmount.value,
      freightAmount: freight.value,
      payAmount: payAmount.value,
      snapshot: draft.value.snapshot,
    });
    clearDraft();
    uni.showModal({
      title: '下单成功',
      content: `订单 ${order.orderNo} 待支付，是否立即支付？`,
      confirmText: '立即支付',
      cancelText: '稍后支付',
      success: async (res) => {
        if (res.confirm) {
          await orderApi.pay(order.orderNo);
          uni.showToast({ title: '支付成功', icon: 'success' });
        }
        setTimeout(() => uni.redirectTo({ url: '/pages/order/list' }), 600);
      },
    });
  } catch {
    // 请求层已提示
  } finally {
    submitting.value = false;
  }
}

onLoad(async () => {
  draft.value = getDraft();
  await loadAddress();
});

// 从地址页选择后返回时刷新默认地址
onShow(() => {
  if (draft.value) loadAddress();
});
</script>

<style scoped>
.confirm {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 130rpx;
}
.card {
  background: #fff;
  padding: 24rpx;
  margin-bottom: 20rpx;
}
.address {
  display: flex;
  align-items: center;
}
.address__body {
  flex: 1;
}
.address__name {
  display: block;
  font-size: 30rpx;
  color: #333;
  font-weight: 600;
}
.address__detail {
  display: block;
  font-size: 26rpx;
  color: #666;
  margin-top: 8rpx;
}
.address__empty {
  flex: 1;
  font-size: 28rpx;
  color: #999;
}
.address__arrow {
  font-size: 34rpx;
  color: #ccc;
}
.item {
  display: flex;
  padding: 16rpx 0;
}
.item__img {
  width: 140rpx;
  height: 140rpx;
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
  justify-content: space-between;
  margin-top: 20rpx;
}
.item__price {
  font-size: 28rpx;
  color: #e54d42;
}
.item__qty {
  font-size: 26rpx;
  color: #999;
}
.summary__row {
  display: flex;
  justify-content: space-between;
  font-size: 28rpx;
  color: #666;
  padding: 12rpx 0;
}
.summary__row--total {
  color: #333;
  font-weight: 600;
}
.summary__pay {
  color: #e54d42;
  font-size: 32rpx;
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
.footer__amount {
  flex: 1;
  font-size: 30rpx;
  color: #e54d42;
}
.footer__btn {
  background: #e54d42;
  color: #fff;
  font-size: 28rpx;
  padding: 16rpx 44rpx;
  border-radius: 40rpx;
}
.footer__btn--disabled {
  opacity: 0.6;
}
</style>
