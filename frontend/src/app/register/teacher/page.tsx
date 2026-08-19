import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Müəllim qeydiyyatı",
  description: "KiberEduAz-da müəllim hesabı yarat. Admin təsdiqindən sonra panel açılır.",
};

export default function TeacherRegisterPage() {
  return (
    <Suspense>
      <AuthForm mode="register-teacher" />
    </Suspense>
  );
}
