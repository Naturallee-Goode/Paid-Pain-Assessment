const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');

module.exports = async function checkAreaClicks(page) {
  const before = process.env.ISSUE83_BEFORE === '1';
  const evidence = process.env.ISSUE83_EVIDENCE_DIR;
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.evaluate(() => window.__viewerTest.setRenderLoopPaused(true));
  const clickPoint = async (point, direction = [0, 0, 1], click = true) => {
    await page.locator('#viewer canvas').scrollIntoViewIfNeeded();
    const position = await page.evaluate(({ point, direction }) => {
      const v = window.__viewerTest;
      const target = new v.THREE.Vector3(...point);
      v.controls.target.copy(target);
      v.camera.position.copy(target).add(new v.THREE.Vector3(...direction).multiplyScalar(.65));
      v.controls.update();
      v.camera.updateMatrixWorld();
      const screen = target.project(v.camera);
      const rect = document.querySelector('#viewer canvas').getBoundingClientRect();
      return { x: rect.left + (screen.x + 1) * rect.width / 2, y: rect.top + (1 - screen.y) * rect.height / 2 };
    }, { point, direction });
    if (click) await page.mouse.click(position.x, position.y);
  };

  // Keep these coordinates identical for the before and after screenshots.
  await clickPoint([.09, .45, 0]);
  console.log('Front knee selection:', await page.locator('#selectedBodyArea').inputValue());
  if (evidence) {
    await fs.mkdir(evidence, { recursive: true });
    await page.evaluate(() => window.__viewerTest.render());
    await page.screenshot({ path: path.join(evidence, before ? 'before.png' : 'after.png') });
  }
  if (before) return;

  const cases = [
    ['neck', [0, 1.46, 0]],
    ['shoulder', [.19, 1.38, 0]],
    ['upper-back', [.06, 1.34, 0], [0, 0, -1]],
    ['lower-back', [.06, 1.17, 0], [0, 0, -1]],
    ['arm', [.23, 1.18, 0]],
    ['elbow', [.25, 1.08, 0]],
    ['wrist-hand', [.29, .84, 0]],
    ['hip', [.10, .78, 0], [0, 0, -1]],
    ['leg', [.09, .60, 0]],
    ['knee', [.09, .45, 0]],
    ['knee', [.09, .45, 0], [-1, 0, 0]],
    ['knee', [.09, .45, 0], [1, 0, 0]],
    ['ankle', [.09, .12, 0]],
    ['foot', [.09, .04, 0]],
  ];
  for (const [area, point, direction] of cases) {
    await page.locator('#clearBodyArea').click();
    await clickPoint(point, direction);
    assert.equal(await page.locator('#selectedBodyArea').inputValue(), area, `Click ${point} from ${direction ?? 'front'}`);
    const label = await page.locator(`[data-area="${area}"]`).textContent();
    assert.equal(await page.locator(`[data-area="${area}"]`).getAttribute('aria-pressed'), 'true');
    assert.equal(await page.locator('#bodyAreaStatus').textContent(), `Selected area: ${label}`);
    assert.match(await page.locator('#possibleIssuesTitle').textContent(), new RegExp(label));
    assert.deepEqual(await page.evaluate(() => {
      const s = window.__viewerTest.bodyMapStore.getState();
      return [s.muscleId, s.side, s.advanced];
    }), [null, null, false]);
  }

  // A supported click must replace the previous area even on a shared muscle.
  await clickPoint([.09, .45, 0]);
  await clickPoint([.09, .60, 0]);
  assert.equal(await page.locator('#selectedBodyArea').inputValue(), 'leg');
  await clickPoint([.09, .45, 0]);
  await clickPoint([.09, .45, 0]);
  assert.equal(await page.locator('#selectedBodyArea').inputValue(), 'knee');
  for (const point of [[0, 1.65, 0], [0, 1.20, 0], [0, .98, 0]]) {
    await clickPoint([.09, .45, 0]);
    await clickPoint(point);
    assert(['', 'knee'].includes(await page.locator('#selectedBodyArea').inputValue()), `Unsupported click ${point} must not assign an unrelated area`);
  }
  await clickPoint([.09, .45, 0]);
  await clickPoint([.23, 1.18, 0], [0, 0, 1], false);
  const cameraBefore = await page.evaluate(() => window.__viewerTest.camera.position.toArray());
  const canvas = await page.locator('#viewer canvas').boundingBox();
  await page.mouse.move(canvas.x + canvas.width / 2, canvas.y + canvas.height / 2);
  await page.mouse.down();
  await page.mouse.move(canvas.x + canvas.width / 2 + 80, canvas.y + canvas.height / 2, { steps: 10 });
  assert.notDeepEqual(await page.evaluate(() => window.__viewerTest.camera.position.toArray()), cameraBefore, 'Dragging must rotate the camera');
  await page.mouse.move(canvas.x + canvas.width / 2, canvas.y + canvas.height / 2, { steps: 10 });
  await page.mouse.up();
  assert.equal(await page.locator('#selectedBodyArea').inputValue(), 'knee', 'Rotation ending at the starting point must not select');
  await page.locator('#clearBodyArea').click();
  await page.evaluate(() => window.__viewerTest.setRenderLoopPaused(false));
  console.log('PASS: twelve surface-click areas, three knee directions, synchronized panels, no side/muscle, repeat/replacement, unsupported regions, and drag.');
};

