import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ContactStep } from "./contact-step";

function setup(props: Partial<React.ComponentProps<typeof ContactStep>> = {}) {
  const onSubmit = vi.fn();
  const user = userEvent.setup();
  render(
    <>
      <ContactStep formId="contact" onSubmit={onSubmit} {...props} />
      {/* In the app the Continue button lives in the footer, outside the form. */}
      <button type="submit" form="contact">
        Continue
      </button>
    </>,
  );
  return { user, onSubmit };
}

describe("ContactStep", () => {
  it("labels every field so patients and screen readers know what to enter", () => {
    setup();

    expect(screen.getByLabelText("Full Name")).toHaveAttribute("autocomplete", "name");
    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("Phone")).toHaveAttribute("type", "tel");
    expect(screen.getByLabelText("Visit reason")).toBeInTheDocument();
  });

  it("stays quiet while the patient is still filling the form", () => {
    setup();

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows an error when the patient leaves a required field empty, and clears it once fixed", async () => {
    const { user } = setup();

    await user.click(screen.getByLabelText("Full Name"));
    await user.tab();
    expect(await screen.findByText("Enter your full name")).toBeInTheDocument();
    expect(screen.getByLabelText("Full Name")).toHaveAttribute("aria-invalid", "true");

    await user.type(screen.getByLabelText("Full Name"), "Jane");
    expect(screen.queryByText("Enter your full name")).not.toBeInTheDocument();
  });

  it("on Continue with missing details, lists what is wrong and moves focus to the first problem", async () => {
    const { user, onSubmit } = setup();

    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(await screen.findByText("Enter your full name")).toBeInTheDocument();
    expect(screen.getByText("Enter your email address")).toBeInTheDocument();
    expect(screen.getByText("Enter a 10-digit US phone number")).toBeInTheDocument();
    expect(screen.getByLabelText("Full Name")).toHaveFocus();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("hands the cleaned-up details to the next step", async () => {
    const { user, onSubmit } = setup();

    await user.type(screen.getByLabelText("Full Name"), "Jane Doe");
    await user.type(screen.getByLabelText("Email"), "jane@example.com");
    await user.type(screen.getByLabelText("Phone"), "(619) 555-0123");
    await user.type(screen.getByLabelText("Visit reason"), "Botox follow-up");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(onSubmit).toHaveBeenCalledWith({
      fullName: "Jane Doe",
      email: "jane@example.com",
      phone: "+16195550123",
      visitReason: "Botox follow-up",
    });
  });

  it("keeps what the patient typed when they come back to this step", () => {
    setup({
      defaultValues: { fullName: "Jane Doe", email: "jane@example.com", phone: "(619) 555-0123", visitReason: "" },
    });

    expect(screen.getByLabelText("Full Name")).toHaveValue("Jane Doe");
    expect(screen.getByLabelText("Phone")).toHaveValue("(619) 555-0123");
  });
});
