import { Controller, Get, Post, Put, Del, Inject, Query, Body, Headers } from '@midwayjs/core';
import { AppAdminService } from '../../service/admin';

@Controller('/admin')
export class AppAdminController {
  @Inject()
  adminService: AppAdminService;

  // ===== 登录 =====
  @Post('/login')
  async login(@Body() body: { username: string; password: string }) {
    return this.adminService.login(body.username, body.password);
  }

  @Get('/info')
  async getAdminInfo(@Headers('authorization') auth: string) {
    const token = auth?.replace('Bearer ', '');
    const payload = this.adminService.verifyToken(token);
    if (!payload) {
      return { code: 40101, message: '未登录或token已过期' };
    }
    return this.adminService.getAdminInfo(payload.adminId);
  }

  // ===== 管理员管理 =====
  @Post('/admin')
  async createAdmin(@Body() body: any) {
    return this.adminService.createAdmin(body);
  }

  @Get('/admin/list')
  async getAdminList(@Query() query: any) {
    return this.adminService.getAdminList({
      page: query.page ? Number(query.page) : 1,
      pageSize: query.pageSize ? Number(query.pageSize) : 10,
      keyword: query.keyword,
    });
  }

  @Put('/admin/:id')
  async updateAdmin(@Body() body: any) {
    return this.adminService.updateAdmin(body.id, body);
  }

  @Del('/admin/:id')
  async deleteAdmin(@Body('id') id: number) {
    return this.adminService.deleteAdmin(id);
  }

  // ===== 系统配置 =====
  @Get('/config')
  async getConfig(@Query('key') key: string) {
    return this.adminService.getConfig(key);
  }

  @Post('/config')
  async setConfig(@Body() body: { key: string; value: any; name?: string; group?: string }) {
    return this.adminService.setConfig(body.key, body.value, body.name, body.group);
  }

  @Get('/config/list')
  async getConfigList(@Query('group') group?: string) {
    return this.adminService.getConfigList({ group });
  }

  // ===== 操作日志 =====
  @Get('/log/list')
  async getLogList(@Query() query: any) {
    return this.adminService.getLogList({
      page: query.page ? Number(query.page) : 1,
      pageSize: query.pageSize ? Number(query.pageSize) : 20,
      adminId: query.adminId ? Number(query.adminId) : undefined,
      action: query.action,
      startDate: query.startDate,
      endDate: query.endDate,
    });
  }

  // ===== 数据统计 =====
  @Get('/dashboard/stats')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  // 前端 api/admin.js 的 getStatistics() 走 /admin/statistics
  @Get('/statistics')
  async getStatistics() {
    return this.adminService.getDashboardStats();
  }

  // ===== 业务数据管理 =====
  @Get('/user/list')
  async getUserList(@Query() query: any) {
    return this.adminService.getUserList({
      page: query.page ? Number(query.page) : 1,
      pageSize: query.pageSize ? Number(query.pageSize) : 10,
      keyword: query.keyword,
    });
  }

  @Get('/order/list')
  async getOrderList(@Query() query: any) {
    return this.adminService.getOrderList({
      page: query.page ? Number(query.page) : 1,
      pageSize: query.pageSize ? Number(query.pageSize) : 10,
      keyword: query.keyword,
      status: query.status,
      type: query.type,
    });
  }

  @Get('/product/list')
  async getProductList(@Query() query: any) {
    return this.adminService.getProductList({
      page: query.page ? Number(query.page) : 1,
      pageSize: query.pageSize ? Number(query.pageSize) : 10,
      keyword: query.keyword,
      categoryId: query.categoryId ? Number(query.categoryId) : undefined,
    });
  }

  @Post('/product/save')
  async saveProduct(@Body() body: any) {
    return this.adminService.saveProduct(body);
  }

  @Post('/product/delete')
  async deleteProduct(@Body('id') id: number) {
    return this.adminService.deleteProduct(Number(id));
  }

  @Get('/restaurant/list')
  async getRestaurantList(@Query() query: any) {
    return this.adminService.getRestaurantList({
      page: query.page ? Number(query.page) : 1,
      pageSize: query.pageSize ? Number(query.pageSize) : 10,
      keyword: query.keyword,
    });
  }

  @Get('/hotel/list')
  async getHotelList(@Query() query: any) {
    return this.adminService.getHotelList({
      page: query.page ? Number(query.page) : 1,
      pageSize: query.pageSize ? Number(query.pageSize) : 10,
      keyword: query.keyword,
    });
  }

  @Get('/route/list')
  async getRouteList(@Query() query: any) {
    return this.adminService.getRouteList({
      page: query.page ? Number(query.page) : 1,
      pageSize: query.pageSize ? Number(query.pageSize) : 10,
      keyword: query.keyword,
    });
  }

  @Get('/post/list')
  async getPostList(@Query() query: any) {
    return this.adminService.getPostList({
      page: query.page ? Number(query.page) : 1,
      pageSize: query.pageSize ? Number(query.pageSize) : 10,
      keyword: query.keyword,
    });
  }

  // ===== 业务数据的写操作 =====
  @Post('/business/save')
  async saveBusiness(@Body() body: any) {
    const { module, ...data } = body;
    return this.adminService.saveBusiness(module, data);
  }

  @Post('/business/delete')
  async deleteBusiness(@Body() body: { module: string; id: number }) {
    return this.adminService.deleteBusiness(body.module, Number(body.id));
  }

  @Post('/user/status')
  async setUserStatus(@Body() body: { id: number; status: number }) {
    return this.adminService.setUserStatus(Number(body.id), Number(body.status));
  }

  @Post('/order/process')
  async processOrder(@Body() body: { id: number; action: string }) {
    return this.adminService.processOrder(Number(body.id), body.action);
  }

  /** 帖子设为/取消精华 */
  @Post('/post/featured')
  async setPostFeatured(@Body() body: { id: number; isFeatured: number }) {
    return this.adminService.savePostFeatured(Number(body.id), Number(body.isFeatured));
  }

  /** 帖子上下架 */
  @Post('/post/status')
  async setPostStatus(@Body() body: { id: number; status: number }) {
    return this.adminService.setPostStatus(Number(body.id), Number(body.status));
  }
}
