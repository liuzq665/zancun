import { Controller, Get, Inject, Param, Post, Body, Query } from '@midwayjs/core';
import { ApiController } from '../api.controller';
import { AppTicketService } from '../../ticket/service/ticket';
import { fail, fmtDate, ok, pageArgs, pageResult } from '../helper';
import { toRoute, toRouteDetail, toScenic, toScenicDetail } from '../mappers';

@Controller('/api/travel')
export class ApiTravelController extends ApiController {
  @Inject()
  ticketService: AppTicketService;

  @Get('/scenic/list')
  async scenicList(@Query() query: any) {
    const { page, size } = pageArgs(query);
    const res = await this.ticketService.getScenicList({ page, pageSize: size, keyword: query.keyword });
    if (res.code !== 0) return fail(res.code, (res as any).message);
    return ok(pageResult(res.data.list.map(toScenic), res.data.pagination.total, page, size));
  }

  @Get('/scenic/detail/:id')
  async scenicDetail(@Param('id') id: string) {
    const res = await this.ticketService.getScenicDetail(Number(id));
    if (res.code !== 0) return fail(res.code, (res as any).message);
    return ok(toScenicDetail(res.data));
  }

  @Get('/route/list')
  async routeList(@Query() query: any) {
    const { page, size } = pageArgs(query);
    const res = await this.ticketService.getRouteList({ page, pageSize: size, keyword: query.keyword });
    if (res.code !== 0) return fail(res.code, (res as any).message);
    return ok(pageResult(res.data.list.map(toRoute), res.data.pagination.total, page, size));
  }

  @Get('/route/detail/:id')
  async routeDetail(@Param('id') id: string) {
    const res = await this.ticketService.getRouteDetail(Number(id));
    if (res.code !== 0) return fail(res.code, (res as any).message);
    return ok(toRouteDetail(res.data));
  }

  // ===== 门票 / 路线 下单 =====

  @Post('/ticket/buy')
  async ticketBuy(@Body() body: any) {
    const uid = this.uid();
    if (!uid) return this.unauth();

    const res = await this.ticketService.createOrder({
      userId: uid,
      orderType: 'ticket',
      relatedId: Number(body.ticketTypeId),
      quantity: Number(body.quantity) || 1,
      bookDate: body.useDate,
    });
    if (res.code !== 0) return fail(res.code, (res as any).message);

    const o: any = (res as any).data;
    return ok({ id: o.id, orderNo: o.orderNo, status: 'PENDING' });
  }

  @Post('/route/buy')
  async routeBuy(@Body() body: any) {
    const uid = this.uid();
    if (!uid) return this.unauth();

    const res = await this.ticketService.createOrder({
      userId: uid,
      orderType: 'route',
      relatedId: Number(body.routeId),
      quantity: Number(body.peopleCount) || 1,
      bookDate: body.departureDate,
    });
    if (res.code !== 0) return fail(res.code, (res as any).message);

    const o: any = (res as any).data;
    return ok({ id: o.id, orderNo: o.orderNo, status: 'PENDING' });
  }

  /**
   * 电子票。后端无 travel_eticket 表，这里由订单推导：
   * 二维码用订单号，有效期用下单时选的出行日期。
   */
  @Get('/eticket/:orderId')
  async eticket(@Param('orderId') orderId: string) {
    const uid = this.uid();
    if (!uid) return this.unauth();

    const res = await this.ticketService.getOrderDetail(Number(orderId), uid);
    if (res.code !== 0) return fail(res.code, (res as any).message);

    const o: any = (res as any).data;
    const statusMap: Record<number, string> = { 0: 'REFUNDED', 4: 'REFUNDED' };
    return ok({
      orderId: o.id,
      qrCode: o.orderNo,
      validDate: fmtDate(o.bookDate),
      status: statusMap[o.orderStatus] || 'UNUSED',
    });
  }

  @Post('/refund/:orderId')
  async refund(@Param('orderId') orderId: string) {
    const uid = this.uid();
    if (!uid) return this.unauth();

    const res = await this.ticketService.refundOrder(Number(orderId), uid);
    if (res.code !== 0) return fail(res.code, (res as any).message);
    return ok(null);
  }

  /** 交通攻略：后端无 travel_traffic_guide 表，返回空列表（小程序无页面调用） */
  @Get('/guide/list')
  async guideList(@Query() query: any) {
    const { page, size } = pageArgs(query);
    return ok(pageResult([], 0, page, size));
  }
}
