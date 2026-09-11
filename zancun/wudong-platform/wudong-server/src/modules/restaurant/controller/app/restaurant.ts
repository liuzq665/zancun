import { Controller, Get, Post, Inject, Query, Body } from '@midwayjs/core';
import { AppRestaurantService } from '../../service/restaurant';

@Controller('/app/restaurant')
export class AppRestaurantController {
  @Inject()
  restaurantService: AppRestaurantService;

  // ===== 餐厅 =====
  @Get('/list')
  async getRestaurantList(@Query() query: any) {
    return this.restaurantService.getRestaurantList({
      keyword: query.keyword,
      page: query.page ? Number(query.page) : 1,
      pageSize: query.pageSize ? Number(query.pageSize) : 10,
      isRecommend: query.isRecommend !== undefined ? Number(query.isRecommend) : undefined,
    });
  }

  @Get('/detail')
  async getRestaurantDetail(@Query('id') id: string) {
    return this.restaurantService.getRestaurantDetail(Number(id));
  }

  @Get('/recommend')
  async getRecommendRestaurants(@Query('limit') limit?: string) {
    return this.restaurantService.getRecommendRestaurants(limit ? Number(limit) : 6);
  }

  @Post('')
  async createRestaurant(@Body() body: any) {
    return this.restaurantService.createRestaurant(body);
  }

  // ===== 菜品 =====
  @Get('/dish/list')
  async getDishList(@Query() query: any) {
    return this.restaurantService.getDishList({
      restaurantId: Number(query.restaurantId),
      category: query.category,
    });
  }

  @Get('/dish/detail')
  async getDishDetail(@Query('id') id: string) {
    return this.restaurantService.getDishDetail(Number(id));
  }

  @Post('/dish')
  async createDish(@Body() body: any) {
    return this.restaurantService.createDish(body);
  }

  // ===== 餐桌 =====
  @Get('/table/list')
  async getTableList(@Query('restaurantId') restaurantId: string) {
    return this.restaurantService.getTableList(Number(restaurantId));
  }

  @Post('/table')
  async createTable(@Body() body: any) {
    return this.restaurantService.createTable(body);
  }

  // ===== 评价 =====
  @Get('/review/list')
  async getReviewList(@Query() query: any) {
    return this.restaurantService.getReviewList({
      restaurantId: Number(query.restaurantId),
      page: query.page ? Number(query.page) : 1,
      pageSize: query.pageSize ? Number(query.pageSize) : 10,
    });
  }

  @Post('/review')
  async createReview(@Body() body: any) {
    return this.restaurantService.createReview(body);
  }
}
