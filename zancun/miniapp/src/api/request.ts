import type { ApiResult } from './types';
import { getToken, clearToken } from '@/utils/auth';
import { mockRequest } from '@/mock';

/**
 * 后端基地址。真机调试时改为局域网 IP（如 http://192.168.1.10:8001）。
 */
export const BASE_URL = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8001';

/** 是否走 mock（后端未就绪时置 true） */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

/**
 * 鉴权头取值。Bearer token 格式。
 */
export function authHeaderValue(token: string): string {
  return `Bearer ${token}`;
}

export interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  /** 是否携带 token，默认 true */
  auth?: boolean;
  /** 失败时是否静默（不弹 toast） */
  silent?: boolean;
}

let redirecting = false;

function handleUnauthorized(silent: boolean) {
  clearToken();
  if (redirecting) return;
  redirecting = true;
  uni.showToast({ title: '登录已失效', icon: 'none' });
  uni.navigateTo({
    url: '/pages/login/login',
    complete: () => {
      redirecting = false;
    },
  });
  if (!silent) return;
}

/**
 * 统一请求：解包 {code,message,data}，code!==0 抛错，401 跳登录。
 */
export function request<T = any>(options: RequestOptions): Promise<T> {
  const { url, method = 'GET', data, auth = true, silent = false } = options;

  if (USE_MOCK) {
    return mockRequest<T>({ url, method, data, auth, silent });
  }

  return new Promise<T>((resolve, reject) => {
    const header: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const token = getToken();
    if (auth && token) {
      header['Authorization'] = authHeaderValue(token);
    }

    uni.request({
      url: BASE_URL + url,
      method,
      data,
      header,
      success: (res) => {
        const body = res.data as ApiResult<T>;
        if (res.statusCode === 401) {
          handleUnauthorized(silent);
          reject(body || { code: 401, message: '未登录' });
          return;
        }
        if (!body || typeof body.code === 'undefined') {
          reject({ code: -1, message: '返回格式异常' });
          return;
        }
        if (body.code !== 0) {
          if (!silent) {
            uni.showToast({ title: body.message || '请求失败', icon: 'none' });
          }
          reject(body);
          return;
        }
        resolve(body.data);
      },
      fail: (err) => {
        if (!silent) {
          uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' });
        }
        reject(err);
      },
    });
  });
}

export const get = <T = any>(url: string, data?: any, opts?: Partial<RequestOptions>) =>
  request<T>({ url, method: 'GET', data, ...opts });

export const post = <T = any>(url: string, data?: any, opts?: Partial<RequestOptions>) =>
  request<T>({ url, method: 'POST', data, ...opts });

export const put = <T = any>(url: string, data?: any, opts?: Partial<RequestOptions>) =>
  request<T>({ url, method: 'PUT', data, ...opts });

export const del = <T = any>(url: string, data?: any, opts?: Partial<RequestOptions>) =>
  request<T>({ url, method: 'DELETE', data, ...opts });
