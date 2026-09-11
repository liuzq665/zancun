import { Controller, Get, Post, Put } from '@midwayjs/core';
import { Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { CartService } from '../../service/cart';

/**
 * 购物车控制器（App端）
 */
@Controller('/app/cart')
export class AppCartController {
  @Inject()
  ctx: Context;

  /**
   * 获取购物车列表
   */
  @Get('/list')
  async getCartList() {
    const userId = this.getLoginUserId();
    if (!userId) {
      return { code: 401, message: '请先登录' };
    }
    const cartService = await this.ctx.requestContext.getAsync(CartService);
    const list = await cartService.getCartList(userId);
    return { code: 0, message: 'success', data: list };
  }

  /**
   * 添加到购物车
   */
  @Post('/add')
  async addToCart() {
    const userId = this.getLoginUserId();
    if (!userId) {
      return { code: 401, message: '请先登录' };
    }
    const body = (this.ctx as any).request.body as { productId: number; quantity?: number };
    const { productId, quantity } = body;

    if (!productId) {
      return { code: 400, message: '请选择商品' };
    }

    const cartService = await this.ctx.requestContext.getAsync(CartService);
    const result = await cartService.addToCart(userId, productId, quantity || 1);

    return { code: 0, message: '添加成功', data: result };
  }

  /**
   * 更新购物车商品数量
   */
  @Put('/update')
  async updateCartItem() {
    const userId = this.getLoginUserId();
    if (!userId) {
      return { code: 401, message: '请先登录' };
    }
    const body = (this.ctx as any).request.body as { id: number; quantity?: number; selected?: number };
    const { id, quantity, selected } = body;

    if (!id || (quantity === undefined && selected === undefined)) {
      return { code: 400, message: '参数错误' };
    }

    const cartService = await this.ctx.requestContext.getAsync(CartService);
    if (quantity !== undefined) {
      await cartService.updateCartItem(id, userId, quantity);
    }
    if (selected !== undefined) {
      await cartService.setChecked(id, userId, selected);
    }

    return { code: 0, message: '更新成功' };
  }

  /**
   * 删除购物车商品
   */
  @Post('/remove')
  async removeCartItem() {
    const userId = this.getLoginUserId();
    if (!userId) {
      return { code: 401, message: '请先登录' };
    }
    const body = (this.ctx as any).request.body as { id: number };
    const { id } = body;

    if (!id) {
      return { code: 400, message: '请选择要删除的商品' };
    }

    const cartService = await this.ctx.requestContext.getAsync(CartService);
    await cartService.removeCartItem(id, userId);

    return { code: 0, message: '删除成功' };
  }

  /**
   * 清空购物车
   */
  @Post('/clear')
  async clearCart() {
    const userId = this.getLoginUserId();
    if (!userId) {
      return { code: 401, message: '请先登录' };
    }
    const cartService = await this.ctx.requestContext.getAsync(CartService);
    await cartService.clearCart(userId);

    return { code: 0, message: '已清空购物车' };
  }

  /**
   * 全选/取消全选
   */
  @Post('/selectAll')
  async selectAll() {
    const userId = this.getLoginUserId();
    if (!userId) {
      return { code: 401, message: '请先登录' };
    }
    const body = (this.ctx as any).request.body as { selected: number };
    const { selected } = body;

    const cartService = await this.ctx.requestContext.getAsync(CartService);
    await cartService.selectAll(userId, selected);

    return { code: 0, message: '操作成功' };
  }

  /**
   * 获取用户ID（从Token）
   */
  private getLoginUserId(): number | null {
    const ctx = this.ctx as any;
    const authHeader = ctx.get?.('Authorization') || ctx.headers?.['Authorization'] || ctx.headers?.['authorization'] || '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) return null;
    try {
      const payload = require('jsonwebtoken').verify(token, 'wudong-platform-secret-2026') as any;
      return payload.userId || null;
    } catch {
      return null;
    }
  }
}
