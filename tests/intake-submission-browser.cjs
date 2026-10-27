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
  if (evidenceDir) await fs.mkdir(evidenceDir, { recursive: true })
  try {
    for (const scenario of ['area-only', 'detailed-no-side', 'detailed-both']) {
      const page = await browser.newPage({ reducedMotion: 'reduce' })
      await page.route('**/email.min.js', route => route.fulfill({
        contentType: 'text/javascript',
        body: 'window.emailjs={init(){},send:async(_service,_template,params)=>{window.__sentEmail=params;return {status:200}}}',
      }))
      await page.route('**/*.glb', route => route.fulfill({ body: model, contentType: 'model/gltf-binary' }))
      await page.goto(`http://127.0.0.1:${server.address().port}`)
      await page.locator('#loadingOverlay').waitFor({ state: 'hidden', timeout: 60000 })
      await page.locator('[data-area="shoulder"]').click()
      if (scenario !== 'area-only') {
        await page.locator('#toggleMuscleView').click()
        await page.locator('#searchInput').fill('acromial')
        await page.locator('#searchInput').press('Enter')
        if (scenario === 'detailed-both') {
          await page.locator('input[name="painSide"][value="both"]').evaluate(input => {
            input.checked = true
            input.dispatchEvent(new Event('change', { bubbles: true }))
          })
        }
      }
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
      await page.locator('#thankYouMessage').waitFor({ state: 'visible' })
      if (evidenceDir) await page.locator('#thankYouMessage').screenshot({ path: path.join(evidenceDir, `${scenario}.png`) })
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
      if (scenario === 'area-only') {
        assert.equal(result.muscle, 'Not selected')
        assert.equal(result.side, 'Not specified')
        assert.equal(result.email.muscle_id, '')
      } else {
        assert.equal(result.muscle, 'Acromial Part Of Deltoid Muscle')
        assert.equal(result.side, scenario === 'detailed-both' ? 'both' : 'Not specified')
        assert.equal(result.email.muscle_id, 'muscle.acromial-part-of-deltoid-muscle')
      }
      await page.close()
    }
    process.stdout.write('PASS: mocked EmailJS payload and confirmation agree for area-only, detailed without side, and detailed with both sides.\n')
  } finally {
    await browser.close()
    await new Promise(resolve => server.close(resolve))
  }
}

main().catch(error => { console.error(error); process.exitCode = 1 })
