import Image from "next/image";
import type { Practice } from "@/lib/practices";

// Server Component: static practice details, no client JavaScript.
export function PracticeCard({ practice }: { practice: Practice }) {
  return (
    <section
      aria-label={`About ${practice.name}`}
      className="rounded-lg border bg-card p-6 text-sm"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="flex size-16 items-center justify-center rounded-full border bg-card">
          <Image src={practice.logoUrl} alt="" width={48} height={33} />
        </div>
        <h2 className="text-base font-bold">{practice.name}</h2>
      </div>

      <dl className="mt-6 grid grid-cols-[5rem_1fr] gap-x-4 gap-y-3">
        <dt className="text-muted-foreground">Address</dt>
        <dd>
          <address className="not-italic">
            {practice.addressLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>
        </dd>

        <dt className="text-muted-foreground">Email</dt>
        <dd>
          <a href={`mailto:${practice.email}`} className="text-primary hover:underline">
            {practice.email}
          </a>
        </dd>

        <dt className="text-muted-foreground">Phone</dt>
        <dd>
          <a
            href={`tel:${practice.phone.replace(/\s/g, "")}`}
            className="text-primary hover:underline"
          >
            {practice.phone}
          </a>
        </dd>
      </dl>
    </section>
  );
}
