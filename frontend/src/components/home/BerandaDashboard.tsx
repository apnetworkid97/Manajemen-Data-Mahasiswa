"use client";

import { getCurrentSession, getStoredUsers } from "@/lib/auth";
import type { UserRole } from "@/types/auth";
import type { Student } from "@/types/student";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function BerandaDashboard() {
  const [currentRole, setCurrentRole] = useState<UserRole>("viewer");
  const [userName, setUserName] = useState("User");
  const [totalUsers, setTotalUsers] = useState(0);
  // const [totalStudents, setTotalStudents] = useState(0);
  // const [totalActiveStudents, setTotalActiveStudents] = useState(0);
  // const [totalInactiveStudents, setTotalInactiveStudents] = useState(0);

  useEffect(() => {
    const session = getCurrentSession();

    if (session) {
      setCurrentRole(session.role);
      setUserName(session.nama);
    }

    const users = getStoredUsers();
    setTotalUsers(users.length);
  }, []);

  // useEffect(() => {
  //   // Mengambil ringkasan jumlah mahasiswa untuk kartu dashboard beranda.
  //   async function loadStudentCount() {
  //     try {
  //       const response = await fetch(`${API_BASE_URL}/api/students`);
  //       const result = await response.json();

  //       if (response.ok) {
  //         const studentList: Student[] = result.data ?? [];

  //         setTotalStudents(result.meta?.totalSemuaData ?? result.data?.length ?? 0);
  //         setTotalActiveStudents(
  //           studentList.filter((student) => student.statusAktif === "Aktif").length
  //         );
  //         setTotalInactiveStudents(
  //           studentList.filter((student) => student.statusAktif === "Tidak Aktif").length
  //         );
  //       }
  //     } catch {
  //       setTotalStudents(0);
  //       setTotalActiveStudents(0);
  //       setTotalInactiveStudents(0);
  //     }
  //   }

  //   void loadStudentCount();
  // }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          Selamat Datang, {userName}
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Role aktif Anda: <span className="font-semibold capitalize">{currentRole}</span>.
        </p>
      </div>

      {/* <div className="grid gap-4 md:grid-cols-4">
        <Card title="Total Mahasiswa" value={String(totalStudents)} />
        <Card title="Mahasiswa Aktif" value={String(totalActiveStudents)} />
        <Card title="Mahasiswa Tidak Aktif" value={String(totalInactiveStudents)} />
        <Card title="Total User" value={String(totalUsers)} />
        <Card title="Role Aktif" value={currentRole.toUpperCase()} />
      </div> */}

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Akses Cepat
        </h3>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/data-mahasiswa"
            className="rounded-xl bg-brand-500 px-5 py-3 text-sm font-medium text-white hover:bg-brand-600"
          >
            Buka Data Mahasiswa
          </Link>
          {currentRole === "admin" ? (
            <Link
              href="/user-management"
              className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/5"
            >
              Buka Role Management
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4 dark:border-gray-800 dark:bg-white/[0.03]">
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
        {value}
      </p>
    </div>
  );
}
