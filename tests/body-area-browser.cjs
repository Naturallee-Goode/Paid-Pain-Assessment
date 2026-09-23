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
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    // Use the checked-in model as a fixture without changing the production URL.
    const model = await fs.readFile(path.join(root, 'assets/human-body2.glb'));
    await page.route('**/*.glb', route => route.fulfill({ body: model, contentType: 'model/gltf-binary' }));
    await page.route('**/viewer.js', async route => {
      const response = await route.fetch();
      await route.fulfill({ response, body: await response.text() + '\nwindow.__viewerTest = { THREE, bodyMeshes, muscleCatalog, getMusclesForArea, focusRegions: AREA_FOCUS_REGIONS, isWithinArea, selectBodyMesh, clearSelection, camera, controls, areaHighlights, animating: () => animating, selected: () => selectedMesh, setRenderLoopPaused: setViewerRenderLoopPaused };' });
    });
    await page.goto(url);
    await page.waitForFunction(() => window.__viewerTest?.bodyMeshes.length > 0, null, { timeout: 60000 });
    await page.locator('#loadingOverlay').waitFor({ state: 'hidden' });
    await page.evaluate(() => window.__viewerTest.setRenderLoopPaused(true));
    const sides = await page.evaluate(() => {
      const catalog = window.__viewerTest.muscleCatalog;
      return ['left', 'right', null].map(side => catalog.filter(record => record.side === side).length);
    });
    assert.deepEqual(sides, [229, 230, 3], 'The loaded catalog must preserve model sides');
    const mappedCounts = await page.evaluate(() => [...document.querySelectorAll('[data-area]')].map(button => window.__viewerTest.getMusclesForArea(button.dataset.area).length));
    assert(mappedCounts.every(count => count > 0), 'Every area needs a loaded muscle list');
    await page.evaluate(() => {
      window.__originalMaterials = new Map(window.__viewerTest.bodyMeshes.map(mesh => [mesh, {material: mesh.material, order: mesh.renderOrder}]));
    });
    const backTargets = {};
    for (const button of await page.locator('[data-area]').all()) {
      await button.click();
      const id = await button.getAttribute('data-area');
      assert.equal(await page.locator('#selectedBodyArea').inputValue(), id);
      assert.equal(await page.locator('[aria-pressed="true"]').count(), 1);
      assert.equal(await page.locator('#partTitle').textContent(), await button.textContent());
      assert.equal(await page.locator('#visualSelection').getAttribute('hidden'), null);
      assert.match(await page.locator('#visualSelectionStatus').textContent(), /Choose Left, Right, or Both/);
      assert.doesNotMatch(await page.locator('#visualSelection').textContent(), /muscles? available/i);
      assert.equal(await page.evaluate(() => window.__viewerTest.selected()), null);
      await page.waitForFunction(() => !window.__viewerTest.animating());
      const state = await page.evaluate(() => {
        const v=window.__viewerTest;
        return {count:v.areaHighlights.size, target:v.controls.target.toArray(), camera:v.camera.position.toArray(), restored:v.bodyMeshes.filter(mesh=>!v.areaHighlights.has(mesh)).every(mesh=>mesh.material===window.__originalMaterials.get(mesh).material && mesh.renderOrder===window.__originalMaterials.get(mesh).order)};
      });
      assert(state.count > 0, `No highlighted region: ${id}`);
      assert(state.restored, `Stale highlight after switching to ${id}`);
      if (id === 'arm' || id === 'leg') {
        assert(await page.evaluate(areaId => {
          const v = window.__viewerTest;
          const area = v.focusRegions.find(region => region.id === areaId);
          const meshes = v.bodyMeshes.filter(mesh => {
            const center = new v.THREE.Box3().setFromObject(mesh).getCenter(new v.THREE.Vector3());
            return v.isWithinArea(center, area);
          });
          return meshes.length === v.areaHighlights.size && meshes.every(mesh => v.areaHighlights.has(mesh));
        }, id), `${id} must highlight every mesh in its spatial region`);
      }
      if (['neck', 'lower-back', 'hip'].includes(id)) {
        const names = await page.evaluate(() => window.__viewerTest.muscleCatalog
          .filter(record => window.__viewerTest.areaHighlights.has(record.mesh))
          .map(record => record.displayName));
        const excluded = {
          neck: /labii|orbicularis|zygomaticus/i,
          'lower-back': /gluteus/i,
          hip: /of hand/i,
        }[id];
        assert(!names.some(name => excluded.test(name)), `${id} highlighted a muscle outside the area`);
      }
      if (id.endsWith('back')) {
        backTargets[id]=state.target;
        assert(state.camera[2] < state.target[2], 'Back areas must be viewed from behind');
      }
    }
    assert(backTargets['upper-back'][1] > backTargets['lower-back'][1]);
    await page.locator('#clearBodyArea').click();
    assert.notEqual(await page.locator('#visualSelection').getAttribute('hidden'), null);
    for (const id of ['changeBodyArea', 'clearBodyArea']) {
      await page.locator('[data-area="knee"]').click();
      await page.locator(`#${id}`).click();
      assert.equal(await page.locator('#selectedBodyArea').inputValue(), '');
      assert.equal(await page.evaluate(() => window.__viewerTest.areaHighlights.size), 0);
      assert.equal(await page.locator('[aria-pressed="true"]').count(), 0);
      assert.equal(await page.locator('[data-area="neck"]').evaluate(el => el === document.activeElement), true);
    }
    await page.locator('[data-area="elbow"]').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#selectedBodyArea').inputValue(), 'elbow');
    await page.locator('[data-area="hip"]').focus();
    await page.keyboard.press('Space');
    assert.equal(await page.locator('#selectedBodyArea').inputValue(), 'hip');
    await page.locator('#painLevel').evaluate(element => {
      element.value = '8';
      element.dispatchEvent(new Event('input', { bubbles: true }));
    });
    assert.equal(await page.locator('#painLevelValue').textContent(), '8');
    page.once('dialog', dialog => dialog.dismiss());
    await page.locator('#intakeForm [type="reset"]').click();
    assert.equal(await page.locator('#selectedBodyArea').inputValue(), 'hip');
    assert.equal(await page.locator('[data-area="hip"]').getAttribute('aria-pressed'), 'true');
    assert.equal(await page.locator('#painLevelValue').textContent(), '8');
    page.once('dialog', dialog => dialog.accept());
    await page.locator('#intakeForm [type="reset"]').click();
    await page.waitForFunction(() => document.querySelector('#selectedBodyArea').value === '' && document.querySelector('#painLevelValue').textContent === '5');
    assert.equal(await page.locator('#selectedBodyArea').inputValue(), '');
    assert.equal(await page.locator('[aria-pressed="true"]').count(), 0);
    assert.equal(await page.locator('#painLevelValue').textContent(), '5');
    for (const width of [390, 768, 1280]) {
      await page.setViewportSize({ width, height: 844 });
      await page.locator('[data-area="wrist-hand"]').click();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      for (const button of await page.locator('[data-area]').all()) {
        assert((await button.boundingBox()).height >= 44);
      }
    }
    // Area focus must not disable user-controlled camera motion.
    await page.waitForFunction(() => !window.__viewerTest.animating());
    const canvas=page.locator('#viewer canvas');
    await canvas.scrollIntoViewIfNeeded();
    const rect=await canvas.boundingBox();
    const before=await page.evaluate(() => window.__viewerTest.camera.position.toArray());
    await page.mouse.move(rect.x+rect.width/2,rect.y+rect.height/2);
    await page.mouse.down();
    await page.mouse.move(rect.x+rect.width/2+60,rect.y+rect.height/2,{steps:10});
    await page.mouse.up();
    await page.waitForTimeout(300);
    assert.notDeepEqual(await page.evaluate(() => window.__viewerTest.camera.position.toArray()),before);
    const distance=await page.evaluate(() => window.__viewerTest.camera.position.distanceTo(window.__viewerTest.controls.target));
    await page.mouse.wheel(0,-150);
    await page.waitForTimeout(300);
    assert.notEqual(await page.evaluate(() => window.__viewerTest.camera.position.distanceTo(window.__viewerTest.controls.target)),distance);
    assert.deepEqual(errors, []);

    // Controls must not depend on model availability or even successful viewer startup.
    for (const scenario of ['delayed', 'failed', 'viewer-unavailable']) {
      const isolated = await browser.newPage({ reducedMotion: 'reduce' });
      let release;
      const gate = new Promise(resolve => { release = resolve; });
      if (scenario === 'viewer-unavailable') {
        await isolated.route('**/viewer.js', route => route.abort());
      } else {
        await isolated.route('**/viewer.js', async route => {
          const response = await route.fetch();
          await route.fulfill({ response, body: await response.text() + '\nsetViewerRenderLoopPaused(true);' });
        });
      }
      await isolated.route('**/*.glb', async route => {
        if (scenario === 'delayed') { await gate; await route.fulfill({ body: model, contentType: 'model/gltf-binary' }); }
        else await route.abort();
      });
      await isolated.goto(url, { waitUntil: 'domcontentloaded' });
      await isolated.locator('[data-area="lower-back"]').click();
      assert.equal(await isolated.locator('#selectedBodyArea').inputValue(), 'lower-back');
      if (scenario === 'delayed') {
        assert.match(await isolated.locator('#visualSelectionStatus').textContent(), /Loading the optional 3D body map/);
        release();
        await isolated.locator('#loadingOverlay').waitFor({ state: 'hidden', timeout: 60000 });
        assert.equal(await isolated.locator('#selectedBodyArea').inputValue(), 'lower-back');
        assert.equal(await isolated.locator('#partTitle').textContent(), 'Lower Back');
        assert.match(await isolated.locator('#visualSelectionStatus').textContent(), /Choose Left, Right, or Both/);
      } else {
        await isolated.waitForFunction(() => document.querySelector('#visualSelectionStatus').textContent.includes('unavailable'));
        if (scenario === 'failed') {
          assert.equal(await isolated.locator('#loadingLabel').textContent(), 'Failed to load model');
          assert.match(await isolated.locator('#partDescription').textContent(), /3D model is unavailable/);
        } else {
          assert.equal(await isolated.locator('#loadingLabel').textContent(), '3D model unavailable');
        }
      }
      await isolated.locator('#clearBodyArea').click();
      assert.equal(await isolated.locator('#selectedBodyArea').inputValue(), '');
      assert.notEqual(await isolated.locator('#visualSelection').getAttribute('hidden'), null);
      await isolated.close();
    }
    console.log('PASS: visual area guidance, area highlights, camera controls, reset, responsive layouts, and delayed/failed/unavailable viewer states. No form submitted.');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
