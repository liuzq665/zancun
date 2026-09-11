import { json, toYuan } from './helper';

/**
 * 实体 → 小程序端期望结构 的映射。
 *
 * 两端命名/单位本就不同，这里集中转换：
 * - 实体用 name / coverImage / salesCount，小程序用 title / mainImage / sales
 * - 实体金额是「分」，小程序是「元」
 * - 实体 JSON 字段以 text 存储，需还原
 *
 * 标注「合成」的字段是因为后端暂无对应表（详见技术文档对比结论），
 * 由现有字段推导而来，保证小程序页面可用；接入真实数据后应替换。
 */

const joinTags = (raw: any, sep = '/'): string | undefined => {
  const arr = json<string[]>(raw, []);
  return arr.length ? arr.join(sep) : undefined;
};

// ===== 衣：商品 =====

export const toGoods = (p: any) => ({
  id: p.id,
  title: p.name,
  subtitle: p.heritageDesc || undefined,
  mainImage: p.coverImage,
  price: toYuan(p.price),
  marketPrice: toYuan(p.originalPrice),
  stock: p.stock,
  sales: p.salesCount,
});

export const toGoodsDetail = (p: any) => ({
  ...toGoods(p),
  detail: p.detail,
  craftIntro: p.heritageDesc,
  images: json<string[]>(p.images, []),
  // 后端暂无 SKU 表 / 评价表：合成单一规格，使详情页 SKU 选择器可正常工作
  skus: [
    {
      id: p.id,
      skuName: p.unit || '默认',
      price: toYuan(p.price),
      stock: p.stock,
      image: p.coverImage,
    },
  ],
});

// ===== 住：民宿 =====

export const toHomestay = (h: any) => ({
  id: h.id,
  name: h.name,
  mainImage: h.coverImage,
  styleTag: h.hotelType,
  facilityTag: joinTags(h.facilities),
  score: h.rating,
  minPrice: toYuan(h.minPrice),
});

export const toHomestayDetail = (h: any, rooms: any[]) => ({
  ...toHomestay(h),
  intro: h.description,
  notice: {
    checkinTime: h.checkInTime,
    checkoutTime: h.checkOutTime,
  },
  roomTypes: (rooms || []).map((r: any) => ({
    id: r.id,
    name: r.name,
    bedType: r.bedType,
    area: r.area,
    capacity: r.capacity,
    price: toYuan(r.price),
    stock: r.stock,
  })),
});

// ===== 行：景区 / 路线 =====

export const toScenic = (s: any) => ({
  id: s.id,
  name: s.name,
  openTime: s.openTime,
  mainImage: s.coverImage,
});

export const toScenicDetail = (s: any) => ({
  ...toScenic(s),
  // 后端暂无票种表（只有 ticketPrice 标量）：合成单一「成人票」以支撑票种选择
  ticketTypes: [
    {
      id: s.id,
      name: '成人票',
      price: toYuan(s.ticketPrice),
      stock: undefined,
    },
  ],
});

const itineraryDays = (raw: any): number => {
  const arr = json<any[]>(raw, []);
  return arr.length || 1;
};

export const toRoute = (r: any) => ({
  id: r.id,
  title: r.name,
  days: itineraryDays(r.itinerary),
  price: toYuan(r.price),
  includedItems: joinTags(r.includes),
  mainImage: r.coverImage,
});

export const toRouteDetail = (r: any) => ({
  ...toRoute(r),
  plans: json<any[]>(r.itinerary, []).map((p: any, i: number) => ({
    day: p.day ?? i + 1,
    description: p.description,
    scenic: p.scenic,
    meal: p.meal,
    hotel: p.hotel,
    traffic: p.traffic,
  })),
});

// ===== 食：餐厅 =====

export const toRestaurant = (r: any) => ({
  id: r.id,
  name: r.name,
  mainImage: r.coverImage,
  address: r.address,
  score: r.rating,
  avgPrice: toYuan(r.avgPrice),
});

export const toRestaurantDetail = (r: any, dishes: any[]) => ({
  ...toRestaurant(r),
  intro: r.description,
  businessHours: r.businessHours,
  capacity: undefined,
  dishes: (dishes || []).map((d: any) => ({
    id: d.id,
    name: d.name,
    price: toYuan(d.price),
  })),
  // 后端暂无餐位时段表
  timeSlots: [],
});

// ===== 社区：帖子 =====

export const toPost = (p: any) => ({
  id: p.id,
  content: p.content,
  images: json<string[]>(p.images, []),
  videoUrl: p.video || undefined,
  likeCount: p.likeCount,
  commentCount: p.commentCount,
  topicTags: json<string[]>(p.tags, []),
  location: p.location || undefined,
  author: p.user
    ? { id: p.user.id, nickname: p.user.nickname, avatar: p.user.avatar }
    : undefined,
});

// ===== 订单模型映射 =====

/**
 * 小程序（=文档 §4.7.1）用 8 态字符串，实体只用 0-4 整型。
 * CONFIRMED / IN_PROGRESS / REFUND_PENDING 三个中间态后端暂未落地，
 * 读取时折叠到最接近的实体状态（见技术文档对比结论：需 base_order 统一订单中心）。
 */
const ORDER_STATUS_DB_TO_API: Record<number, string> = {
  0: 'CANCELED',
  1: 'PENDING',
  2: 'PAID',
  3: 'FINISHED',
  4: 'REFUNDED',
};

export const ORDER_STATUS_API_TO_DB: Record<string, number> = {
  PENDING: 1,
  PAID: 2,
  FINISHED: 3,
  CANCELED: 0,
  REFUNDED: 4,
  // 中间态无对应实体值，折叠处理
  CONFIRMED: 2,
  IN_PROGRESS: 2,
  REFUND_PENDING: 1,
};

/** 小程序的 orderType（文档 §4.7.2）→ 实体 orderType（后者按资源类型取价） */
export const ORDER_TYPE_API_TO_DB: Record<string, string> = {
  goods: 'product',
  food_seat: 'food_seat',
  hotel: 'hotel',
  ticket: 'ticket',
  route: 'route',
};

const ORDER_TYPE_DB_TO_API: Record<string, string> = {
  product: 'goods',
  food_seat: 'food_seat',
  hotel: 'hotel',
  ticket: 'ticket',
  route: 'route',
};

export const toApiOrder = (o: any) => ({
  id: o.id,
  orderNo: o.orderNo,
  orderType: ORDER_TYPE_DB_TO_API[o.orderType] || o.orderType,
  title: o.relatedName || undefined,
  totalAmount: toYuan(o.totalPrice),
  freightAmount: 0,
  payAmount: toYuan(o.totalPrice),
  status: ORDER_STATUS_DB_TO_API[o.orderStatus] || String(o.orderStatus),
  refundAmount: 0,
  createTime: o.createTime,
  payTime: o.payTime || undefined,
});
