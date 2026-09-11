import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { AppUserEntity } from '../../user/entity/user';

/**
 * 餐厅实体
 */
@Entity('app_restaurant')
export class AppRestaurantEntity extends BaseEntity {
  @Index()
  @Column({ comment: '餐厅名称', length: 100 })
  name: string;

  @Column({ comment: '餐厅描述', type: 'text', nullable: true })
  description: string;

  @Column({ comment: '餐厅封面图', length: 255, nullable: true })
  coverImage: string;

  @Column({ comment: '餐厅图片(JSON)', type: 'text', nullable: true })
  images: string;

  @Column({ comment: '人均价格(分)', nullable: true })
  avgPrice: number;

  @Column({ comment: '地址', length: 200, nullable: true })
  address: string;

  @Column({ comment: '经度', type: 'decimal', precision: 10, scale: 6, nullable: true })
  longitude: number;

  @Column({ comment: '纬度', type: 'decimal', precision: 10, scale: 6, nullable: true })
  latitude: number;

  @Column({ comment: '联系电话', length: 20, nullable: true })
  phone: string;

  @Column({ comment: '营业时间', length: 100, nullable: true })
  businessHours: string;

  @Index()
  @Column({ comment: '商家ID', nullable: true })
  merchantId: number;

  @ManyToOne(() => AppUserEntity)
  @JoinColumn({ name: 'merchantId' })
  merchant: AppUserEntity;

  @Column({ comment: '评分 1-5', default: 5 })
  rating: number;

  @Column({ comment: '评分数量', default: 0 })
  ratingCount: number;

  @Column({ comment: '收藏数量', default: 0 })
  favoriteCount: number;

  @Column({ comment: '餐厅特色标签(JSON)', type: 'text', nullable: true })
  tags: string;

  @Column({ comment: '环境描述', length: 255, nullable: true })
  environment: string;

  @Column({ comment: '特色菜品(JSON)', type: 'text', nullable: true })
  specialties: string;

  @Column({ comment: '状态 0-歇业 1-营业', default: 1 })
  status: number;

  @Column({ comment: '是否推荐 0-否 1-是', default: 0 })
  isRecommend: number;
}

/**
 * 菜品实体
 */
@Entity('app_dish')
export class AppDishEntity extends BaseEntity {
  @Index()
  @Column({ comment: '菜品名称', length: 100 })
  name: string;

  @Column({ comment: '菜品描述', length: 255, nullable: true })
  description: string;

  @Column({ comment: '菜品图片', length: 255, nullable: true })
  coverImage: string;

  @Column({ comment: '价格(分)', default: 0 })
  price: number;

  @Column({ comment: '原价(分)', nullable: true })
  originalPrice: number;

  @Index()
  @Column({ comment: '餐厅ID' })
  restaurantId: number;

  @ManyToOne(() => AppRestaurantEntity)
  @JoinColumn({ name: 'restaurantId' })
  restaurant: AppRestaurantEntity;

  @Column({ comment: '菜品分类 如:招牌菜/凉菜/主食', length: 50, nullable: true })
  category: string;

  @Column({ comment: '库存', default: 0 })
  stock: number;

  @Column({ comment: '销量', default: 0 })
  salesCount: number;

  @Column({ comment: '状态 0-售罄 1-在售', default: 1 })
  status: number;
}

/**
 * 餐桌/包间预订
 */
@Entity('app_table')
export class AppTableEntity extends BaseEntity {
  @Index()
  @Column({ comment: '餐桌编号', length: 20 })
  tableNo: string;

  @Column({ comment: '餐桌类型 如:大桌/中桌/小桌/包间', length: 20, default: '中桌' })
  tableType: string;

  @Column({ comment: '容纳人数', default: 4 })
  capacity: number;

  @Column({ comment: '价格(分)', default: 0 })
  price: number;

  @Index()
  @Column({ comment: '餐厅ID' })
  restaurantId: number;

  @ManyToOne(() => AppRestaurantEntity)
  @JoinColumn({ name: 'restaurantId' })
  restaurant: AppRestaurantEntity;

  @Column({ comment: '状态 0-不可用 1-可用', default: 1 })
  status: number;
}

/**
 * 餐厅评论
 */
@Entity('app_restaurant_review')
export class AppRestaurantReviewEntity extends BaseEntity {
  @Index()
  @Column({ comment: '餐厅ID' })
  restaurantId: number;

  @ManyToOne(() => AppRestaurantEntity)
  @JoinColumn({ name: 'restaurantId' })
  restaurant: AppRestaurantEntity;

  @Index()
  @Column({ comment: '用户ID' })
  userId: number;

  @ManyToOne(() => AppUserEntity)
  @JoinColumn({ name: 'userId' })
  user: AppUserEntity;

  @Column({ comment: '评分 1-5', default: 5 })
  rating: number;

  @Column({ comment: '评论内容', type: 'text', nullable: true })
  content: string;

  @Column({ comment: '评论图片(JSON)', type: 'text', nullable: true })
  images: string;

  @Column({ comment: '状态 0-隐藏 1-显示', default: 1 })
  status: number;
}
