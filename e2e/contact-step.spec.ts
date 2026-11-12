import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/booking/gold-spa");
});

test("a patient with valid details continues to the payment step", async ({ page }) => {
  await page.getByLabel("Full Name").fill("Jane Doe");
  await page.getByLabel("Email").fill("jane@example.com");
  await page.getByLabel("Phone").fill("(619) 555-0123");
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(page.getByRole("heading", { name: "Secure your appointment by card" })).toBeVisible();
});

test("a patient who skips required fields stays on the contact step and sees why", async ({ page }) => {
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(page.getByText("Enter your full name")).toBeVisible();
  await expect(page.getByLabel("Full Name")).toBeFocused();
  await expect(page.getByRole("heading", { name: "Secure your appointment by card" })).toHaveCount(0);
});

test("going back from payment keeps the details exactly as the patient typed them", async ({ page }) => {
  await page.getByLabel("Full Name").fill("Jane Doe");
  await page.getByLabel("Email").fill("jane@example.com");
  await page.getByLabel("Phone").fill("619-555-0123");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Back" }).click();

  await expect(page.getByLabel("Full Name")).toHaveValue("Jane Doe");
  await expect(page.getByLabel("Email")).toHaveValue("jane@example.com");
  await expect(page.getByLabel("Phone")).toHaveValue("619-555-0123");
});

test("clicking Continue right after typing a wrong email still lists every problem", async ({ page }) => {
  await page.getByLabel("Email").pressSequentially("jane@");
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(page.getByText("Enter a 10-digit US phone number")).toBeVisible();
});
