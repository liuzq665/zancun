/**
 * Mock 层：后端未就绪时按《技术文档》第 7 章契约返回数据。
 * 开关：.env 里 VITE_USE_MOCK=true
 */
import * as db from './data';
import type { CartItem, Order } from '@/api/types';

interface MockContext {
  params: Record<string, string>;
  data: any;
}

type MockHandler = (ctx: MockContext) => any;

interface MockRoute {
  method: string;
  reg: RegExp;
  keys: string[];
  handler: MockHandler;
}

const routes: MockRoute[] = [];

function on(method: string, path: string, handler: MockHandler) {
  const keys: string[] = [];
  const reg = new RegExp(
    '^' +
      path.replace(/:([A-Za-z0-9_]+)/g, (_m, key) => {
        keys.push(key);
        return '([^/]+)';
      }) +
      '$',
  );
  routes.push({ method: method.toUpperCase(), reg, keys, handler });
}

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

// ---------- 认证 7.3.1 ----------
on('POST', '/api/auth/sms/send', () => null);

on('POST', '/api/auth/register', ({ data }) => ({
  id: 1,
  username: data?.phone || '13800000001',
}));

on('POST', '/api/auth/login', ({ data }) => {
  if (data?.password === 'wrong') {
    throw { code: 1005, message: '密码错误' };
  }
  return {
    token: 'mock-jwt-token',
    user: {
      id: 1,
      username: data?.phone || '13800000001',
      nickname: '游客小明',
      avatar: 'https://images.pexels.com/photos/7400017/pexels-photo-7400017.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      gender: 1,
    },
  };
});

on('POST', '/api/auth/wechat/login', () => ({
  token: 'mock-jwt-token',
  user: { id: 1, username: 'wx_openid', nickname: '微信用户' },
}));

on('GET', '/api/auth/profile', () => ({
  id: 1,
  username: '13800000001',
  nickname: '游客小明',
  avatar: 'https://images.pexels.com/photos/7400017/pexels-photo-7400017.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
  gender: 1,
  region: '贵州黔东南',
  bio: '爱旅行的苗寨访客',
}));

on('PUT', '/api/auth/profile', () => null);

// ---------- 首页运营 ----------
on('GET', '/api/admin/banner', () => clone(db.banners));

// ---------- 衣 7.4 ----------
on('GET', '/api/goods/category/tree', () => clone(db.goodsCategories));

on('GET', '/api/goods/list', ({ data }) => {
  // mock 数据未挂 categoryId，分类筛选直接返回全部
  const list = clone(db.goodsList);
  const page = Number(data?.page || 1);
  const size = Number(data?.size || 10);
  return { list: list.slice((page - 1) * size, page * size), total: list.length, page, size };
});

on('GET', '/api/goods/search', ({ data }) => {
  const kw = String(data?.keyword || '');
  const list = clone(db.goodsList).filter((g) => !kw || g.title.includes(kw));
  return { list, total: list.length };
});

on('GET', '/api/goods/detail/:id', ({ params }) => db.goodsDetail(Number(params.id)));

on('GET', '/api/goods/evaluation/:goodsId', ({ data }) => ({
  list: [
    { id: 1, score: 5, content: '做工精美，很满意', images: [], nickname: '游客小明' },
    { id: 2, score: 4, content: '物流稍慢，东西不错', images: [] },
  ],
  total: 2,
  page: Number(data?.page || 1),
  size: Number(data?.size || 10),
}));

on('POST', '/api/goods/collect/:goodsId', () => null);
on('POST', '/api/goods/evaluate', () => ({ id: 1 }));
on('POST', '/api/goods/evaluate/append', () => null);

// ---------- 购物车 7.3.4 ----------
let cart = clone(db.cartItems);

on('GET', '/api/cart/list', () => clone(cart));

on('POST', '/api/cart/add', ({ data }) => {
  const exist = cart.find(
    (c) => c.entityType === data.entityType && c.entityId === Number(data.entityId),
  );
  if (exist) exist.quantity += Number(data.quantity || 1);
  else {
    cart.push({
      id: cart.length + 1,
      module: data.module,
      entityType: data.entityType,
      entityId: Number(data.entityId),
      title: data.title,
      specName: data.specName,
      image: data.image,
      price: data.price,
      quantity: Number(data.quantity || 1),
      checked: 1,
    });
  }
  return null;
});

on('PUT', '/api/cart/update/:id', ({ params, data }) => {
  const item = cart.find((c) => c.id === Number(params.id));
  if (!item) throw { code: 3001, message: '购物车项不存在' };
  if (typeof data?.quantity !== 'undefined') item.quantity = Number(data.quantity);
  if (typeof data?.checked !== 'undefined') item.checked = Number(data.checked) as 0 | 1;
  return null;
});

on('DELETE', '/api/cart/remove/:id', ({ params }) => {
  cart = cart.filter((c) => c.id !== Number(params.id));
  return null;
});

// ---------- 订单 7.3.3 ----------
let orders = clone(db.orders);

on('POST', '/api/order/create', ({ data }) => {
  const order: Order = {
    id: orders.length + 1,
    orderNo: String(Date.now()) + '000000',
    orderType: data.orderType,
    title: data.title || data.items?.[0]?.title,
    totalAmount: data.totalAmount,
    payAmount: data.payAmount,
    status: 'PENDING',
    createTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
    items: data.items,
  };
  orders.unshift(order);
  return { id: order.id, orderNo: order.orderNo, status: order.status, payAmount: order.payAmount };
});

on('GET', '/api/order/list', ({ data }) => {
  let list = clone(orders);
  if (data?.status) list = list.filter((o) => o.status === data.status);
  if (data?.orderType) list = list.filter((o) => o.orderType === data.orderType);
  return { list, total: list.length, page: Number(data?.page || 1), size: Number(data?.size || 10) };
});

on('GET', '/api/order/detail/:id', ({ params }) => {
  const order = orders.find((o) => o.id === Number(params.id));
  if (!order) throw { code: 2001, message: '订单不存在' };
  return clone(order);
});

on('POST', '/api/order/cancel/:id', ({ params }) => {
  const order = orders.find((o) => o.id === Number(params.id));
  if (!order) throw { code: 2001, message: '订单不存在' };
  if (order.status !== 'PENDING') throw { code: 2004, message: '仅待支付订单可取消' };
  order.status = 'CANCELED';
  return { id: order.id, status: order.status };
});

on('POST', '/api/order/pay/:orderNo', ({ params }) => {
  const order = orders.find((o) => o.orderNo === params.orderNo);
  if (!order) throw { code: 2001, message: '订单不存在' };
  if (order.status !== 'PENDING') throw { code: 2002, message: '订单状态不可支付' };
  order.status = 'PAID';
  return { status: 'SUCCESS', orderStatus: 'PAID' };
});

on('POST', '/api/order/confirm/:id', ({ params }) => {
  const order = orders.find((o) => o.id === Number(params.id));
  if (!order) throw { code: 2001, message: '订单不存在' };
  order.status = 'FINISHED';
  return { id: order.id, status: order.status };
});

on('POST', '/api/order/refund/:id', ({ params }) => {
  const order = orders.find((o) => o.id === Number(params.id));
  if (!order) throw { code: 2001, message: '订单不存在' };
  order.status = 'REFUNDED';
  return { id: order.id, status: order.status };
});

// ---------- 食 7.5 ----------
on('GET', '/api/food/restaurant/list', ({ data }) => ({
  list: clone(db.restaurants),
  total: db.restaurants.length,
  page: Number(data?.page || 1),
  size: Number(data?.size || 10),
}));

on('GET', '/api/food/restaurant/detail/:id', ({ params }) =>
  db.restaurantDetail(Number(params.id)),
);

on('POST', '/api/food/reserve', ({ data }) => {
  const order: Order = {
    id: orders.length + 1,
    orderNo: String(Date.now()) + '000001',
    orderType: 'food_seat',
    title: '餐位预订',
    totalAmount: 0,
    payAmount: 0,
    status: 'PENDING',
  };
  orders.unshift(order);
  return { id: order.id, orderNo: order.orderNo, status: order.status };
});

on('GET', '/api/food/product/list', ({ data }) => ({
  list: [
    { id: 1, name: '雷山银球茶', price: 128, spec: '250g', stock: 50, origin: '贵州雷山', mainImage: 'https://images.pexels.com/photos/35643789/pexels-photo-35643789.png?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
    { id: 2, name: '苗家腊肉', price: 88, spec: '500g', stock: 30, origin: '贵州雷山', mainImage: 'https://images.pexels.com/photos/19688911/pexels-photo-19688911.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' },
  ],
  total: 2,
  page: Number(data?.page || 1),
  size: Number(data?.size || 10),
}));

on('GET', '/api/food/product/detail/:id', ({ params }) => ({
  id: Number(params.id),
  name: '雷山银球茶',
  price: 128,
  spec: '250g',
  stock: 50,
  origin: '贵州雷山',
  shelfLife: '18 个月',
  mainImage: 'https://images.pexels.com/photos/35643789/pexels-photo-35643789.png?auto=compress&cs=tinysrgb&w=750&h=750&fit=crop',
}));

// ---------- 住 7.6 ----------
on('GET', '/api/hotel/list', ({ data }) => ({
  list: clone(db.homestays),
  total: db.homestays.length,
  page: Number(data?.page || 1),
  size: Number(data?.size || 10),
}));

on('GET', '/api/hotel/detail/:id', ({ params }) => db.homestayDetail(Number(params.id)));

on('GET', '/api/hotel/calendar/:roomTypeId', ({ params, data }) =>
  db.roomCalendar(Number(params.roomTypeId), Number(data?.days || 30)),
);

on('POST', '/api/hotel/reserve', ({ data }) => {
  const order: Order = {
    id: orders.length + 1,
    orderNo: String(Date.now()) + '000002',
    orderType: 'hotel',
    title: '民宿预订',
    totalAmount: 0,
    payAmount: 0,
    status: 'PENDING',
  };
  orders.unshift(order);
  return { id: order.id, orderNo: order.orderNo, status: order.status };
});

// ---------- 行 7.7 ----------
on('GET', '/api/travel/scenic/list', ({ data }) => ({
  list: clone(db.scenics),
  total: db.scenics.length,
  page: Number(data?.page || 1),
  size: Number(data?.size || 10),
}));

on('GET', '/api/travel/scenic/detail/:id', ({ params }) => clone(db.scenics[0]));

on('GET', '/api/travel/route/list', ({ data }) => ({
  list: clone(db.routes),
  total: db.routes.length,
  page: Number(data?.page || 1),
  size: Number(data?.size || 10),
}));

on('GET', '/api/travel/route/detail/:id', ({ params }) =>
  clone(db.routes.find((r) => r.id === Number(params.id)) || db.routes[0]),
);

on('GET', '/api/travel/eticket/:orderId', ({ params }) => ({
  orderId: Number(params.orderId),
  qrCode: 'https://images.pexels.com/photos/5642978/pexels-photo-5642978.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
  validDate: '2026-09-20',
  status: 'UNUSED',
}));

// ---------- 社区 7.8 ----------
on('GET', '/api/community/feed', ({ data }) => ({
  list: clone(db.posts),
  total: db.posts.length,
  page: Number(data?.page || 1),
  size: Number(data?.size || 10),
}));

on('GET', '/api/community/post/:id', ({ params }) =>
  clone(db.posts.find((p) => p.id === Number(params.id)) || db.posts[0]),
);

on('POST', '/api/community/post', () => ({ id: 1, status: 'NORMAL' }));
on('POST', '/api/community/like/:targetType/:id', () => ({ liked: true, likeCount: 21 }));
on('POST', '/api/community/comment', () => null);
on('POST', '/api/community/follow/:userId', () => null);
on('POST', '/api/community/collect/:postId', () => null);
on('POST', '/api/community/report', () => null);

// ---------- 上传 / 消息 7.3.5 ----------
on('POST', '/api/upload/image', () => ({
  url: 'https://images.pexels.com/photos/17881567/pexels-photo-17881567.jpeg?auto=compress&cs=tinysrgb&w=750&h=750&fit=crop',
}));
on('POST', '/api/upload/video', () => ({
  url: 'https://images.pexels.com/photos/34408549/pexels-photo-34408549.jpeg?auto=compress&cs=tinysrgb&w=750&h=750&fit=crop',
}));

on('GET', '/api/message/list', ({ data }) => ({
  list: clone(db.messages),
  total: db.messages.length,
  page: Number(data?.page || 1),
  size: Number(data?.size || 10),
}));

on('PUT', '/api/message/read/:id', () => null);

// ---------- 我的收藏（聚合，端点待补进接口文档） ----------
on('GET', '/api/mine/collect', ({ data }) => {
  const type = data?.type || 'goods';
  if (type === 'hotel') return clone(db.homestays);
  if (type === 'post') return clone(db.posts);
  return clone(db.goodsList);
});

// ---------- 地址 7.3.6 ----------
let addresses = [
  {
    id: 1,
    receiverName: '张三',
    receiverPhone: '13800000001',
    province: '贵州省',
    city: '黔东南州',
    district: '雷山县',
    detail: '乌东村',
    isDefault: 1,
  },
];

on('GET', '/api/address/list', () => clone(addresses));

on('POST', '/api/address/add', ({ data }) => {
  const item = { id: addresses.length + 1, isDefault: 0, ...data };
  if (item.isDefault) addresses.forEach((a) => (a.isDefault = 0));
  addresses.push(item);
  return item;
});

on('PUT', '/api/address/update/:id', ({ params, data }) => {
  const item = addresses.find((a) => a.id === Number(params.id));
  if (!item) throw { code: 3001, message: '地址不存在' };
  Object.assign(item, data);
  return null;
});

on('DELETE', '/api/address/remove/:id', ({ params }) => {
  addresses = addresses.filter((a) => a.id !== Number(params.id));
  return null;
});

on('PUT', '/api/address/default/:id', ({ params }) => {
  addresses.forEach((a) => (a.isDefault = a.id === Number(params.id) ? 1 : 0));
  return null;
});

export function mockRequest<T>(opts: {
  url: string;
  method: string;
  data?: any;
  auth?: boolean;
  silent?: boolean;
}): Promise<T> {
  const { url, method, data } = opts;
  const hit = routes.find((r) => r.method === method.toUpperCase() && r.reg.test(url));

  return new Promise<T>((resolve, reject) => {
    setTimeout(() => {
      if (!hit) {
        reject({ code: 404, message: `[mock] 未匹配接口 ${method} ${url}` });
        return;
      }
      const matched = hit.reg.exec(url) || [];
      const params: Record<string, string> = {};
      hit.keys.forEach((key, i) => {
        params[key] = decodeURIComponent(matched[i + 1]);
      });
      try {
        resolve(hit.handler({ params, data }) as T);
      } catch (err) {
        reject(err);
      }
    }, 120);
  });
}
