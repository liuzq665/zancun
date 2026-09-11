import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 用户实体
 */
@Entity('app_user')
export class AppUserEntity extends BaseEntity {
  @Column({ comment: '手机号', length: 20, unique: true })
phone: string;

  @Column({ comment: '密码', length: 100 })
  password: string;

  @Column({ comment: '昵称', length: 50, nullable: true })
  nickname: string;

  @Column({ comment: '头像', length: 255, nullable: true })
  avatar: string;

  @Column({ comment: '性别 0-未知 1-男 2-女', default: 0 })
  gender: number;

  @Column({ comment: '地区', length: 100, nullable: true })
  region: string;

  @Column({ comment: '个人简介', length: 500, nullable: true })
  bio: string;

  @Column({ comment: '角色 visitor-游客 merchant-商家', default: 'visitor', length: 20 })
  role: string;

  @Column({ comment: '状态 0-禁用 1-启用', default: 1 })
  status: number;
}
