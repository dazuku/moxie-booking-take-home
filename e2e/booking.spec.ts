import { expect, test } from "@playwright/test";

test("the root URL opens the Gold Spa booking page", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/booking\/gold-spa$/);
  await expect(page.getByRole("heading", { name: "Gold Spa" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue" })).toBeVisible();
});
