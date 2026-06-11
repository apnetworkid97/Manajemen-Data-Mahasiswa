import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | Manajemen Data Mahasiswa",
  description: "Halaman reset password user Manajemen Data Mahasiswa",
};

// Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
