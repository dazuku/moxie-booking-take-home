"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { BookingMain, placement } from "@/components/booking-layout";
import { Button } from "@/components/ui/button";
import { type ContactDetails, type ContactFormValues, formatUsPhone } from "@/lib/booking-schema";
import { ContactStep } from "./contact-step";

type Step = "contact" | "payment";

const CONTACT_FORM_ID = "contact-form";

type BookingFlowProps = {
  /** Rendered on the server and passed in, so they ship no client JS. */
  practiceCard: ReactNode;
  servicesSummary: ReactNode;
};

export function BookingFlow({ practiceCard, servicesSummary }: BookingFlowProps) {
  const [step, setStep] = useState<Step>("contact");
  const [contact, setContact] = useState<ContactDetails>();
  const stepRef = useStepFocus(step);

  function handleContact(details: ContactDetails) {
    setContact(details);
    setStep("payment");
  }

  const practice = (
    <div key="practice" className={placement.practice}>
      {practiceCard}
    </div>
  );
  const services = (
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
      {step === "contact" && (
        <ContactStep
          formId={CONTACT_FORM_ID}
          onSubmit={handleContact}
          defaultValues={contact && toFormValues(contact)}
        />
      )}

      {/* Slice 3 replaces this with the payment form. */}
      {step === "payment" && (
        <h2 className="text-base font-bold">Secure your appointment by card</h2>
      )}
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
        {step === "contact" ? [practice, services, stepCard] : [stepCard, services, practice]}
      </BookingMain>

      <footer className="sticky bottom-0 border-t bg-card">
        <div className="mx-auto flex w-full max-w-2xl justify-end px-4 py-3 md:px-8 lg:max-w-5xl">
          {step === "contact" && (
            <Button type="submit" form={CONTACT_FORM_ID} size="lg" className="w-full md:w-auto">
              Continue
            </Button>
          )}
          {step === "payment" && (
            <Button
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

// When the patient goes back, show their phone the way they would write it,
// not the normalised +1 form we store.
function toFormValues(details: ContactDetails): ContactFormValues {
  return { ...details, phone: formatUsPhone(details.phone) };
}
