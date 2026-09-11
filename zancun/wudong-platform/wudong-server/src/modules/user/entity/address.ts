import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 用户收货地址
 */
@Entity('app_address')
export class AppAddressEntity extends BaseEntity {
  @Index()
  @Column({ comment: '用户ID' })
  userId: number;

  @Column({ comment: '收货人', length: 50 })
  name: string;

  @Column({ comment: '手机号', length: 20 })
  phone: string;

  @Column({ comment: '省份', length: 50 })
  province: string;

  @Column({ comment: '城市', length: 50 })
  city: string;

  @Column({ comment: '区县', length: 50 })
  district: string;

  @Column({ comment: '详细地址', length: 255 })
  detail: string;

  @Column({ comment: '是否默认 0-否 1-是', default: 0 })
  isDefault: number;
}
