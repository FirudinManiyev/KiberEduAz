import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/password-reset";

export const metadata: Metadata = {
  title: "Yeni parol",
  description: "KiberEduAz hesabın üçün yeni parol təyin et.",
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
