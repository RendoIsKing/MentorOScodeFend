import { test, expect } from '@playwright/test';
import { ensureLoggedIn } from './utils';

test('Create post shows in feed', async ({ page, request, baseURL }) => {
  // Ensure we are logged in (dev login or register fallback)
  await ensureLoggedIn(request, page.context());

  // Go to upload, pick a tiny image via data URL converted to File
  await page.goto(`${baseURL}/upload`);

  // Create an in-memory file and add via the gallery input
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAIElEQVQoU2NkYGD4z0AEYBxVSFQwCqYGMAqGBoYGAE0sAQHkO3y1AAAAAElFTkSuQmCC',
    'base64'
  );
  const fileName = `e2e-${Date.now()}.png`;
  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Galleri' }).click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles({ name: fileName, mimeType: 'image/png', buffer: png });

  // Continue to compose
  await page.getByRole('button', { name: 'Publish' }).click();
  await page.waitForURL(/\/upload\/compose\?draft=/);

  const caption = `E2E post ${Date.now()}`;
  await page.getByLabel('Caption').fill(caption);
  await page.getByRole('button', { name: 'Post' }).click();

  // Expect redirect to profile or feed; then verify feed contains caption
  await page.waitForLoadState('networkidle');
  await page.goto(`${baseURL}/(deskSidebar)/(home)/home`);
  await expect(page.getByText(caption).first()).toBeVisible({ timeout: 15_000 });
});


