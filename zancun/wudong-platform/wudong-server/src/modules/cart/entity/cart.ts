import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { AppUserEntity } from '../../user/entity/user';
import { AppProductEntity } from '../../product/entity/product';

/**
 * 购物车实体
 */
@Entity('cart')
export class AppCartEntity extends BaseEntity {
  @Index()
  @Column({ comment: '用户ID' })
  userId: number;

  @ManyToOne(() => AppUserEntity)
  @JoinColumn({ name: 'userId' })
  user: AppUserEntity;

  @Index()
  @Column({ comment: '商品ID' })
  productId: number;

  @ManyToOne(() => AppProductEntity)
  @JoinColumn({ name: 'productId' })
  product: AppProductEntity;

  @Column({ comment: '数量', default: 1 })
  quantity: number;

  @Column({ comment: '是否选中 0-否 1-是', default: 1 })
  selected: number;
}
