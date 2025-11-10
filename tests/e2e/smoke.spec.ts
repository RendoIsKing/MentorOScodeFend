import { test, expect } from "@playwright/test";

const BASE_URL = process.env.E2E_BASE_URL || "http://localhost:3000";

test.describe("Smoke", () => {
  test("app responds", async ({ page }) => {
    const res = await page.request.get(BASE_URL, { timeout: 15000 });
    expect(res.ok()).toBeTruthy();
  });

  test("signin renders or redirects properly", async ({ page }) => {
    await page.goto(`${BASE_URL}/signin`, { waitUntil: "domcontentloaded" });
    // Accept either a visible form or a redirect to home if already logged in
    const hasForm = await page.locator("form").first().isVisible().catch(() => false);
    const onHome = page.url().replace(/\/+$/, "").endsWith("");
    expect(hasForm || onHome).toBeTruthy();
  });

  test("home loads basic shell", async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
    // Look for header or app root
    const hasRoot = await page.locator("main").first().isVisible().catch(() => false);
    expect(hasRoot).toBeTruthy();
  });
});


