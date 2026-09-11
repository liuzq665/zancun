<template>
  <div class="map-view" ref="mapContainer">
    <div v-if="loading" class="map-loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>地图加载中...</span>
    </div>
    <div v-if="error" class="map-error">
      <el-icon><Warning /></el-icon>
      <span>{{ error }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import L from 'leaflet'
import { Loading, Warning } from '@element-plus/icons-vue'
import { WUDONG_CENTER } from '@/utils/geo'

// 定义图标 HTML（放在 props 之前避免解析问题）
const DEFAULT_ICON_HTML = '<div class="marker-pin">' +
  '<svg width="32" height="40" viewBox="0 0 32 40" fill="none">' +
  '<path d="M16 0C7.163 0 0 7.163 0 16c0 8.284 14.25 23.5 15.375 24.708a1 1 0 001.25 0C17.75 39.5 32 24.284 32 16c0-8.837-7.163-16-16-16z" fill="#d4af37"/>' +
  '<circle cx="16" cy="16" r="8" fill="#1a365d"/>' +
  '</svg>' +
  '</div>'

const USER_ICON_HTML = '<div class="user-pin">' +
  '<div class="user-dot"></div>' +
  '<div class="user-pulse"></div>' +
  '</div>'

const props = defineProps({
  // 中心坐标
  center: {
    type: Object,
    default: () => ({ lat: WUDONG_CENTER.latitude, lng: WUDONG_CENTER.longitude }),
  },
  // 缩放级别
  zoom: {
    type: Number,
    default: 15,
  },
  // 标记点列表
  markers: {
    type: Array,
    default: () => [],
  },
  // 是否可点击
  clickable: {
    type: Boolean,
    default: true,
  },
  // 高度
  height: {
    type: String,
    default: '300px',
  },
  // 用户位置 { latitude, longitude }
  userLocation: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['click', 'marker-click', 'map-ready'])

const mapContainer = ref(null)
const loading = ref(true)
const error = ref(null)

let mapInstance = null
let markerGroup = null
let userMarker = null

// 默认标记图标
const defaultIcon = L.divIcon({
  className: 'custom-marker',
  html: DEFAULT_ICON_HTML,
  iconSize: [32, 40],
  iconAnchor: [16, 40],
  popupAnchor: [0, -40],
})

// 用户定位图标
const userIcon = L.divIcon({
  className: 'user-marker',
  html: USER_ICON_HTML,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

// 初始化地图
const initMap = () => {
  if (!mapContainer.value || mapInstance) return

  // 确保容器有尺寸
  const rect = mapContainer.value.getBoundingClientRect()
  console.log('Map container dimensions:', rect.width, rect.height)

  if (rect.width === 0 || rect.height === 0) {
    console.warn('Map container has no dimensions, retrying...')
    setTimeout(initMap, 200)
    return
  }

  try {
    // 修复 Leaflet 默认图标问题
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })

    console.log('Initializing Leaflet map with center:', props.center)

    mapInstance = L.map(mapContainer.value, {
      center: [props.center.lat, props.center.lng],
      zoom: props.zoom,
      scrollWheelZoom: props.clickable,
      dragging: true,
      zoomControl: true,
      preferCanvas: false,
    })

    console.log('Map instance created, adding tile layer...')

    // 添加底图 - 尝试多个地图源，失败时自动切换
    const tileLayers = [
      // 方案1: 高德地图（国内最稳定）
      {
        url: 'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
        options: { subdomains: '1234', attribution: '&copy; <a href="https://www.autonavi.com">高德地图</a>', maxZoom: 18 }
      },
      // 方案2: 天地图（国家基础地理信息中心运营）
      {
        url: 'https://t{s}.tianditu.gov.cn/DataServer?T=vec_w&X={x}&Y={y}&L={z}',
        options: { subdomains: '01234567', attribution: '&copy; <a href="https://www.tianditu.gov.cn">天地图</a>', maxZoom: 18 }
      },
      // 方案3: 腾讯地图
      {
        url: 'https://rt{s}.map.gtimg.com/tile?z={z}&x={x}&y={y}&styleid=2&scene=0',
        options: { subdomains: '0123', attribution: '&copy; <a href="https://www.qq.com">腾讯地图</a>', maxZoom: 18 }
      }
    ]

    let tileLayer = null
    let currentIndex = 0

    const tryNextTileLayer = () => {
      if (currentIndex >= tileLayers.length) {
        error.value = '地图加载失败，请检查网络连接'
        console.error('All tile layers failed')
        return false
      }

      const layer = tileLayers[currentIndex]
      console.log(`Trying tile layer ${currentIndex + 1}:`, layer.url.substring(0, 50) + '...')

      tileLayer = L.tileLayer(layer.url, layer.options)
        .on('load', () => {
          console.log('Tile layer loaded successfully')
        })
        .on('tileerror', (e) => {
          console.warn(`Tile layer ${currentIndex + 1} error:`, e)
          currentIndex++
          if (tileLayer) {
            mapInstance.removeLayer(tileLayer)
          }
          tryNextTileLayer()
        })
        .addTo(mapInstance)

      return true
    }

    tryNextTileLayer()

    console.log('Tile layer added, creating marker group...')

    // 创建标记组
    markerGroup = L.layerGroup().addTo(mapInstance)

    // 添加初始标记
    console.log('Adding markers, count:', props.markers?.length || 0)
    updateMarkers()

    // 地图点击事件
    if (props.clickable) {
      mapInstance.on('click', (e) => {
        emit('click', { lat: e.latlng.lat, lng: e.latlng.lng })
      })
    }

    // 监听地图移动事件用于调试
    mapInstance.on('moveend', () => {
      console.log('Map moved, center:', mapInstance.getCenter())
    })

    // 地图就绪
    emit('map-ready', mapInstance)

    // 触发地图尺寸更新（解决某些情况下地图不显示的问题）
    setTimeout(() => {
      if (mapInstance) {
        console.log('Invalidating map size...')
        mapInstance.invalidateSize()
      }
    }, 300)

    loading.value = false
    console.log('Map initialization complete')
  } catch (err) {
    error.value = '地图初始化失败: ' + (err.message || '未知错误')
    loading.value = false
    console.error('Map init error:', err)
  }
}

// 更新标记点
const updateMarkers = () => {
  if (!markerGroup || !mapInstance) return

  // 清除现有标记
  markerGroup.clearLayers()

  if (!props.markers || props.markers.length === 0) {
    // 如果没有标记，使用默认中心
    if (props.markers !== undefined) {
      mapInstance.setView([props.center.lat, props.center.lng], props.zoom)
    }
    return
  }

  // 添加新标记
  props.markers.forEach((marker) => {
    const m = L.marker([marker.lat, marker.lng], {
      icon: marker.icon || defaultIcon,
    })

    // 绑定弹窗
    if (marker.title || marker.content) {
      const popupContent = `
        <div class="map-popup">
          ${marker.title ? `<h4>${marker.title}</h4>` : ''}
          ${marker.content ? `<p>${marker.content}</p>` : ''}
          ${marker.url ? `<a href="${marker.url}">查看详情</a>` : ''}
        </div>
      `
      m.bindPopup(popupContent)
    }

    // 点击事件
    if (marker.onClick) {
      m.on('click', () => emit('marker-click', marker))
    }

    markerGroup.addLayer(m)
  })

  // 根据标记数量调整视图
  if (props.markers.length === 1) {
    // 单个标记：以标记为中心
    mapInstance.setView([props.markers[0].lat, props.markers[0].lng], props.zoom)
  } else {
    // 多个标记：自动调整视图以包含所有标记
    const bounds = L.latLngBounds(props.markers.map(m => [m.lat, m.lng]))
    mapInstance.fitBounds(bounds, { padding: [50, 50] })
  }
}

// 添加用户位置标记
const addUserMarker = (lat, lng) => {
  if (!mapInstance) return

  if (userMarker) {
    userMarker.setLatLng([lat, lng])
  } else {
    userMarker = L.marker([lat, lng], { icon: userIcon }).addTo(mapInstance)
    userMarker.bindPopup('您的位置')
  }
}

// 监听标记变化
watch(() => props.markers, () => {
  updateMarkers()
  // 标记更新后刷新地图尺寸
  if (mapInstance) {
    setTimeout(() => mapInstance.invalidateSize({ pan: false }), 100)
  }
}, { deep: true })

// 监听中心点变化
watch(
  () => props.center,
  (newCenter) => {
    if (mapInstance && newCenter) {
      mapInstance.setView([newCenter.lat, newCenter.lng], props.zoom)
    }
  }
)

// 监听用户位置变化
watch(
  () => props.userLocation,
  (newLocation) => {
    if (!mapInstance) return
    if (newLocation && newLocation.latitude && newLocation.longitude) {
      addUserMarker(newLocation.latitude, newLocation.longitude)
    }
  }
)

onMounted(() => {
  nextTick(() => {
    initMap()
  })
})

onUnmounted(() => {
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
  }
})

// 暴露方法给父组件
defineExpose({
  addUserMarker,
  flyTo: (lat, lng, zoom = 15) => {
    if (mapInstance) {
      mapInstance.flyTo([lat, lng], zoom)
    }
  },
  setView: (lat, lng, zoom = 15) => {
    if (mapInstance) {
      mapInstance.setView([lat, lng], zoom)
    }
  },
  invalidateSize: () => {
    if (mapInstance) {
      mapInstance.invalidateSize()
    }
  },
})
</script>

<style scoped>
.map-view {
  position: relative;
  width: 100%;
  height: v-bind('props.height');
  min-height: 200px;
  border-radius: 12px;
  overflow: hidden;
  background: #e8e8e8;
}

.map-loading,
.map-error {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
  z-index: 1000;
  background: #f5f5f5;
}

.map-error {
  color: #f56c6c;
}

.map-loading .el-icon {
  font-size: 24px;
  color: #d4af37;
}
</style>

<style>
/* Leaflet 容器样式 - 必须在这里设置，不能用 scoped */
.leaflet-container {
  width: 100% !important;
  height: 100% !important;
  border-radius: 12px;
  font-family: inherit;
}

/* 全局样式 - Leaflet 自定义标记 */
.custom-marker {
  background: transparent;
  border: none;
}

.marker-pin {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  transition: transform 0.2s;
}

.marker-pin:hover {
  transform: scale(1.1);
}

.user-marker {
  background: transparent;
  border: none;
}

.user-pin {
  position: relative;
  width: 24px;
  height: 24px;
}

.user-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  background: #409eff;
  border-radius: 50%;
  border: 2px solid white;
  z-index: 2;
}

.user-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 24px;
  height: 24px;
  background: rgba(64, 158, 255, 0.3);
  border-radius: 50%;
  animation: pulse 2s ease-out infinite;
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(2.5);
    opacity: 0;
  }
}

/* 弹窗样式 */
.map-popup {
  padding: 4px;
  min-width: 120px;
}

.map-popup h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #1a365d;
}

.map-popup p {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #666;
}

.map-popup a {
  color: #d4af37;
  text-decoration: none;
  font-size: 12px;
}

.map-popup a:hover {
  text-decoration: underline;
}
</style>
