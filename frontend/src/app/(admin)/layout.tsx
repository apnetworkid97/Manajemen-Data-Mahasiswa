"use client";

import { ensureSeedUsers, getCurrentSession } from "@/lib/auth";
import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

// Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    ensureSeedUsers();
    const currentSession = getCurrentSession();

    // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
    if (!currentSession) {
      router.replace("/signin");
      return;
    }

    setIsCheckingAuth(false);
  }, [router]);

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-4 text-sm text-gray-600 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-300">
          Memeriksa status login...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen xl:flex">
      {/* Sidebar and Backdrop */}
      <AppSidebar />
      <Backdrop />
      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all  duration-300 ease-in-out ${mainContentMargin}`}
      >
        {/* Header */}
        <AppHeader />
        {/* Page Content */}
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">{children}</div>
      </div>
    </div>
  );
}
