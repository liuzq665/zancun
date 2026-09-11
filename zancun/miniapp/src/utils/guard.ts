import { getToken } from './auth';

/** 需要登录的操作统一调用；未登录时提示并跳登录页 */
export function requireLogin(): boolean {
  if (getToken()) return true;
  uni.showToast({ title: '请先登录', icon: 'none' });
  setTimeout(() => {
    uni.navigateTo({ url: '/pages/login/login' });
  }, 400);
  return false;
}
