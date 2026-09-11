/**
 * 地理工具函数
 * 提供距离计算、位置获取等地理位置相关功能
 */

/**
 * 计算两点之间的直线距离（使用 Haversine 公式）
 * @param lat1 第一个点的纬度
 * @param lng1 第一个点的经度
 * @param lat2 第二个点的纬度
 * @param lng2 第二个点的经度
 * @returns 距离（单位：公里）
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371 // 地球半径（公里）
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * 角度转弧度
 */
function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

/**
 * 获取用户当前位置
 * @returns Promise<{ latitude: number, longitude: number }>
 */
export function getUserLocation(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('浏览器不支持地理定位'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      (error) => {
        let message = '获取位置失败'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = '用户拒绝了定位请求'
            break
          case error.POSITION_UNAVAILABLE:
            message = '位置信息不可用'
            break
          case error.TIMEOUT:
            message = '获取位置超时'
            break
        }
        reject(new Error(message))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    )
  })
}

/**
 * 格式化距离显示
 * @param distance 距离（公里）
 * @returns 格式化后的字符串
 */
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`
  }
  if (distance < 10) {
    return `${distance.toFixed(1)}km`
  }
  return `${Math.round(distance)}km`
}

/**
 * 判断是否在中国境内（粗略判断）
 * @param lat 纬度
 * @param lng 经度
 */
export function isInChina(lat: number, lng: number): boolean {
  // 中国大致范围：纬度 18-54，经度 73-135
  return lat >= 18 && lat <= 54 && lng >= 73 && lng <= 135
}

/**
 * 计算位置偏移（用于地图展示）
 * @param lat 纬度
 * @param lng 经度
 * @param offsetLat 纬度偏移量
 * @param offsetLng 经度偏移量
 */
export function offsetPosition(
  lat: number,
  lng: number,
  offsetLat: number,
  offsetLng: number
): { latitude: number; longitude: number } {
  return {
    latitude: lat + offsetLat,
    longitude: lng + offsetLng,
  }
}

/**
 * 乌东村中心坐标（默认位置）
 */
export const WUDONG_CENTER = {
  latitude: 26.5833,
  longitude: 108.5833,
  name: '乌东村',
}

/**
 * 根据距离排序列表
 * @param items 列表项
 * @param userLat 用户纬度
 * @param userLng 用户经度
 * @param getPosition 获取每项位置的函数
 * @returns 排序后的列表
 */
export function sortByDistance<T>(
  items: T[],
  userLat: number,
  userLng: number,
  getPosition: (item: T) => { latitude: number; longitude: number }
): T[] {
  return [...items].sort((a, b) => {
    const posA = getPosition(a)
    const posB = getPosition(b)
    const distA = calculateDistance(userLat, userLng, posA.latitude, posA.longitude)
    const distB = calculateDistance(userLat, userLng, posB.latitude, posB.longitude)
    return distA - distB
  })
}

/**
 * 生成高德地图导航链接
 * @param destLat 目的地纬度
 * @param destLng 目的地经度
 * @param destName 目的地名称
 * @param userLat 用户纬度（可选）
 * @param userLng 用户经度（可选）
 */
export function getAmapNavigationUrl(
  destLat: number,
  destLng: number,
  destName: string,
  userLat?: number,
  userLng?: number
): string {
  const encodedName = encodeURIComponent(destName)
  if (userLat && userLng) {
    // 起点导航
    return `https://uri.amap.com/navigation?to=${destLng},${destLat},${encodedName}&mode=car&callnative=1`
  }
  // 直接导航到目的地
  return `https://uri.amap.com/navigation?to=${destLng},${destLat},${encodedName}&mode=car&callnative=1`
}

/**
 * 生成百度地图导航链接
 * @param destLat 目的地纬度
 * @param destLng 目的地经度
 * @param destName 目的地名称
 */
export function getBaiduNavigationUrl(
  destLat: number,
  destLng: number,
  destName: string
): string {
  // 百度坐标转换（简单处理，实际可能需要更精确的转换）
  const encodedName = encodeURIComponent(destName)
  return `https://api.map.baidu.com/direction?destination=latlng:${destLat},${destLng}|name:${encodedName}&mode=driving&output=html&src=webapp.navi.${encodedName}`
}

/**
 * 生成腾讯地图导航链接
 * @param destLat 目的地纬度
 * @param destLng 目的地经度
 * @param destName 目的地名称
 */
export function getTencentNavigationUrl(
  destLat: number,
  destLng: number,
  destName: string
): string {
  const encodedName = encodeURIComponent(destName)
  return `https://apis.map.qq.com/tools/routeplan/?epointx=${destLng}&epointy=${destLat}&ename=${encodedName}&referer=乌东文旅`
}

/**
 * 生成 Apple Maps 导航链接（iOS/macOS）
 * @param destLat 目的地纬度
 * @param destLng 目的地经度
 * @param destName 目的地名称
 */
export function getAppleNavigationUrl(
  destLat: number,
  destLng: number,
  destName: string
): string {
  const encodedName = encodeURIComponent(destName)
  return `http://maps.apple.com/?daddr=${destLat},${destLng}&q=${encodedName}&dirflg=d`
}

/**
 * 判断设备类型
 */
export function getDeviceType(): 'ios' | 'android' | 'desktop' {
  const userAgent = navigator.userAgent.toLowerCase()
  if (/iphone|ipad|ipod/.test(userAgent)) return 'ios'
  if (/android/.test(userAgent)) return 'android'
  return 'desktop'
}

/**
 * 获取最适合的导航链接
 * @param destLat 目的地纬度
 * @param destLng 目的地经度
 * @param destName 目的地名称
 * @param userLat 用户纬度（可选）
 * @param userLng 用户经度（可选）
 */
export function getNavigationUrl(
  destLat: number,
  destLng: number,
  destName: string,
  userLat?: number,
  userLng?: number
): string {
  const device = getDeviceType()

  if (device === 'ios') {
    return getAppleNavigationUrl(destLat, destLng, destName)
  }

  // Android 和 desktop 都使用高德地图
  return getAmapNavigationUrl(destLat, destLng, destName, userLat, userLng)
}
