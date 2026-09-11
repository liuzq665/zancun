import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { AppMessageEntity } from '../entity/message';

@Provide()
export class MessageService {
  @InjectEntityModel(AppMessageEntity)
  repo: Repository<AppMessageEntity>;

  /** 写入站内信（下单/支付等事件调用） */
  async notify(userId: number, type: string, title: string, content: string) {
    await this.repo.save(this.repo.create({ userId, type, title, content, isRead: 0 } as any));
  }

  async list(userId: number, page: number, pageSize: number) {
    const [list, total] = await this.repo.findAndCount({
      where: { userId } as any,
      order: { id: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { list, total };
  }

  async read(id: number, userId: number) {
    await this.repo.update({ id, userId } as any, { isRead: 1 } as any);
  }

  /** 全部标记已读 */
  async readAll(userId: number) {
    await this.repo.update({ userId, isRead: 0 } as any, { isRead: 1 } as any);
  }

  /** 未读数量（PC 顶栏铃铛角标用） */
  async unreadCount(userId: number) {
    return this.repo.count({ where: { userId, isRead: 0 } as any });
  }
}
