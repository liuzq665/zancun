import { Controller, Get, Inject, Param, Put, Query } from '@midwayjs/core';
import { ApiController } from '../api.controller';
import { MessageService } from '../../message/service/message';
import { ok, pageArgs, pageResult } from '../helper';

@Controller('/api/message')
export class ApiMessageController extends ApiController {
  @Inject()
  messageService: MessageService;

  @Get('/list')
  async list(@Query() query: any) {
    const uid = this.uid();
    if (!uid) return this.unauth();

    const { page, size } = pageArgs(query);
    const res = await this.messageService.list(uid, page, size);

    const list = res.list.map((m: any) => ({
      id: m.id,
      type: m.type,
      title: m.title,
      content: m.content,
      isRead: m.isRead,
    }));
    return ok(pageResult(list, res.total, page, size));
  }

  @Put('/read/:id')
  async read(@Param('id') id: string) {
    const uid = this.uid();
    if (!uid) return this.unauth();

    await this.messageService.read(Number(id), uid);
    return ok(null);
  }
}
