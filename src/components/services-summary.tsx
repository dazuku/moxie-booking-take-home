import { formatDuration, formatPrice } from "@/lib/format";
import type { Service } from "@/lib/practices";

// Server Component: the services the patient picked in the earlier steps of
// the real flow, so they always know what they are booking and what it costs.
export function ServicesSummary({ services }: { services: Service[] }) {
  const totalCents = services.reduce((sum, service) => sum + service.priceCents, 0);

  return (
    <section aria-labelledby="services-heading" className="rounded-lg border bg-card p-6 text-sm">
      <h2 id="services-heading" className="mb-4 font-semibold text-muted-foreground">
        Services
      </h2>

      <ul className="flex flex-col gap-3">
        {services.map((service) => (
          <li key={service.id}>
            <p className="font-bold">{service.name}</p>
            <p className="mt-0.5 text-muted-foreground">
              {formatDuration(service.durationMinutes)} <span aria-hidden>•</span>{" "}
              {formatPrice(service.priceCents)}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-4 border-t pt-4">
        <p className="flex justify-between font-bold">
          <span>Total</span>
          <span>{formatPrice(totalCents)}</span>
        </p>
        <p className="mt-1 text-muted-foreground">Nothing is charged today.</p>
      </div>
    </section>
  );
}
