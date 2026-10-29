import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { AuthCard } from "@/components/auth/auth-card";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      description="Log in to your account to continue."
      footer={{ text: "Don't have an account?", linkText: "Sign up", href: "/register" }}
    >
      {/* LoginForm reads ?next= from the URL, which is request-time data. */}
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
