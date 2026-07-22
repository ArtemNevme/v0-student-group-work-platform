// @ts-check
const { chromium } = require("playwright")
const path = require("path")

const BASE_URL = process.env.BASE_URL || "http://localhost:3000"
const OUT_DIR = path.join(__dirname, "..", ".tmp")

async function screenshot(page, name, options = {}) {
  const fullPath = path.join(OUT_DIR, `${name}.png`)
  await page.screenshot({ path: fullPath, fullPage: true, ...options })
  console.log(`Screenshot saved: ${fullPath}`)
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })

  const pages = [
    { url: "/", name: "landing-light" },
    { url: "/auth/login", name: "login-light" },
    { url: "/auth/sign-up", name: "signup-light" },
  ]

  for (const { url, name } of pages) {
    const page = await context.newPage()
    await page.goto(`${BASE_URL}${url}`, { waitUntil: "networkidle" })
    await screenshot(page, name)

    // Switch to dark theme via next-themes (attribute="class")
    await page.evaluate(() => {
      document.documentElement.classList.add("dark")
    })
    await page.waitForTimeout(300)
    await screenshot(page, name.replace("-light", "-dark"))

    await page.close()
  }

  // Mobile landing
  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const mobilePage = await mobileContext.newPage()
  await mobilePage.goto(`${BASE_URL}/`, { waitUntil: "networkidle" })
  await screenshot(mobilePage, "landing-mobile-light")
  await mobilePage.evaluate(() => document.documentElement.classList.add("dark"))
  await mobilePage.waitForTimeout(300)
  await screenshot(mobilePage, "landing-mobile-dark")
  await mobilePage.close()

  await browser.close()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
