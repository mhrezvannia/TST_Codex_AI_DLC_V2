import { expect, test, type Page } from "@playwright/test";

const base = process.env.U03_BASE_URL;
const mutationEnabled = process.env.U03_MUTATION_E2E === "1";

test.describe("U03 Agreement authority acceptance", () => {
  test.skip(!base, "Requires the isolated Wave A Compose stack and seeded Agreement fixtures");

  test("supports direct URL, reload, back-forward, and safe unauthenticated API behavior", async ({ page, request }) => {
    const protectedApi = await request.get(`${base}/charge-agreements/api/agreements`);
    expect([401, 403]).toContain(protectedApi.status());

    await page.goto(`${base}/charge-agreements/`);
    await expect(page.getByRole("heading", { name: "Charge agreements" })).toBeVisible();
    await page.reload();
    await expect(page.getByRole("heading", { name: "Charge agreements" })).toBeVisible();

    const firstAgreement = page.locator('[data-testid^="agreement-row-"] a').first();
    test.skip(await firstAgreement.count() === 0, "Requires at least one seeded visible Agreement");
    await firstAgreement.click();
    await expect(page.getByText("Agreement identity")).toBeVisible();
    await page.goBack();
    await page.goForward();
    await expect(page.getByText("Agreement identity")).toBeVisible();
  });

  for (const viewport of [
    { width: 375, height: 812 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1440, height: 900 }
  ]) {
    for (const scheme of ["light", "dark"] as const) {
      test(`${viewport.width}px ${scheme} keeps the operational page bounded and labelled`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
        await page.goto(`${base}/charge-agreements/`);
        await expect(page.getByRole("heading", { name: "Charge agreements" })).toBeVisible();
        await expect(page.getByRole("heading", { name: "Search and filters" })).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      });
    }
  }

  test("supports keyboard-only filter and read-only/denied command hiding", async ({ page }) => {
    await page.goto(`${base}/charge-agreements/`);
    await page.keyboard.press("Tab");
    await tabUntilFocused(page, "agreement-customer");
    await page.keyboard.type("customer-seeded");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("agreement-list-status")).toHaveAttribute("aria-live", "polite");
    const readOnlyCopy = page.getByText(/read-only/i);
    if (await readOnlyCopy.count()) {
      await expect(page.getByTestId("create-agreement-link")).toHaveCount(0);
    }
  });

  test("creates, edits, approves, creates a successor, and records terminal history", async ({ page }) => {
    test.skip(!mutationEnabled, "Set U03_MUTATION_E2E=1 only for the isolated disposable mutation fixture");
    await page.goto(`${base}/charge-agreements/agreements/new`);
    await fillAgreement(page, `AGR-E2E-${Date.now()}`);
    await page.getByTestId("save-agreement").click();
    await expect(page.getByText("Agreement identity")).toBeVisible();

    const detailUrl = page.url();
    await page.getByRole("link", { name: /edit/i }).click();
    await page.getByLabel("Reason").fill("E2E edit");
    await page.getByTestId("save-agreement").click();
    await page.getByLabel("Lifecycle reason").fill("E2E approval");
    await page.getByRole("button", { name: "Approve" }).click();
    await expect(page.getByText("APPROVED")).toBeVisible();

    await page.getByRole("link", { name: /successor/i }).click();
    await page.getByLabel("Reason").fill("E2E successor");
    await page.getByTestId("save-agreement").click();
    await page.goto(detailUrl);
    await expect(page.getByText(/activity/i)).toBeVisible();
  });
});

async function tabUntilFocused(page: Page, id: string) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (await page.evaluate((target) => document.activeElement?.id === target, id)) return;
    await page.keyboard.press("Tab");
  }
  throw new Error(`Keyboard focus did not reach ${id}`);
}

async function fillAgreement(page: Page, number: string) {
  const values: Record<string, string> = {
    "Agreement number": number,
    "Customer ID": "customer-e2e",
    "Trade lane ID": "lane-e2e",
    "Origin location ID": "location-origin",
    "Destination location ID": "location-destination",
    "Equipment type ID": "equipment-40hc",
    "Valid from": "2026-08-01",
    "Valid to": "2026-12-31",
    "Base / OFR RateVersion ID": "rate-version-base",
    "Surcharge / BAF RateVersion ID": "rate-version-surcharge",
    "Local / THC RateVersion ID": "rate-version-local",
    "Reason": "E2E create"
  };
  for (const [label, value] of Object.entries(values)) {
    await page.getByLabel(label).fill(value);
  }
}
