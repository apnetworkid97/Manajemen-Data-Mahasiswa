"use client";

import {
  authenticateUser,
  ensureSeedUsers,
  getCurrentSession,
  setCurrentSession,
} from "@/lib/auth";
import Button from "@/components/ui/button/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type LoginErrors = {
  email?: string;
  password?: string;
};

// Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
export default function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    ensureSeedUsers();
    const currentSession = getCurrentSession();
    // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
    if (currentSession) {
      router.replace("/");
    }
  }, [router]);

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  function validateForm() {
    const nextErrors: LoginErrors = {};

    if (!emailRegex.test(email)) {
      nextErrors.email = "Format email tidak valid.";
    }

    // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
    if (password.length < 6) {
      nextErrors.password = "Password minimal 6 karakter.";
    }

    return nextErrors;
  }

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    await new Promise((resolve) => {
      window.setTimeout(resolve, 600);
    });

    const authenticatedUser = authenticateUser(email, password);

    // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
    if (!authenticatedUser) {
      setErrors({
        password: "Email atau password salah.",
      });
      setLoading(false);
      return;
    }

    setCurrentSession(authenticatedUser);
    router.replace("/");
  }

  return (
    <div className="flex w-full flex-1 flex-col lg:w-1/2">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] sm:p-8">
          <div className="mb-6">
            <h1 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Login Manajemen Data Mahasiswa
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Masukkan email dan password untuk masuk ke dashboard.
            </p>
          </div>

          <div className="mb-5 rounded-xl border border-blue-light-200 bg-blue-light-50 p-4 text-sm text-blue-light-700">
            <p className="font-medium">Akun demo</p>
            <p>Email: admin@kampus.ac.id</p>
            <p>Password: admin123</p>
            <p className="mt-2">Role lain tersedia: operator dan viewer.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setErrors((previous) => ({
                    ...previous,
                    email: "",
                  }));
                }}
                placeholder="admin@kampus.ac.id"
                className={`h-11 w-full rounded-xl border bg-white px-4 text-sm text-gray-800 outline-none transition dark:bg-gray-900 dark:text-white/90 ${
                  errors.email
                    ? "border-error-500 focus:border-error-500"
                    : "border-gray-300 focus:border-brand-500 dark:border-gray-700"
                }`}
              />
              {errors.email ? (
                <p className="mt-2 text-xs text-error-600">{errors.email}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setErrors((previous) => ({
                      ...previous,
                      password: "",
                    }));
                  }}
                  placeholder="Masukkan password"
                  className={`h-11 w-full rounded-xl border bg-white px-4 pr-20 text-sm text-gray-800 outline-none transition dark:bg-gray-900 dark:text-white/90 ${
                    errors.password
                      ? "border-error-500 focus:border-error-500"
                      : "border-gray-300 focus:border-brand-500 dark:border-gray-700"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-brand-600"
                >
                  {showPassword ? "Sembunyikan" : "Lihat"}
                </button>
              </div>
              {errors.password ? (
                <p className="mt-2 text-xs text-error-600">{errors.password}</p>
              ) : null}
            </div>

            <Button className="w-full" size="sm" disabled={loading}>
              {loading ? "Memeriksa..." : "Login"}
            </Button>
          </form>

          <p className="mt-3 text-right text-sm">
            <Link href="/reset-password" className="text-brand-600 hover:text-brand-700">
              Lupa password?
            </Link>
          </p>

          <p className="mt-5 text-center text-sm text-gray-600 dark:text-gray-400">
            Belum punya akun?{" "}
            <Link href="/signup" className="font-medium text-brand-600 hover:text-brand-700">
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
