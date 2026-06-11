import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manajemen Data Mahasiswa",
  description: "Manajemen Data Mahasiswa by Aditya Agus Prakoso",
};

// Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
export default function SignIn() {
  return <SignInForm />;
}
