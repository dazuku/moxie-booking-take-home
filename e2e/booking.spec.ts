import { expect, test } from "@playwright/test";

test("the root URL opens the Gold Spa booking page", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/booking\/gold-spa$/);
  await expect(page.getByRole("heading", { name: "Gold Spa" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue" })).toBeVisible();
});

test("an unknown practice shows a not-found page instead of the booking form", async ({ page }) => {
  await page.goto("/booking/not-a-real-spa");

  await expect(page.getByText(/could not be found/i)).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue" })).toHaveCount(0);
});
