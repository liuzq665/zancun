import { get, put } from '../request';
import type { Message, PageQuery, PageResult } from '../types';

/** 消息列表 */
export const list = (query?: PageQuery) => get<PageResult<Message>>('/api/message/list', query);

/** 标记已读 */
export const read = (id: number) => put<null>(`/api/message/read/${id}`);
