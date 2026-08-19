import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Qeydiyyat",
  description: "KiberEduAz-da hesab yarat və kibertəhlükəsizlik yoluna başla.",
};

export default function RegisterPage() {
  return (
    <Suspense>
      <AuthForm mode="register" />
    </Suspense>
  );
}
