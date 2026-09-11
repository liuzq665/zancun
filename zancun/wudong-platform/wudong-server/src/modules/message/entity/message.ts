import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 站内消息（对应文档 4.4.1 的 base_message）。
 */
@Entity('app_message')
export class AppMessageEntity extends BaseEntity {
  @Index()
  @Column({ comment: '用户ID' })
  userId: number;

  @Column({ comment: '类型 system-系统 order-订单 interact-互动', length: 20, default: 'system' })
  type: string;

  @Column({ comment: '标题', length: 200, nullable: true })
  title: string;

  @Column({ comment: '内容', type: 'text', nullable: true })
  content: string;

  @Column({ comment: '是否已读 0-未读 1-已读', default: 0 })
  isRead: number;
}
