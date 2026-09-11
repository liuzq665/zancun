/**
 * LLM 级端到端验证：让真实模型带着本插件跑，检查回答是否落在真实数据上。
 *
 * 为什么走 headless profile：DSH 的 Web UI 强制先选工作区（原生目录对话框，无法可靠自动化），
 * 而 agent 行为与 UI 无关 —— 同一套工具、同一套系统提示词、同一个 agent loop。
 * Web UI 里的那一份由用户手工确认。
 *
 * 为什么用 Node spawn 而不是直接在 PowerShell 里传参：PowerShell 5.1 调用原生程序时
 * 按 ANSI 码页编码命令行，中文提问会被写坏。这里把提问写成 UTF-8 字面量，
 * 由 Node 以宽字符命令行传给子进程，才不会糟蹋中文。
 *
 * 用法：node tools/e2e-agent.mjs [只跑第 N 个的序号...]
 */

import { spawn } from 'node:child_process'
import path from 'node:path'

import { searchProducts, searchStays, searchTravel, searchFood } from '../src/core/api.js'

const DSH_BIN = process.env.DSH_BIN || path.join(process.env.USERPROFILE, '.dsh', 'profiles', 'node_modules', '@deepseek-ai', 'dsh', 'lib', 'bin.js')
const PATCH = process.env.WUDONG_PATCH || 'C:\\Users\\24076\\Desktop\\wudong-project\\wudong_project\\wudong-guide\\cordis.patch.yml'

/** 真实实体名，用来判断回答是不是"有据可依"。 */
const stays = await searchStays({ size: 20 })
const travel = await searchTravel({ size: 20 })
const foods = await searchFood({ size: 20 })
const products = await searchProducts({ size: 20 })

const realNames = {
  stays: (stays.ok ? stays.items : []).map((it) => it.name),
  travel: (travel.ok ? travel.items : []).map((it) => it.name),
  foods: (foods.ok ? foods.items : []).map((it) => it.name),
  products: (products.ok ? products.items : []).map((it) => it.name),
}
const allRealNames = Object.values(realNames).flat().filter(Boolean)
console.log(`已知真实实体：民宿 ${realNames.stays.length}｜景区/路线 ${realNames.travel.length}｜餐饮 ${realNames.foods.length}｜商品 ${realNames.products.length}`)

const cases = [
  {
    label: '行程规划',
    prompt: '我们一家三口打算国庆去乌东玩 2 天，带着老人，想爬梯田、看非遗手工艺。请帮我排一份具体行程，并说下大概花多少钱。',
    assert: (text) => {
      const hit = realNames.stays.concat(realNames.travel).filter((name) => text.includes(name))
      return hit.length > 0 ? undefined : '没有引用任何真实民宿/路线名'
    },
  },
  {
    label: '语义搜索',
    prompt: '我想买 600 元以内的苗族手工艺，有什么推荐？',
    assert: (text) => {
      const hit = realNames.products.filter((name) => text.includes(name))
      return hit.length > 0 ? undefined : '没有引用任何真实商品名'
    },
  },
  {
    label: '文化问答',
    prompt: '第一次去乌东苗寨，有什么值得看的、要注意什么？',
    assert: (text) => (text.length > 80 ? undefined : '回答过短，像是在敷衍'),
  },
  {
    label: '降级：数据服务不可用',
    prompt: '帮我排一份 2 天的乌东行程。',
    env: { WUDONG_API_BASE: 'http://127.0.0.1:9' },
    assert: (text) => {
      const invented = allRealNames.filter((name) => text.includes(name))
      if (invented.length > 0) return `数据不可用却引用了真实名（等于编造）：${invented.slice(0, 3).join('、')}`
      if (!/(不可用|查不到|暂时|无法获取|连接失败|稍后)/.test(text)) return '既没引用数据，也没说明不可用'
      return undefined
    },
  },
]

function ask(prompt, extraEnv) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [DSH_BIN, '--profile', 'headless', '--patch', PATCH, prompt], {
      env: { ...process.env, DSH_PERMISSION_MODE: 'read-only', ...extraEnv },
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let out = ''
    let err = ''
    child.stdout.on('data', (d) => { out += d })
    child.stderr.on('data', (d) => { err += d })
    child.on('exit', (code) => resolve({ code, out, err }))
  })
}

const only = process.argv.slice(2).map(Number).filter((n) => Number.isInteger(n))
let failed = 0

for (const [index, testCase] of cases.entries()) {
  if (only.length > 0 && !only.includes(index + 1)) continue
  console.log(`\n${'='.repeat(70)}\n[${index + 1}/${cases.length}] ${testCase.label}\n提问：${testCase.prompt}\n${'-'.repeat(70)}`)
  const { code, out, err } = await ask(testCase.prompt, testCase.env)
  const answer = out.trim()
  console.log(answer || '(无输出)')
  if (err.trim()) console.log(`[stderr] ${err.trim().slice(0, 500)}`)
  if (code !== 0) {
    console.log(`FAIL 退出码 ${code}`)
    failed += 1
    continue
  }
  const problem = testCase.assert(answer)
  if (problem) {
    console.log(`FAIL ${problem}`)
    failed += 1
  } else {
    console.log('ok   回答落在真实数据上')
  }
}

console.log(`\n结果：${failed === 0 ? '全部通过' : `${failed} 项失败`}`)
if (failed > 0) process.exitCode = 1
