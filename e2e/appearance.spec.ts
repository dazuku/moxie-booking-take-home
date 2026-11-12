import { expect, test } from "@playwright/test";

// The design is light-only. A patient whose phone or laptop is in dark mode
// must still see white inputs; grey ones read as disabled.
test.use({ colorScheme: "dark" });

test("inputs stay white on the card when the device is in dark mode", async ({ page }) => {
  await page.goto("/booking/gold-spa");

  for (const label of ["Full Name", "Email", "Phone", "Visit reason"]) {
    const background = await page
      .getByLabel(label)
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(background, label).toBe("rgba(0, 0, 0, 0)");
  }
  await expect(page.locator("html")).toHaveCSS("color-scheme", "light");
});

test("buttons show the pointer cursor so they read as clickable", async ({ page }) => {
  await page.goto("/booking/gold-spa");

  await expect(page.getByRole("button", { name: "Continue" })).toHaveCSS("cursor", "pointer");
});

test("the page declares a PNG favicon that loads", async ({ page, request }) => {
  await page.goto("/booking/gold-spa");

  const href = await page.locator('link[rel="icon"][type="image/png"]').getAttribute("href");
  expect(href).toBeTruthy();
  const response = await request.get(href!);
  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toBe("image/png");
});
