// 按关键词向 Pexels 检索图片，产出「槽位 -> 图片URL」映射（URL 走项目现有格式）
import fs from 'fs'
import path from 'path'

const ROOT = 'C:/Users/24076/Desktop/wudong-project/wudong_project'
const env = fs.readFileSync(path.join(ROOT, 'wudong-platform/wudong-server/.env'), 'utf8')
const KEY = (env.match(/PEXELS_API_KEY=(\S+)/) || [])[1]
if (!KEY) { console.error('未找到 PEXELS_API_KEY'); process.exit(1) }

// 槽位 -> { 关键词, 取几张 }。Pexels 为英文索引，用贴近实物的英文词。
const PLAN = {
  // ---- 衣：非遗商品（每商品 1 主图 + 2 细节图）----
  p_silver_crown:   { q: 'silver headpiece jewelry handmade', n: 3 },
  p_batik_fabric:   { q: 'batik fabric indigo textile', n: 3 },
  p_embroidery:     { q: 'embroidered shawl textile colorful', n: 3 },
  p_lusheng:        { q: 'bamboo musical instrument traditional', n: 3 },
  p_bamboo_basket:  { q: 'woven bamboo basket handicraft', n: 3 },
  p_costume:        { q: 'traditional ethnic embroidered costume', n: 3 },
  p_earrings:       { q: 'silver earrings jewelry pair', n: 3 },
  p_tablecloth:     { q: 'batik printed tablecloth textile', n: 3 },

  // ---- 食：餐厅（每店 1 主图 + 1 环境图）----
  r_fish_house:     { q: 'chinese restaurant wooden interior', n: 3 },
  r_dong_farm:      { q: 'rural farmhouse restaurant courtyard', n: 3 },
  r_beef_hotpot:    { q: 'chinese hotpot restaurant table', n: 3 },
  r_ricefield_farm: { q: 'countryside restaurant terrace field', n: 3 },

  // ---- 食：菜品（每道 1 张）----
  d_sour_fish:      { q: 'fish soup bowl hot', n: 2 },
  d_cured_meat:     { q: 'sliced cured meat plate', n: 2 },
  d_pickled_fish:   { q: 'pickled fish dish plate', n: 2 },
  d_veg_soup:       { q: 'vegetable soup bowl', n: 2 },
  d_pork_belly:     { q: 'braised pork belly dish', n: 2 },
  d_rice_cake:      { q: 'glutinous rice cake steamed', n: 2 },
  d_sticky_rice:    { q: 'steamed sticky rice bowl', n: 2 },
  d_beef_slices:    { q: 'raw beef slices plate', n: 2 },
  d_beef_offal:     { q: 'beef offal platter', n: 2 },
  d_veg_platter:    { q: 'fresh vegetables platter raw', n: 2 },
  d_ricefield_fish: { q: 'grilled whole fish dish', n: 2 },
  d_duck:           { q: 'roast duck dish plate', n: 2 },
  d_wild_veg:       { q: 'cooked green vegetables dish', n: 2 },
  d_rice_wine:      { q: 'rice wine bottle cup', n: 2 },

  // ---- 住：民宿（每店 1 主图 + 2 图）----
  h_stilt_house:    { q: 'wooden stilt house over water', n: 3 },
  h_wooden_lodge:   { q: 'wooden cabin lodge forest', n: 3 },
  h_terrace_view:   { q: 'hotel view rice terrace mountain', n: 3 },
  h_pastoral_inn:   { q: 'countryside guesthouse farm field', n: 3 },

  // ---- 住：房型（每房型 1 张）----
  rm_wood_room:     { q: 'wooden hotel room bed interior', n: 3 },
  rm_family_suite:  { q: 'spacious hotel suite room', n: 2 },
  rm_twin_room:     { q: 'twin beds hotel room', n: 2 },
  rm_view_room:     { q: 'hotel room window mountain view', n: 3 },
  rm_minimal_room:  { q: 'minimal hotel room bright', n: 2 },
  rm_simple_room:   { q: 'simple guesthouse room wood', n: 3 },

  // ---- 行：景区（每景区 1 主图 + 1 图）----
  s_rice_terrace:   { q: 'rice terraces green asia', n: 3 },
  s_museum:         { q: 'museum exhibition traditional artifacts', n: 3 },
  s_ancient_village:{ q: 'ancient chinese village old houses', n: 3 },
  s_drum_tower:     { q: 'chinese pagoda tower wooden', n: 3 },
  s_dance_show:     { q: 'traditional ethnic dance performance', n: 3 },

  // ---- 行：路线 ----
  t_sunrise_route:  { q: 'sunrise over mountains mist', n: 2 },
  t_culture_route:  { q: 'ethnic minority village culture', n: 2 },
  t_oldtown_route:  { q: 'old town street china', n: 2 },
  t_weekend_route:  { q: 'rural landscape village china', n: 2 },

  // ---- 社区：帖子 ----
  c_terrace_sunrise:{ q: 'rice terrace sunrise landscape', n: 2 },
  c_batik_work:     { q: 'batik dyeing craft hands', n: 2 },
  c_house_night:    { q: 'wooden house night warm light', n: 2 },
  c_fish_soup:      { q: 'fish soup asian bowl', n: 2 },
  c_bonfire:        { q: 'bonfire night people celebration', n: 2 },
  c_old_village:    { q: 'old village wooden houses lane', n: 2 },

  // ---- 用户头像 ----
  av_user:          { q: 'portrait person face smiling', n: 8 },

  // ---- 首页 Banner 与模块图 ----
  b_terrace:        { q: 'rice terrace mountains panorama', n: 2 },
  b_stilt:          { q: 'wooden stilt houses village', n: 2 },
  b_silver:         { q: 'silver jewelry craft workshop', n: 2 },
  b_festival:       { q: 'ethnic festival celebration costume', n: 2 },

  // ---- 页面 hero 背景（各模块一张）----
  hero_products:    { q: 'handicraft textile market', n: 1 },
  hero_product_det: { q: 'handmade craft detail closeup', n: 1 },
  hero_restaurants: { q: 'asian food table dishes', n: 1 },
  hero_hotels:      { q: 'countryside lodging wooden', n: 1 },
  hero_tickets:     { q: 'mountain landscape terrace china', n: 1 },
  hero_community:   { q: 'travel photography people outdoors', n: 1 },
  hero_user:        { q: 'traveler backpack landscape', n: 1 },
  hero_orders:      { q: 'travel planning map notebook', n: 1 },
  hero_login:       { q: 'village landscape morning china', n: 1 },
  hero_post:        { q: 'nature landscape green mountain', n: 1 },
  hero_route:       { q: 'hiking trail mountain path', n: 1 },
  hero_admin:       { q: 'modern office desk workspace', n: 1 },
  hero_cart:        { q: 'shopping craft goods flatlay', n: 1 },
  logo_village:     { q: 'chinese village roofs aerial', n: 1 },
}

const api = async (q, n, page = 1) => {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=${n}&page=${page}&orientation=landscape`
  const r = await fetch(url, { headers: { Authorization: KEY } })
  if (!r.ok) throw new Error(`HTTP ${r.status} ${r.statusText}`)
  return r.json()
}

// 注意：不能自己拼 `pexels-photo-{id}.jpeg` —— 有些照片本身是 .png，
// 拼死扩展名会 404。这里取 API 返回的真实地址，只替换尺寸参数。
const url = (p, w = 800) => {
  const base = (p.src?.large || p.src?.medium || p.src?.original || '').split('?')[0]
  return base ? `${base}?auto=compress&cs=tinysrgb&w=${w}` : ''
}

const out = {}
const used = new Set()
let reqs = 0

for (const [slot, { q, n }] of Object.entries(PLAN)) {
  try {
    const j = await api(q, Math.max(n, 5))
    reqs++
    const picked = []
    for (const p of j.photos || []) {
      if (picked.length >= n) break
      if (used.has(p.id)) continue
      // 校验「我最终会写进代码的那个 URL」真的可访问（而不是 API 给的原始地址）
      const u = url(p)
      if (!u) continue
      try {
        const h = await fetch(u, { method: 'HEAD' })
        if (!h.ok) continue
      } catch { continue }
      used.add(p.id)
      picked.push(u)
    }
    out[slot] = { q, images: picked }
    console.log(`${slot.padEnd(20)} "${q}"  -> ${picked.length}/${n}`)
    if (picked.length < n) console.log(`   ⚠ 只取到 ${picked.length} 张`)
  } catch (e) {
    console.log(`${slot.padEnd(20)} ✖ ${e.message}`)
    out[slot] = { q, images: [], error: e.message }
  }
  await new Promise((r) => setTimeout(r, 250))
}

// 报告缺口
const gaps = Object.entries(out).filter(([, v]) => !v.images.length)
console.log(`\n请求数 = ${reqs} / 200（每小时额度）`)
console.log(`槽位 = ${Object.keys(out).length}，无图槽位 = ${gaps.length}`)
if (gaps.length) gaps.forEach(([k]) => console.log(`   缺: ${k}`))

fs.writeFileSync(path.join(ROOT, 'miniapp/tests/pexels-map.json'), JSON.stringify(out, null, 2))
console.log('\n已写入 miniapp/tests/pexels-map.json')
