import Link from "next/link";
import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthCardProps {
  title: string;
  description: string;
  footer: { text: string; linkText: string; href: string };
  children: ReactNode;
}

export function AuthCard({ title, description, footer, children }: AuthCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
      <CardFooter className="justify-center text-sm text-muted-foreground">
        {footer.text}&nbsp;
        <Link href={footer.href} className="font-medium text-foreground underline-offset-4 hover:underline">
          {footer.linkText}
        </Link>
      </CardFooter>
    </Card>
  );
}
