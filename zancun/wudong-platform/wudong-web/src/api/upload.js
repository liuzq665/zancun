import request from '@/utils/request'

/**
 * 图片上传（multipart，字段名 file）。
 * 返回 { code, data: { url } }，url 是可直接访问的相对路径。
 */
export function uploadImage(file) {
  const form = new FormData()
  form.append('file', file)
  return request.post('/app/upload/image', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
