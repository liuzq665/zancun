const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('./er-drawio-runtime/node_modules/playwright-core');

const root = path.resolve(__dirname, '..');
const diagramDir = path.join(root, 'thinking', '\u52a8\u6001\u7ed3\u6784\u8bbe\u8ba1');
const mermaidBundle = path.join(__dirname, 'mermaid-runtime', 'node_modules', 'mermaid', 'dist', 'mermaid.min.js');
const documentation = path.join(diagramDir, '00 \u65f6\u5e8f\u56fe\u4e0e\u72b6\u6001\u56fe\u8bbe\u8ba1\u8bf4\u660e.md');
const previewFile = path.join(diagramDir, '18 \u65f6\u5e8f\u56fe\u4e0e\u72b6\u6001\u56fe\u6c47\u603b.md');

function checkSequence(source) {
  const labels = new Map([
    ['Student', '\u5b66\u751f'],
    ['Manager', '\u5bbf\u7ba1'],
    ['Admin', '\u7cfb\u7edf\u7ba1\u7406\u5458'],
    ['Worker', '\u7ef4\u4fee\u4eba\u5458'],
    ['System', '\u7cfb\u7edf'],
  ]);
  const declared = new Set();
  const stack = [];
  for (const [index, raw] of source.split(/\r?\n/).entries()) {
    const line = raw.trim();
    if (!line || line.startsWith('%%')) continue;
    const declaration = line.match(/^(actor|participant)\s+(\w+)\s+as\s+(.+)$/);
    if (/^(actor|participant)\b/.test(line) && !declaration) {
      throw new Error(`Missing explicit business label on line ${index + 1}`);
    }
    if (declaration) {
      const [, kind, id, label] = declaration;
      if (!labels.has(id) || labels.get(id) !== label.trim()) {
        throw new Error(`Only the five business lifelines are allowed on line ${index + 1}`);
      }
      if (kind !== (id === 'System' ? 'participant' : 'actor')) {
        throw new Error(`People must be actors and System a participant on line ${index + 1}`);
      }
      if (declared.has(id)) throw new Error(`Duplicate lifeline on line ${index + 1}`);
      declared.add(id);
    }
    const message = line.match(/^(\w+)\s*(?:--?>>|--?>|--?x|--?\))\s*(\w+)\s*:/);
    if (message && (!declared.has(message[1]) || !declared.has(message[2]))) {
      throw new Error(`Undeclared message lifeline on line ${index + 1}`);
    }
    const note = line.match(/^Note\s+(?:over|right of|left of)\s+([^:]+):/i);
    if (note && note[1].split(',').some(id => !declared.has(id.trim()))) {
      throw new Error(`Undeclared note lifeline on line ${index + 1}`);
    }
    if (/Controller|Service|Mapper|\bJob\b|MySQL|\bJWT\b|\bSQL\b|\b(?:GET|POST|PUT|DELETE)\s+\//i.test(line)) {
      throw new Error(`Implementation detail in business sequence on line ${index + 1}`);
    }
    const opener = line.match(/^(alt|opt|loop|par|critical|break|rect)\b/);
    if (opener) stack.push({ type: opener[1], line: index + 1 });
    if (/^else\b/.test(line) && stack.at(-1)?.type !== 'alt') {
      throw new Error(`Unexpected else on line ${index + 1}`);
    }
    if (/^and\b/.test(line) && stack.at(-1)?.type !== 'par') {
      throw new Error(`Unexpected and on line ${index + 1}`);
    }
    if (line === 'end' && !stack.pop()) throw new Error(`Unexpected end on line ${index + 1}`);
  }
  if (stack.length) throw new Error(`Unclosed control block from line ${stack.at(-1).line}`);
  if (!declared.has('System')) throw new Error('Every business sequence must declare System as the system participant');
}

function checkStates(source) {
  const states = new Set([...source.matchAll(/^\s*state\s+"[^"]+"\s+as\s+(\w+)\s*$/gm)].map(match => match[1]));
  const edges = [...source.matchAll(/^\s*(\w+|\[\*\])\s*-->\s*(\w+|\[\*\])\s*(?::|$)/gm)].map(match => [match[1], match[2]]);
  for (const edge of edges) {
    for (const state of edge) {
      if (state !== '[*]' && !states.has(state)) throw new Error(`Undeclared state: ${state}`);
    }
  }
  const reached = new Set(edges.filter(([from]) => from === '[*]').map(([, to]) => to));
  let changed = true;
  while (changed) {
    changed = false;
    for (const [from, to] of edges) {
      if (reached.has(from) && to !== '[*]' && !reached.has(to)) {
        reached.add(to);
        changed = true;
      }
    }
  }
  for (const state of states) {
    if (!reached.has(state)) throw new Error(`Unreachable state: ${state}`);
  }
}

function checkDocumentationLinks() {
  const source = fs.readFileSync(documentation, 'utf8');
  for (const match of source.matchAll(/\]\((\.\.?\/[^\)]+)\)/g)) {
    const linked = path.resolve(diagramDir, decodeURIComponent(match[1]));
    if (!linked.startsWith(root + path.sep) || !fs.existsSync(linked)) {
      throw new Error(`Missing or unsafe documentation link: ${match[1]}`);
    }
  }
}

function buildPreview(diagrams) {
  const sequence = diagrams.filter(diagram => diagram.source.startsWith('sequenceDiagram'));
  const state = diagrams.filter(diagram => diagram.source.startsWith('stateDiagram-v2'));
  const lines = [
    '# \u9ad8\u6821\u5bbf\u820d\u7ba1\u7406\u7cfb\u7edf\u65f6\u5e8f\u56fe\u4e0e\u72b6\u6001\u56fe\u6c47\u603b',
    '',
    '> \u672c\u6587\u4ef6\u7531\u540c\u76ee\u5f55 .mmd \u6e90\u6587\u4ef6\u751f\u6210\u3002\u8bbe\u8ba1\u4f9d\u636e\u3001\u72b6\u6001\u5b57\u5178\u548c\u5f85\u786e\u8ba4\u89c4\u5219\u89c1\u300a00 \u65f6\u5e8f\u56fe\u4e0e\u72b6\u6001\u56fe\u8bbe\u8ba1\u8bf4\u660e\u300b\u3002',
    '',
    '[\u8bbe\u8ba1\u8bf4\u660e\u4e0e\u4e00\u81f4\u6027\u5bf9\u7167](./00%20\u65f6\u5e8f\u56fe\u4e0e\u72b6\u6001\u56fe\u8bbe\u8ba1\u8bf4\u660e.md)',
    '',
    '> \u65f6\u5e8f\u56fe\u4ec5\u4f7f\u7528\u5b66\u751f\u3001\u5bbf\u7ba1\u3001\u7cfb\u7edf\u7ba1\u7406\u5458\u3001\u7ef4\u4fee\u4eba\u5458\u548c\u7cfb\u7edf\u751f\u547d\u7ebf\uff0c\u6bcf\u5f20\u56fe\u53ea\u5217\u51fa\u53c2\u4e0e\u8be5\u6d41\u7a0b\u7684\u89d2\u8272\u3002\u539f\u6709 7 \u5f20\u72b6\u6001\u56fe\u4fdd\u6301\u4e0d\u53d8\u3002',
    '',
    '## 1. \u4e1a\u52a1\u65f6\u5e8f\u56fe',
    '',
  ];
  for (const [number, diagram] of sequence.entries()) {
    lines.push(`### 1.${number + 1} ${diagram.name.replace(/\.mmd$/, '')}`, '', '```mermaid', diagram.source.trimEnd(), '```', '');
  }
  lines.push('## 2. \u72b6\u6001\u56fe', '');
  for (const [number, diagram] of state.entries()) {
    lines.push(`### 2.${number + 1} ${diagram.name.replace(/\.mmd$/, '')}`, '', '```mermaid', diagram.source.trimEnd(), '```', '');
  }
  fs.writeFileSync(previewFile, lines.join('\n'), 'utf8');
  console.log(`BUILT ${path.relative(root, previewFile)}`);
}

async function main() {
  const diagrams = fs.readdirSync(diagramDir).filter(name => name.endsWith('.mmd')).sort().map(name => ({
    name,
    source: fs.readFileSync(path.join(diagramDir, name), 'utf8').replace(/^\uFEFF/, ''),
  }));
  if (diagrams.length !== 17) throw new Error(`Expected 17 diagrams, found ${diagrams.length}`);
  if (diagrams.filter(d => d.source.startsWith('sequenceDiagram')).length !== 10 ||
      diagrams.filter(d => d.source.startsWith('stateDiagram-v2')).length !== 7) {
    throw new Error('Expected 10 business sequences and 7 state diagrams');
  }
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  let failures = 0;
  try {
    const page = await browser.newPage();
    await page.addScriptTag({ path: mermaidBundle });
    await page.evaluate(() => window.mermaid.initialize({ startOnLoad: false, securityLevel: 'strict' }));
    for (const diagram of diagrams) {
      try {
        if (diagram.source.startsWith('sequenceDiagram')) checkSequence(diagram.source);
        else if (diagram.source.startsWith('stateDiagram-v2')) checkStates(diagram.source);
        else throw new Error('Unexpected diagram type');
        const result = await page.evaluate(async source => {
          return window.mermaid.parse(source);
        }, diagram.source);
        if (process.argv.includes('--render-check')) {
          const rendered = await page.evaluate(async source => {
            const { svg } = await window.mermaid.render('diagram-validation', source);
            const wrapper = document.createElement('div');
            wrapper.innerHTML = svg;
            document.body.append(wrapper);
            const element = wrapper.querySelector('svg');
            const rectangle = element?.getBoundingClientRect();
            const count = element?.querySelectorAll('path, rect, circle, polygon, text').length;
            const valid = Boolean(rectangle?.width && rectangle?.height && count);
            wrapper.remove();
            return valid;
          }, diagram.source);
          if (!rendered) throw new Error('Mermaid SVG is blank or has no dimensions');
        }
        console.log(`PASS ${diagram.name} (${result.diagramType})`);
      } catch (error) {
        failures++;
        console.error(`FAIL ${diagram.name}: ${error.message}`);
      }
    }
  } finally {
    await browser.close();
  }
  if (failures) throw new Error(`${failures} diagram(s) failed validation`);
  if (process.argv.includes('--build-preview')) buildPreview(diagrams);
  checkDocumentationLinks();
  console.log('PASS documentation links');
  console.log(`Validated ${diagrams.length} diagrams: ${diagrams.filter(d => d.source.startsWith('sequenceDiagram')).length} sequence, ${diagrams.filter(d => d.source.startsWith('stateDiagram-v2')).length} state.`);
}

main().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
