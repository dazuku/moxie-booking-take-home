export type Service = {
  id: string;
  name: string;
  durationMinutes: number;
  priceCents: number;
};

export type Practice = {
  slug: string;
  name: string;
  logoUrl: string;
  addressLines: string[];
  email: string;
  phone: string;
  cancellationFeeCents: number;
  /** Services the patient picked in the earlier steps of the real flow. */
  selectedServices: Service[];
};

// Stands in for the API. Values come from the Figma frames.
const practices: Practice[] = [
  {
    slug: "gold-spa",
    name: "Gold Spa",
    logoUrl: "/gold-spa-logo.svg",
    addressLines: ["2525 Camino del Rio S", "Suite 315 Room 8", "San Diego, CA 92108"],
    email: "goldspa@gmail.com",
    phone: "+11 123 4567 222",
    cancellationFeeCents: 5000,
    selectedServices: [
      { id: "botox-1", name: "Botox", durationMinutes: 45, priceCents: 20000 },
      { id: "botox-2", name: "Botox", durationMinutes: 45, priceCents: 20000 },
    ],
  },
];

export function getPracticeSlugs(): string[] {
  return practices.map((practice) => practice.slug);
}

export async function getPractice(slug: string): Promise<Practice | undefined> {
  return practices.find((practice) => practice.slug === slug);
}
