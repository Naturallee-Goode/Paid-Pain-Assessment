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
    const evidenceDir = process.env.EVIDENCE_DIR;
    const issue85EvidenceDir = process.env.ISSUE85_EVIDENCE_DIR;
    const issue82EvidenceDir = process.env.ISSUE82_EVIDENCE_DIR;
    if (issue82EvidenceDir) await fs.mkdir(issue82EvidenceDir, { recursive: true });
    if (issue85EvidenceDir) await fs.mkdir(issue85EvidenceDir, { recursive: true });
    if (evidenceDir) await fs.mkdir(evidenceDir, { recursive: true });
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    const openAdvanced = async () => {
      const toggle = page.locator('#toggleMuscleView');
      if (await toggle.getAttribute('aria-expanded') === 'false') await toggle.click();
    };
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    // Use the checked-in model as a fixture without changing the production URL.
    const model = await fs.readFile(path.join(root, 'assets/human-body2.glb'));
    await page.route('**/*.glb', route => route.fulfill({ body: model, contentType: 'model/gltf-binary' }));
    await page.route('**/viewer.js*', async route => {
      const response = await route.fetch();
      await route.fulfill({ response, body: await response.text() + '\nwindow.__viewerTest = { THREE, bodyMeshes, muscleCatalog, getMusclesForArea, getBodyArea, getSupportedBodyAreaForRegion, bodyMapStore, focusRegions: AREA_FOCUS_REGIONS, isWithinArea, selectBodyMesh, clearSelection, camera, controls, areaHighlights, highlightMat, animating: () => animating, selected: () => selectedMesh, setRenderLoopPaused: setViewerRenderLoopPaused };' });
    });
    await page.goto(url);
    await page.waitForFunction(() => window.__viewerTest?.bodyMeshes.length > 0, null, { timeout: 60000 });
    await page.locator('#loadingOverlay').waitFor({ state: 'hidden' });
    // The view switch is usable before choosing an area and does not require a side.
    await page.locator('#toggleMuscleView').press('Enter');
    assert.equal(await page.locator('#toggleMuscleView').getAttribute('aria-expanded'), 'true');
    assert.equal(await page.locator('#muscleSelection').isVisible(), false);
    assert.match(await page.locator('#muscleSelectionHint').textContent(), /Choose a body area/);
    await page.locator('#toggleMuscleView').press('Space');
    assert.equal(await page.locator('#infoPanel').isVisible(), false);
    assert.equal(await page.evaluate(() => window.__viewerTest.bodyMapStore.getState().advanced), false);
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
      assert.equal(await page.evaluate(() => window.__viewerTest.selected()), null);
      assert.equal(await page.locator('#possibleIssues').isVisible(), true);
      assert.equal(await page.locator('#muscleSelection').isVisible(), false);
      assert.equal(await page.locator('#possibleIssuesList li').count() > 0, true);
      assert.equal(await page.locator('#possibleIssuesList a').count(), 0);
      assert.match(await page.locator('#issuesDisclaimer').textContent(), /not a medical diagnosis/);
      await page.waitForFunction(() => !window.__viewerTest.animating());
      const state = await page.evaluate(() => {
        const v=window.__viewerTest;
        return {count:v.areaHighlights.size, target:v.controls.target.toArray(), camera:v.camera.position.toArray(), restored:v.bodyMeshes.filter(mesh=>!v.areaHighlights.has(mesh)).every(mesh=>mesh.material===window.__originalMaterials.get(mesh).material && mesh.renderOrder===window.__originalMaterials.get(mesh).order)};
      });
      assert(state.count > 0, `No highlighted region: ${id}`);
      assert(state.restored, `Stale highlight after switching to ${id}`);
      assert(await page.evaluate(areaId => {
        const v = window.__viewerTest;
        const expected = new Set(v.getMusclesForArea(areaId).map(record => record.mesh));
        return expected.size === v.areaHighlights.size
          && [...expected].every(mesh => v.areaHighlights.has(mesh));
      }, id), `${id} must highlight exactly its anatomically assigned meshes`);
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

    // Regression: a muscle assigned to multiple areas must remain in the
    // currently selected catalog area instead of switching by mesh position.
    await page.locator('[data-area="upper-back"]').click();
    await openAdvanced();
    await page.locator('#searchInput').fill('latissimus');
    await page.locator('#searchResults .search-result-item', { hasText: 'Latissimus Dorsi Muscle' }).click();
    assert.equal(await page.locator('#selectedBodyArea').inputValue(), 'upper-back');
    assert.equal(await page.evaluate(() => window.__viewerTest.bodyMapStore.getState().muscleId), 'muscle.latissimus-dorsi-muscle');
    assert.equal(await page.locator('#partTitle').textContent(), 'Latissimus Dorsi Muscle');
    assert.equal(await page.evaluate(() => window.__viewerTest.selected() !== null), true);

    // Regression: selecting a new muscle must honor a side chosen first.
    await page.locator('[data-area="shoulder"]').click();
    await openAdvanced();
    await page.locator('#searchInput').focus();
    assert(await page.locator('#searchResults .search-result-item').count() > 0, 'Advanced mode must allow browsing the selected area');
    await page.locator('#searchInput').fill('BiCePs');
    assert(await page.locator('#searchResults .search-result-item').count() > 0, 'Upper-arm biceps must remain searchable in Shoulder');
    assert.equal(await page.locator('#searchResults .search-result-item', { hasText: 'Femoris' }).count(), 0, 'Leg muscles must not appear in Shoulder');
    if (issue85EvidenceDir) await page.locator('#infoPanel').screenshot({ path: path.join(issue85EvidenceDir, 'shoulder-biceps.png') });
    await page.locator('[data-area="thigh"]').click();
    await page.locator('#searchInput').fill('biceps');
    assert(await page.locator('#searchResults .search-result-item', { hasText: 'Femoris' }).count() > 0, 'Biceps femoris belongs in Thigh');
    assert.equal(await page.locator('#searchResults .search-result-item', { hasText: 'Brachii' }).count(), 0, 'Upper-arm biceps must not appear in Thigh');
    if (issue85EvidenceDir) await page.locator('#infoPanel').screenshot({ path: path.join(issue85EvidenceDir, 'thigh-biceps.png') });
    await page.locator('[data-area="shoulder"]').click();
    await page.locator('#searchInput').fill('femoris');
    assert.match(await page.locator('#searchResults').textContent(), /No muscles found in this area/);
    await page.locator('input[name="painSide"][value="right"]').check();
    await page.locator('#searchInput').fill('acromial');
    await page.locator('#searchResults .search-result-item', { hasText: 'Acromial Part Of Deltoid Muscle' }).click();
    assert.equal(await page.evaluate(() => window.__viewerTest.bodyMapStore.getState().side), 'right');
    assert.equal(await page.evaluate(() => {
      const v = window.__viewerTest;
      return v.muscleCatalog.find(record => record.mesh === v.selected())?.side;
    }), 'right');

    const captureSelectionState = () => page.evaluate(() => {
      const v = window.__viewerTest;
      return {
        muscleId: v.bodyMapStore.getState().muscleId,
        side: v.bodyMapStore.getState().side,
        checkedSide: document.querySelector('input[name="painSide"]:checked')?.value ?? null,
        selectedMesh: v.selected()?.uuid ?? null,
        highlightedMeshes: [v.selected(), ...v.areaHighlights.keys()]
          .filter(Boolean)
          .map(mesh => mesh.uuid)
          .sort(),
        title: document.querySelector('#partTitle').textContent,
        details: document.querySelector('#partDescription').textContent,
        camera: v.camera.position.toArray(),
        target: v.controls.target.toArray(),
      };
    });

    // Regression: selecting the same search result again is a no-op for every
    // side state, whether the result is chosen by click or Enter.
    for (const side of ['right', 'left', 'both', null]) {
      await page.locator('#clearBodyArea').click();
      await page.locator('[data-area="shoulder"]').click();
      if (side) await page.locator(`input[name="painSide"][value="${side}"]`).check();
      await openAdvanced();
      await page.locator('#searchInput').fill('acromial');
      await page.locator('#searchResults .search-result-item', { hasText: 'Acromial Part Of Deltoid Muscle' }).click();
      const initialState = await captureSelectionState();

      await page.locator('#searchInput').fill('acromial');
      await page.locator('#searchResults .search-result-item', { hasText: 'Acromial Part Of Deltoid Muscle' }).click();
      assert.deepEqual(await captureSelectionState(), initialState, `Repeated click changed the ${side ?? 'unspecified'}-side selection`);

      await page.locator('#searchInput').fill('acromial');
      await page.locator('#searchInput').press('Enter');
      assert.deepEqual(await captureSelectionState(), initialState, `Repeated Enter changed the ${side ?? 'unspecified'}-side selection`);
    }

    // Regression: Both must be reapplied when changing logical muscles.
    await page.locator('input[name="painSide"][value="both"]').check();
    await page.locator('#searchInput').fill('clavicular');
    await page.locator('#searchResults .search-result-item', { hasText: 'Clavicular Part Of Deltoid Muscle' }).click();
    assert.equal(await page.evaluate(() => window.__viewerTest.bodyMapStore.getState().side), 'both');
    assert(await page.evaluate(() => {
      const v = window.__viewerTest;
      const selectedRecord = v.muscleCatalog.find(record => record.mesh === v.selected());
      const highlighted = new Set([v.selected(), ...v.areaHighlights.keys()]);
      const sides = new Set(v.muscleCatalog
        .filter(record => record.displayName === selectedRecord.displayName && highlighted.has(record.mesh))
        .map(record => record.side));
      return sides.has('left') && sides.has('right');
    }), 'Both must highlight both copies after changing muscles');

    await page.locator('#clearBodyArea').click();
    await page.locator('[data-area="shoulder"]').click();
    await page.locator('input[name="painSide"][value="left"]').check();
    assert(await page.evaluate(() => {
      const v = window.__viewerTest;
      const highlighted = v.muscleCatalog.filter(record => v.areaHighlights.has(record.mesh));
      return highlighted.length > 0 && highlighted.every(record => record.side === 'left');
    }), 'Left must highlight only left-side muscles in the selected area');
    const leftCount = await page.evaluate(() => window.__viewerTest.areaHighlights.size);
    await page.locator('input[name="painSide"][value="right"]').check();
    assert(await page.evaluate(() => {
      const v = window.__viewerTest;
      const highlighted = v.muscleCatalog.filter(record => v.areaHighlights.has(record.mesh));
      return highlighted.length > 0 && highlighted.every(record => record.side === 'right');
    }), 'Right must highlight only right-side muscles in the selected area');
    await page.locator('input[name="painSide"][value="both"]').check();
    assert(await page.evaluate(() => {
      const v = window.__viewerTest;
      const sides = new Set(v.muscleCatalog.filter(record => v.areaHighlights.has(record.mesh)).map(record => record.side));
      return sides.has('left') && sides.has('right');
    }), 'Both must highlight muscles on both sides of the selected area');
    assert((await page.evaluate(() => window.__viewerTest.areaHighlights.size)) > leftCount);
    await page.locator('#clearBodyArea').click();
    // Simple clicks select only areas; muscle interaction requires explicit advanced mode.
    await page.evaluate(() => {
      const v = window.__viewerTest;
      const record = v.muscleCatalog.find(candidate => {
        if (candidate.side !== 'left') return false;
        if (!v.muscleCatalog.some(peer => peer.displayName === candidate.displayName && peer.side === 'right')) return false;
        const center = new v.THREE.Box3().setFromObject(candidate.mesh).getCenter(new v.THREE.Vector3());
        return v.getSupportedBodyAreaForRegion(v.getBodyArea(center), center.y)?.id === 'shoulder';
      });
      window.__testMesh = record.mesh;
      v.selectBodyMesh(window.__testMesh);
    });
    assert.equal(await page.locator('#selectedBodyArea').inputValue(), 'shoulder');
    assert.equal(await page.evaluate(() => window.__viewerTest.selected()), null);
    await page.evaluate(() => window.__viewerTest.selectBodyMesh(window.__testMesh));
    assert.equal(await page.evaluate(() => window.__viewerTest.bodyMapStore.getState().muscleId), null);
    assert.equal(await page.locator('#infoPanel').isVisible(), false);
    await openAdvanced();
    await page.evaluate(() => window.__viewerTest.selectBodyMesh(window.__testMesh));
    assert.equal(await page.evaluate(() => window.__viewerTest.selected() === window.__testMesh), true);
    assert.match(await page.locator('#partDescription').textContent(), /Possible diagnoses associated with this muscle/);
    assert.equal(await page.locator('#partDescription li').count() > 0, true);
    assert.equal(await page.locator('#partDescription a').count(), 0);
    assert.match(await page.locator('#partDescription').textContent(), /not a medical diagnosis/);
    const selectedMuscleTitle = await page.locator('#partTitle').textContent();
    assert.equal(await page.locator('input[name="painSide"][required]').count(), 0);
    assert.equal(await page.locator('input[name="painSide"][value="left"]').isChecked(), true);
    assert.equal(await page.evaluate(() => window.__viewerTest.bodyMapStore.getState().side), 'left');
    await page.evaluate(() => {
      const v = window.__viewerTest;
      const selectedRecord = v.muscleCatalog.find(record => record.mesh === window.__testMesh);
      const rightRecord = v.muscleCatalog.find(record => record.displayName === selectedRecord.displayName && record.side === 'right');
      v.selectBodyMesh(rightRecord.mesh);
    });
    assert.equal(await page.locator('input[name="painSide"][value="right"]').isChecked(), true);
    assert.equal(await page.evaluate(() => window.__viewerTest.bodyMapStore.getState().side), 'right');
    await page.locator('#clearPainSide').click();
    assert.equal(await page.locator('input[name="painSide"]:checked').count(), 0);
    if (evidenceDir) await page.locator('.side-selector').screenshot({ path: path.join(evidenceDir, 'side-not-specified.png') });
    for (const side of ['left', 'right']) {
      await page.locator(`input[name="painSide"][value="${side}"]`).check();
      assert.equal(await page.locator('#partTitle').textContent(), selectedMuscleTitle);
      assert.match(await page.locator('#partDescription').textContent(), /Possible diagnoses associated with this muscle/);
      assert.equal(await page.evaluate(expectedSide => {
        const v = window.__viewerTest;
        return v.muscleCatalog.find(record => record.mesh === v.selected())?.side;
      }, side), side);
      if (side === 'left' && evidenceDir) await page.locator('.side-selector').screenshot({ path: path.join(evidenceDir, 'side-left-selected.png') });
    }
    await page.locator('input[name="painSide"][value="both"]').check();
    assert.equal(await page.locator('#partTitle').textContent(), selectedMuscleTitle);
    assert(await page.evaluate(() => {
      const v = window.__viewerTest;
      const selectedRecord = v.muscleCatalog.find(record => record.mesh === v.selected());
      const highlighted = [v.selected(), ...v.areaHighlights.keys()];
      const sides = new Set(v.muscleCatalog
        .filter(record => record.displayName === selectedRecord.displayName && highlighted.includes(record.mesh))
        .map(record => record.side));
      return sides.has('left') && sides.has('right');
    }), 'Both must preserve the selected muscle and highlight its left and right copies');
    await page.locator('#clearPainSide').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('input[name="painSide"]:checked').count(), 0);
    assert.equal(await page.evaluate(() => window.__viewerTest.bodyMapStore.getState().side), null);
    assert.equal(await page.evaluate(() => window.__viewerTest.bodyMapStore.getState().muscleId !== null), true);
    assert.equal(await page.locator('input[name="painSide"][value="left"]').evaluate(el => el === document.activeElement), true);
    await page.locator('#toggleMuscleView').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#toggleMuscleView').getAttribute('aria-expanded'), 'false');
    assert.equal(await page.locator('#infoPanel').isVisible(), false);
    assert.equal(await page.evaluate(() => window.__viewerTest.bodyMapStore.getState().muscleId), null);
    assert.equal(await page.locator('#selectedBodyArea').inputValue(), 'shoulder');
    assert.equal(await page.evaluate(() => {
      const v = window.__viewerTest;
      const expected = new Set(v.getMusclesForArea('shoulder').map(record => record.mesh));
      return v.selected() === null && expected.size === v.areaHighlights.size
        && [...expected].every(mesh => v.areaHighlights.has(mesh));
    }), true, 'Returning to simple must restore area highlighting');
    assert.equal(await page.locator('#toggleMuscleView').evaluate(el => el === document.activeElement), true);
    await page.keyboard.press('Space');
    assert.equal(await page.locator('#toggleMuscleView').getAttribute('aria-expanded'), 'true');
    assert.equal(await page.locator('#searchInput').evaluate(el => el === document.activeElement), true);
    await page.evaluate(() => window.__viewerTest.selectBodyMesh(window.__testMesh));
    assert.equal(await page.locator('#partTitle').textContent(), selectedMuscleTitle);
    assert.equal(await page.locator('#panelToggle').count(), 0, 'The obsolete collapse control must be removed');
    await page.locator('#searchInput').fill('a');
    assert.equal(await page.locator('#searchResults').isVisible(), true);
    assert.equal(await page.locator('#searchInput').getAttribute('aria-expanded'), 'true');
    assert.equal(await page.locator('#searchResults').evaluate(element => getComputedStyle(element).position), 'static');
    assert.equal(await page.locator('.viewer-info-content').evaluate(element => getComputedStyle(element).overflowY), 'visible');
    const searchBox = await page.locator('#searchInput').boundingBox();
    const resultsBox = await page.locator('#searchResults').boundingBox();
    assert(resultsBox.y >= searchBox.y + searchBox.height, 'Search results must appear below the input in normal page flow');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    if (evidenceDir) await page.locator('#infoPanel').screenshot({ path: path.join(evidenceDir, 'advanced-search-desktop.png') });
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    assert.equal(await page.locator('#searchResults').evaluate(element => getComputedStyle(element).overflowY), 'visible');
    if (evidenceDir) await page.locator('#infoPanel').screenshot({ path: path.join(evidenceDir, 'advanced-search-phone.png') });
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.keyboard.press('ArrowDown');
    assert.equal(await page.locator('#searchResults [aria-selected="true"]').count(), 1);
    assert(await page.locator('#searchInput').getAttribute('aria-activedescendant'));
    assert.equal(await page.locator('#searchResults .search-result-item[tabindex="0"]').count(), 0);
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.querySelector('#searchResults').contains(document.activeElement)), false, 'Tab must skip search results');

    await page.locator('#searchInput').focus();
    await page.locator('#searchInput').fill('Clavicular Part Of Deltoid Muscle');
    await page.keyboard.press('ArrowDown');
    const activeResultLabel = await page.locator('#searchResults [aria-selected="true"]').textContent();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#partTitle').textContent(), activeResultLabel);
    assert.equal(await page.locator('#searchResults').isVisible(), false);

    await page.locator('#searchInput').fill('a');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#searchResults').isVisible(), false);
    assert.equal(await page.locator('#searchInput').getAttribute('aria-expanded'), 'false');
    await page.evaluate(() => {
      document.querySelector('#searchInput').value = 'old search';
    });
    assert.equal(await page.evaluate(() => window.__viewerTest.selected() !== null), true);
    await page.locator('[data-area="foot"]').click();
    assert.equal(await page.evaluate(() => window.__testMesh.material === window.__viewerTest.highlightMat), false);
    assert.equal(await page.locator('#searchInput').inputValue(), '');
    await page.locator('[data-area="knee"]').click();
    await page.locator('#fullName').fill('Keep This Answer');
    await page.locator('#clearBodyArea').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#selectedBodyArea').inputValue(), '');
    assert.equal(await page.evaluate(() => window.__viewerTest.areaHighlights.size), 0);
    assert.equal(await page.locator('[aria-pressed="true"]').count(), 0);
    assert.equal(await page.locator('[data-area="neck"]').evaluate(el => el === document.activeElement), true);
    assert.equal(await page.locator('#fullName').inputValue(), 'Keep This Answer');
    await page.locator('[data-area="elbow"]').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#selectedBodyArea').inputValue(), 'elbow');
    assert.match(await page.locator('#possibleIssuesList').textContent(), /Tennis Elbow/);
    assert.doesNotMatch(await page.locator('#possibleIssuesList').textContent(), /tendon irritation|tendonitis/i);
    if (issue82EvidenceDir) await page.screenshot({ path: path.join(issue82EvidenceDir, 'elbow-sponsor-content.png'), fullPage: true });
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
    await page.locator('#fullName').fill('Keep This Answer');
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
    if (evidenceDir) await page.screenshot({ path: path.join(evidenceDir, 'before-reset.png') });
    await page.locator('#clearBodyArea').click();
    assert.deepEqual(await page.evaluate(() => window.__viewerTest.camera.position.toArray()), [0, 0.85, 2]);
    assert.deepEqual(await page.evaluate(() => window.__viewerTest.controls.target.toArray()), [0, 0.85, 0]);
    assert.equal(await page.evaluate(() => window.__viewerTest.animating()), false);
    assert.equal(await page.locator('#fullName').inputValue(), 'Keep This Answer');
    if (evidenceDir) await page.screenshot({ path: path.join(evidenceDir, 'after-reset.png') });

    // Reset remains useful with no area selected when only the camera has moved.
    await page.evaluate(() => {
      const v = window.__viewerTest;
      v.camera.position.set(3, 4, 5);
      v.controls.target.set(1, 1, 1);
      v.controls.update();
    });
    assert.equal(await page.locator('#selectedBodyArea').inputValue(), '');
    assert.equal(await page.locator('#clearBodyArea').isEnabled(), true);
    await page.locator('#clearBodyArea').click();
    assert.deepEqual(await page.evaluate(() => window.__viewerTest.camera.position.toArray()), [0, 0.85, 2]);
    assert.deepEqual(await page.evaluate(() => window.__viewerTest.controls.target.toArray()), [0, 0.85, 0]);
    // Reproducible issue evidence: two different areas and a mobile layout.
    for (const [area, width] of [['shoulder', 1280], ['foot', 1280], ['shoulder', 390]]) {
      await page.locator('#clearBodyArea').click();
      await page.setViewportSize({ width, height: 960 });
      await page.locator(`[data-area="${area}"]`).click();
      const content = await page.locator('#possibleIssuesList').textContent();
      assert.match(content, area === 'foot' ? /Plantar fasciitis/ : /Shoulder bursitis/);
      assert.doesNotMatch(content, area === 'foot' ? /Bursitis/ : /Plantar fasciitis/);
      assert.equal(await page.locator('#muscleSelection').isVisible(), false);
      if (evidenceDir) {
        await page.locator('#bodyAreaControls').scrollIntoViewIfNeeded();
        await page.screenshot({ path: path.join(evidenceDir, `${area}-${width}.png`) });
      }
      await openAdvanced();
      assert.equal(await page.locator('#muscleSelection').isVisible(), true);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    }
    assert.deepEqual(errors, []);

    // Controls must not depend on model availability or even successful viewer startup.
    const areaScenarios = [];
    for (const scenario of ['delayed', 'delayed-reset', 'failed', 'viewer-unavailable', 'missing-content']) {
      const isolated = await browser.newPage({ reducedMotion: 'reduce', viewport: { width: 1280, height: 1000 } });
      const isolatedErrors = [];
      isolated.on('pageerror', error => isolatedErrors.push(error.message));
      await isolated.addInitScript(() => {
        window.__submissions = 0;
        document.addEventListener('submit', event => { event.preventDefault(); window.__submissions++; });
      });
      if (scenario === 'missing-content') {
        // Replace only Foot's content in this browser; production data stays intact.
        await isolated.route('**/possible-issues-data.mjs', async route => {
          const response = await route.fetch();
          const body = (await response.text()).replace('export function getPossibleIssues(areaId) {',
            "export function getPossibleIssues(areaId) { if (areaId === 'foot') return [];");
          await route.fulfill({ response, body });
        });
      }
      let release;
      const gate = new Promise(resolve => { release = resolve; });
      if (scenario === 'viewer-unavailable') {
        await isolated.route('**/viewer.js*', route => route.abort());
      } else {
        await isolated.route('**/viewer.js*', async route => {
          const response = await route.fetch();
          await route.fulfill({ response, body: await response.text() + '\nsetViewerRenderLoopPaused(true);' });
        });
      }
      await isolated.route('**/*.glb', async route => {
        if (scenario.startsWith('delayed')) { await gate; await route.fulfill({ body: model, contentType: 'model/gltf-binary' }); }
        else await route.abort();
      });
      await isolated.goto(url, { waitUntil: 'domcontentloaded' });
      await isolated.locator('#fullName').fill('Keep this test answer');
      const panel = isolated.locator('#possibleIssues');
      assert.equal(await panel.isVisible(), false);
      for (const button of await isolated.locator('[data-area]').all()) {
        await button.click();
        assert.equal(await panel.isVisible(), true);
        assert.equal(await isolated.locator('#possibleIssuesTitle').textContent(), `Possible issues in ${await button.textContent()}`);
        assert.equal(await isolated.locator('input[name="painSide"]:checked').count(), 0);
        if (scenario === 'missing-content' && await button.getAttribute('data-area') === 'foot') {
          assert.equal(await panel.locator('li').count(), 1);
          assert.match(await panel.textContent(), /Content is not available for this area yet\./);
          assert.doesNotMatch(await panel.textContent(), /Frozen shoulder|Achilles/);
        } else {
          assert((await panel.locator('li').count()) > 0);
        }
      }
      const selection = await isolated.evaluate(async () => (await import('./body-map-store.mjs')).bodyMapStore.getState());
      assert.equal(selection.muscleId, null);
      assert.equal(selection.side, null);
      if (scenario.startsWith('delayed')) {
        // Reset while the request is pending; loading must not resurrect old content.
        if (scenario === 'delayed-reset') {
          await isolated.locator('#clearBodyArea').click();
          assert.equal(await isolated.locator('#possibleIssuesList').textContent(), '');
          assert.equal(await panel.isVisible(), false);
        }
        release();
        await isolated.locator('#loadingOverlay').waitFor({ state: 'hidden', timeout: 60000 });
        assert.equal(await panel.isVisible(), scenario === 'delayed');
        assert.equal(await isolated.locator('#selectedBodyArea').inputValue(), scenario === 'delayed' ? 'foot' : '');
        if (scenario === 'delayed') assert.match(await panel.textContent(), /Possible issues in Foot/);
        await isolated.locator('[data-area="lower-back"]').click();
        assert.match(await panel.textContent(), /Possible issues in Lower Back/);
      }
      if (scenario === 'failed' || scenario === 'missing-content') {
        await isolated.waitForFunction(() => document.getElementById('loadingLabel').textContent === 'Failed to load model');
        if (scenario === 'failed') await isolated.locator('[data-area="shoulder"]').click();
        if (issue82EvidenceDir) await isolated.locator('#intakeForm fieldset').nth(1).screenshot({
          path: path.join(issue82EvidenceDir, scenario === 'failed' ? 'area-only-model-failed.png' : 'unavailable-content.png'),
        });
      }
      await isolated.locator('#clearBodyArea').click();
      assert.equal(await isolated.locator('#selectedBodyArea').inputValue(), '');
      assert.equal(await panel.isVisible(), false);
      assert.equal(await isolated.locator('#possibleIssuesList').textContent(), '');
      assert.equal(await isolated.locator('#possibleIssuesTitle').textContent(), '');
      assert.equal(await isolated.locator('#fullName').inputValue(), 'Keep this test answer');
      await isolated.locator('[data-area="shoulder"]').click();
      isolated.once('dialog', dialog => dialog.accept());
      await isolated.locator('#intakeForm [type="reset"]').click();
      await isolated.waitForFunction(() => document.getElementById('selectedBodyArea').value === '');
      assert.equal(await isolated.locator('#possibleIssuesList').textContent(), '');
      assert.equal(await isolated.locator('#possibleIssuesTitle').textContent(), '');
      assert.equal(await panel.isVisible(), false);
      assert.equal(await isolated.evaluate(() => window.__submissions), 0);
      if (scenario !== 'viewer-unavailable') assert.deepEqual(isolatedErrors, []);
      else {
        assert.equal(isolatedErrors.length, 1);
        assert.match(isolatedErrors[0], /Failed to fetch dynamically imported module/);
      }
      areaScenarios.push({ scenario, result: 'passed', areasChecked: await isolated.locator('[data-area]').count(), clearSelection: 'passed', formReset: 'passed', formSubmissions: 0 });
      await isolated.close();
    }
    if (issue82EvidenceDir) await fs.writeFile(path.join(issue82EvidenceDir, 'browser-results.json'), JSON.stringify({
      capturedAt: new Date().toISOString(), viewport: { width: 1280, height: 1000 },
      loadedModelWorkflow: 'passed', responsiveWidths: [390, 768, 1280],
      screenshots: ['area-only-model-failed.png', 'unavailable-content.png'],
      missingContentIsTestFixture: true, areaScenarios,
    }, null, 2) + '\n');
    console.log('PASS: existing model workflow and all configured area-information lists, replacement, Clear Selection, form reset, three layouts, delayed/failed model, unavailable viewer, missing-content fixture, and no accidental submissions.');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
