import { BASE_URL, authHeaderValue } from '../request';
import { getToken } from '@/utils/auth';

export interface UploadResult {
  url: string;
}

/**
 * 上传图片 / 视频（multipart，字段名 file）。
 * 上传不走统一解包（uni.uploadFile 返回结构与 uni.request 不同）。
 */
function upload(url: string, filePath: string, name = 'file'): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: BASE_URL + url,
      filePath,
      name,
      header: { Authorization: authHeaderValue(getToken()) },
      success: (res) => {
        try {
          const body = JSON.parse(res.data);
          if (body.code !== 0) {
            uni.showToast({ title: body.message || '上传失败', icon: 'none' });
            reject(body);
            return;
          }
          resolve(body.data);
        } catch (e) {
          reject(e);
        }
      },
      fail: (err) => {
        uni.showToast({ title: '上传失败', icon: 'none' });
        reject(err);
      },
    });
  });
}

/** 图片 jpg/png/webp ≤5MB */
export const uploadImage = (filePath: string) => upload('/api/upload/image', filePath);

/** 视频 mp4 ≤100MB ≤60s */
export const uploadVideo = (filePath: string) => upload('/api/upload/video', filePath);
