import { expect, type Page, test } from "@playwright/test";

async function fillContact(page: Page) {
  await page.getByLabel("Full Name").fill("Jane Doe");
  await page.getByLabel("Email").fill("jane@example.com");
  await page.getByLabel("Phone").fill("(619) 555-0123");
  await page.getByRole("button", { name: "Continue" }).click();
}

async function fillCard(page: Page) {
  await page.getByLabel("Card number").fill("4242 4242 4242 4242");
  await page.getByLabel("Expiry date").fill("12 / 30");
  await page.getByLabel("Security code").fill("123");
  await page.getByLabel("Billing ZIP code").fill("92108");
}

test.beforeEach(async ({ page }) => {
  await page.goto("/booking/gold-spa");
  await fillContact(page);
});

test("a patient who fills in the card and accepts the policy gets their appointment booked", async ({ page }) => {
  await fillCard(page);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Book appointment" }).click();

  await expect(page.getByRole("heading", { name: "Your appointment has been booked!" })).toBeVisible();
});

test("the payment step has a single booking action", async ({ page }) => {
  await expect(page.getByRole("button", { name: "Book appointment" })).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Continue" })).toHaveCount(0);
});

test("going back to fix contact details keeps the card the patient already typed", async ({ page }) => {
  await fillCard(page);
  await page.getByRole("button", { name: "Back" }).click();
  await page.getByLabel("Email").fill("jane.doe@example.com");
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(page.getByLabel("Card number")).toHaveValue("4242 4242 4242 4242");
  await expect(page.getByLabel("Billing ZIP code")).toHaveValue("92108");
});

test("clicking Book right after typing a wrong card still submits and lists every problem", async ({ page }) => {
  await page.getByLabel("Card number").pressSequentially("4242424242424241");
  await page.getByRole("button", { name: "Book appointment" }).click();

  await expect(page.getByText("Enter your billing ZIP code")).toBeVisible();
  await expect(page.getByText("Accept the cancellation policy to book")).toBeVisible();
});

test("ticking the policy right after typing a wrong ZIP still ticks it", async ({ page }) => {
  await page.getByLabel("Billing ZIP code").pressSequentially("9210");
  await page.getByRole("checkbox").click();

  await expect(page.getByRole("checkbox")).toBeChecked();
});
