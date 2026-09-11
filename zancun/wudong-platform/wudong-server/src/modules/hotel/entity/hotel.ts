import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { AppUserEntity } from '../../user/entity/user';

/**
 * 民宿/酒店实体
 */
@Entity('app_hotel')
export class AppHotelEntity extends BaseEntity {
  @Index()
  @Column({ comment: '民宿名称', length: 100 })
  name: string;

  @Column({ comment: '民宿描述', type: 'text', nullable: true })
  description: string;

  @Column({ comment: '封面图', length: 255, nullable: true })
  coverImage: string;

  @Column({ comment: '图片(JSON)', type: 'text', nullable: true })
  images: string;

  @Column({ comment: '地址', length: 200, nullable: true })
  address: string;

  @Column({ comment: '经度', type: 'decimal', precision: 10, scale: 6, nullable: true })
  longitude: number;

  @Column({ comment: '纬度', type: 'decimal', precision: 10, scale: 6, nullable: true })
  latitude: number;

  @Column({ comment: '联系电话', length: 20, nullable: true })
  phone: string;

  @Index()
  @Column({ comment: '商家ID', nullable: true })
  merchantId: number;

  @ManyToOne(() => AppUserEntity)
  @JoinColumn({ name: 'merchantId' })
  merchant: AppUserEntity;

  @Column({ comment: '民宿类型 如:吊脚楼/木楼/现代', length: 50, nullable: true })
  hotelType: string;

  @Column({ comment: '特色标签(JSON)', type: 'text', nullable: true })
  tags: string;

  @Column({ comment: '入住时间', length: 20, default: '14:00' })
  checkInTime: string;

  @Column({ comment: '退房时间', length: 20, default: '12:00' })
  checkOutTime: string;

  @Column({ comment: '最低价格(分)', nullable: true })
  minPrice: number;

  @Column({ comment: '评分 1-5', default: 5 })
  rating: number;

  @Column({ comment: '评分数量', default: 0 })
  ratingCount: number;

  @Column({ comment: '收藏数量', default: 0 })
  favoriteCount: number;

  @Column({ comment: '环境描述', length: 255, nullable: true })
  environment: string;

  @Column({ comment: '配套设施(JSON)', type: 'text', nullable: true })
  facilities: string;

  @Column({ comment: '周围景观', length: 255, nullable: true })
  nearbyScenery: string;

  @Column({ comment: '状态 0-歇业 1-营业', default: 1 })
  status: number;

  @Column({ comment: '是否推荐 0-否 1-是', default: 0 })
  isRecommend: number;
}

/**
 * 房间实体
 */
@Entity('app_room')
export class AppRoomEntity extends BaseEntity {
  @Index()
  @Column({ comment: '房间名称/房型', length: 100 })
  name: string;

  @Column({ comment: '房间描述', length: 255, nullable: true })
  description: string;

  @Column({ comment: '封面图', length: 255, nullable: true })
  coverImage: string;

  @Column({ comment: '图片(JSON)', type: 'text', nullable: true })
  images: string;

  @Column({ comment: '价格(分)/晚', default: 0 })
  price: number;

  @Column({ comment: '原价(分)', nullable: true })
  originalPrice: number;

  @Index()
  @Column({ comment: '民宿ID' })
  hotelId: number;

  @ManyToOne(() => AppHotelEntity)
  @JoinColumn({ name: 'hotelId' })
  hotel: AppHotelEntity;

  @Column({ comment: '容纳人数', default: 2 })
  capacity: number;

  @Column({ comment: '床型 如:大床/双床/榻榻米', length: 50, nullable: true })
  bedType: string;

  @Column({ comment: '房间面积(平方米)', nullable: true })
  area: number;

  @Column({ comment: '楼层', nullable: true })
  floor: number;

  @Column({ comment: '库存(房间数)', default: 0 })
  stock: number;

  @Column({ comment: '配套设施(JSON)', type: 'text', nullable: true })
  facilities: string;

  @Column({ comment: '状态 0-不可预订 1-可预订', default: 1 })
  status: number;
}

/**
 * 民宿评论
 */
@Entity('app_hotel_review')
export class AppHotelReviewEntity extends BaseEntity {
  @Index()
  @Column({ comment: '民宿ID' })
  hotelId: number;

  @ManyToOne(() => AppHotelEntity)
  @JoinColumn({ name: 'hotelId' })
  hotel: AppHotelEntity;

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

  @Column({ comment: '入住日期', type: 'date', nullable: true })
  checkInDate: Date;

  @Column({ comment: '状态 0-隐藏 1-显示', default: 1 })
  status: number;
}
