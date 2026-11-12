"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ChangeEvent, MouseEvent } from "react";
import { Controller, useForm, type UseFormRegisterReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { formatCardNumber, formatExpiry } from "@/lib/card";
import { formatPrice } from "@/lib/format";
import { type PaymentDetails, type PaymentFormValues, paymentSchema } from "@/lib/payment-schema";
import { FormField } from "./form-field";

const emptyPayment: PaymentFormValues = {
  cardNumber: "",
  expiry: "",
  cvv: "",
  zip: "",
  acceptPolicy: false,
};

type PaymentStepProps = {
  cancellationFeeCents: number;
  onSubmit: (details: PaymentDetails) => void;
};

export function PaymentStep({ cancellationFeeCents, onSubmit }: PaymentStepProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormValues, unknown, PaymentDetails>({
    resolver: zodResolver(paymentSchema),
    mode: "onTouched",
    defaultValues: emptyPayment,
  });

  return (
    <form noValidate onSubmit={handleSubmit((details) => onSubmit(details))}>
      <h2 className="text-base font-bold">Secure your appointment by card</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        A credit or debit card is required to book your appointment.
      </p>

      <FieldSet className="mt-6 gap-3">
        <FieldLegend variant="label" className="mb-0">
          Card information
        </FieldLegend>

        <FormField id="cardNumber" label="Card number" hideLabel error={errors.cardNumber}>
          <Input
            {...formatted(register("cardNumber"), formatCardNumber)}
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="1234 1234 1234 1234"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField id="expiry" label="Expiry date" hideLabel error={errors.expiry}>
            <Input
              {...formatted(register("expiry"), formatExpiry)}
              inputMode="numeric"
              autoComplete="cc-exp"
              placeholder="MM / YY"
            />
          </FormField>
          <FormField id="cvv" label="Security code" hideLabel error={errors.cvv}>
            <Input
              {...register("cvv")}
              inputMode="numeric"
              autoComplete="cc-csc"
              maxLength={4}
              placeholder="CVV"
            />
          </FormField>
        </div>
      </FieldSet>

      <FormField id="zip" label="Billing ZIP code" hideLabel error={errors.zip} className="mt-5 gap-1.5">
        <Input
          {...register("zip")}
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={10}
          placeholder="Billing zip code"
        />
      </FormField>

      <Controller
        control={control}
        name="acceptPolicy"
        render={({ field, fieldState }) => (
          <div className="mt-6">
            <div className="flex items-start gap-3">
              <Checkbox
                id="acceptPolicy"
                ref={field.ref}
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                onBlur={field.onBlur}
                onMouseDown={keepFocus}
                aria-invalid={!!fieldState.error}
                aria-describedby={fieldState.error ? "acceptPolicy-error" : undefined}
                className="mt-0.5"
              />
              <label htmlFor="acceptPolicy" className="text-sm leading-relaxed text-muted-foreground">
                We ask that you please reschedule or cancel at least 24 hours before the beginning of
                your appointment or you may be charged a cancellation fee of{" "}
                {formatPrice(cancellationFeeCents)}. In the event of emergency, contact us directly.
                Your card will be held in case of late cancellation and for future purchases. It
                will not be charged now.
              </label>
            </div>
            <FieldError id="acceptPolicy-error" errors={[fieldState.error]} className="mt-2" />
          </div>
        )}
      />

      <Separator className="my-6" />

      <Button type="submit" size="lg" className="w-full" onMouseDown={keepFocus}>
        Book appointment
      </Button>
      <p className="mt-4 text-xs text-muted-foreground">
        By creating this appointment, you acknowledge you will receive automated transactional
        messages from this merchant.
      </p>
    </form>
  );
}

/**
 * Errors appear when the patient leaves a field. If that happened on the
 * mouse-down of a click, the new error would push this control down before
 * mouse-up and the click would be lost. Keeping focus where it is until the
 * click lands avoids that; the submit then validates every field anyway.
 * Keyboard and screen-reader use are unaffected (no mouse-down).
 */
function keepFocus(event: MouseEvent<HTMLElement>) {
  event.preventDefault();
}

/**
 * Reformat the value as the patient types ("4242 4242 …", "12 / 27") before
 * react-hook-form stores it. The schema strips the formatting again.
 */
function formatted(field: UseFormRegisterReturn, format: (value: string) => string) {
  return {
    ...field,
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      event.target.value = format(event.target.value);
      return field.onChange(event);
    },
  };
}
