const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const http = require('node:http');
const path = require('node:path');

// Serve the real application without requiring a second terminal.
const root = path.resolve(__dirname, '../src');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.glb': 'model/gltf-binary' };
const server = http.createServer(async (req, res) => {
  try {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    const data = await fs.readFile(file);
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' }).end(data);
  } catch { res.writeHead(404).end(); }
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}), headless: true });
    const url = `http://127.0.0.1:${server.address().port}`;
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    // Use the checked-in model as a fixture without changing the production URL.
    const model = await fs.readFile(path.join(root, 'assets/human-body2.glb'));
    await page.route('**/*.glb', route => route.fulfill({ body: model, contentType: 'model/gltf-binary' }));
    await page.route('**/viewer.js', async route => {
      const response = await route.fetch();
      await route.fulfill({ response, body: await response.text() + '\nwindow.__viewerTest = { bodyMeshes, selectBodyMesh, clearSelection, selected: () => selectedMesh };' });
    });
    await page.goto(url);
    await page.waitForFunction(() => window.__viewerTest?.bodyMeshes.length > 0, null, { timeout: 60000 });
    await page.locator('#loadingOverlay').waitFor({ state: 'hidden' });
    for (const button of await page.locator('[data-area]').all()) {
      await button.click();
      const id = await button.getAttribute('data-area');
      assert.equal(await page.locator('#selectedBodyArea').inputValue(), id);
      assert.equal(await page.locator('[aria-pressed="true"]').count(), 1);
      assert.equal(await page.locator('#partTitle').textContent(), await button.textContent());
      assert.equal(await page.evaluate(() => window.__viewerTest.selected()), null);
    }
    // Switching from a selected mesh must restore its material and clear search.
    await page.evaluate(() => {
      const mesh = window.__viewerTest.bodyMeshes[0];
      window.__originalMaterial = mesh.material;
      window.__viewerTest.selectBodyMesh(mesh);
      document.querySelector('#searchInput').value = 'old search';
    });
    await page.locator('[data-area="neck"]').click();
    assert.equal(await page.evaluate(() => window.__viewerTest.bodyMeshes[0].material === window.__originalMaterial), true);
    assert.equal(await page.locator('#searchInput').inputValue(), '');
    for (const id of ['changeBodyArea', 'clearBodyArea']) {
      await page.locator('[data-area="knee"]').click();
      await page.locator(`#${id}`).click();
      assert.equal(await page.locator('#selectedBodyArea').inputValue(), '');
      assert.equal(await page.locator('[aria-pressed="true"]').count(), 0);
      assert.equal(await page.locator('[data-area="neck"]').evaluate(el => el === document.activeElement), true);
    }
    await page.locator('[data-area="elbow"]').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#selectedBodyArea').inputValue(), 'elbow');
    await page.locator('[data-area="hip"]').focus();
    await page.keyboard.press('Space');
    assert.equal(await page.locator('#selectedBodyArea').inputValue(), 'hip');
    await page.evaluate(() => document.querySelector('#intakeForm').reset());
    assert.equal(await page.locator('#selectedBodyArea').inputValue(), '');
    assert.equal(await page.locator('[aria-pressed="true"]').count(), 0);
    for (const width of [390, 768, 1280]) {
      await page.setViewportSize({ width, height: 844 });
      await page.locator('[data-area="wrist-hand"]').click();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      for (const button of await page.locator('[data-area]').all()) {
        assert((await button.boundingBox()).height >= 44);
      }
    }
    assert.deepEqual(errors, []);

    // Controls must not depend on model availability or even successful viewer startup.
    for (const scenario of ['delayed', 'failed', 'viewer-unavailable']) {
      const isolated = await browser.newPage();
      let release;
      const gate = new Promise(resolve => { release = resolve; });
      if (scenario === 'viewer-unavailable') await isolated.route('**/viewer.js', route => route.abort());
      await isolated.route('**/*.glb', async route => {
        if (scenario === 'delayed') { await gate; await route.fulfill({ body: model, contentType: 'model/gltf-binary' }); }
        else await route.abort();
      });
      await isolated.goto(url, { waitUntil: 'domcontentloaded' });
      await isolated.locator('[data-area="lower-back"]').click();
      assert.equal(await isolated.locator('#selectedBodyArea').inputValue(), 'lower-back');
      if (scenario === 'delayed') {
        release();
        await isolated.locator('#loadingOverlay').waitFor({ state: 'hidden', timeout: 60000 });
        assert.equal(await isolated.locator('#selectedBodyArea').inputValue(), 'lower-back');
      }
      await isolated.locator('#clearBodyArea').click();
      assert.equal(await isolated.locator('#selectedBodyArea').inputValue(), '');
      await isolated.close();
    }
    console.log('PASS: all ten areas, viewer cleanup, Change/Clear, keyboard, reset, three layouts, delayed/failed model, and unavailable viewer. No form submitted.');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
