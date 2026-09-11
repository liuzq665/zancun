import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { AppUserEntity } from '../../user/entity/user';

/**
 * 景区实体
 */
@Entity('app_scenic')
export class AppScenicEntity extends BaseEntity {
  @Index()
  @Column({ comment: '景区名称', length: 100 })
  name: string;

  @Column({ comment: '景区描述', type: 'text', nullable: true })
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

  @Column({ comment: '开放时间', length: 100, nullable: true })
  openTime: string;

  @Column({ comment: '建议游玩时长', length: 50, nullable: true })
  suggestedDuration: string;

  @Column({ comment: '景区类型 如:自然风光/民族文化/历史遗迹', length: 50, nullable: true })
  scenicType: string;

  @Column({ comment: '特色标签(JSON)', type: 'text', nullable: true })
  tags: string;

  @Column({ comment: '门票价格(分)', nullable: true })
  ticketPrice: number;

  @Column({ comment: '收藏数量', default: 0 })
  favoriteCount: number;

  @Column({ comment: '状态 0-关闭 1-开放', default: 1 })
  status: number;

  @Column({ comment: '是否推荐 0-否 1-是', default: 0 })
  isRecommend: number;
}

/**
 * 游览路线
 */
@Entity('app_route')
export class AppRouteEntity extends BaseEntity {
  @Index()
  @Column({ comment: '路线名称', length: 100 })
  name: string;

  @Column({ comment: '路线描述', type: 'text', nullable: true })
  description: string;

  @Column({ comment: '封面图', length: 255, nullable: true })
  coverImage: string;

  @Column({ comment: '路线类型 如:一日游/两日游/深度游', length: 50, nullable: true })
  routeType: string;

  @Column({ comment: '价格(分)', default: 0 })
  price: number;

  @Column({ comment: '原价(分)', nullable: true })
  originalPrice: number;

  @Index()
  @Column({ comment: '所属景区ID', nullable: true })
  scenicId: number;

  @ManyToOne(() => AppScenicEntity)
  @JoinColumn({ name: 'scenicId' })
  scenic: AppScenicEntity;

  @Column({ comment: '途经景点(JSON)', type: 'text', nullable: true })
  spots: string;

  @Column({ comment: '行程安排(JSON)', type: 'text', nullable: true })
  itinerary: string;

  @Column({ comment: '包含服务(JSON)', type: 'text', nullable: true })
  includes: string;

  @Column({ comment: '注意事项', type: 'text', nullable: true })
  tips: string;

  @Column({ comment: '集合地点', length: 200, nullable: true })
  meetingPoint: string;

  @Column({ comment: '集合时间', length: 50, nullable: true })
  meetingTime: string;

  @Column({ comment: '成团人数', default: 10 })
  minPeople: number;

  @Column({ comment: '最大人数', default: 30 })
  maxPeople: number;

  @Column({ comment: '已报名人数', default: 0 })
  enrolledCount: number;

  @Column({ comment: '状态 0-不可预订 1-可预订', default: 1 })
  status: number;

  @Column({ comment: '是否推荐 0-否 1-是', default: 0 })
  isRecommend: number;
}

/**
 * 订单/票务
 */
@Entity('app_order')
export class AppOrderEntity extends BaseEntity {
  @Column({ comment: '订单编号', length: 32, unique: true })
  orderNo: string;

  @Index()
  @Column({ comment: '用户ID' })
  userId: number;

  @ManyToOne(() => AppUserEntity)
  @JoinColumn({ name: 'userId' })
  user: AppUserEntity;

  @Column({ comment: '订单类型 ticket-票务 hotel-住宿 product-商品 restaurant-餐饮', length: 20 })
  orderType: string;

  @Column({ comment: '关联ID(票务/住宿/商品/餐厅ID)', nullable: true })
  relatedId: number;

  @Column({ comment: '关联名称', length: 100, nullable: true })
  relatedName: string;

  @Column({ comment: '数量', default: 1 })
  quantity: number;

  @Column({ comment: '单价(分)', default: 0 })
  unitPrice: number;

  @Column({ comment: '总价(分)', default: 0 })
  totalPrice: number;

  @Column({ comment: '预订日期/入住日期', type: 'date', nullable: true })
  bookDate: Date;

  @Column({ comment: '结束日期(退房日期)', type: 'date', nullable: true })
  endDate: Date;

  @Column({ comment: '联系人姓名', length: 50, nullable: true })
  contactName: string;

  @Column({ comment: '联系人电话', length: 20, nullable: true })
  contactPhone: string;

  @Column({ comment: '备注', length: 255, nullable: true })
  remark: string;

  @Column({ comment: '订单状态 0-已取消 1-待支付 2-已支付 3-已完成 4-已退款', default: 1 })
  orderStatus: number;

  @Column({ comment: '支付方式 wx-微信 zfb-支付宝', length: 20, nullable: true })
  payMethod: string;

  @Column({ comment: '支付时间', type: 'datetime', nullable: true })
  payTime: Date;

  @Column({ comment: '取消原因', length: 255, nullable: true })
  cancelReason: string;
}
