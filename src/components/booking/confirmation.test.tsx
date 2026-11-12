import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Confirmation } from "./confirmation";

describe("Confirmation", () => {
  it("tells the patient the booking worked and where the confirmation went", () => {
    render(<Confirmation email="jane@example.com" />);

    expect(screen.getByRole("heading", { name: "Your appointment has been booked!" })).toBeInTheDocument();
    // Showing the address, not "your email", makes a typo obvious straight away.
    expect(screen.getByText(/A confirmation has been sent to/)).toHaveTextContent(
      "A confirmation has been sent to jane@example.com.",
    );
  });
});
