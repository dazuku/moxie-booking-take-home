import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BookingSkeleton } from "@/components/booking-layout";
import { BookingFlow } from "@/components/booking/booking-flow";
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

  return <BookingFlow practiceCard={<PracticeCard practice={practice} />} />;
}
