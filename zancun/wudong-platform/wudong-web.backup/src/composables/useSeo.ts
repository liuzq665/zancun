/**
 * SEO Composable - 提供动态更新页面 meta 标签的功能
 * 用于详情页等需要根据内容动态设置 SEO 信息的场景
 */

/**
 * 更新文档标题
 * @param title 页面标题
 * @param suffix 是否添加后缀（默认添加 " - 乌东文旅平台"）
 */
export function updateTitle(title: string, suffix = true) {
  document.title = suffix && title ? `${title} - 乌东文旅平台` : title || '乌东文旅综合服务平台'
}

/**
 * 更新 meta description
 * @param description 页面描述
 */
export function updateDescription(description: string) {
  updateMetaTag('name', 'description', description)
}

/**
 * 更新 meta keywords
 * @param keywords 关键词（逗号分隔）
 */
export function updateKeywords(keywords: string) {
  updateMetaTag('name', 'keywords', keywords)
}

/**
 * 更新 Open Graph 标签
 * @param property 属性名（如 'og:title'）
 * @param content 内容
 */
export function updateOgTag(property: string, content: string) {
  updateMetaTag('property', property, content)
}

/**
 * 通用 meta 标签更新函数
 * @param attrName 属性类型 ('name' | 'property')
 * @param attrValue 属性值
 * @param content 内容
 */
function updateMetaTag(attrName: 'name' | 'property', attrValue: string, content: string) {
  if (!content) return

  // 先尝试找到已存在的标签
  let meta = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement

  // 如果不存在，创建一个新的
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute(attrName, attrValue)
    document.head.appendChild(meta)
  }

  meta.setAttribute('content', content)
}

/**
 * 更新 Canonical URL
 * @param url 规范URL
 */
export function updateCanonical(url: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement

  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }

  link.setAttribute('href', url)
}

/**
 * 更新所有 SEO 相关标签（一次性更新）
 * @param options SEO 选项
 */
export function updateSeo(options: {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: string
}) {
  const { title, description, keywords, image, url, type = 'website' } = options

  if (title) updateTitle(title)
  if (title) updateOgTag('og:title', title)
  if (description) {
    updateDescription(description)
    updateOgTag('og:description', description)
  }
  if (keywords) updateKeywords(keywords)
  if (image) updateOgTag('og:image', image)
  if (url) {
    updateCanonical(url)
    updateOgTag('og:url', url)
  }
  if (type) updateOgTag('og:type', type)
}

/**
 * 为商品页面生成结构化数据
 * @param product 商品数据
 */
export function generateProductSchema(product: {
  id: number
  name: string
  description?: string
  price: number
  originalPrice?: number
  stock?: number
  coverImage?: string
  category?: { name: string }
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `${product.name} - 乌东文旅非遗商品`,
    image: product.coverImage,
    url: `https://wudong.travel/products/${product.id}`,
    brand: {
      '@type': 'Brand',
      name: '乌东文旅',
    },
    offers: {
      '@type': 'Offer',
      price: (product.price / 100).toFixed(2),
      priceCurrency: 'CNY',
      availability: (product.stock ?? 0) > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: '乌东文旅综合服务平台',
      },
    },
  }
}

/**
 * 为商家页面生成结构化数据（民宿/餐厅）
 * @param business 商家数据
 * @param type 类型 ('Hotel' | 'Restaurant')
 */
export function generateBusinessSchema(
  business: {
    id: number
    name: string
    description?: string
    address?: string
    rating?: number
    reviewCount?: number
    coverImage?: string
    latitude?: number
    longitude?: number
    phone?: string
  },
  type: 'Hotel' | 'Restaurant'
) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': type,
    name: business.name,
    description: business.description,
    image: business.coverImage,
    url: `https://wudong.travel/${type.toLowerCase()}s/${business.id}`,
  }

  if (business.address) {
    schema.address = {
      '@type': 'PostalAddress',
      addressLocality: '乌东村',
      addressRegion: '贵州省黔东南苗族侗族自治州',
      addressCountry: 'CN',
      streetAddress: business.address,
    }
  }

  if (business.rating) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: business.rating.toString(),
      reviewCount: business.reviewCount?.toString() || '10',
    }
  }

  if (business.latitude && business.longitude) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: business.latitude,
      longitude: business.longitude,
    }
  }

  if (business.phone) {
    schema.telephone = business.phone
  }

  return schema
}

/**
 * 注入结构化数据脚本
 * @param schema 结构化数据对象
 */
export function injectSchemaScript(schema: object) {
  // 移除已存在的 schema 脚本
  const existingScript = document.querySelector('script[data-seo-schema]')
  if (existingScript) {
    existingScript.remove()
  }

  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.setAttribute('data-seo-schema', 'true')
  script.textContent = JSON.stringify(schema)
  document.head.appendChild(script)
}

// 导出默认对象供组合式使用
export default {
  updateTitle,
  updateDescription,
  updateKeywords,
  updateOgTag,
  updateCanonical,
  updateSeo,
  generateProductSchema,
  generateBusinessSchema,
  injectSchemaScript,
}
