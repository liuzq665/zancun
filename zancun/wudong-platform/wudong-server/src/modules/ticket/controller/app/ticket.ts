import { Controller, Get, Post, Inject, Query, Body } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { AppTicketService } from '../../service/ticket';
import { AppUserService } from '../../../user/service/user';

@Controller('/app/ticket')
export class AppTicketController {
  @Inject()
  ticketService: AppTicketService;

  @Inject()
  userService: AppUserService;

  @Inject()
  ctx: Context;

  /**
   * 从 token 解析登录用户。
   * 订单接口一律以此为准，不再采信 body/query 里的 userId（防越权）。
   */
  private uid(): number | null {
    const header: any =
      (this.ctx.get && this.ctx.get('authorization')) || (this.ctx.headers as any)?.authorization || '';
    const token = String(header).replace(/^Bearer\s+/i, '').trim();
    if (!token) return null;
    const payload = this.userService.verifyToken(token);
    return (payload && payload.userId) || null;
  }

  // ===== 景区 =====
  @Get('/scenic/list')
  async getScenicList(@Query() query: any) {
    return this.ticketService.getScenicList({
      keyword: query.keyword,
      page: query.page ? Number(query.page) : 1,
      pageSize: query.pageSize ? Number(query.pageSize) : 10,
      isRecommend: query.isRecommend !== undefined ? Number(query.isRecommend) : undefined,
      scenicType: query.scenicType,
    });
  }

  @Get('/scenic/detail')
  async getScenicDetail(@Query('id') id: string) {
    return this.ticketService.getScenicDetail(Number(id));
  }

  @Post('/scenic')
  async createScenic(@Body() body: any) {
    return this.ticketService.createScenic(body);
  }

  // ===== 路线 =====
  @Get('/route/list')
  async getRouteList(@Query() query: any) {
    return this.ticketService.getRouteList({
      keyword: query.keyword,
      page: query.page ? Number(query.page) : 1,
      pageSize: query.pageSize ? Number(query.pageSize) : 10,
      isRecommend: query.isRecommend !== undefined ? Number(query.isRecommend) : undefined,
      scenicId: query.scenicId ? Number(query.scenicId) : undefined,
      routeType: query.routeType,
    });
  }

  @Get('/route/detail')
  async getRouteDetail(@Query('id') id: string) {
    return this.ticketService.getRouteDetail(Number(id));
  }

  @Get('/route/recommend')
  async getRecommendRoutes(@Query('limit') limit?: string) {
    return this.ticketService.getRecommendRoutes(limit ? Number(limit) : 6);
  }

  @Post('/route')
  async createRoute(@Body() body: any) {
    return this.ticketService.createRoute(body);
  }

  // ===== 订单 =====
  @Post('/order')
  async createOrder(@Body() body: any) {
    const userId = this.uid();
    if (!userId) return { code: 401, message: '请先登录' };
    // 展开 body 后再覆盖 userId，客户端传的 userId 一律忽略
    return this.ticketService.createOrder({ ...body, userId });
  }

  @Get('/order/list')
  async getOrderList(@Query() query: any) {
    const userId = this.uid();
    if (!userId) return { code: 401, message: '请先登录' };
    return this.ticketService.getOrderList({
      userId,
      orderType: query.orderType,
      page: query.page ? Number(query.page) : 1,
      pageSize: query.pageSize ? Number(query.pageSize) : 10,
    });
  }

  @Get('/order/detail')
  async getOrderDetail(@Query('id') id: string) {
    const userId = this.uid();
    if (!userId) return { code: 401, message: '请先登录' };
    return this.ticketService.getOrderDetail(Number(id), userId);
  }

  @Post('/order/cancel')
  async cancelOrder(@Body() body: any) {
    const userId = this.uid();
    if (!userId) return { code: 401, message: '请先登录' };
    return this.ticketService.cancelOrder(Number(body.id), userId, body.reason);
  }

  @Post('/order/pay')
  async payOrder(@Body() body: any) {
    const userId = this.uid();
    if (!userId) return { code: 401, message: '请先登录' };
    return this.ticketService.payOrder(Number(body.id), userId, body.payMethod);
  }

  @Post('/order/refund')
  async refundOrder(@Body() body: any) {
    const userId = this.uid();
    if (!userId) return { code: 401, message: '请先登录' };
    return this.ticketService.refundOrder(Number(body.id), userId);
  }
}
