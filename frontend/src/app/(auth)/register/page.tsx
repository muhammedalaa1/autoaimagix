import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Sign up" };

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create an account"
      description="Start keeping your notes in one secure place."
      footer={{ text: "Already have an account?", linkText: "Log in", href: "/login" }}
    >
      <RegisterForm />
    </AuthCard>
  );
}
