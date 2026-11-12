import { expect, test } from "@playwright/test";

test("booking prints the booking to the console and shows the confirmation", async ({ page }) => {
  const logged: unknown[] = [];
  page.on("console", async (message) => {
    for (const arg of message.args()) logged.push(await arg.jsonValue());
  });

  await page.goto("/booking/gold-spa");
  await page.getByLabel("Full Name").fill("Jane Doe");
  await page.getByLabel("Email").fill("jane@example.com");
  await page.getByLabel("Phone").fill("(619) 555-0123");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Card number").fill("4242 4242 4242 4242");
  await page.getByLabel("Expiry date").fill("12 / 30");
  await page.getByLabel("Security code").fill("123");
  await page.getByLabel("Billing ZIP code").fill("92108");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Book appointment" }).click();

  const heading = page.getByRole("heading", { name: "Your appointment has been booked!" });
  await expect(heading).toBeVisible();
  await expect(page.getByText("A confirmation has been sent to jane@example.com.")).toBeVisible();
  await expect(page.getByRole("region", { name: "About Gold Spa" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Services" })).toContainText("$400");
  // The booking is done: no step actions left to press.
  for (const action of ["Continue", "Back", "Book appointment"]) {
    await expect(page.getByRole("button", { name: action })).toHaveCount(0);
  }

  await expect
    .poll(() => logged.find((value) => typeof value === "object" && value !== null && "patient" in value))
    .toMatchObject({
      practice: { slug: "gold-spa" },
      totalCents: 40000,
      patient: { fullName: "Jane Doe", email: "jane@example.com", phone: "+16195550123" },
      payment: { cardNumber: "4242424242424242", expiry: "12/30", cvv: "123", zip: "92108" },
      acceptedCancellationPolicy: true,
    });
});
