import { Controller, Del, Get, Inject, Param, Post, Put, Body } from '@midwayjs/core';
import { ApiController } from '../api.controller';
import { CartService } from '../../cart/service/cart';
import { fail, ok, toYuan } from '../helper';

/**
 * 购物车门面。
 *
 * 小程序的购物车是「module + entityType + entityId」通用模型，而现有
 * AppCartEntity 是「productId」专用模型。这里把 productId 映射为 entityId，
 * module/entityType 固定为 goods/goods_sku、specName 无来源（后端无 SKU 表）。
 */
@Controller('/api/cart')
export class ApiCartController extends ApiController {
  @Inject()
  cartService: CartService;

  @Get('/list')
  async list() {
    const uid = this.uid();
    if (!uid) return this.unauth();

    const items = await this.cartService.getCartList(uid);
    return ok(
      items.map((it: any) => ({
        id: it.id,
        module: 'goods',
        entityType: 'goods_sku',
        entityId: it.productId,
        title: it.name,
        image: it.coverImage,
        price: toYuan(it.price),
        quantity: it.quantity,
        checked: it.selected,
      }))
    );
  }

  @Post('/add')
  async add(@Body() body: any) {
    const uid = this.uid();
    if (!uid) return this.unauth();

    await this.cartService.addToCart(uid, Number(body.entityId), Number(body.quantity || 1));
    return ok(null);
  }

  @Put('/update/:id')
  async update(@Param('id') id: string, @Body() body: any) {
    const uid = this.uid();
    if (!uid) return this.unauth();

    try {
      if (body.quantity !== undefined) {
        await this.cartService.updateCartItem(Number(id), uid, Number(body.quantity));
      }
      if (body.checked !== undefined) {
        await this.cartService.setChecked(Number(id), uid, Number(body.checked));
      }
    } catch {
      return fail(3001, '购物车项不存在');
    }
    return ok(null);
  }

  @Del('/remove/:id')
  async remove(@Param('id') id: string) {
    const uid = this.uid();
    if (!uid) return this.unauth();

    try {
      await this.cartService.removeCartItem(Number(id), uid);
    } catch {
      // 小程序对「删除不存在的项」按成功处理
    }
    return ok(null);
  }
}
