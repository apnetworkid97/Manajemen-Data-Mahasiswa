import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import StudentManager from "@/components/students/StudentManager";

import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Manajemen Data Mahasiswa",
  description:
    "Aplikasi CRUD data mahasiswa berbasis Next.js dan Node.js.",
};

// Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
export default function DataTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Manajemen Data Mahasiswa" />
      <StudentManager />
    </div>
  );
}
