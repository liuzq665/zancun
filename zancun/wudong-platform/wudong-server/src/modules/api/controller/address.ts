import { Controller, Del, Get, Inject, Param, Post, Put, Body } from '@midwayjs/core';
import { ApiController } from '../api.controller';
import { AddressService } from '../service/address';
import { fail, ok } from '../helper';

/**
 * 小程序用 receiverName/receiverPhone，实体用 name/phone，这里做字段换名。
 */
@Controller('/api/address')
export class ApiAddressController extends ApiController {
  @Inject()
  addressService: AddressService;

  private toDto(a: any) {
    return {
      id: a.id,
      receiverName: a.name,
      receiverPhone: a.phone,
      province: a.province,
      city: a.city,
      district: a.district,
      detail: a.detail,
      isDefault: a.isDefault,
    };
  }

  private toEntity(body: any) {
    const data: any = {};
    if (body.receiverName !== undefined) data.name = body.receiverName;
    if (body.receiverPhone !== undefined) data.phone = body.receiverPhone;
    ['province', 'city', 'district', 'detail'].forEach(k => {
      if (body[k] !== undefined) data[k] = body[k];
    });
    if (body.isDefault !== undefined) data.isDefault = Number(body.isDefault) ? 1 : 0;
    return data;
  }

  @Get('/list')
  async list() {
    const uid = this.uid();
    if (!uid) return this.unauth();

    const rows = await this.addressService.list(uid);
    return ok(rows.map(r => this.toDto(r)));
  }

  @Post('/add')
  async add(@Body() body: any) {
    const uid = this.uid();
    if (!uid) return this.unauth();

    const saved = await this.addressService.add(uid, this.toEntity(body));
    return ok(this.toDto(saved));
  }

  @Put('/update/:id')
  async update(@Param('id') id: string, @Body() body: any) {
    const uid = this.uid();
    if (!uid) return this.unauth();

    const result = await this.addressService.update(Number(id), uid, this.toEntity(body));
    if (!result) return fail(3001, '地址不存在');
    return ok(null);
  }

  @Del('/remove/:id')
  async remove(@Param('id') id: string) {
    const uid = this.uid();
    if (!uid) return this.unauth();

    await this.addressService.remove(Number(id), uid);
    return ok(null);
  }

  @Put('/default/:id')
  async setDefault(@Param('id') id: string) {
    const uid = this.uid();
    if (!uid) return this.unauth();

    await this.addressService.setDefault(Number(id), uid);
    return ok(null);
  }
}
