import { Controller, Get, Post, Put, Del, Inject, Query, Body } from '@midwayjs/core';
import { AppProductService } from '../../service/product';

@Controller('/app/product')
export class AppProductController {
  @Inject()
  productService: AppProductService;

  // ===== 分类 =====

  @Get('/category/list')
  async getCategoryList() {
    return this.productService.getCategoryList();
  }

  @Post('/category')
  async createCategory(@Body() body: any) {
    return this.productService.createCategory(body);
  }

  // ===== 商品 =====

  @Get('/list')
  async getProductList(@Query() query: any) {
    return this.productService.getProductList({
      categoryId: query.categoryId ? Number(query.categoryId) : undefined,
      keyword: query.keyword,
      page: query.page ? Number(query.page) : 1,
      pageSize: query.pageSize ? Number(query.pageSize) : 10,
      isRecommend: query.isRecommend !== undefined ? Number(query.isRecommend) : undefined,
    });
  }

  @Get('/detail')
  async getProductDetail(@Query('id') id: string) {
    return this.productService.getProductDetail(Number(id));
  }

  @Get('/recommend')
  async getRecommendProducts(@Query('limit') limit?: string) {
    return this.productService.getRecommendProducts(limit ? Number(limit) : 6);
  }

  @Post('')
  async createProduct(@Body() body: any) {
    return this.productService.createProduct(body);
  }

  @Put('/:id')
  async updateProduct(@Body() body: any) {
    return this.productService.updateProduct(body.id, body);
  }

  @Del('/:id')
  async deleteProduct(@Body('id') id: number) {
    return this.productService.deleteProduct(id);
  }
}
