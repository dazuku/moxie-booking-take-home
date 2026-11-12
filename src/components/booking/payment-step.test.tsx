import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PaymentStep } from "./payment-step";

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-11-15T12:00:00"));
});

afterEach(() => {
  vi.useRealTimers();
});

function setup() {
  const onSubmit = vi.fn();
  const user = userEvent.setup();
  render(<PaymentStep cancellationFeeCents={5000} onSubmit={onSubmit} />);
  return { user, onSubmit };
}

async function fillValidCard(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Card number"), "4242424242424242");
  await user.type(screen.getByLabelText("Expiry date"), "1227");
  await user.type(screen.getByLabelText("Security code"), "123");
  await user.type(screen.getByLabelText("Billing ZIP code"), "92108");
}

describe("PaymentStep", () => {
  it("labels every card field, even though the design shows one 'Card information' label", () => {
    setup();

    expect(screen.getByRole("group", { name: "Card information" })).toBeInTheDocument();
    expect(screen.getByLabelText("Card number")).toHaveAttribute("autocomplete", "cc-number");
    expect(screen.getByLabelText("Expiry date")).toHaveAttribute("autocomplete", "cc-exp");
    expect(screen.getByLabelText("Security code")).toHaveAttribute("autocomplete", "cc-csc");
    expect(screen.getByLabelText("Billing ZIP code")).toHaveAttribute("autocomplete", "postal-code");
  });

  it("formats the card number and expiry as the patient types", async () => {
    const { user } = setup();

    await user.type(screen.getByLabelText("Card number"), "4242424242424242");
    await user.type(screen.getByLabelText("Expiry date"), "1227");

    expect(screen.getByLabelText("Card number")).toHaveValue("4242 4242 4242 4242");
    expect(screen.getByLabelText("Expiry date")).toHaveValue("12 / 27");
  });

  it("states the practice's cancellation fee in the policy", () => {
    setup();

    expect(screen.getByLabelText(/cancellation fee of \$50/)).toBeInTheDocument();
  });

  it("does not book until every field is valid and the policy is accepted", async () => {
    const { user, onSubmit } = setup();

    await fillValidCard(user);
    await user.click(screen.getByRole("button", { name: "Book appointment" }));

    expect(await screen.findByText("Accept the cancellation policy to book")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("books with the card details once everything is filled in", async () => {
    const { user, onSubmit } = setup();

    await fillValidCard(user);
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Book appointment" }));

    expect(onSubmit).toHaveBeenCalledWith({
      cardNumber: "4242424242424242",
      expiry: "12/27",
      cvv: "123",
      zip: "92108",
      acceptPolicy: true,
    });
  });

  it("on Book with several mistakes, shows every one of them, not just the first fields", async () => {
    const { user, onSubmit } = setup();

    await user.type(screen.getByLabelText("Card number"), "4242424242424241");
    await user.type(screen.getByLabelText("Expiry date"), "1025");
    await user.click(screen.getByRole("button", { name: "Book appointment" }));

    expect(await screen.findByText("Check your card number, it doesn't look right")).toBeInTheDocument();
    expect(screen.getByText("This card has expired")).toBeInTheDocument();
    expect(screen.getByText("Enter the 3-digit security code")).toBeInTheDocument();
    expect(screen.getByText("Enter your billing ZIP code")).toBeInTheDocument();
    expect(screen.getByText("Accept the cancellation policy to book")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
