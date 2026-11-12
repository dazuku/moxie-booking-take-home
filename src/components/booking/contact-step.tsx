"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactElement } from "react";
import { cloneElement } from "react";
import { type FieldError as RHFFieldError, useForm } from "react-hook-form";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { type ContactDetails, type ContactFormValues, contactSchema } from "@/lib/booking-schema";

const emptyContact: ContactFormValues = { fullName: "", email: "", phone: "", visitReason: "" };

type ContactStepProps = {
  /** The Continue button sits in the page footer and submits this form via its id. */
  formId: string;
  onSubmit: (details: ContactDetails) => void;
  /** What the patient typed before, when they come back to this step. */
  defaultValues?: ContactFormValues;
};

export function ContactStep({ formId, onSubmit, defaultValues = emptyContact }: ContactStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormValues, unknown, ContactDetails>({
    resolver: zodResolver(contactSchema),
    // Validate a field once the patient leaves it, then live while they fix it.
    mode: "onTouched",
    defaultValues,
  });

  return (
    <form id={formId} noValidate onSubmit={handleSubmit((details) => onSubmit(details))}>
      <h2 className="mb-6 text-base font-bold">Enter your details below</h2>

      <FieldGroup className="gap-5">
        <FormField id="fullName" label="Full Name" error={errors.fullName}>
          <Input {...register("fullName")} autoComplete="name" placeholder="Jane Doe" />
        </FormField>

        <FormField id="email" label="Email" error={errors.email}>
          <Input
            {...register("email")}
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
          />
        </FormField>

        <FormField id="phone" label="Phone" error={errors.phone}>
          <Input {...register("phone")} type="tel" autoComplete="tel" placeholder="(619) 555-0123" />
        </FormField>

        <FormField id="visitReason" label="Visit reason" error={errors.visitReason}>
          <Textarea
            {...register("visitReason")}
            placeholder="Anything the practice should know before your visit"
          />
        </FormField>
      </FieldGroup>
    </form>
  );
}

/**
 * Label + control + error, wired for assistive tech: the label targets the
 * control, and an invalid control points at its error message.
 */
function FormField({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: RHFFieldError;
  children: ReactElement<{ id?: string; "aria-invalid"?: boolean; "aria-describedby"?: string }>;
}) {
  const errorId = `${id}-error`;
  return (
    <Field data-invalid={!!error} className="gap-1.5">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {cloneElement(children, {
        id,
        "aria-invalid": !!error,
        "aria-describedby": error ? errorId : undefined,
      })}
      <FieldError id={errorId} errors={[error]} />
    </Field>
  );
}
