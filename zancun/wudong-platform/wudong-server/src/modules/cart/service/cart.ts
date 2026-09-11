import { Inject, Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { AppCartEntity } from '../entity/cart';

@Provide()
export class CartService {
  @InjectEntityModel(AppCartEntity)
  cartModel: Repository<AppCartEntity>;

  /**
   * 获取用户购物车列表
   */
  async getCartList(userId: number) {
    const items = await this.cartModel.find({
      where: { userId } as any,
      relations: ['product'],
      order: { id: 'DESC' },
    });

    return items.map(item => ({
      id: item.id,
      userId: item.userId,
      productId: item.productId,
      quantity: item.quantity,
      selected: item.selected,
      name: item.product?.name || '',
      price: item.product?.price || 0,
      coverImage: item.product?.coverImage || '',
      stock: item.product?.stock || 0,
      heritageDesc: item.product?.heritageDesc || '',
    }));
  }

  /**
   * 添加商品到购物车
   */
  async addToCart(userId: number, productId: number, quantity: number = 1) {
    // 检查是否已存在
    const existItem = await this.cartModel.findOne({
      where: { userId, productId } as any,
    });

    if (existItem) {
      // 已存在，增加数量
      existItem.quantity += quantity;
      await this.cartModel.save(existItem);
      return existItem;
    }

    // 新增
    const cartItem = new AppCartEntity();
    cartItem.userId = userId;
    cartItem.productId = productId;
    cartItem.quantity = quantity;
    cartItem.selected = 1;

    return await this.cartModel.save(cartItem);
  }

  /**
   * 更新购物车商品数量
   */
  async updateCartItem(id: number, userId: number, quantity: number) {
    const item = await this.cartModel.findOne({
      where: { id, userId } as any,
    });

    if (!item) {
      throw new Error('购物车商品不存在');
    }

    item.quantity = quantity;
    return await this.cartModel.save(item);
  }

  /**
   * 删除购物车商品
   */
  async removeCartItem(id: number, userId: number) {
    const item = await this.cartModel.findOne({
      where: { id, userId } as any,
    });

    if (!item) {
      throw new Error('购物车商品不存在');
    }

    await this.cartModel.remove(item);
    return true;
  }

  /**
   * 设置单项勾选状态
   */
  async setChecked(id: number, userId: number, selected: number) {
    const item = await this.cartModel.findOne({
      where: { id, userId } as any,
    });

    if (!item) {
      throw new Error('购物车商品不存在');
    }

    item.selected = selected;
    return await this.cartModel.save(item);
  }

  /**
   * 清空购物车
   */
  async clearCart(userId: number) {
    await this.cartModel.delete({ userId } as any);
    return true;
  }

  /**
   * 全选/取消全选
   */
  async selectAll(userId: number, selected: number) {
    await this.cartModel.update({ userId } as any, { selected });
    return true;
  }
}
