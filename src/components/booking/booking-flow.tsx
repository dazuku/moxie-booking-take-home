"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { BookingMain, placement } from "@/components/booking-layout";
import { Button } from "@/components/ui/button";
import { type Booking, buildBooking } from "@/lib/booking";
import type { ContactDetails } from "@/lib/booking-schema";
import type { PaymentDetails } from "@/lib/payment-schema";
import type { Practice } from "@/lib/practices";
import { Confirmation } from "./confirmation";
import { ContactStep } from "./contact-step";
import { PaymentStep } from "./payment-step";

type Step = "contact" | "payment" | "confirmation";

const CONTACT_FORM_ID = "contact-form";

type BookingFlowProps = {
  practice: Practice;
  /** Rendered on the server and passed in, so they ship no client JS. */
  practiceCard: ReactNode;
  servicesSummary: ReactNode;
};

export function BookingFlow({ practice, practiceCard, servicesSummary }: BookingFlowProps) {
  const [step, setStep] = useState<Step>("contact");
  const [contact, setContact] = useState<ContactDetails>();
  const [booking, setBooking] = useState<Booking>();
  const stepRef = useStepFocus(step);

  function handleContact(details: ContactDetails) {
    setContact(details);
    setStep("payment");
  }

  function handlePayment(payment: PaymentDetails) {
    if (!contact) return; // Payment is only reachable after a valid contact step.
    const submitted = buildBooking({ practice, contact, payment, bookedAt: new Date() });
    // The exercise has no API: the booking is printed instead of being sent.
    console.log("Booking submitted:", submitted);
    setBooking(submitted);
    setStep("confirmation");
  }

  if (step === "confirmation" && booking) {
    return (
      <BookingMain layout="single">
        <Confirmation ref={stepRef} email={booking.patient.email} />
        {practiceCard}
        {servicesSummary}
      </BookingMain>
    );
  }

  const practiceSlot = (
    <div key="practice" className={placement.practice}>
      {practiceCard}
    </div>
  );
  const servicesSlot = (
    <div key="services" className={placement.services}>
      {servicesSummary}
    </div>
  );
  const stepCard = (
    <section
      key="step"
      ref={stepRef}
      tabIndex={-1}
      className={`rounded-lg border bg-card p-6 outline-none md:p-8 ${placement.step}`}
    >
      {/*
        Both forms stay mounted and the inactive one is hidden, so going Back
        to fix an email never wipes the card the patient already typed.
      */}
      <div hidden={step !== "contact"}>
        <ContactStep formId={CONTACT_FORM_ID} onSubmit={handleContact} />
      </div>
      <div hidden={step !== "payment"}>
        <PaymentStep
          cancellationFeeCents={practice.cancellationFeeCents}
          onSubmit={handlePayment}
        />
      </div>
    </section>
  );

  return (
    <>
      <BookingMain>
        {/*
          Phones show these in DOM order (so tab and screen-reader order match):
          contact starts with who and what you are booking; payment goes
          straight to the card form, with the summary one scroll away.
          From 1024px the placement classes put them in two columns.
        */}
        {step === "contact"
          ? [practiceSlot, servicesSlot, stepCard]
          : [stepCard, servicesSlot, practiceSlot]}
      </BookingMain>

      <footer className="sticky bottom-0 border-t bg-card">
        <div className="mx-auto flex w-full max-w-2xl justify-end px-4 py-3 md:px-8 lg:max-w-5xl">
          {/*
            Distinct keys matter: if React reused one <button> for both, a
            click on Back would re-render it as Continue (type="submit")
            before the browser's default action ran, and submit the contact
            form straight back to payment.
          */}
          {step === "contact" ? (
            <Button
              key="continue"
              type="submit"
              form={CONTACT_FORM_ID}
              size="lg"
              className="w-full md:w-auto"
            >
              Continue
            </Button>
          ) : (
            <Button
              key="back"
              type="button"
              variant="outline"
              size="lg"
              className="w-full md:w-auto"
              onClick={() => setStep("contact")}
            >
              Back
            </Button>
          )}
        </div>
      </footer>
    </>
  );
}

/**
 * When the step changes, bring the new step into view and move focus to it.
 * On phones the form sits below the practice card, so without this the
 * patient would be left looking at the wrong part of the page, and screen
 * readers would not announce that anything changed.
 */
function useStepFocus(step: Step) {
  const ref = useRef<HTMLElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    ref.current?.focus({ preventScroll: true });
    ref.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [step]);

  return ref;
}
