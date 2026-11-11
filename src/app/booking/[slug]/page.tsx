import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PracticeCard } from "@/components/practice-card";
import { getPractice, getPracticeSlugs } from "@/lib/practices";

export function generateStaticParams() {
  return getPracticeSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata(
  props: PageProps<"/booking/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const practice = await getPractice(slug);
  return { title: practice ? `Book with ${practice.name}` : "Practice not found" };
}

export default async function BookingPage(props: PageProps<"/booking/[slug]">) {
  const { slug } = await props.params;
  const practice = await getPractice(slug);
  if (!practice) notFound();

  return (
    <div className="flex flex-1 flex-col">
      {/* Stacked below 1024px (phones, portrait tablets); two columns above. */}
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-4 md:px-8 md:py-8 lg:max-w-5xl">
        <h1 className="mb-4 text-center text-base font-bold lg:sr-only">Book appointment</h1>

        <div className="grid items-start gap-4 md:gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <PracticeCard practice={practice} />

          {/* Slice 2 replaces this with the client-side booking flow. */}
          <section className="rounded-lg border bg-card p-6 md:p-8">
            <h2 className="text-base font-bold">Enter your details below</h2>
          </section>
        </div>
      </main>

      <footer className="sticky bottom-0 border-t bg-card">
        <div className="mx-auto flex w-full max-w-2xl justify-end px-4 py-3 md:px-8 lg:max-w-5xl">
          <button
            type="button"
            className="h-11 w-full rounded-lg bg-primary px-8 text-sm font-semibold text-primary-foreground md:w-auto"
          >
            Continue
          </button>
        </div>
      </footer>
    </div>
  );
}
