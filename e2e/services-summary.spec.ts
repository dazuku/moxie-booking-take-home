import { expect, type Locator, type Page, test } from "@playwright/test";

const summary = (page: Page) => page.getByRole("region", { name: "Services" });

async function top(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error("element is not visible");
  return box.y;
}

async function continueToPayment(page: Page) {
  await page.getByLabel("Full Name").fill("Jane Doe");
  await page.getByLabel("Email").fill("jane@example.com");
  await page.getByLabel("Phone").fill("(619) 555-0123");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { name: "Secure your appointment by card" })).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/booking/gold-spa");
});

test("patients see what they are booking, and the total, before entering any details", async ({ page }) => {
  await expect(summary(page)).toBeVisible();
  await expect(summary(page).getByRole("listitem")).toHaveCount(2);
  await expect(summary(page)).toContainText("$400");
});

test("the summary stays visible on the payment step", async ({ page }) => {
  await continueToPayment(page);

  await expect(summary(page)).toContainText("$400");
});

test("on phones, the contact step shows the summary before the form", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "phone layout only");

  expect(await top(summary(page))).toBeLessThan(await top(page.getByLabel("Full Name")));
});

test("on phones, the payment step puts the card form first, then the summary", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "phone layout only");
  await continueToPayment(page);

  const form = page.getByRole("heading", { name: "Secure your appointment by card" });
  expect(await top(form)).toBeLessThan(await top(summary(page)));
});

test("on desktop, the summary sits under the practice card, beside the form", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop layout only");

  const practice = await page.getByRole("region", { name: "About Gold Spa" }).boundingBox();
  const services = await summary(page).boundingBox();
  const form = await page.getByLabel("Full Name").boundingBox();
  expect(services!.x).toBe(practice!.x);
  expect(services!.y).toBeGreaterThan(practice!.y);
  expect(form!.x).toBeGreaterThan(services!.x + services!.width);
});
