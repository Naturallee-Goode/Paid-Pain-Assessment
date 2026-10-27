const { chromium } = require('playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const http = require('node:http')
const path = require('node:path')

const root = path.resolve(__dirname, '../src')
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.glb': 'model/gltf-binary' }
const server = http.createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url, 'http://localhost').pathname
    const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname))
    if (!file.startsWith(root + path.sep)) return response.writeHead(403).end()
    response.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' })
      .end(await fs.readFile(file))
  } catch {
    response.writeHead(404).end()
  }
})

async function main() {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  const browser = await chromium.launch({ headless: true })
  const model = await fs.readFile(path.join(root, 'assets/human-body2.glb'))
  const evidenceDir = process.env.ISSUE86_EVIDENCE_DIR
  const integratedEvidenceDir = process.env.ISSUE87_EVIDENCE_DIR
  if (evidenceDir) await fs.mkdir(evidenceDir, { recursive: true })
  if (integratedEvidenceDir) await fs.mkdir(integratedEvidenceDir, { recursive: true })
  try {
    const scenarios = [
      { name: 'area-only', width: 1280, detailed: false },
      { name: 'detailed-no-side', width: 1280, detailed: true },
      { name: 'detailed-both', width: 1280, detailed: true, side: 'both' },
      { name: 'phone-simple', width: 390, detailed: false },
      { name: 'phone-advanced', width: 390, detailed: true },
      { name: 'keyboard', width: 1280, detailed: true, keyboard: true },
      { name: 'model-failed', width: 390, detailed: false, modelFailed: true },
    ]
    const context = await browser.newContext({ reducedMotion: 'reduce' })
    for (const scenario of scenarios.filter(item => !process.env.INTEGRATED_SCENARIO || item.name === process.env.INTEGRATED_SCENARIO)) {
      process.stdout.write(`START ${scenario.name}\n`)
      const page = await context.newPage()
      await page.setViewportSize({ width: scenario.width, height: 900 })
      await page.route('**/email.min.js', route => route.fulfill({
        contentType: 'text/javascript',
        body: 'window.emailjs={init(){},send:async(_service,_template,params)=>{window.__sentEmail=params;return {status:200}}}',
      }))
      await page.route('**/*.glb', route => scenario.modelFailed
        ? route.abort()
        : route.fulfill({ body: model, contentType: 'model/gltf-binary' }))
      if (scenario.keyboard) {
        await page.route('**/viewer.js*', async route => {
          const response = await route.fetch()
          await route.fulfill({ response, body: `${await response.text()}\nsetViewerRenderLoopPaused(true);` })
        })
      }
      await page.goto(`http://127.0.0.1:${server.address().port}`, { waitUntil: 'domcontentloaded' })
      const tabTo = async (selector, { reverse = false } = {}) => {
        const target = page.locator(selector).first()
        for (let step = 0; step < 80; step++) {
          if (await target.evaluate(element => element === document.activeElement)) {
            if (scenario.keyboard) process.stdout.write(`FOCUS ${selector} in ${step} tabs\n`)
            return
          }
          await page.keyboard.press(reverse ? 'Shift+Tab' : 'Tab')
        }
        throw new Error(`${selector} is not reachable with ${reverse ? 'Shift+Tab' : 'Tab'}`)
      }
      if (scenario.modelFailed) await page.locator('#loadingLabel').filter({ hasText: 'Failed to load model' }).waitFor()
      else await page.locator('#loadingOverlay').waitFor({ state: 'hidden', timeout: 60000 })
      if (scenario.keyboard) {
        await tabTo('[data-area="shoulder"]')
        assert.equal(await page.locator('[data-area="shoulder"]').evaluate(element => element === document.activeElement), true)
        await page.keyboard.press('Enter')
      } else if (scenario.modelFailed) {
        await page.locator('[data-area="shoulder"]').focus()
        await page.keyboard.press('Enter')
      } else await page.locator('[data-area="shoulder"]').click()
      assert.equal(await page.locator('[data-area="shoulder"]').getAttribute('aria-pressed'), 'true')
      assert.match(await page.locator('#bodyAreaStatus').textContent(), /Selected area: Shoulder/)
      if (scenario.detailed) {
        if (scenario.keyboard) {
          await tabTo('#toggleMuscleView')
          await page.keyboard.press('Space')
          assert.equal(await page.locator('#searchInput').evaluate(element => element === document.activeElement), true)
        } else await page.locator('#toggleMuscleView').click()
        if (scenario.keyboard) {
          await page.keyboard.type('acromial')
          await page.keyboard.press('ArrowDown')
          await page.keyboard.press('Enter')
        } else {
          await page.locator('#searchInput').fill('acromial')
          await page.locator('#searchInput').press('Enter')
        }
        assert.equal(await page.locator('#partTitle').getAttribute('aria-live'), 'polite')
        assert.equal(await page.locator('#infoPanel').getAttribute('aria-labelledby'), 'partTitle')
        if (scenario.keyboard) {
          await tabTo('[data-area="foot"]', { reverse: true })
          await page.keyboard.press('Enter')
          assert.equal(await page.locator('#selectedMuscle').inputValue(), '')
          await tabTo('#clearBodyArea')
          await page.keyboard.press('Enter')
          assert.equal(await page.locator('#selectedBodyArea').inputValue(), '')
          if (integratedEvidenceDir) await page.locator('#bodyAreaControls').screenshot({ path: path.join(integratedEvidenceDir, 'keyboard-after-reset.png') })
          await tabTo('[data-area="shoulder"]')
          await page.keyboard.press('Enter')
          await tabTo('#toggleMuscleView')
          await page.keyboard.press('Enter')
          assert.equal(await page.locator('#searchInput').evaluate(element => element === document.activeElement), true)
          await page.keyboard.type('acromial')
          await page.keyboard.press('ArrowDown')
          await page.keyboard.press('Enter')
        }
        if (scenario.side) {
          await page.locator('input[name="painSide"][value="both"]').evaluate(input => {
            input.checked = true
            input.dispatchEvent(new Event('change', { bubbles: true }))
          })
        }
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
      if (integratedEvidenceDir && ['area-only', 'detailed-no-side', 'phone-simple', 'phone-advanced', 'model-failed'].includes(scenario.name)) {
        await page.locator('#bodyAreaControls').screenshot({ path: path.join(integratedEvidenceDir, `${scenario.name}-selection.png`) })
        if (scenario.detailed) await page.locator('#infoPanel').screenshot({ path: path.join(integratedEvidenceDir, `${scenario.name}-advanced.png`) })
      }
      if (scenario.keyboard) {
        // Verify the navigation helper actually detects a required field that
        // has been removed from the tab order, then restore it for the flow.
        await page.locator('#email').evaluate(input => input.tabIndex = -1)
        await assert.rejects(tabTo('#email'), /not reachable with Tab/)
        await page.locator('#email').evaluate(input => input.removeAttribute('tabindex'))
        await tabTo('#fullName', { reverse: true })
        await page.keyboard.type('Test Client')
        await tabTo('#email')
        await page.keyboard.type('client@example.test')
        await tabTo('#phone')
        await page.keyboard.type('3125550123')
        for (const selector of ['input[name="wellnessGoal"]', 'input[name="consultationPreference"]', 'input[name="disclaimerAgreement"]']) {
          await tabTo(selector)
          await page.keyboard.press('Space')
          assert.equal(await page.locator(selector).first().isChecked(), true)
        }
        await tabTo('#intakeForm [type="submit"]')
        await page.keyboard.press('Enter')
      } else {
        await page.locator('#fullName').fill('Test Client')
        await page.locator('#email').fill('client@example.test')
        await page.locator('#phone').fill('3125550123')
        for (const selector of ['input[name="wellnessGoal"]', 'input[name="consultationPreference"]', 'input[name="disclaimerAgreement"]']) {
          await page.locator(selector).first().evaluate(input => {
            input.checked = true
            input.dispatchEvent(new Event('change', { bubbles: true }))
          })
        }
        await page.locator('#intakeForm').evaluate(form => form.requestSubmit())
      }
      await page.locator('#thankYouMessage').waitFor({ state: 'visible' })
      if (evidenceDir && ['area-only', 'detailed-no-side', 'detailed-both'].includes(scenario.name)) await page.locator('#thankYouMessage').screenshot({ path: path.join(evidenceDir, `${scenario.name}.png`) })
      if (integratedEvidenceDir && ['phone-simple', 'phone-advanced', 'model-failed'].includes(scenario.name)) await page.locator('#thankYouMessage').screenshot({ path: path.join(integratedEvidenceDir, `${scenario.name}-confirmation.png`) })
      const result = await page.evaluate(() => ({
        email: window.__sentEmail,
        area: document.getElementById('summaryBodyArea').textContent,
        muscle: document.getElementById('summaryMuscle').textContent,
        side: document.getElementById('summarySide').textContent,
      }))
      assert.equal(result.area, 'Shoulder')
      assert.equal(result.email.body_area, result.area)
      assert.equal(result.email.muscle, result.muscle)
      assert.equal(result.email.pain_side, result.side)
      assert.equal(result.email.body_area_id, 'shoulder')
      if (!scenario.detailed) {
        assert.equal(result.muscle, 'Not selected')
        assert.equal(result.side, 'Not specified')
        assert.equal(result.email.muscle_id, '')
      } else {
        assert.equal(result.muscle, 'Acromial Part Of Deltoid Muscle')
        assert.equal(result.side, scenario.side ?? 'Not specified')
        assert.equal(result.email.muscle_id, 'muscle.acromial-part-of-deltoid-muscle')
      }
      await page.close()
      process.stdout.write(`PASS ${scenario.name}\n`)
    }
    await context.close()
    process.stdout.write('PASS: integrated desktop, phone, keyboard, reset, failed-model, and mocked submission scenarios.\n')
  } finally {
    await browser.close()
    await new Promise(resolve => server.close(resolve))
  }
}

main().catch(error => { console.error(error); process.exitCode = 1 })
