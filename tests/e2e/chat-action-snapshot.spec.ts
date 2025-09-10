import { test, expect, request } from "@playwright/test";
import { ensureLoggedIn } from './utils';

const FE = process.env.E2E_FRONTEND || "http://localhost:3002";
const BE = process.env.E2E_BACKEND || "http://localhost:3006/api/backend";

test.describe("Chat → action → snapshot", () => {
  test("sets calories and logs weight; Student Center updates", async ({ page, context }) => {
    const api = await request.newContext();
    await ensureLoggedIn(api as any, context);

    await page.goto(`${FE}/coach-engh`);
    await page.getByPlaceholder("Skriv til The PT...").fill("Sett kalorier til 2400");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(1200);

    await page.goto(`${FE}/student`);
    const kcalText = await page.getByTestId("nutrition-kcal").textContent();
    expect(kcalText || "").toContain("2400");

    const today = new Date().toISOString().slice(0, 10);
    const logger = page.getByTestId("weight-logger");
    await logger.getByRole("spinbutton").fill("81");
    await logger.getByRole("button", { name: /Lagre/i }).click();
    await page.waitForTimeout(800);

    const last = await page.getByTestId("weight-last").textContent();
    expect(last || "").toMatch(/81/);
  });
});


