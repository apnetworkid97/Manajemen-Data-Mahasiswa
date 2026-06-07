import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import UserManager from "@/components/users/UserManager";
import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Role Management",
  description: "Manajemen akun user dengan role RBAC.",
};

// Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
export default function UserManagementPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Role Management" />
      <UserManager />
    </div>
  );
}
