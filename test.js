// Smoke test: start the app, hit every route, check the search index.
const assert = require('assert');
const { spawn } = require('child_process');

const PORT = 5100 + Math.floor(Math.random() * 800);
const base = `http://127.0.0.1:${PORT}`;

(async () => {
  const server = spawn(process.execPath, ['server.js'], {
    cwd: __dirname,
    env: { ...process.env, PORT: String(PORT) },
    stdio: 'ignore',
  });

  try {
    let up = false;
    for (let i = 0; i < 60 && !up; i++) {
      try { await fetch(base + '/'); up = true; } catch { await new Promise(r => setTimeout(r, 100)); }
    }
    assert.ok(up, 'server did not start');

    for (const route of ['/', '/features', '/reviews', '/explore', '/essays', '/community']) {
      const res = await fetch(base + route);
      const body = await res.text();
      assert.strictEqual(res.status, 200, route);
      assert.ok(!body.includes('{{'), route + ' has unrendered placeholders');
      assert.ok(body.includes('/search-index.json') || body.includes('search-dialog'), route + ' missing search UI');
    }

    const notFound = await fetch(base + '/does-not-exist');
    assert.strictEqual(notFound.status, 404);
    assert.ok((await notFound.text()).includes('notfound__code'), '404 page missing');

    const indexRes = await fetch(base + '/search-index.json');
    assert.strictEqual(indexRes.status, 200);
    const index = await indexRes.json();
    assert.strictEqual(index.length, 5, 'index should have five pages');
    for (const entry of index) {
      assert.ok(entry.url && entry.title && entry.page && entry.text, 'incomplete index entry');
    }
    const frieren = index.find(e => e.url === '/');
    assert.ok(frieren.text.toLowerCase().includes('frieren'), 'home page text not indexed');

    console.log('ok — routes, 404 page, and search index');
  } finally {
    server.kill();
  }
})().catch(err => {
  console.error(err.message);
  process.exit(1);
});
