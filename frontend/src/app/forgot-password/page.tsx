import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/password-reset";

export const metadata: Metadata = {
  title: "Parolu bərpa et",
  description: "KiberEduAz hesabının parolunu e-poçt linki ilə bərpa et.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
