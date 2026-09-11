import { Controller, Get, Inject, Param, Post, Body, Query } from '@midwayjs/core';
import { ApiController } from '../api.controller';
import { AppHotelService } from '../../hotel/service/hotel';
import { AppTicketService } from '../../ticket/service/ticket';
import { fail, ok, pageArgs, pageResult, toYuan } from '../helper';
import { toHomestay, toHomestayDetail, toApiOrder } from '../mappers';

@Controller('/api/hotel')
export class ApiHotelController extends ApiController {
  @Inject()
  hotelService: AppHotelService;

  @Inject()
  ticketService: AppTicketService;

  @Get('/list')
  async list(@Query() query: any) {
    const { page, size } = pageArgs(query);
    const res = await this.hotelService.getHotelList({ page, pageSize: size, keyword: query.keyword });
    if (res.code !== 0) return fail(res.code, (res as any).message);
    return ok(pageResult(res.data.list.map(toHomestay), res.data.pagination.total, page, size));
  }

  @Get('/detail/:id')
  async detail(@Param('id') id: string) {
    const hotelId = Number(id);
    const res = await this.hotelService.getHotelDetail(hotelId);
    if (res.code !== 0) return fail(res.code, (res as any).message);

    const rooms = await this.hotelService.getRoomList({ hotelId });
    return ok(toHomestayDetail(res.data, rooms.code === 0 ? rooms.data : []));
  }

  /**
   * 房态日历。后端暂无「按日期」的房态表（文档 4.4.4 的 hotel_room_calendar），
   * 这里用房型自身的库存/价格推导出连续日期，保证日历控件可用。
   */
  @Get('/calendar/:roomTypeId')
  async calendar(@Param('roomTypeId') roomTypeId: string, @Query() query: any) {
    const days = Math.max(1, Number(query.days) || 30);
    const res = await this.hotelService.getRoomDetail(Number(roomTypeId));
    if (res.code !== 0) return fail(res.code, (res as any).message);

    const room: any = (res as any).data;
    const today = new Date();
    const list = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`;
      list.push({ date, stock: room.stock, price: toYuan(room.price) });
    }
    return ok(list);
  }

  /** 民宿预订：以房型（roomTypeId）为资源下单，服务端按房型取价 */
  @Post('/reserve')
  async reserve(@Body() body: any) {
    const uid = this.uid();
    if (!uid) return this.unauth();

    const res = await this.ticketService.createOrder({
      userId: uid,
      orderType: 'hotel',
      relatedId: Number(body.roomTypeId),
      quantity: 1,
      bookDate: body.checkin,
      endDate: body.checkout,
      contactName: body.contactName,
      contactPhone: body.contactPhone,
      remark: body.idCard ? `身份证:${body.idCard}` : undefined,
    });
    if (res.code !== 0) return fail(res.code, (res as any).message);

    const o: any = (res as any).data;
    return ok({ id: o.id, orderNo: o.orderNo, status: 'PENDING' });
  }

  @Get('/order/my')
  async myOrders(@Query() query: any) {
    const uid = this.uid();
    if (!uid) return this.unauth();

    const { page, size } = pageArgs(query);
    const res = await this.ticketService.getOrderList({
      userId: uid,
      orderType: 'hotel',
      page,
      pageSize: size,
    });
    if (res.code !== 0) return fail(res.code, (res as any).message);
    return ok(pageResult(res.data.list.map(toApiOrder), res.data.pagination.total, page, size));
  }

  @Post('/order/cancel/:orderId')
  async cancelOrder(@Param('orderId') orderId: string) {
    const uid = this.uid();
    if (!uid) return this.unauth();

    const res = await this.ticketService.cancelOrder(Number(orderId), uid);
    if (res.code !== 0) return fail(res.code, (res as any).message);
    return ok(null);
  }
}
