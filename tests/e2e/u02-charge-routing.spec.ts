import { expect, test } from "@playwright/test";

const base = process.env.U02_BASE_URL;

test.describe("U02 Charge routing acceptance source", () => {
  test.skip(!base, "Requires a built Charge app and isolated fake Charge/Reference backends");

  test("uses the exact base path, redirect and safe unauthenticated behavior", async ({ request }) => {
    const root = await request.get(`${base}/charge-agreements`, { maxRedirects: 0 });
    expect(root.status()).toBe(308);
    expect(root.headers().location).toBe("/charge-agreements/");

    const health = await request.get(`${base}/charge-agreements/api/health`);
    expect(health.status()).toBe(200);
    expect(Object.keys(await health.json()).sort()).toEqual(["service", "status", "timestamp"]);

    const protectedApi = await request.get(`${base}/charge-agreements/api/agreements`);
    expect(protectedApi.status()).toBe(401);
  });

  test("keeps route-state focus, action size and responsive reflow testable", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${base}/charge-agreements/does-not-exist`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Charge route not found");
    const action = page.getByTestId("charge-not-found-return");
    await expect(action).toBeVisible();
    expect((await action.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  });
});
