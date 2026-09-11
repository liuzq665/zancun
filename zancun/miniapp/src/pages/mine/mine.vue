<template>
  <view class="mine">
    <view class="header" @click="onHeaderTap">
      <image class="header__avatar" :src="user.profile?.avatar || defaultAvatar" mode="aspectFill" />
      <view class="header__body">
        <text class="header__name">{{ user.isLogin ? user.nickname : '点击登录' }}</text>
        <text class="header__tip">{{ user.isLogin ? user.profile?.bio || '欢迎回来' : '登录后可下单、收藏、发布游记' }}</text>
      </view>
    </view>

    <view class="orders card">
      <view class="card__head">
        <text class="card__title">我的订单</text>
        <text class="card__more" @click="goOrders('')">全部 ›</text>
      </view>
      <view class="orders__row">
        <view v-for="o in orderTabs" :key="o.status" class="orders__item" @click="goOrders(o.status)">
          <text class="orders__label">{{ o.label }}</text>
        </view>
      </view>
    </view>

    <view class="card">
      <view v-for="m in menus" :key="m.url" class="menu" @click="go(m.url)">
        <text class="menu__icon">{{ m.icon }}</text>
        <text class="menu__name">{{ m.name }}</text>
        <text class="menu__arrow">›</text>
      </view>
    </view>

    <view v-if="user.isLogin" class="logout" @click="logout">退出登录</view>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { useUserStore } from '@/store/user';

const user = useUserStore();
const defaultAvatar = 'https://images.pexels.com/photos/7400017/pexels-photo-7400017.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop';

const orderTabs = [
  { label: '待支付', status: 'PENDING' },
  { label: '已支付', status: 'PAID' },
  { label: '已完成', status: 'FINISHED' },
  { label: '退款/售后', status: 'REFUNDED' },
];

const menus = [
  { icon: '❤️', name: '我的收藏', url: '/pages/mine/collect' },
  { icon: '📍', name: '收货地址', url: '/pages/mine/address' },
  { icon: '✉️', name: '消息', url: '/pages/mine/message' },
  { icon: '🎫', name: '我的电子票', url: '/pages/travel/eticket?orderId=1' },
];

function onHeaderTap() {
  if (!user.isLogin) uni.navigateTo({ url: '/pages/login/login' });
}

function goOrders(status: string) {
  uni.navigateTo({ url: `/pages/order/list${status ? `?status=${status}` : ''}` });
}

function go(url: string) {
  uni.navigateTo({ url });
}

function logout() {
  uni.showModal({
    title: '提示',
    content: '确定退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        user.logout();
        uni.showToast({ title: '已退出', icon: 'success' });
      }
    },
  });
}

onShow(async () => {
  if (user.isLogin && !user.profile) {
    try {
      await user.loadProfile();
    } catch {
      user.logout();
    }
  }
});
</script>

<style scoped>
.mine {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 60rpx;
}
.header {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 48rpx 24rpx;
  margin-bottom: 20rpx;
}
.header__avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: #eee;
}
.header__body {
  flex: 1;
  padding-left: 24rpx;
}
.header__name {
  display: block;
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
}
.header__tip {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
}
.card {
  background: #fff;
  border-radius: 16rpx;
  margin: 0 20rpx 20rpx;
  padding: 24rpx;
}
.card__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card__title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}
.card__more {
  font-size: 24rpx;
  color: #999;
}
.orders__row {
  display: flex;
  margin-top: 24rpx;
}
.orders__item {
  flex: 1;
  display: flex;
  justify-content: center;
}
.orders__label {
  font-size: 26rpx;
  color: #666;
}
.menu {
  display: flex;
  align-items: center;
  min-height: 96rpx;
  border-bottom: 1rpx solid #f5f5f5;
}
.menu:last-child {
  border-bottom: none;
}
.menu__icon {
  font-size: 34rpx;
  margin-right: 20rpx;
}
.menu__name {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}
.menu__arrow {
  font-size: 32rpx;
  color: #ccc;
}
.logout {
  margin: 30rpx 20rpx;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  background: #fff;
  border-radius: 44rpx;
  font-size: 30rpx;
  color: #e54d42;
}
</style>
