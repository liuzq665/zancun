import { defineStore } from 'pinia';
import * as cartApi from '@/api/modules/cart';
import type { CartItem } from '@/api/types';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[],
  }),
  getters: {
    count: (state) => state.items.reduce((n, i) => n + i.quantity, 0),
    checkedItems: (state) => state.items.filter((i) => i.checked === 1),
    checkedAmount: (state) =>
      state.items
        .filter((i) => i.checked === 1)
        .reduce((n, i) => n + (i.price || 0) * i.quantity, 0),
  },
  actions: {
    async load() {
      this.items = await cartApi.list();
      return this.items;
    },
    async add(payload: Parameters<typeof cartApi.add>[0]) {
      await cartApi.add(payload);
      await this.load();
    },
    async update(id: number, patch: { quantity?: number; checked?: 0 | 1 }) {
      await cartApi.update(id, patch);
      await this.load();
    },
    async remove(id: number) {
      await cartApi.remove(id);
      await this.load();
    },
  },
});
