const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const root = path.resolve(__dirname, '..');
const directory = path.join(root, 'thinking', '\u0045\u0052\u8bbe\u8ba1');
const diagramPath = path.join(directory, '01 \u5bbf\u820d\u7cfb\u7edfER\u56fe.mmd');
const documentPath = path.join(directory, '00 ER\u8bbe\u8ba1\u8bf4\u660e.md');
const allowedTypes = new Set(['bigint', 'string', 'boolean', 'date', 'datetime']);

function checkStructure(source) {
  const entities = new Map();
  const relations = [];
  let current = null;
  for (const [index, raw] of source.split(/\r?\n/).entries()) {
    const line = raw.trim();
    if (!line || line.startsWith('%%') || line === 'erDiagram') continue;
    const entity = line.match(/^([A-Z][A-Z0-9_]*)\["([^"]+)"\]\s*\{$/);
    if (entity) {
      if (current || entities.has(entity[1])) throw new Error(`Duplicate or nested entity at line ${index + 1}`);
      current = { name: entity[1], label: entity[2], attributes: new Map() };
      entities.set(current.name, current);
      continue;
    }
    if (line === '}') {
      if (!current) throw new Error(`Unexpected closing brace at line ${index + 1}`);
      current = null;
      continue;
    }
    if (current) {
      const attribute = line.match(/^(\w+)\s+(\w+)(?:\s+((?:PK|FK|UK)(?:,\s*(?:PK|FK|UK))*))?\s+"([^"]+)"$/);
      if (!attribute) throw new Error(`Malformed attribute at line ${index + 1}`);
      const [, type, name, keyText = '', comment] = attribute;
      if (!allowedTypes.has(type)) throw new Error(`Unsupported attribute type at line ${index + 1}`);
      if (current.attributes.has(name)) throw new Error(`Duplicate attribute at line ${index + 1}`);
      current.attributes.set(name, { type, keys: keyText.split(/,\s*/).filter(Boolean), comment });
      continue;
    }
    const relation = line.match(/^([A-Z][A-Z0-9_]*)\s+(\|\||\|o|o\||\}\||\|\{|\}o|o\{)(--|\.\.)(\|\||\|o|o\||\}\||\|\{|\}o|o\{)\s+([A-Z][A-Z0-9_]*)\s*:\s*"([^"]+)"$/);
    if (!relation) throw new Error(`Unsupported statement at line ${index + 1}`);
    const [, from, fromCardinality, connector, toCardinality, to, label] = relation;
    relations.push({ from, to, fromCardinality, toCardinality, connector, label });
  }
  if (current) throw new Error(`Unclosed entity: ${current.name}`);
  const signatures = new Set();
  for (const relation of relations) {
    if (!entities.has(relation.from) || !entities.has(relation.to)) throw new Error(`Undefined relation endpoint: ${relation.label}`);
    const signature = `${relation.from}:${relation.to}:${relation.label}`;
    if (signatures.has(signature)) throw new Error(`Duplicate relation: ${relation.label}`);
    signatures.add(signature);
  }
  for (const entity of entities.values()) {
    const keys = [...entity.attributes.values()];
    if (!keys.some(attribute => attribute.keys.includes('PK'))) throw new Error(`Missing primary key: ${entity.name}`);
    for (const attribute of keys) {
      if (attribute.keys.includes('FK') && attribute.type !== 'bigint') throw new Error(`Unexpected foreign key type: ${entity.name}`);
      for (const [key, label] of [['PK', '\u4e3b\u952e'], ['FK', '\u5916\u952e'], ['UK', '\u552f\u4e00\u952e']]) {
        if (attribute.keys.includes(key) && !attribute.comment.includes(label)) throw new Error(`Missing key explanation: ${entity.name} ${key}`);
      }
    }
    if (!relations.some(relation => relation.from === entity.name || relation.to === entity.name)) throw new Error(`Disconnected entity: ${entity.name}`);
  }
  return { entities, relations };
}

function expectRelation(relations, from, fromCardinality, toCardinality, to) {
  if (!relations.some(relation => relation.from === from && relation.to === to && relation.fromCardinality === fromCardinality && relation.toCardinality === toCardinality)) {
    throw new Error(`Missing business relation: ${from} ${fromCardinality} ${toCardinality} ${to}`);
  }
}

function checkBusinessModel(model) {
  const { entities, relations } = model;
  if (entities.has('ADMIN_PROFILE')) throw new Error('Admin must be expressed through the ADMIN role for now');
  expectRelation(relations, 'SYS_USER', '||', 'o|', 'STUDENT_PROFILE');
  expectRelation(relations, 'SYS_USER', '||', 'o|', 'DORM_MANAGER_PROFILE');
  expectRelation(relations, 'SYS_USER', '||', 'o|', 'REPAIRER_PROFILE');
  expectRelation(relations, 'STUDENT_PROFILE', '||', 'o{', 'ACCOMMODATION_ASSIGNMENT');
  expectRelation(relations, 'BED', '||', 'o{', 'ACCOMMODATION_ASSIGNMENT');
  expectRelation(relations, 'REPAIR_ORDER', '||', 'o{', 'DISPATCH_RECORD');
  expectRelation(relations, 'REPAIRER_PROFILE', '||', 'o{', 'DISPATCH_RECORD');
  expectRelation(relations, 'REPAIR_ORDER', '|o', 'o{', 'REPAIR_ORDER');
  expectRelation(relations, 'REPAIR_ORDER', '||', 'o|', 'REPAIR_RESULT');
  expectRelation(relations, 'REPAIR_RESULT', '||', 'o|', 'REPAIR_CONFIRMATION');
  expectRelation(relations, 'REPAIR_CONFIRMATION', '||', 'o|', 'REPAIR_EVALUATION');
  expectRelation(relations, 'STAY_SUBMISSION_VERSION', '||', 'o{', 'STAY_DATE_RANGE');
  expectRelation(relations, 'STAY_BATCH_VERSION', '||', 'o{', 'STAY_REVIEW_RECORD');
  const receiptKeys = [...entities.get('MESSAGE_RECEIPT').attributes.entries()]
    .filter(([, attribute]) => attribute.keys.includes('PK')).map(([name]) => name).sort();
  if (receiptKeys.join(',') !== 'message_id,user_id') throw new Error('Message receipts must be unique per message and account');
  for (const [entity, attributes] of [
    ['BED', ['occupied', 'student_id']],
    ['STUDENT_PROFILE', ['department_name', 'major_name', 'class_name', 'building_id', 'room_id', 'bed_id']],
    ['REPAIR_ORDER', ['fault_description', 'student_remark', 'reject_count', 'accept_timeout_count', 'is_rework']],
    ['REPAIR_AUDIT_RECORD', ['order_id']],
    ['STAY_APPLICATION', ['batch_id', 'locked', 'is_completed']],
    ['MESSAGE_RECEIPT', ['is_read']],
  ]) {
    for (const name of attributes) {
      if (entities.get(entity).attributes.has(name)) throw new Error(`Redundant current fact: ${entity}.${name}`);
    }
  }
}

function checkDocumentationLinks() {
  const source = fs.readFileSync(documentPath, 'utf8');
  for (const match of source.matchAll(/\]\((\.\.?\/[^)]+)\)/g)) {
    const linked = path.resolve(directory, decodeURIComponent(match[1]));
    if (!linked.startsWith(root + path.sep) || !fs.existsSync(linked)) throw new Error(`Missing documentation link: ${match[1]}`);
  }
}

async function main() {
  const source = fs.readFileSync(diagramPath, 'utf8');
  const model = checkStructure(source);
  checkBusinessModel(model);
  const bundle = path.join(__dirname, 'mermaid-runtime', 'node_modules', 'mermaid', 'dist', 'mermaid.esm.mjs');
  const { default: mermaid } = await import(pathToFileURL(bundle).href);
  mermaid.initialize({ startOnLoad: false, securityLevel: 'strict' });
  const result = await mermaid.parse(source);
  if (result.diagramType !== 'er') throw new Error(`Unexpected Mermaid type: ${result.diagramType}`);
  checkDocumentationLinks();
  const virtualCount = [...model.entities.values()].filter(entity => entity.label.includes('\u865a\u5b9e\u4f53')).length;
  const attributeCount = [...model.entities.values()].reduce((sum, entity) => sum + entity.attributes.size, 0);
  console.log(`PASS Mermaid syntax (${result.diagramType}); no rendering performed.`);
  console.log(`PASS ${model.entities.size} entities (${virtualCount} associative), ${attributeCount} attributes, ${model.relations.length} relations.`);
  console.log('PASS key explanations, endpoint definitions, business cardinalities, normalization checks and documentation links.');
}

main().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
