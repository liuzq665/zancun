import type {
  Banner,
  CartItem,
  Goods,
  GoodsCategory,
  Homestay,
  Message,
  Order,
  Post,
  Restaurant,
  Route,
  Scenic,
} from '@/api/types';

// 图片与后端种子同源（Pexels），按内容主题选取，避免 picsum 随机图与内容不符。
// 保留原 img(seed, w, h) 签名，调用处不用改。
const IMG: Record<string, string> = {
  wudong1: 'https://images.pexels.com/photos/6129969/pexels-photo-6129969.jpeg',
  wudong2: 'https://images.pexels.com/photos/16582298/pexels-photo-16582298.jpeg',
  wudong3: 'https://images.pexels.com/photos/31119469/pexels-photo-31119469.jpeg',
  silver: 'https://images.pexels.com/photos/14802898/pexels-photo-14802898.jpeg',
  batik: 'https://images.pexels.com/photos/34583535/pexels-photo-34583535.jpeg',
  embroidery: 'https://images.pexels.com/photos/17881567/pexels-photo-17881567.jpeg',
  restaurant1: 'https://images.pexels.com/photos/33965578/pexels-photo-33965578.png',
  restaurant2: 'https://images.pexels.com/photos/18414268/pexels-photo-18414268.jpeg',
  hotel1: 'https://images.pexels.com/photos/36647675/pexels-photo-36647675.jpeg',
  hotel2: 'https://images.pexels.com/photos/17801941/pexels-photo-17801941.jpeg',
  scenic1: 'https://images.pexels.com/photos/7206100/pexels-photo-7206100.png',
  route1: 'https://images.pexels.com/photos/14036107/pexels-photo-14036107.jpeg',
  route2: 'https://images.pexels.com/photos/8776825/pexels-photo-8776825.jpeg',
  post1: 'https://images.pexels.com/photos/2161540/pexels-photo-2161540.jpeg',
  post2: 'https://images.pexels.com/photos/34161634/pexels-photo-34161634.jpeg',
  post3: 'https://images.pexels.com/photos/34408549/pexels-photo-34408549.jpeg',
  avatar1: 'https://images.pexels.com/photos/7400017/pexels-photo-7400017.jpeg',
  avatar2: 'https://images.pexels.com/photos/9963637/pexels-photo-9963637.jpeg',
  tea: 'https://images.pexels.com/photos/35643789/pexels-photo-35643789.png',
  qr: 'https://images.pexels.com/photos/5642978/pexels-photo-5642978.jpeg',
  upload: 'https://images.pexels.com/photos/17881567/pexels-photo-17881567.jpeg',
  uploadv: 'https://images.pexels.com/photos/34408549/pexels-photo-34408549.jpeg',
};
// 商品图集用 `g{id}-{n}` 动态拼种子，按 id 轮换三张主题图兜底
const GALLERY = [
  'https://images.pexels.com/photos/14802898/pexels-photo-14802898.jpeg',
  'https://images.pexels.com/photos/34583535/pexels-photo-34583535.jpeg',
  'https://images.pexels.com/photos/17881567/pexels-photo-17881567.jpeg',
];
const img = (seed: string, w = 400, h = 400) => {
  const base = IMG[seed] || (seed.startsWith('g') ? GALLERY[Number(seed.replace(/\D/g, '')) % GALLERY.length] : GALLERY[0]);
  return `${base}?auto=compress&cs=tinysrgb&w=${Math.max(w, 400)}&h=${h}&fit=crop`;
};

export const banners: Banner[] = [
  { id: 1, title: '乌东苗寨', imageUrl: img('wudong1', 750, 360) },
  { id: 2, title: '长桌宴', imageUrl: img('wudong2', 750, 360) },
  { id: 3, title: '蜡染刺绣', imageUrl: img('wudong3', 750, 360) },
];

export const goodsCategories: GoodsCategory[] = [
  {
    id: 1,
    name: '银饰',
    children: [
      { id: 11, name: '手镯' },
      { id: 12, name: '项链' },
    ],
  },
  {
    id: 2,
    name: '蜡染',
    children: [
      { id: 21, name: '围巾' },
      { id: 22, name: '桌布' },
    ],
  },
  { id: 3, name: '刺绣', children: [{ id: 31, name: '服饰' }] },
  { id: 4, name: '服饰', children: [] },
  { id: 5, name: '其他', children: [] },
];

export const goodsList: Goods[] = [
  {
    id: 1,
    title: '苗族银饰手镯',
    subtitle: '纯手工锻造',
    mainImage: img('silver'),
    price: 299,
    marketPrice: 399,
    stock: 100,
    sales: 128,
    score: 4.8,
  },
  {
    id: 2,
    title: '蜡染围巾',
    subtitle: '非遗工艺',
    mainImage: img('batik'),
    price: 168,
    marketPrice: 218,
    stock: 60,
    sales: 96,
    score: 4.7,
  },
  {
    id: 3,
    title: '苗绣手提包',
    subtitle: '手工刺绣',
    mainImage: img('embroidery'),
    price: 458,
    marketPrice: 588,
    stock: 20,
    sales: 41,
    score: 4.9,
  },
];

export const goodsDetail = (id: number): Goods => {
  const base = goodsList.find((g) => g.id === id) || goodsList[0];
  return {
    ...base,
    detail: '<p>乌东村非遗手作，由当地匠人纯手工制作。</p>',
    craftIntro: '采用传统锻造工艺，历经数十道工序。',
    inheritorName: '李师傅',
    inheritorStory: '三代传承，坚持手工制作。',
    images: [img(`g${id}-1`), img(`g${id}-2`), img(`g${id}-3`)],
    evaluationCount: 36,
    skus: [
      { id: base.id * 100 + 1, skuName: '中号', price: base.price, stock: 60, image: img(`g${id}-s1`) },
      { id: base.id * 100 + 2, skuName: '大号', price: base.price + 100, stock: 40, image: img(`g${id}-s2`) },
    ],
  };
};

/** 初始购物车为空，加购行为由用户操作产生（E2E 依赖此语义） */
export const cartItems: CartItem[] = [];

export const orders: Order[] = [
  {
    id: 1,
    orderNo: '20260908103000123456',
    orderType: 'goods',
    title: '苗族银饰手镯',
    totalAmount: 299,
    payAmount: 299,
    status: 'PENDING',
    createTime: '2026-09-08 10:30:00',
    items: [
      {
        module: 'goods',
        entityType: 'goods_sku',
        entityId: 101,
        title: '苗族银饰手镯',
        specName: '中号',
        price: 299,
        quantity: 1,
      },
    ],
  },
];

export const messages: Message[] = [
  { id: 1, type: 'order', title: '下单成功', content: '订单 20260908... 待支付', isRead: 0 },
  { id: 2, type: 'system', title: '欢迎来到乌东文旅', content: '完善资料可获得更多推荐', isRead: 1 },
];

export const restaurants: Restaurant[] = [
  {
    id: 1,
    name: '苗家长桌宴',
    mainImage: img('restaurant1', 750, 400),
    address: '乌东村中心广场',
    distance: 1200,
    score: 4.6,
    avgPrice: 80,
  },
  {
    id: 2,
    name: '苗寨酸汤鱼馆',
    mainImage: img('restaurant2', 750, 400),
    address: '乌东村东街 12 号',
    distance: 2100,
    score: 4.4,
    avgPrice: 65,
  },
];

export const restaurantDetail = (id: number): Restaurant => {
  const base = restaurants.find((r) => r.id === id) || restaurants[0];
  return {
    ...base,
    intro: '地道苗族风味，长桌宴可容纳 200 人。',
    businessHours: '11:00-21:00',
    capacity: 200,
    dishes: [
      { id: 1, name: '酸汤鱼', price: 68, isSignature: true },
      { id: 2, name: '苗家腊肉', price: 48, isSignature: true },
    ],
    timeSlots: [
      { id: 1, name: '午餐 11:30-13:30', maxReserve: 50 },
      { id: 2, name: '晚餐 17:30-19:30', maxReserve: 50 },
    ],
  };
};

export const homestays: Homestay[] = [
  {
    id: 1,
    name: '苗寨木楼',
    mainImage: img('hotel1', 750, 400),
    styleTag: '木楼',
    facilityTag: 'WiFi/空调/独立卫浴',
    score: 4.8,
    minPrice: 288,
  },
  {
    id: 2,
    name: '吊脚楼客栈',
    mainImage: img('hotel2', 750, 400),
    styleTag: '吊脚楼',
    facilityTag: 'WiFi/独立卫浴',
    score: 4.5,
    minPrice: 228,
  },
];

export const homestayDetail = (id: number): Homestay => {
  const base = homestays.find((h) => h.id === id) || homestays[0];
  return {
    ...base,
    intro: '坐落于苗寨半山，推窗即见梯田。',
    notice: { checkinTime: '14:00', checkoutTime: '12:00', hasBreakfast: true, deposit: 100 },
    roomTypes: [
      { id: 1, name: '苗族木屋大床房', bedType: '1.8m 大床', area: 28, capacity: 2, price: 288, stock: 5 },
      { id: 2, name: '苗族木屋双床房', bedType: '双床', area: 32, capacity: 2, price: 328, stock: 3 },
    ],
  };
};

export const roomCalendar = (roomTypeId: number, days = 30) => {
  const out = [];
  const now = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(now.getTime() + i * 86400000);
    const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    out.push({ date, stock: i % 7 === 3 ? 0 : 3, price: 288 + (i % 5) * 10 });
  }
  return out;
};

export const scenics: Scenic[] = [
  {
    id: 1,
    name: '乌东苗寨',
    openTime: '08:00-18:00',
    mainImage: img('scenic1', 750, 400),
    ticketTypes: [
      { id: 1, name: '成人票', price: 60, stock: 500 },
      { id: 2, name: '儿童票', price: 30, stock: 200 },
    ],
  },
];

export const routes: Route[] = [
  {
    id: 1,
    title: '乌东苗寨一日游',
    days: 1,
    price: 268,
    includedItems: '门票/午餐/导游',
    mainImage: img('route1', 750, 400),
    plans: [{ day: 1, description: '上午苗寨游览，中午长桌宴，下午梯田徒步', scenic: '乌东苗寨', meal: '长桌宴' }],
  },
  {
    id: 2,
    title: '苗寨两日深度游',
    days: 2,
    price: 598,
    includedItems: '门票/餐饮/住宿/导游',
    mainImage: img('route2', 750, 400),
    plans: [
      { day: 1, description: '苗寨游览 + 蜡染体验', scenic: '乌东苗寨', meal: '长桌宴', hotel: '苗寨木楼' },
      { day: 2, description: '梯田徒步 + 银饰工坊', scenic: '梯田', meal: '农家菜' },
    ],
  },
];

export const posts: Post[] = [
  {
    id: 1,
    title: '乌东苗寨两日游',
    content: '清晨的梯田云海太美了，长桌宴也很热闹……',
    images: [img('post1'), img('post2')],
    likeCount: 20,
    commentCount: 6,
    topicTags: ['苗寨', '梯田'],
    author: { id: 1, nickname: '游客小明', avatar: img('avatar1', 100, 100) },
  },
  {
    id: 2,
    title: '蜡染体验记录',
    content: '跟着阿婆学蜡染，做了一条围巾。',
    images: [img('post3')],
    likeCount: 12,
    commentCount: 3,
    topicTags: ['蜡染'],
    author: { id: 2, nickname: '旅行的小李', avatar: img('avatar2', 100, 100) },
  },
];
