import Image from "next/image";
import type { Ref } from "react";

export function Confirmation({ email, ref }: { email: string; ref?: Ref<HTMLElement> }) {
  return (
    <section
      ref={ref}
      tabIndex={-1}
      aria-labelledby="confirmation-heading"
      className="flex flex-col items-center rounded-lg border bg-card p-6 text-center outline-none md:p-8"
    >
      <Image
        src="/success-icon.svg"
        alt=""
        width={200}
        height={200}
        priority
        className="size-28 md:size-32"
      />
      <h2 id="confirmation-heading" className="mt-6 text-base font-bold">
        Your appointment has been booked!
      </h2>
      <p className="mt-3 text-sm">
        A confirmation has been sent to <strong className="font-semibold">{email}</strong>.
      </p>
    </section>
  );
}
