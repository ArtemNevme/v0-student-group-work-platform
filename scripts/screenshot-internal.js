// @ts-check
const { chromium } = require("playwright")
const path = require("path")

const BASE_URL = process.env.BASE_URL || "http://localhost:3000"
const OUT_DIR = path.join(__dirname, "..", ".tmp")

const TEST_EMAIL = process.env.TEST_EMAIL || `test${Date.now()}@studysinc.local`
const TEST_PASSWORD = process.env.TEST_PASSWORD || "TestPassword123!"

async function screenshot(page, name) {
  const fullPath = path.join(OUT_DIR, `${name}.png`)
  await page.screenshot({ path: fullPath, fullPage: true })
  console.log(`Screenshot saved: ${fullPath}`)
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()

  // Try sign up
  await page.goto(`${BASE_URL}/auth/sign-up`, { waitUntil: "networkidle" })
  await page.fill('input#fullName', "Test User")
  await page.fill('input#email', TEST_EMAIL)
  await page.fill('input#password', TEST_PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForTimeout(2000)

  const bodyText = await page.locator("body").innerText()
  console.log("Sign-up page body:", bodyText.slice(0, 500))

  // Try login anyway
  await page.goto(`${BASE_URL}/auth/login`, { waitUntil: "networkidle" })
  await page.fill('input[type="email"]', TEST_EMAIL)
  await page.fill('input[type="password"]', TEST_PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForTimeout(3000)

  const afterLoginText = await page.locator("body").innerText()
  console.log("After login body:", afterLoginText.slice(0, 500))

  const currentUrl = page.url()
  console.log("Current URL:", currentUrl)

  if (currentUrl.includes("/dashboard")) {
    console.log("Login succeeded")
    const dashboardPages = [
      "/dashboard",
      "/dashboard/my-tasks",
      "/dashboard/calendar",
      "/dashboard/profile",
      "/dashboard/groups",
      "/dashboard/subjects",
      "/dashboard/notifications",
      "/dashboard/google-classroom",
    ]
    for (const url of dashboardPages) {
      await page.goto(`${BASE_URL}${url}`, { waitUntil: "networkidle" })
      const name = url.replace(/\//g, "-").replace(/^-/, "") || "dashboard"
      await screenshot(page, name)
    }
  } else {
    console.log("Could not log in automatically. Manual login required for internal screenshots.")
  }

  await browser.close()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
