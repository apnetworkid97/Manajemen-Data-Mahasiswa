import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manajemen Data Mahasiswa",
  description: "Manajemen Data Mahasiswa by Aditya Agus Prakoso",
  // other metadata
};

// Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
export default function SignUp() {
  return <SignUpForm />;
}
