"use client";

import type { ComponentProps } from "react";
import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  description?: string;
  multiline?: boolean;
  inputProps?: Omit<ComponentProps<"input">, "name"> & Omit<ComponentProps<"textarea">, "name">;
}

/** Label + input + error message wired to react-hook-form, with accessible aria attributes. */
export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  multiline,
  inputProps,
}: FormFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const id = `field-${name}`;
        const shared = {
          ...inputProps,
          ...field,
          id,
          "aria-invalid": fieldState.invalid,
          "aria-describedby": fieldState.error ? `${id}-error` : undefined,
        };
        return (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            {multiline ? <Textarea {...shared} /> : <Input {...shared} />}
            {description && !fieldState.error && <FieldDescription>{description}</FieldDescription>}
            <FieldError id={`${id}-error`} errors={[fieldState.error]} />
          </Field>
        );
      }}
    />
  );
}
