import { createPinia } from 'pinia';

const store = createPinia();

export default store;
export { useUserStore } from './user';
export { useCartStore } from './cart';
