import { Controller, Get, Inject, Param, Post, Body, Query } from '@midwayjs/core';
import { ApiController } from '../api.controller';
import { AppRestaurantService } from '../../restaurant/service/restaurant';
import { AppProductService } from '../../product/service/product';
import { AppTicketService } from '../../ticket/service/ticket';
import { fail, ok, pageArgs, pageResult, toYuan } from '../helper';
import { toRestaurant, toRestaurantDetail, toApiOrder } from '../mappers';

@Controller('/api/food')
export class ApiFoodController extends ApiController {
  @Inject()
  restaurantService: AppRestaurantService;

  @Inject()
  productService: AppProductService;

  @Inject()
  ticketService: AppTicketService;

  @Get('/restaurant/list')
  async restaurantList(@Query() query: any) {
    const { page, size } = pageArgs(query);
    const res = await this.restaurantService.getRestaurantList({
      page,
      pageSize: size,
      keyword: query.keyword,
    });
    if (res.code !== 0) return fail(res.code, (res as any).message);
    return ok(pageResult(res.data.list.map(toRestaurant), res.data.pagination.total, page, size));
  }

  @Get('/restaurant/detail/:id')
  async restaurantDetail(@Param('id') id: string) {
    const restaurantId = Number(id);
    const res = await this.restaurantService.getRestaurantDetail(restaurantId);
    if (res.code !== 0) return fail(res.code, (res as any).message);

    const dishes = await this.restaurantService.getDishList({ restaurantId });
    return ok(toRestaurantDetail(res.data, dishes.code === 0 ? dishes.data : []));
  }

  // ===== 农产品 =====
  // 后端没有独立的农产品表（文档 4.4.3 的 food_product 未落地），暂以商品表承载。
  // 因此 origin / shelfLife 无数据来源，返回 undefined。

  private toFoodProduct(p: any) {
    return {
      id: p.id,
      name: p.name,
      price: toYuan(p.price),
      spec: p.unit,
      stock: p.stock,
      origin: undefined,
      mainImage: p.coverImage,
    };
  }

  @Get('/product/list')
  async productList(@Query() query: any) {
    const { page, size } = pageArgs(query);
    const res = await this.productService.getProductList({ page, pageSize: size });
    if (res.code !== 0) return fail(res.code, (res as any).message);
    return ok(pageResult(res.data.list.map(p => this.toFoodProduct(p)), res.data.pagination.total, page, size));
  }

  @Get('/product/detail/:id')
  async productDetail(@Param('id') id: string) {
    const res: any = await this.productService.getProductDetail(Number(id));
    if (res.code !== 0) return fail(res.code, res.message);
    return ok({ ...this.toFoodProduct(res.data), shelfLife: undefined, detail: res.data.detail });
  }

  // ===== 餐位预订 =====
  // 后端无餐位时段表（food_time_slot 未落地），以 timeSlotId 作为订单资源标识。

  @Post('/reserve')
  async reserve(@Body() body: any) {
    const uid = this.uid();
    if (!uid) return this.unauth();

    const res = await this.ticketService.createOrder({
      userId: uid,
      orderType: 'food_seat',
      relatedId: Number(body.timeSlotId),
      quantity: Number(body.peopleCount) || 1,
      bookDate: body.date,
      contactName: body.name,
      contactPhone: body.phone,
      remark: body.remark,
    });
    if (res.code !== 0) return fail(res.code, (res as any).message);

    const o: any = (res as any).data;
    return ok({ id: o.id, orderNo: o.orderNo, status: 'PENDING' });
  }

  @Get('/reserve/my')
  async myReserves(@Query() query: any) {
    const uid = this.uid();
    if (!uid) return this.unauth();

    const { page, size } = pageArgs(query);
    const res = await this.ticketService.getOrderList({
      userId: uid,
      orderType: 'food_seat',
      page,
      pageSize: size,
    });
    if (res.code !== 0) return fail(res.code, (res as any).message);
    return ok(pageResult(res.data.list.map(toApiOrder), res.data.pagination.total, page, size));
  }

  @Post('/reserve/cancel/:orderId')
  async cancelReserve(@Param('orderId') orderId: string) {
    const uid = this.uid();
    if (!uid) return this.unauth();

    const res = await this.ticketService.cancelOrder(Number(orderId), uid);
    if (res.code !== 0) return fail(res.code, (res as any).message);
    return ok(null);
  }
}
