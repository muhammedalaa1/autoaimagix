"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormField } from "@/components/forms/form-field";
import { FormRootError } from "@/components/forms/form-root-error";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { authApi } from "@/lib/api/endpoints";
import { DEFAULT_AUTHED_ROUTE } from "@/lib/constants";
import { applyServerErrors } from "@/lib/forms";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";

export function RegisterForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const register = useMutation({
    mutationFn: authApi.register,
    onSuccess: ({ data }) => {
      queryClient.clear();
      toast.success(`Welcome, ${data.name}!`);
      router.replace(DEFAULT_AUTHED_ROUTE);
      router.refresh();
    },
    onError: (error) => applyServerErrors(error, form.setError, ["name", "email", "password"]),
  });

  return (
    <form noValidate onSubmit={form.handleSubmit((values) => register.mutate(values))}>
      <FieldGroup>
        <FormRootError message={form.formState.errors.root?.message} />
        <FormField
          control={form.control}
          name="name"
          label="Name"
          inputProps={{ autoComplete: "name", placeholder: "Jane Doe" }}
        />
        <FormField
          control={form.control}
          name="email"
          label="Email"
          inputProps={{ type: "email", autoComplete: "email", placeholder: "you@example.com" }}
        />
        <FormField
          control={form.control}
          name="password"
          label="Password"
          description="8+ characters with upper and lowercase letters and a number."
          inputProps={{ type: "password", autoComplete: "new-password" }}
        />
        <Button type="submit" size="lg" className="w-full" disabled={register.isPending}>
          {register.isPending && <Loader2 className="animate-spin" />}
          Create account
        </Button>
      </FieldGroup>
    </form>
  );
}
