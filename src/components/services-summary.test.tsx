import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Service } from "@/lib/practices";
import { ServicesSummary } from "./services-summary";

const services: Service[] = [
  { id: "botox", name: "Botox", durationMinutes: 45, priceCents: 20000 },
  { id: "filler", name: "Lip filler", durationMinutes: 30, priceCents: 45000 },
];

describe("ServicesSummary", () => {
  it("lists every service the patient picked, with its duration and price", () => {
    render(<ServicesSummary services={services} />);

    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("Botox");
    expect(items[0]).toHaveTextContent("45 mins");
    expect(items[0]).toHaveTextContent("$200");
    expect(items[1]).toHaveTextContent("Lip filler");
  });

  it("shows the total and that nothing is charged today", () => {
    render(<ServicesSummary services={services} />);

    expect(screen.getByText("$650")).toBeInTheDocument();
    expect(screen.getByText("Nothing is charged today.")).toBeInTheDocument();
  });
});
