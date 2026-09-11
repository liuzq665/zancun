import { del, get, post, put } from '../request';
import type { Address } from '../types';

export type AddressInput = Omit<Address, 'id'>;

/** 7.3.6 地址列表 */
export const list = () => get<Address[]>('/api/address/list');

/** 7.3.6 新增地址 */
export const add = (data: AddressInput) => post<Address>('/api/address/add', data);

/** 7.3.6 修改地址 */
export const update = (id: number, data: Partial<AddressInput>) =>
  put<null>(`/api/address/update/${id}`, data);

/** 7.3.6 删除地址 */
export const remove = (id: number) => del<null>(`/api/address/remove/${id}`);

/** 7.3.6 设为默认 */
export const setDefault = (id: number) => put<null>(`/api/address/default/${id}`);
