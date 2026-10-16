const fs = require('fs');
const path = require('path');

const target = path.resolve(__dirname, '..', 'thinking', 'ER设计', '宿舍系统ER图.drawio');
const source = fs.readFileSync(target, 'utf8');

function escapeExistingEntities(value) {
  return value
    .replace(/&(?!amp;|lt;|gt;|quot;|apos;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const fixed = source.replace(/value="([\s\S]*?)"\s+(vertex|edge)="1"/g, (_, value, kind) => {
  return `value="${escapeExistingEntities(value)}" ${kind}="1"`;
});

fs.writeFileSync(target, fixed, 'utf8');
console.log(`Fixed XML value attributes: ${target}`);
