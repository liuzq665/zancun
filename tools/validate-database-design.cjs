const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const sqlPath = path.join(root, 'thinking', '数据库设计', '01 宿舍系统数据库.sql');
const docPath = path.join(root, 'thinking', '数据库设计', '00 宿舍系统数据库设计说明.md');
const sql = fs.readFileSync(sqlPath, 'utf8');
const doc = fs.readFileSync(docPath, 'utf8');
const errors = [];

const tableMatches = [...sql.matchAll(/CREATE TABLE\s+(\w+)\s*\(([\s\S]*?)\)\s*ENGINE=/gi)];
const viewMatches = [...sql.matchAll(/CREATE OR REPLACE VIEW\s+(\w+)\s+AS/gi)];
const tableNames = new Set(tableMatches.map((match) => match[1]));

function assert(condition, message) {
  if (!condition) errors.push(message);
}

assert(tableMatches.length === 57, `expected 57 tables, found ${tableMatches.length}`);
assert(viewMatches.length === 11, `expected 11 views, found ${viewMatches.length}`);
assert(!/,\s*\)\s*ENGINE=/i.test(sql), 'a CREATE TABLE block has a trailing comma before ENGINE');

for (const [, table, body] of tableMatches) {
  assert(/PRIMARY KEY\s*\(/i.test(body), `${table} has no primary key`);
  for (const [, target] of body.matchAll(/REFERENCES\s+(\w+)\s*\(/gi)) {
    assert(tableNames.has(target), `${table} references missing table ${target}`);
  }
}

const derivedNames = [
  'occupied', 'current_load', 'reject_count', 'accept_timeout_count',
  'repair_timeout_count', 'abnormal', 'rework_count', 'average_score',
  'evaluation_count', 'configured_bed_count', 'occupied_bed_count',
];
for (const [, table, body] of tableMatches) {
  for (const name of derivedNames) {
    assert(!new RegExp(`\\b${name}\\b`, 'i').test(body), `${table} stores derived field ${name}`);
  }
}

const scopeBody = tableMatches.find((match) => match[1] === 'stay_application_scope')?.[2] || '';
assert(!/UNIQUE KEY\s+\w+\s*\([^)]*building_rule_id/i.test(scopeBody), 'stay_application_scope makes building_rule_id globally unique');
const repairerBody = tableMatches.find((match) => match[1] === 'repairer_profile')?.[2] || '';
assert(/profile_note\s+VARCHAR/i.test(repairerBody), 'repairer_profile.profile_note is missing');
assert(!/^\s*remark\s+/im.test(repairerBody), 'repairer_profile still uses the reserved remark field');

for (const table of tableNames) {
  const heading = `#### [^\\n]+ \`${table}\``;
  assert(new RegExp(heading, 'm').test(doc), `documentation is missing table ${table}`);
}

const expectedViews = [
  'v_student_accommodation_current', 'v_bed_occupancy_current', 'v_student_academic_detail',
  'v_dorm_room_capacity', 'v_repair_worker_current_load', 'v_dispatch_deadlines',
  'v_repair_confirmation_deadline', 'v_repair_order_dashboard', 'v_stay_roster_current',
  'v_stay_application_export', 'v_repair_evaluation_summary',
];
for (const view of expectedViews) assert(viewMatches.some((match) => match[1] === view), `missing view ${view}`);

if (errors.length) {
  console.error(errors.map((error) => `ERROR: ${error}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Database design static validation passed: ${tableMatches.length} tables, ${viewMatches.length} views.`);
}
