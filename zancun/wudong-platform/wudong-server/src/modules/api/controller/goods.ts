import { Controller, Get, Inject, Param, Query } from '@midwayjs/core';
import { ApiController } from '../api.controller';
import { AppProductService } from '../../product/service/product';
import { fail, ok, pageArgs, pageResult } from '../helper';
import { toGoods, toGoodsDetail } from '../mappers';

@Controller('/api/goods')
export class ApiGoodsController extends ApiController {
  @Inject()
  productService: AppProductService;

  /** 分类树：后端分类无父子层级，返回扁平节点（children 为空） */
  @Get('/category/tree')
  async categoryTree() {
    const res = await this.productService.getCategoryList();
    if (res.code !== 0) return fail(res.code, (res as any).message);
    const list = (res.data || []).map((c: any) => ({ id: c.id, name: c.name, children: [] }));
    return ok(list);
  }

  @Get('/list')
  async list(@Query() query: any) {
    const { page, size } = pageArgs(query);
    const res = await this.productService.getProductList({
      page,
      pageSize: size,
      categoryId: query.categoryId ? Number(query.categoryId) : undefined,
      keyword: query.keyword,
    });
    if (res.code !== 0) return fail(res.code, (res as any).message);
    return ok(pageResult(res.data.list.map(toGoods), res.data.pagination.total, page, size));
  }

  /** 搜索结果只带 list/total（对齐小程序契约） */
  @Get('/search')
  async search(@Query() query: any) {
    const { page, size } = pageArgs(query);
    const res = await this.productService.getProductList({
      page,
      pageSize: size,
      keyword: query.keyword,
    });
    if (res.code !== 0) return fail(res.code, (res as any).message);
    return ok({ list: res.data.list.map(toGoods), total: res.data.pagination.total });
  }

  @Get('/detail/:id')
  async detail(@Param('id') id: string) {
    const res = await this.productService.getProductDetail(Number(id));
    if (res.code !== 0) return fail(res.code, (res as any).message);
    return ok(toGoodsDetail(res.data));
  }
}
