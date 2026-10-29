"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { FormField } from "@/components/forms/form-field";
import { FormRootError } from "@/components/forms/form-root-error";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { authApi } from "@/lib/api/endpoints";
import { applyServerErrors } from "@/lib/forms";
import { safeRedirectPath } from "@/lib/safe-redirect";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const login = useMutation({
    mutationFn: authApi.login,
    onSuccess: () => {
      queryClient.clear(); // never show data cached for a previous account
      router.replace(safeRedirectPath(searchParams.get("next")));
      router.refresh();
    },
    onError: (error) => applyServerErrors(error, form.setError, ["email", "password"]),
  });

  return (
    <form noValidate onSubmit={form.handleSubmit((values) => login.mutate(values))}>
      <FieldGroup>
        <FormRootError message={form.formState.errors.root?.message} />
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
          inputProps={{ type: "password", autoComplete: "current-password" }}
        />
        <Button type="submit" size="lg" className="w-full" disabled={login.isPending}>
          {login.isPending && <Loader2 className="animate-spin" />}
          Log in
        </Button>
      </FieldGroup>
    </form>
  );
}
