const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.TEST_URL || 'http://localhost:5173';
const output = path.resolve(__dirname, '../test-results/live-smoke.json');
const report = {base, startedAt: new Date().toISOString(), passed: [], errors: []};

async function run() {
  const page = await fetch(base + '/login');
  assert.equal(page.status, 200);
  assert.ok((await page.text()).includes('src/app.js'));
  const endpoints = {
    student1: ['/auth/me', '/dashboard', '/profile', '/messages', '/accommodations/current', '/accommodations/history', '/accommodations/roommates', '/repair-orders', '/stay/current', '/stay/applications'],
    manager1: ['/auth/me', '/dashboard', '/profile', '/messages', '/accommodations/current', '/accommodations/history', '/buildings', '/rooms', '/beds', '/repair-orders', '/stay/current', '/stay/applications'],
    repair1: ['/auth/me', '/dashboard', '/profile', '/messages', '/repair-orders', '/repair-catalog'],
    admin: ['/auth/me', '/dashboard', '/profile', '/messages', '/accommodations/current', '/buildings', '/rooms', '/beds', '/repair-orders', '/stay/current', '/stay/applications', '/admin/users', '/admin/repair-config', '/admin/logs', '/admin/data-tasks', '/admin/backup-tasks']
  };
  for (const [loginAccount, paths] of Object.entries(endpoints)) {
    const login = await fetch(base + '/api/v1/auth/login', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({loginAccount, password: '123456'})});
    assert.equal(login.status, 200, loginAccount + ' login');
    const body = await login.json();
    const headers = {Authorization: 'Bearer ' + body.data.token};
    try {
      for (const endpoint of paths) {
        const response = await fetch(base + '/api/v1' + endpoint, {headers});
        assert.equal(response.status, 200, loginAccount + endpoint);
        assert.equal((await response.json()).code, 0, loginAccount + endpoint);
      }
      if (loginAccount !== 'admin') assert.equal((await fetch(base + '/api/v1/admin/users', {headers})).status, 403);
      report.passed.push({account: loginAccount, role: body.data.user.role, endpoints: paths.length});
    } finally {
      const logout = await fetch(base + '/api/v1/auth/logout', {method: 'POST', headers});
      assert.equal(logout.status, 200);
      assert.equal((await fetch(base + '/api/v1/auth/me', {headers})).status, 401);
    }
  }
}
run().catch(error => {report.errors.push(error.stack); process.exitCode = 1;}).finally(() => {
  report.finishedAt = new Date().toISOString();
  fs.mkdirSync(path.dirname(output), {recursive: true});
  fs.writeFileSync(output, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
});
