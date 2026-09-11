import { defineStore } from 'pinia';
import * as authApi from '@/api/modules/auth';
import type { User } from '@/api/types';
import { getToken, setToken, clearToken } from '@/utils/auth';

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken(),
    profile: null as User | null,
  }),
  getters: {
    isLogin: (state) => !!state.token,
    nickname: (state) => state.profile?.nickname || '未登录',
  },
  actions: {
    async login(phone: string, password: string) {
      const res = await authApi.login({ phone, password });
      this.token = res.token;
      this.profile = res.user;
      setToken(res.token);
      return res;
    },
    async loadProfile() {
      this.profile = await authApi.getProfile();
      return this.profile;
    },
    logout() {
      this.token = '';
      this.profile = null;
      clearToken();
    },
  },
});
