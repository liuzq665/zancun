<template>
  <view class="address">
    <wd-loading v-if="loading && !list.length" />
    <wd-empty v-else-if="!list.length" text="还没有收货地址" />

    <view v-else class="list">
      <view v-for="a in list" :key="a.id" class="card" @click="onPick(a)">
        <view class="card__body">
          <view class="card__head">
            <text class="card__name">{{ a.receiverName }}</text>
            <text class="card__phone">{{ a.receiverPhone }}</text>
            <text v-if="a.isDefault" class="card__default">默认</text>
          </view>
          <text class="card__detail">
            {{ a.province }}{{ a.city }}{{ a.district }}{{ a.detail }}
          </text>
        </view>
        <view class="card__actions">
          <text class="action" @click.stop="edit(a)">编辑</text>
          <text class="action" @click.stop="remove(a)">删除</text>
        </view>
      </view>
    </view>

    <view class="footer">
      <view class="footer__btn" @click="openForm()">＋ 新增地址</view>
    </view>

    <view v-if="showForm" class="mask" @click="showForm = false">
      <view class="sheet" @click.stop>
        <text class="sheet__title">{{ form.id ? '编辑地址' : '新增地址' }}</text>
        <input v-model="form.receiverName" class="sheet__input" placeholder="收货人" />
        <input v-model="form.receiverPhone" class="sheet__input" type="number" maxlength="11" placeholder="手机号" />
        <input v-model="form.province" class="sheet__input" placeholder="省" />
        <input v-model="form.city" class="sheet__input" placeholder="市" />
        <input v-model="form.district" class="sheet__input" placeholder="区/县" />
        <input v-model="form.detail" class="sheet__input" placeholder="详细地址" />
        <view class="sheet__row" @click="form.isDefault = form.isDefault ? 0 : 1">
          <text class="sheet__label">设为默认地址</text>
          <text :class="['check', form.isDefault ? 'check--on' : '']">{{ form.isDefault ? '✓' : '' }}</text>
        </view>
        <view class="sheet__btn" @click="save">保存</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import * as addressApi from '@/api/modules/address';
import { requireLogin } from '@/utils/guard';
import type { Address } from '@/api/types';

const list = ref<Address[]>([]);
const loading = ref(false);
const showForm = ref(false);
const selectMode = ref(false);

const emptyForm = () => ({
  id: 0,
  receiverName: '',
  receiverPhone: '',
  province: '贵州省',
  city: '黔东南州',
  district: '雷山县',
  detail: '',
  isDefault: 0 as 0 | 1,
});

const form = reactive(emptyForm());

async function load() {
  if (!requireLogin()) return;
  loading.value = true;
  try {
    list.value = await addressApi.list();
  } finally {
    loading.value = false;
  }
}

function openForm(a?: Address) {
  Object.assign(form, a ? { ...a } : emptyForm());
  showForm.value = true;
}

function edit(a: Address) {
  openForm(a);
}

function save() {
  if (!form.receiverName.trim()) return uni.showToast({ title: '请填写收货人', icon: 'none' });
  if (!/^1\d{10}$/.test(form.receiverPhone)) {
    return uni.showToast({ title: '请填写正确手机号', icon: 'none' });
  }
  if (!form.detail.trim()) return uni.showToast({ title: '请填写详细地址', icon: 'none' });

  const payload = {
    receiverName: form.receiverName.trim(),
    receiverPhone: form.receiverPhone,
    province: form.province,
    city: form.city,
    district: form.district,
    detail: form.detail.trim(),
    isDefault: form.isDefault,
  };

  const done = async () => {
    showForm.value = false;
    await load();
  };

  if (form.id) addressApi.update(form.id, payload).then(done);
  else addressApi.add(payload).then(done);
}

function remove(a: Address) {
  uni.showModal({
    title: '提示',
    content: '确定删除该地址吗？',
    success: async (res) => {
      if (res.confirm) {
        await addressApi.remove(a.id);
        load();
      }
    },
  });
}

async function onPick(a: Address) {
  if (!selectMode.value) return;
  if (a.isDefault !== 1) await addressApi.setDefault(a.id);
  uni.navigateBack();
}

onLoad((options) => {
  selectMode.value = options?.select === '1';
  load();
});
</script>

<style scoped>
.address {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 140rpx;
}
.list {
  padding: 20rpx;
}
.card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}
.card__body {
  flex: 1;
}
.card__head {
  display: flex;
  align-items: center;
}
.card__name {
  font-size: 30rpx;
  color: #333;
  font-weight: 600;
}
.card__phone {
  font-size: 26rpx;
  color: #666;
  margin-left: 20rpx;
}
.card__default {
  font-size: 20rpx;
  color: #e54d42;
  border: 1rpx solid #e54d42;
  border-radius: 6rpx;
  padding: 2rpx 10rpx;
  margin-left: 16rpx;
}
.card__detail {
  display: block;
  font-size: 26rpx;
  color: #666;
  margin-top: 12rpx;
}
.card__actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.action {
  font-size: 24rpx;
  color: #999;
  padding: 8rpx 0;
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
.mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
}
.sheet {
  width: 100%;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 30rpx 24rpx 40rpx;
}
.sheet__title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin-bottom: 20rpx;
}
.sheet__input {
  height: 88rpx;
  border-bottom: 1rpx solid #f5f5f5;
  font-size: 28rpx;
}
.sheet__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 88rpx;
}
.sheet__label {
  font-size: 28rpx;
  color: #333;
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
.sheet__btn {
  margin-top: 30rpx;
  height: 84rpx;
  line-height: 84rpx;
  text-align: center;
  background: #e54d42;
  color: #fff;
  border-radius: 42rpx;
  font-size: 30rpx;
}
</style>
