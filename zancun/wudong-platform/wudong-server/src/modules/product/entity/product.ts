import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { AppUserEntity } from '../../user/entity/user';

/**
 * 商品分类
 */
@Entity('app_category')
export class AppCategoryEntity extends BaseEntity {
  @Column({ comment: '分类名称', length: 50 })
  name: string;

  @Column({ comment: '分类图标', length: 255, nullable: true })
  icon: string;

  @Column({ comment: '分类描述', length: 255, nullable: true })
  description: string;

  @Column({ comment: '排序', default: 0 })
  sort: number;

  @Column({ comment: '状态 0-禁用 1-启用', default: 1 })
  status: number;
}

/**
 * 商品实体
 */
@Entity('app_product')
export class AppProductEntity extends BaseEntity {
  @Index()
  @Column({ comment: '商品名称', length: 100 })
  name: string;

  @Column({ comment: '商品描述', type: 'text', nullable: true })
  description: string;

  @Column({ comment: '商品价格(分)', default: 0 })
  price: number;

  @Column({ comment: '原价(分)', nullable: true })
  originalPrice: number;

  @Column({ comment: '商品图片(JSON数组)', type: 'text', nullable: true })
  images: string;

  @Column({ comment: '商品封面图', length: 255, nullable: true })
  coverImage: string;

  @Column({ comment: '库存数量', default: 0 })
  stock: number;

  @Column({ comment: '单位', length: 20, default: '件' })
  unit: string;

  @Index()
  @Column({ comment: '分类ID', nullable: true })
  categoryId: number;

  @ManyToOne(() => AppCategoryEntity)
  @JoinColumn({ name: 'categoryId' })
  category: AppCategoryEntity;

  @Index()
  @Column({ comment: '商家ID', nullable: true })
  merchantId: number | null;

  @ManyToOne(() => AppUserEntity)
  @JoinColumn({ name: 'merchantId' })
  merchant: AppUserEntity;

  @Column({ comment: '非遗级别 0-普通 1-县级 2-州级 3-省级 4-国家级', default: 0 })
  heritageLevel: number;

  @Column({ comment: '非遗工艺描述', length: 255, nullable: true })
  heritageDesc: string;

  @Column({ comment: '浏览量', default: 0 })
  viewCount: number;

  @Column({ comment: '销量', default: 0 })
  salesCount: number;

  @Column({ comment: '商品详情(富文本)', type: 'text', nullable: true })
  detail: string;

  @Column({ comment: '状态 0-下架 1-上架', default: 1 })
  status: number;

  @Column({ comment: '是否推荐 0-否 1-是', default: 0 })
  isRecommend: number;
}
