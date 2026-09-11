import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 管理员实体
 */
@Entity('app_admin')
export class AppAdminEntity extends BaseEntity {
  @Column({ comment: '管理员账号', length: 50, unique: true })
  username: string;

  @Column({ comment: '密码', length: 100 })
  password: string;

  @Column({ comment: '管理员昵称', length: 50, nullable: true })
  nickname: string;

  @Column({ comment: '头像', length: 255, nullable: true })
  avatar: string;

  @Column({ comment: '角色 admin-超级管理员 manager-运营管理', length: 20, default: 'manager' })
  role: string;

  @Column({ comment: '手机号', length: 20, nullable: true })
  phone: string;

  @Column({ comment: '状态 0-禁用 1-启用', default: 1 })
  status: number;
}

/**
 * 系统配置实体
 */
@Entity('app_config')
export class AppConfigEntity extends BaseEntity {
  @Column({ comment: '配置键', length: 100, unique: true })
  configKey: string;

  @Column({ comment: '配置值', type: 'text', nullable: true })
  configValue: string;

  @Column({ comment: '配置名称', length: 100, nullable: true })
  configName: string;

  @Column({ comment: '配置分组', length: 50, nullable: true })
  group: string;

  @Column({ comment: '配置类型 string/number/boolean/json', length: 20, default: 'string' })
  configType: string;

  @Column({ comment: '备注', length: 255, nullable: true })
  remark: string;
}

/**
 * 操作日志实体
 */
@Entity('app_log')
export class AppLogEntity extends BaseEntity {
  @Index()
  @Column({ comment: '管理员ID', nullable: true })
  adminId: number;

  @Column({ comment: '管理员名称', length: 50, nullable: true })
  adminName: string;

  @Column({ comment: '操作类型', length: 50, nullable: true })
  action: string;

  @Column({ comment: '操作内容', type: 'text', nullable: true })
  content: string;

  @Column({ comment: 'IP地址', length: 50, nullable: true })
  ip: string;

  @Column({ comment: '请求参数', type: 'text', nullable: true })
  params: string;

  @Column({ comment: '操作结果 0-失败 1-成功', default: 1 })
  result: number;
}
