import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { AppAddressEntity } from '../../user/entity/address';

/**
 * 收货地址服务。实体早已存在（app_address），但此前没有 service/controller。
 */
@Provide()
export class AddressService {
  @InjectEntityModel(AppAddressEntity)
  repo: Repository<AppAddressEntity>;

  async list(userId: number) {
    return this.repo.find({
      where: { userId } as any,
      order: { isDefault: 'DESC', id: 'DESC' },
    });
  }

  async add(userId: number, data: any) {
    const isDefault = Number(data.isDefault) ? 1 : 0;
    if (isDefault === 1) {
      await this.repo.update({ userId } as any, { isDefault: 0 } as any);
    }
    const entity = this.repo.create({ ...data, userId, isDefault } as any);
    return this.repo.save(entity);
  }

  async update(id: number, userId: number, data: any) {
    const exist = await this.repo.findOne({ where: { id, userId } as any });
    if (!exist) return null;

    const patch: any = { ...data };
    if (patch.isDefault !== undefined) {
      patch.isDefault = Number(patch.isDefault) ? 1 : 0;
      if (patch.isDefault === 1) {
        await this.repo.update({ userId } as any, { isDefault: 0 } as any);
      }
    }
    await this.repo.update({ id, userId } as any, patch);
    return true;
  }

  async remove(id: number, userId: number) {
    await this.repo.delete({ id, userId } as any);
  }

  async setDefault(id: number, userId: number) {
    await this.repo.update({ userId } as any, { isDefault: 0 } as any);
    await this.repo.update({ id, userId } as any, { isDefault: 1 } as any);
  }
}
