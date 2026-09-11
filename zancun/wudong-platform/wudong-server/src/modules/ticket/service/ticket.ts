import { Inject, Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { AppScenicEntity, AppRouteEntity, AppOrderEntity } from '../entity/ticket';
import { AppProductEntity } from '../../product/entity/product';
import { AppRoomEntity } from '../../hotel/entity/hotel';
import { AppTableEntity, AppDishEntity } from '../../restaurant/entity/restaurant';
import { MessageService } from '../../message/service/message';

/**
 * 订单状态。实体用整型存储，这里给出与文档 §4.7.1 语义对应的命名，
 * 避免继续在代码里散落 0/1/2 魔法数字。
 * （文档的 8 态含 CONFIRMED/IN_PROGRESS/REFUND_PENDING，需 base_order 统一订单中心，
 *   本次不重建，见技术文档对比结论。）
 */
export enum OrderStatus {
  CANCELED = 0,
  PENDING = 1,
  PAID = 2,
  COMPLETED = 3,
  REFUNDED = 4,
}

@Provide()
export class AppTicketService {
  @InjectEntityModel(AppScenicEntity)
  scenicRepo: Repository<AppScenicEntity>;

  @InjectEntityModel(AppRouteEntity)
  routeRepo: Repository<AppRouteEntity>;

  @InjectEntityModel(AppOrderEntity)
  orderRepo: Repository<AppOrderEntity>;

  @InjectEntityModel(AppProductEntity)
  productRepo: Repository<AppProductEntity>;

  @InjectEntityModel(AppRoomEntity)
  roomRepo: Repository<AppRoomEntity>;

  @InjectEntityModel(AppTableEntity)
  tableRepo: Repository<AppTableEntity>;

  @InjectEntityModel(AppDishEntity)
  dishRepo: Repository<AppDishEntity>;

  @Inject()
  messageService: MessageService;

  // ===== 景区管理 =====

  async getScenicList(params: {
    keyword?: string;
    page?: number;
    pageSize?: number;
    isRecommend?: number;
    scenicType?: string;
  }) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;

    const where: any = { status: 1 };
    if (params.keyword) {
      where.name = Like(`%${params.keyword}%`);
    }
    if (params.isRecommend !== undefined) {
      where.isRecommend = params.isRecommend;
    }
    if (params.scenicType) {
      where.scenicType = params.scenicType;
    }

    const [list, total] = await this.scenicRepo.findAndCount({
      where,
      order: { id: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      code: 0,
      data: {
        list: list.map((item: any) => ({
          ...item,
          images: item.images ? JSON.parse(item.images) : [],
          tags: item.tags ? JSON.parse(item.tags) : [],
        })),
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    };
  }

  async getScenicDetail(id: number) {
    const scenic = await this.scenicRepo.findOne({ where: { id } });

    if (!scenic) {
      return { code: 40401, message: '景区不存在' };
    }

    return {
      code: 0,
      data: {
        ...scenic,
        images: scenic.images ? JSON.parse(scenic.images) : [],
        tags: scenic.tags ? JSON.parse(scenic.tags) : [],
      },
    };
  }

  async createScenic(data: {
    name: string;
    description?: string;
    coverImage?: string;
    images?: string[];
    address?: string;
    longitude?: number;
    latitude?: number;
    phone?: string;
    openTime?: string;
    suggestedDuration?: string;
    scenicType?: string;
    tags?: string[];
    ticketPrice?: number;
    isRecommend?: number;
  }) {
    const scenic = this.scenicRepo.create({
      ...data,
      images: data.images ? JSON.stringify(data.images) : null,
      tags: data.tags ? JSON.stringify(data.tags) : null,
    });
    const result = await this.scenicRepo.save(scenic);
    return { code: 0, data: result };
  }

  // ===== 路线管理 =====

  async getRouteList(params: {
    keyword?: string;
    page?: number;
    pageSize?: number;
    isRecommend?: number;
    scenicId?: number;
    routeType?: string;
  }) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;

    const where: any = { status: 1 };
    if (params.keyword) {
      where.name = Like(`%${params.keyword}%`);
    }
    if (params.isRecommend !== undefined) {
      where.isRecommend = params.isRecommend;
    }
    if (params.scenicId) {
      where.scenicId = params.scenicId;
    }
    if (params.routeType) {
      where.routeType = params.routeType;
    }

    const [list, total] = await this.routeRepo.findAndCount({
      where,
      relations: ['scenic'],
      order: { id: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      code: 0,
      data: {
        list: list.map((item: any) => ({
          ...item,
          spots: item.spots ? JSON.parse(item.spots) : [],
          itinerary: item.itinerary ? JSON.parse(item.itinerary) : [],
          includes: item.includes ? JSON.parse(item.includes) : [],
        })),
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    };
  }

  async getRouteDetail(id: number) {
    const route = await this.routeRepo.findOne({
      where: { id },
      relations: ['scenic'],
    });

    if (!route) {
      return { code: 40401, message: '路线不存在' };
    }

    return {
      code: 0,
      data: {
        ...route,
        spots: route.spots ? JSON.parse(route.spots) : [],
        itinerary: route.itinerary ? JSON.parse(route.itinerary) : [],
        includes: route.includes ? JSON.parse(route.includes) : [],
      },
    };
  }

  async createRoute(data: {
    name: string;
    description?: string;
    coverImage?: string;
    routeType?: string;
    price: number;
    originalPrice?: number;
    scenicId?: number;
    spots?: string[];
    itinerary?: any[];
    includes?: string[];
    tips?: string;
    meetingPoint?: string;
    meetingTime?: string;
    minPeople?: number;
    maxPeople?: number;
    isRecommend?: number;
  }) {
    const route = this.routeRepo.create({
      ...data,
      spots: data.spots ? JSON.stringify(data.spots) : null,
      itinerary: data.itinerary ? JSON.stringify(data.itinerary) : null,
      includes: data.includes ? JSON.stringify(data.includes) : null,
    });
    const result = await this.routeRepo.save(route);
    return { code: 0, data: result };
  }

  async getRecommendRoutes(limit: number = 6) {
    const list = await this.routeRepo.find({
      where: { status: 1, isRecommend: 1 },
      relations: ['scenic'],
      order: { id: 'DESC' },
      take: limit,
    });

    return {
      code: 0,
      data: list.map((item: any) => ({
        ...item,
        spots: item.spots ? JSON.parse(item.spots) : [],
        itinerary: item.itinerary ? JSON.parse(item.itinerary) : [],
        includes: item.includes ? JSON.parse(item.includes) : [],
      })),
    };
  }

  // ===== 订单管理 =====

  /**
   * bookDate / endDate 是 MySQL date 列，但前端日期控件会传 ISO datatime
   * （如 2026-09-30T16:00:00.000Z），直接入库会报 Incorrect date value。
   * 这里统一裁成 YYYY-MM-DD。
   */
  private toDateOnly(v: any): any {
    if (!v) return v;
    if (typeof v === 'string') {
      const m = v.match(/^\d{4}-\d{2}-\d{2}/);
      if (m) {
        // 纯日期串直接返回，避免时区偏移
        if (v.length === 10) return v;
        const d = new Date(v);
        if (isNaN(d.getTime())) return null;
        const p = (n: number) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
      }
      return null;
    }
    const d = v instanceof Date ? v : new Date(v);
    if (isNaN(d.getTime())) return null;
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }

  /** 按订单类型取服务端权威价（ADR-5）；返回 null 表示关联资源不存在 */
  private async resolveServerPrice(orderType: string, relatedId: number) {
    if (orderType === 'route') {
      const r = await this.routeRepo.findOne({ where: { id: relatedId } });
      return r ? { price: r.price, name: r.name } : null;
    }
    if (orderType === 'product') {
      const p = await this.productRepo.findOne({ where: { id: relatedId } });
      return p ? { price: p.price, name: p.name } : null;
    }
    if (orderType === 'ticket' || orderType === 'scenic') {
      const s = await this.scenicRepo.findOne({ where: { id: relatedId } });
      return s ? { price: s.ticketPrice, name: s.name } : null;
    }
    if (orderType === 'hotel') {
      const r = await this.roomRepo.findOne({ where: { id: relatedId } });
      return r ? { price: r.price, name: r.name } : null;
    }
    if (orderType === 'food_seat') {
      // 餐位预订本质是「预约到店消费」，餐位本身不计费；
      // 若有预点菜，则由菜品价格决定订单金额（见 createOrder 的 dishIds 分支）
      return { price: 0, name: '餐位预订' };
    }
    return null;
  }

  /**
   * 按菜品 id 汇总价格（服务端权威取价，客户端只传 id 不传价）。
   * 返回 null 表示有菜品不存在。
   */
  private async sumDishPrices(dishIds: number[]) {
    const ids = (dishIds || []).map(Number).filter((n) => Number.isFinite(n));
    if (!ids.length) return null;

    const dishes = await this.dishRepo.find({ where: { id: In(ids) } as any });
    if (dishes.length !== new Set(ids).size) return null; // 有 id 查不到

    return {
      total: dishes.reduce((sum, d) => sum + (d.price || 0), 0),
      names: dishes.map((d) => d.name),
    };
  }

  /**
   * 条件更新扣库存（文档 §5.8.4 的 DB 侧兜底，暂未引入 Redis）。
   * 影响行数为 0 即库存不足。门票暂无按日库存表（travel_ticket_calendar 未实现），跳过不扣。
   */
  private async deductStock(manager: any, orderType: string, relatedId: number, qty: number) {
    if (orderType === 'product') {
      const r = await manager.query(
        'UPDATE app_product SET stock = stock - ? WHERE id = ? AND stock >= ?',
        [qty, relatedId, qty]
      );
      return (r?.affectedRows ?? 0) > 0;
    }
    if (orderType === 'route') {
      // 路线无 stock 列，用「已报名人数 + 成团上限」做条件更新
      const r = await manager.query(
        'UPDATE app_route SET enrolledCount = enrolledCount + ? WHERE id = ? AND (maxPeople - enrolledCount) >= ?',
        [qty, relatedId, qty]
      );
      return (r?.affectedRows ?? 0) > 0;
    }
    if (orderType === 'hotel') {
      const r = await manager.query(
        'UPDATE app_room SET stock = stock - ? WHERE id = ? AND stock >= ?',
        [qty, relatedId, qty]
      );
      return (r?.affectedRows ?? 0) > 0;
    }
    // 餐位（app_table）非库存制，门票无按日库存表，均跳过扣减
    return true;
  }

  /** 取消订单时回补库存 */
  private async restock(manager: any, orderType: string, relatedId: number, qty: number) {
    if (orderType === 'product') {
      await manager.query('UPDATE app_product SET stock = stock + ? WHERE id = ?', [qty, relatedId]);
    } else if (orderType === 'route') {
      await manager.query(
        'UPDATE app_route SET enrolledCount = GREATEST(enrolledCount - ?, 0) WHERE id = ?',
        [qty, relatedId]
      );
    } else if (orderType === 'hotel') {
      await manager.query('UPDATE app_room SET stock = stock + ? WHERE id = ?', [qty, relatedId]);
    }
  }

  async createOrder(data: {
    userId: number;
    orderType: string;
    relatedId: number;
    relatedName?: string;
    quantity?: number;
    unitPrice?: number;
    totalPrice?: number;
    bookDate?: Date;
    endDate?: Date;
    contactName?: string;
    contactPhone?: string;
    remark?: string;
    dishIds?: number[];
  }) {
    let quantity = Math.max(1, Number(data.quantity) || 1);

    // 1. 服务端权威取价（ADR-5）：客户端金额只用于比对，不作为计价依据
    const resolved = await this.resolveServerPrice(data.orderType, Number(data.relatedId));
    if (!resolved) {
      return { code: 2001, message: '订单关联的资源不存在' };
    }

    let serverUnitPrice = resolved.price;
    let relatedName = resolved.name || data.relatedName;

    // 餐位预订 + 预点菜：金额由菜品决定（服务端按 dishId 查价求和，客户端不传价）
    if (data.orderType === 'food_seat' && data.dishIds && data.dishIds.length) {
      const dishSum = await this.sumDishPrices(data.dishIds);
      if (!dishSum) {
        return { code: 2001, message: '预点菜品不存在，请重新选择' };
      }
      // 金额按「整单」记：unitPrice = 菜品合计，quantity 固定为 1
      serverUnitPrice = dishSum.total;
      quantity = 1;
      relatedName = `餐位预订（${dishSum.names.join('、')}）`;
    }

    const serverTotalPrice = serverUnitPrice * quantity;

    if (
      (data.unitPrice !== undefined && Number(data.unitPrice) !== serverUnitPrice) ||
      (data.totalPrice !== undefined && Number(data.totalPrice) !== serverTotalPrice)
    ) {
      return { code: 2003, message: '价格已变更，请刷新后重试' };
    }

    // 2. 建订单 + 扣库存同一事务，任一失败整体回滚
    try {
      return await this.orderRepo.manager.transaction(async (manager: any) => {
        const deducted = await this.deductStock(manager, data.orderType, Number(data.relatedId), quantity);
        if (!deducted) throw new Error('STOCK_SHORTAGE');

        const order = manager.create(AppOrderEntity, {
          orderNo: `WD${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
          userId: data.userId,
          orderType: data.orderType,
          relatedId: Number(data.relatedId),
          relatedName,
          quantity,
          unitPrice: serverUnitPrice, // 服务端价快照
          totalPrice: serverTotalPrice,
          bookDate: this.toDateOnly(data.bookDate),
          endDate: this.toDateOnly(data.endDate),
          contactName: data.contactName,
          contactPhone: data.contactPhone,
          remark: data.remark,
          orderStatus: OrderStatus.PENDING,
        });
        const saved = await manager.save(order);
        return { code: 0, data: saved };
      }).then(async (result: any) => {
        // 站内信放在 service 里，/app/* 与 /api/* 两条入口都会触发（不再各自写一遍）
        if (result.code === 0) {
          await this.messageService.notify(
            data.userId,
            'order',
            '下单成功',
            `订单 ${result.data.orderNo} 待支付`
          );
        }
        return result;
      });
    } catch (err: any) {
      if (err?.message === 'STOCK_SHORTAGE') {
        return { code: 40001, message: '库存不足' };
      }
      throw err;
    }
  }

  async getOrderList(params: {
    userId: number;
    orderType?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;

    const where: any = { userId: params.userId };
    if (params.orderType) {
      where.orderType = params.orderType;
    }

    const [list, total] = await this.orderRepo.findAndCount({
      where,
      order: { id: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      code: 0,
      data: {
        list,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    };
  }

  async getOrderDetail(id: number, userId: number) {
    const order = await this.orderRepo.findOne({
      where: { id, userId } as any,
    });

    if (!order) {
      return { code: 2001, message: '订单不存在' };
    }

    return { code: 0, data: order };
  }

  async cancelOrder(id: number, userId: number, reason?: string) {
    const order = await this.orderRepo.findOne({
      where: { id, userId } as any,
    });

    if (!order) {
      return { code: 2001, message: '订单不存在' };
    }

    if (order.orderStatus !== OrderStatus.PENDING) {
      return { code: 2004, message: '仅待支付订单可取消' };
    }

    // 取消 + 回补库存同一事务
    await this.orderRepo.manager.transaction(async (manager: any) => {
      await manager.update(AppOrderEntity, id, {
        orderStatus: OrderStatus.CANCELED,
        cancelReason: reason,
      });
      await this.restock(manager, order.orderType, order.relatedId, order.quantity);
    });

    return { code: 0, message: '订单已取消' };
  }

  async payOrder(id: number, userId: number, payMethod: string) {
    const order = await this.orderRepo.findOne({
      where: { id, userId } as any,
    });

    if (!order) {
      return { code: 2001, message: '订单不存在' };
    }

    if (order.orderStatus !== OrderStatus.PENDING) {
      return { code: 2002, message: '订单状态不可支付' };
    }

    // 库存在下单时已扣减，支付仅推进状态
    await this.orderRepo.update(id, {
      orderStatus: OrderStatus.PAID,
      payMethod,
      payTime: new Date(),
    } as any);

    await this.messageService.notify(userId, 'order', '支付成功', `订单 ${order.orderNo} 已支付`);

    return { code: 0, message: '支付成功' };
  }

  /** 按订单号查询（/api/order/pay/:orderNo 用） */
  async findOrderByNo(orderNo: string, userId: number) {
    const order = await this.orderRepo.findOne({ where: { orderNo, userId } as any });
    if (!order) return { code: 2001, message: '订单不存在' };
    return { code: 0, data: order };
  }

  /** 确认完成（PAID → COMPLETED） */
  async confirmOrder(id: number, userId: number) {
    const order = await this.orderRepo.findOne({ where: { id, userId } as any });
    if (!order) return { code: 2001, message: '订单不存在' };
    if (order.orderStatus !== OrderStatus.PAID) {
      return { code: 2005, message: '仅已支付订单可确认' };
    }
    await this.orderRepo.update(id, { orderStatus: OrderStatus.COMPLETED } as any);
    return { code: 0, message: '已确认完成' };
  }

  /** 退款（PAID → REFUNDED，同事务回补库存） */
  async refundOrder(id: number, userId: number) {
    const order = await this.orderRepo.findOne({ where: { id, userId } as any });
    if (!order) return { code: 2001, message: '订单不存在' };
    if (order.orderStatus !== OrderStatus.PAID) {
      return { code: 2005, message: '仅已支付订单可退款' };
    }

    await this.orderRepo.manager.transaction(async (manager: any) => {
      await manager.update(AppOrderEntity, id, { orderStatus: OrderStatus.REFUNDED });
      await this.restock(manager, order.orderType, order.relatedId, order.quantity);
    });

    return { code: 0, message: '退款成功' };
  }
}
