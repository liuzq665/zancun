/**
 * 宿主半部（node 侧）。
 *
 * 这个包的所有呈现都在浏览器端，node 侧只需要一个空座位 —— DSH 的客户端模块扫描
 * 只认「已挂载且未停用、并且**已经有 fiber**」的行，才会去读它的 package.json
 * 并把 exports["./client"] 收进浏览器清单。
 *
 * 注意导出形态要跟第一方客户端包一致：**只导出 apply**（它们不导出 name）。
 */

export function apply() {
  // 诊断用：确认这个包的宿主半部真的被激活成 fiber 了（Stage 0 验证）。
  console.log('[wudong-guide-ui] 宿主半部已激活')
}
