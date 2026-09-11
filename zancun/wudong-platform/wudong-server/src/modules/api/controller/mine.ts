import { Controller, Get, Inject, Query } from '@midwayjs/core';
import { ApiController } from '../api.controller';
import { AppCommunityService } from '../../community/service/community';
import { AppProductService } from '../../product/service/product';
import { AppHotelService } from '../../hotel/service/hotel';
import { fail, ok } from '../helper';
import { toGoods, toHomestay, toPost } from '../mappers';

/** 收藏类型：小程序的 goods/hotel/post ↔ 实体的 product/hotel/post */
const FAVORITE_TYPE_MAP: Record<string, string> = {
  goods: 'product',
  hotel: 'hotel',
  post: 'post',
};

@Controller('/api/mine')
export class ApiMineController extends ApiController {
  @Inject()
  communityService: AppCommunityService;

  @Inject()
  productService: AppProductService;

  @Inject()
  hotelService: AppHotelService;

  /** 我的收藏：按类型聚合各模块数据，返回裸数组 */
  @Get('/collect')
  async collect(@Query('type') type?: string) {
    const uid = this.uid();
    if (!uid) return this.unauth();

    const favoriteType = FAVORITE_TYPE_MAP[type || 'goods'] || 'product';
    const res = await this.communityService.getFavoriteList({
      userId: uid,
      favoriteType,
      pageSize: 100,
    });
    if (res.code !== 0) return fail(res.code, (res as any).message);

    const list: any[] = [];
    for (const f of res.data.list as any[]) {
      if (favoriteType === 'product') {
        const d = await this.productService.getProductDetail(f.relatedId);
        if (d.code === 0) list.push(toGoods(d.data));
      } else if (favoriteType === 'hotel') {
        const d = await this.hotelService.getHotelDetail(f.relatedId);
        if (d.code === 0) list.push(toHomestay(d.data));
      } else {
        const d = await this.communityService.getPostDetail(f.relatedId);
        if (d.code === 0) list.push(toPost(d.data));
      }
    }
    return ok(list);
  }
}
