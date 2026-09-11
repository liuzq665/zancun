import { Controller, Get, Inject, Param, Post, Body, Query } from '@midwayjs/core';
import { ApiController } from '../api.controller';
import { AppTicketService } from '../../ticket/service/ticket';
import { fail, ok, pageArgs, pageResult, toYuan } from '../helper';
import { ORDER_STATUS_API_TO_DB, ORDER_TYPE_API_TO_DB, toApiOrder } from '../mappers';

/**
 * 统一订单门面（文档 §7.3.3）。
 *
 * 小程序/文档用「8 态字符串 + items[] + 金额单位元」，实体是「0-4 整型 + 单资源 + 分」，
 * 这里做双向映射（见 mappers.ts）。
 *
 * 已知限制：实体没有订单明细表（base_order_item 未落地），故**仅支持单商品下单**；
 * 购物车多选合并下单会返回明确错误，而不是写出一条错误金额的订单。
 */
@Controller('/api/order')
export class ApiOrderController extends ApiController {
  @Inject()
  ticketService: AppTicketService;

  @Post('/create')
  async create(@Body() body: any) {
    const uid = this.uid();
    if (!uid) return this.unauth();

    const items: any[] = Array.isArray(body.items) ? body.items : [];
    if (items.length !== 1) {
      return fail(40001, '暂不支持多商品合并下单');
    }

    const item = items[0];
    const dbType = ORDER_TYPE_API_TO_DB[body.orderType];
    if (!dbType) return fail(40001, '不支持的订单类型');

    // 元 → 分，与实体口径一致；服务端仍会按 relatedId 重算并比对
    const res = await this.ticketService.createOrder({
      userId: uid,
      orderType: dbType,
      relatedId: Number(item.entityId),
      relatedName: body.title || item.title,
      quantity: Number(item.quantity) || 1,
      unitPrice: item.price !== undefined ? Math.round(Number(item.price) * 100) : undefined,
      totalPrice: body.totalAmount !== undefined ? Math.round(Number(body.totalAmount) * 100) : undefined,
      bookDate: item.startDate,
      endDate: item.endDate,
    });
    if (res.code !== 0) return fail(res.code, (res as any).message);

    const o: any = (res as any).data;
    // 站内信由 AppTicketService 统一写入（/app 与 /api 共用），此处不再重复

    return ok({
      id: o.id,
      orderNo: o.orderNo,
      status: 'PENDING',
      payAmount: toYuan(o.totalPrice),
    });
  }

  @Get('/list')
  async list(@Query() query: any) {
    const uid = this.uid();
    if (!uid) return this.unauth();

    const { page, size } = pageArgs(query);
    const dbType = query.orderType ? ORDER_TYPE_API_TO_DB[query.orderType] : undefined;

    const res = await this.ticketService.getOrderList({
      userId: uid,
      orderType: dbType,
      page,
      pageSize: size,
    });
    if (res.code !== 0) return fail(res.code, (res as any).message);

    let list = res.data.list.map(toApiOrder);
    // 状态筛选在映射后做（实体整型无法直接表达 8 态）
    if (query.status && ORDER_STATUS_API_TO_DB[query.status] === undefined) {
      return fail(40001, '不支持的订单状态');
    }
    if (query.status) {
      list = list.filter((o: any) => o.status === query.status);
    }

    return ok(pageResult(list, res.data.pagination.total, page, size));
  }

  @Get('/detail/:id')
  async detail(@Param('id') id: string) {
    const uid = this.uid();
    if (!uid) return this.unauth();

    const res = await this.ticketService.getOrderDetail(Number(id), uid);
    if (res.code !== 0) return fail(res.code, (res as any).message);
    return ok(toApiOrder(res.data));
  }

  @Post('/cancel/:id')
  async cancel(@Param('id') id: string) {
    const uid = this.uid();
    if (!uid) return this.unauth();

    const res = await this.ticketService.cancelOrder(Number(id), uid);
    if (res.code !== 0) return fail(res.code, (res as any).message);
    return ok({ id: Number(id), status: 'CANCELED' });
  }

  /** 注意：路径参数是订单号（字符串），不是 id */
  @Post('/pay/:orderNo')
  async pay(@Param('orderNo') orderNo: string) {
    const uid = this.uid();
    if (!uid) return this.unauth();

    const found = await this.ticketService.findOrderByNo(orderNo, uid);
    if (found.code !== 0) return fail(found.code, (found as any).message);

    const res = await this.ticketService.payOrder((found.data as any).id, uid, 'wechat');
    if (res.code !== 0) return fail(res.code, (res as any).message);
    return ok({ status: 'SUCCESS', orderStatus: 'PAID' });
  }

  @Post('/confirm/:id')
  async confirm(@Param('id') id: string) {
    const uid = this.uid();
    if (!uid) return this.unauth();

    const res = await this.ticketService.confirmOrder(Number(id), uid);
    if (res.code !== 0) return fail(res.code, (res as any).message);
    return ok({ id: Number(id), status: 'FINISHED' });
  }

  @Post('/refund/:id')
  async refund(@Param('id') id: string) {
    const uid = this.uid();
    if (!uid) return this.unauth();

    const res = await this.ticketService.refundOrder(Number(id), uid);
    if (res.code !== 0) return fail(res.code, (res as any).message);
    return ok({ id: Number(id), status: 'REFUNDED' });
  }
}
