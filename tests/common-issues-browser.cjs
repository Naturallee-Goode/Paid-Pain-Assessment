const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const http = require('node:http');
const path = require('node:path');

const root = path.resolve(__dirname, '../src');
const before = process.argv.includes('--before');
const stage = before ? 'before' : 'after';
const evidence = process.env.ISSUE81_EVIDENCE_DIR;
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.glb': 'model/gltf-binary' };
const server = http.createServer(async (req, res) => {
  try {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' }).end(await fs.readFile(file));
  } catch { res.writeHead(404).end(); }
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}), headless: true });
  const captures = [];
  try {
    if (evidence) await fs.mkdir(evidence, { recursive: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 1000 }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    // Freeze continuous rendering for reliable screenshots of this heavy model.
    // Real UI events still run; render its actual scene once after each action.
    await page.route('**/viewer.js', async route => {
      const response = await route.fetch();
      await route.fulfill({ response, body: await response.text() + '\nsetViewerRenderLoopPaused(true); window.__contentTest = { muscleCatalog, getMusclesForArea, selectBodyMesh, render: () => { controls.update(); renderer.render(scene, camera); } };' });
    });
    const url = `http://127.0.0.1:${server.address().port}/`;
    await page.goto(url);
    await page.waitForFunction(() => window.__contentTest?.muscleCatalog.length > 0, null, { timeout: 60000 });
    await page.locator('#loadingOverlay').waitFor({ state: 'hidden' });
    await page.evaluate(() => window.__contentTest.render());
    const capture = async (name, description) => {
      if (!evidence) return;
      await page.evaluate(() => window.__contentTest.render());
      const file = `${stage}-${name}.png`;
      await page.locator('#intakeForm fieldset').nth(1).screenshot({ path: path.join(evidence, file), animations: 'disabled' });
      captures.push({ file, description, timestamp: new Date().toISOString(), viewport: page.viewportSize() });
    };
    await page.locator('[data-area="shoulder"]').click();
    assert.match(await page.locator('#partDescription').textContent(), before ? /Rotate or zoom/ : /Common Shoulder issues/);
    await capture('shoulder-area', 'Real app: Shoulder selected without a muscle.');
    await page.locator('#searchInput').fill('deltoid');
    await page.locator('#searchResults li').first().click();
    assert.match(await page.locator('#partTitle').textContent(), /deltoid/i);
    const description = page.locator('#partDescription');
    assert.match(await description.textContent(), before ? /Common Shoulder Diagnoses/ : /Common Shoulder issues/);
    await capture('shoulder-muscle', 'Real app: Acromial Part Of Deltoid Muscle detail.');
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    if (!before) {
      assert(await page.locator('#partDescription').evaluate(element => {
        const content = element.closest('.viewer-info-content');
        return content.scrollHeight <= content.clientHeight + 1;
      }), 'Descriptions should fit the expanded panel without an inner scroll');
    }
    await capture('shoulder-mobile', 'Real app: selected muscle at a 390px viewport.');
    await page.setViewportSize({ width: 1280, height: 1000 });
    if (!before) {
      assert.equal(await description.locator('li').count(), 4);
      assert.doesNotMatch(await description.textContent(), /Draft|pending review/);
      assert.equal(await description.locator('a').count(), 0);
      assert.doesNotMatch(await description.textContent(), /These examples support education/);
      for (const button of await page.locator('[data-area]').all()) {
        await button.click();
        const label = await button.textContent();
        assert.equal(await description.locator('strong').first().textContent(), `Common ${label} issues`);
        assert((await description.locator('li').count()) > 0, `No content for ${label}`);
        assert.doesNotMatch(await description.textContent(), /Draft|pending review/);
        assert.equal(await description.locator('a').count(), 0);
        assert.equal(await page.locator('#selectedBodyArea').inputValue(), await button.getAttribute('data-area'));
      }
      await page.locator('[data-area="foot"]').click();
      assert.match(await description.textContent(), /Plantar fasciitis/);
      assert.doesNotMatch(await description.textContent(), /Frozen shoulder/);
      await capture('foot-area', 'Real app: Foot content replaces Shoulder content.');
      for (const id of ['changeBodyArea', 'clearBodyArea']) {
        await page.locator('[data-area="shoulder"]').click();
        await page.locator(`#${id}`).click();
        assert.equal(await description.textContent(), '');
      }
      await page.locator('[data-area="shoulder"]').click();
      page.once('dialog', dialog => dialog.accept());
      await page.locator('#intakeForm [type="reset"]').click();
      await page.waitForFunction(() => document.getElementById('selectedBodyArea').value === '');
      assert.equal(await description.textContent(), '');
      // These two states demonstrate code paths, never actual sponsor decisions.
      await page.locator('[data-area="shoulder"]').click();
      for (const state of ['approved', 'unavailable']) {
        await page.evaluate(async state => {
          const { renderCommonIssues } = await import('./common-issues.mjs');
          const { getCommonIssueContent } = await import('./common-issues-data.mjs');
          const content = getCommonIssueContent('shoulder');
          const fixture = state === 'approved' ? {
            ...content, review: { status: 'approved', reviewer: 'Mia Miller', date: '2026-10-13', evidence: 'TEST FIXTURE ONLY', requestedChanges: null },
          } : { items: [], review: { status: 'unavailable' } };
          const root = document.getElementById('partDescription');
          renderCommonIssues(root, 'shoulder', fixture);
          const label = document.createElement('p');
          label.textContent = `TEST FIXTURE ONLY: ${state} rendering. This is not a sponsor review decision.`;
          label.style.fontWeight = 'bold';
          root.prepend(label);
        }, state);
        assert.equal(await description.locator('li').count(), state === 'approved' ? 4 : 0);
        assert.equal(await description.locator('a').count(), 0);
        assert.doesNotMatch(await description.textContent(), /Draft · pending review/);
        if (state === 'unavailable') assert.match(await description.textContent(), /not available/);
        await capture(`${state}-fixture`, `TEST FIXTURE ONLY: ${state} rendering, not sponsor approval.`);
      }
    }
    assert.deepEqual(errors, []);
    if (evidence) await fs.writeFile(path.join(evidence, `${stage}-captures.json`), JSON.stringify({ stage, captures, pageErrors: errors, formSubmitted: false }, null, 2) + '\n');
    console.log(`PASS: ${stage} content browser checks; ${captures.length} screenshots; no page errors or form submission.`);
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
