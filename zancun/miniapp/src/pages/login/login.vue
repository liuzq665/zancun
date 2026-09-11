<template>
  <view class="login">
    <text class="login__title">乌东文旅</text>
    <text class="login__subtitle">衣食住行 · 一站服务</text>

    <input
      v-model="phone"
      class="login__input"
      type="number"
      maxlength="11"
      placeholder="请输入手机号"
    />
    <input v-model="password" class="login__input" password placeholder="请输入密码" />

    <button class="login__btn" :loading="loading" @click="onLogin">登录</button>
    <text class="login__tip">测试账号 13800000001 / abc12345</text>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '@/store/user';

const phone = ref('13800000001');
const password = ref('abc12345');
const loading = ref(false);
const userStore = useUserStore();

async function onLogin() {
  if (!/^1\d{10}$/.test(phone.value)) {
    uni.showToast({ title: '请输入正确手机号', icon: 'none' });
    return;
  }
  loading.value = true;
  try {
    await userStore.login(phone.value, password.value);
    uni.showToast({ title: '登录成功', icon: 'success' });
    setTimeout(() => {
      // 等待期间用户可能已自行跳转，避免误弹回上一页
      const pages = getCurrentPages();
      const current = pages[pages.length - 1];
      if (current && current.route !== 'pages/login/login') return;
      uni.navigateBack({ fail: () => uni.switchTab({ url: '/pages/index/index' }) });
    }, 600);
  } catch {
    // 请求层已统一提示
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login {
  padding: 120rpx 60rpx 0;
  display: flex;
  flex-direction: column;
}
.login__title {
  font-size: 48rpx;
  font-weight: 600;
  color: #e54d42;
  text-align: center;
}
.login__subtitle {
  font-size: 26rpx;
  color: #999;
  text-align: center;
  margin-top: 12rpx;
  margin-bottom: 60rpx;
}
.login__input {
  height: 92rpx;
  border-bottom: 1rpx solid #eee;
  font-size: 30rpx;
  margin-bottom: 20rpx;
}
.login__btn {
  margin-top: 60rpx;
  background: #e54d42;
  color: #fff;
  border-radius: 46rpx;
  font-size: 32rpx;
}
.login__tip {
  margin-top: 30rpx;
  font-size: 24rpx;
  color: #bbb;
  text-align: center;
}
</style>
