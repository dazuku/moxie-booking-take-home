import { cloneElement, type ReactElement } from "react";
import type { FieldError as RHFFieldError } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";

type ControlProps = { id?: string; "aria-invalid"?: boolean; "aria-describedby"?: string };

/**
 * Label + control + error, wired for assistive tech: the label targets the
 * control, and an invalid control points at its error message.
 * `hideLabel` keeps the label for screen readers when the design groups
 * several inputs under one visible heading (the card fields).
 */
export function FormField({
  id,
  label,
  hideLabel = false,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  hideLabel?: boolean;
  error?: RHFFieldError;
  className?: string;
  children: ReactElement<ControlProps>;
}) {
  const errorId = `${id}-error`;
  return (
    <Field data-invalid={!!error} className={className ?? "gap-1.5"}>
      <FieldLabel htmlFor={id} className={hideLabel ? "sr-only" : undefined}>
        {label}
      </FieldLabel>
      {cloneElement(children, {
        id,
        "aria-invalid": !!error,
        "aria-describedby": error ? errorId : undefined,
      })}
      <FieldError id={errorId} errors={[error]} />
    </Field>
  );
}
