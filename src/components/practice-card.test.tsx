import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Practice } from "@/lib/practices";
import { PracticeCard } from "./practice-card";

const practice: Practice = {
  slug: "test-spa",
  name: "Test Spa",
  logoUrl: "/logo.svg",
  addressLines: ["1 Main St", "Austin, TX 78701"],
  email: "hello@testspa.com",
  phone: "+1 512 555 0100",
  cancellationFeeCents: 5000,
  selectedServices: [],
};

describe("PracticeCard", () => {
  it("shows the practice name and every address line", () => {
    render(<PracticeCard practice={practice} />);

    expect(screen.getByRole("heading", { name: "Test Spa" })).toBeInTheDocument();
    expect(screen.getByText("1 Main St")).toBeInTheDocument();
    expect(screen.getByText("Austin, TX 78701")).toBeInTheDocument();
  });

  it("lets patients email or call the practice in one tap", () => {
    render(<PracticeCard practice={practice} />);

    expect(screen.getByRole("link", { name: "hello@testspa.com" })).toHaveAttribute(
      "href",
      "mailto:hello@testspa.com",
    );
    expect(screen.getByRole("link", { name: "+1 512 555 0100" })).toHaveAttribute(
      "href",
      "tel:+15125550100",
    );
  });
});
