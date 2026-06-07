import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BerandaDashboard from "@/components/home/BerandaDashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Beranda",
  description: "Halaman beranda aplikasi manajemen data mahasiswa.",
};

// Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
export default function HomePage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Beranda" />
      <BerandaDashboard />
    </div>
  );
}
