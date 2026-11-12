import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BookingMain, BookingSkeleton } from "@/components/booking-layout";
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

type Params = PageProps<"/booking/[slug]">["params"];

// The page never waits: it renders a skeleton straight away, and only the
// part that needs the practice suspends on `params`.
export default function BookingPage(props: PageProps<"/booking/[slug]">) {
  return (
    <div className="flex flex-1 flex-col">
      <Suspense fallback={<BookingSkeleton />}>
        <Booking params={props.params} />
      </Suspense>
    </div>
  );
}

async function Booking({ params }: { params: Params }) {
  const { slug } = await params;
  const practice = await getPractice(slug);
  if (!practice) notFound();

  return (
    <>
      <BookingMain>
        <PracticeCard practice={practice} />

        {/* Slice 2 replaces this with the client-side booking flow. */}
        <section className="rounded-lg border bg-card p-6 md:p-8">
          <h2 className="text-base font-bold">Enter your details below</h2>
        </section>
      </BookingMain>

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
    </>
  );
}
