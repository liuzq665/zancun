import { get, post, put } from '../request';
import type { LoginResult, User } from '../types';

/** 发送验证码 */
export const sendSms = (phone: string) =>
  post<null>('/api/auth/sms/send', { phone }, { auth: false });

/** 注册 */
export const register = (data: { phone: string; code: string; password: string }) =>
  post<{ id: number; username: string }>('/api/auth/register', data, { auth: false });

/** 登录 */
export const login = (data: { phone: string; password: string }) =>
  post<LoginResult>('/api/auth/login', data, { auth: false });

/** 微信登录（预留） */
export const wechatLogin = (code: string) =>
  post<LoginResult>('/api/user/wechat/login', { code }, { auth: false });

/** 个人信息 */
export const getProfile = () => get<User>('/api/auth/profile');

export const updateProfile = (data: Partial<User>) => put<null>('/api/auth/profile', data);
