/**
 * 安全面验证：确认 web profile 组合后的配置里，危险工具全部是停用状态。
 *
 * 断言对象是 DSH **组合后**的配置（--dump-config），不是我们的源代码 ——
 * 也就是向导实际运行时的那份工具目录。
 *
 * 用法：node tools/verify-lockdown.mjs
 */

import { spawnSync } from 'node:child_process'
import path from 'node:path'

const DSH_BIN = process.env.DSH_BIN || path.join(process.env.USERPROFILE, '.dsh', 'profiles', 'node_modules', '@deepseek-ai', 'dsh', 'lib', 'bin.js')
const PATCH = process.env.WUDONG_PATCH || 'C:\\Users\\24076\\Desktop\\wudong-project\\wudong_project\\wudong-guide\\cordis.patch.yml'

let failed = 0
function check(label, condition, detail) {
  console.log(`  ${condition ? 'ok  ' : 'FAIL'} ${label}${condition || detail === undefined ? '' : `  → ${detail}`}`)
  if (!condition) failed += 1
}

const result = spawnSync(process.execPath, [DSH_BIN, '--profile', 'web', '--patch', PATCH, '--dump-config'], {
  encoding: 'utf8',
  maxBuffer: 32 * 1024 * 1024,
})
if (result.status !== 0) {
  console.error(`--dump-config 失败（退出码 ${result.status}）\n${result.stderr?.slice(0, 800)}`)
  process.exit(1)
}
const lines = result.stdout.split(/\r?\n/)
console.log(`组合配置：${lines.length} 行`)

/** 把 `- id: x` 之后到下一个 `- id:` 之前的内容归到该行，取它的 disabled 与 name。 */
function parseRows(text) {
  const rows = new Map()
  let current = null
  for (const line of text) {
    const idMatch = line.match(/^- id:\s*(\S+)\s*$/)
    if (idMatch) {
      current = { id: idMatch[1], name: undefined, disabled: undefined, body: [line] }
      rows.set(current.id, current)
      continue
    }
    if (current) {
      current.body.push(line)
      const nameMatch = line.match(/^\s+name:\s*(.+?)\s*$/)
      if (nameMatch && current.name === undefined) current.name = nameMatch[1].replace(/^['"]|['"]$/g, '')
      const disabledMatch = line.match(/^\s+disabled:\s*(.+?)\s*$/)
      if (disabledMatch) current.disabled = disabledMatch[1]
    }
  }
  return rows
}

const rows = parseRows(lines)
check('解析到了配置行', rows.size > 100, `只解析出 ${rows.size} 行`)

/* ----------------------------- 危险工具必须停用 ----------------------------- */
console.log('\n== 危险工具行必须 disabled: true ==')
const mustBeDisabled = [
  'tool-bash',
  'tool-pwsh',
  'tool-fs',
  'tool-fs-search',
  'tool-web',
  'tool-skill',
  'tool-subagent',
  'tool-subagent-fork',
  'tool-subagent-control',
  'tool-workflow',
  'tool-jobs',
  'tool-todo',
  'tool-goal',
  'tool-ralph',
]
for (const id of mustBeDisabled) {
  const row = rows.get(id)
  check(`${id} 存在且已停用`, row !== undefined && row.disabled === 'true', row === undefined ? '配置里没有这一行（DSH 可能改名了）' : `disabled=${row.disabled ?? '(未设置)'}`)
}

/* ------------- 兜底：任何以 tool- 开头的行都不允许处于启用状态 ------------- */
console.log('\n== 兜底：所有 tool-* 行 ==')
const toolRows = [...rows.values()].filter((row) => row.id.startsWith('tool-'))
const enabledToolRows = toolRows.filter((row) => row.disabled !== 'true')
check(`以 tool- 开头的行共 ${toolRows.length} 个，且全部停用`, enabledToolRows.length === 0, enabledToolRows.map((row) => `${row.id}(${row.name ?? '?'})`).join('、'))

/* ------------------------------ 不得挂载 MCP ------------------------------ */
console.log('\n== 不得有 MCP 条目 ==')
const mcpRows = [...rows.values()].filter((row) => /^mcp[-_]/.test(row.id) || /mcp-client/.test(row.name ?? ''))
check('没有挂载任何 MCP server', mcpRows.length === 0, mcpRows.map((row) => row.id).join('、'))

/* ------------------------------ 我们的行要在 ------------------------------ */
console.log('\n== 本插件已挂载 ==')
const guideRow = rows.get('wudong-guide')
check('wudong-guide 行存在', guideRow !== undefined)
check('wudong-guide 指向正确的包名', guideRow?.name === 'wudong-guide', guideRow?.name)
check('wudong-guide 未被停用', guideRow?.disabled !== 'true', guideRow?.disabled)

/* --------------------------- 人格已替换成导游 --------------------------- */
const systemPromptRow = rows.get('system-prompt')
check('system-prompt 的 personaPrefix 已是导游人格', /乌东文旅/.test(systemPromptRow?.body.join('\n') ?? ''), '没在 system-prompt 行里找到「乌东文旅」')
check('personaSuffix 未被误删', /personaSuffix/.test(systemPromptRow?.body.join('\n') ?? ''))

console.log(`\n结果：${failed === 0 ? '全部通过' : `${failed} 项失败`}`)
if (failed > 0) process.exitCode = 1
