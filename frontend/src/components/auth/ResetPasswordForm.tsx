"use client";

import {
  ensureSeedUsers,
  isRegisteredEmail,
  resetPasswordByEmail,
} from "@/lib/auth";
import { getOtpLimitMessage, recordOtpSend } from "@/lib/otp-rate-limit";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const otpRegex = /^\d{6}$/;
const swalButtonColor = "#465fff";

type ResetErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export default function ResetPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [errors, setErrors] = useState<ResetErrors>({});
  const [loading, setLoading] = useState(false);
  const [loadingSendOtp, setLoadingSendOtp] = useState(false);
  const [loadingVerifyOtp, setLoadingVerifyOtp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    ensureSeedUsers();
  }, []);

  // Memastikan format data reset valid sebelum request dikirim ke backend.
  function validateForm(): ResetErrors {
    const normalizedEmail = normalizeEmail(email);
    const nextErrors: ResetErrors = {};

    if (!emailRegex.test(normalizedEmail)) {
      nextErrors.email = "Format email tidak valid.";
    }

    if (password.length < 6) {
      nextErrors.password = "Password baru minimal 6 karakter.";
    }

    if (confirmPassword !== password) {
      nextErrors.confirmPassword = "Konfirmasi password tidak sama.";
    }

    if (!otpVerified) {
      nextErrors.email = "Verifikasi OTP wajib dilakukan terlebih dahulu.";
    }

    return nextErrors;
  }

  // Mengirim OTP reset password ke email user yang sudah terdaftar.
  async function handleSendOtp() {
    const normalizedEmail = normalizeEmail(email);
    if (!emailRegex.test(normalizedEmail)) {
      setErrors((previous) => ({
        ...previous,
        email: "Isi email valid dulu sebelum kirim OTP.",
      }));
      return;
    }

    if (!isRegisteredEmail(normalizedEmail)) {
      setErrors((previous) => ({
        ...previous,
        email: "Email belum terdaftar di sistem.",
      }));
      void showErrorAlert("Email tidak ditemukan", "Gunakan email yang sudah terdaftar.");
      return;
    }

    const otpLimitMessage = getOtpLimitMessage(normalizedEmail);
    if (otpLimitMessage) {
      void showErrorAlert("OTP belum bisa dikirim", otpLimitMessage);
      return;
    }

    setLoadingSendOtp(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal mengirim OTP.");
      }

      setOtpSent(true);
      setOtpVerified(false);
      setOtp("");
      recordOtpSend(normalizedEmail);
      await showSuccessAlert("OTP terkirim", "Silakan cek email Anda.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal mengirim OTP.";
      void showErrorAlert("OTP gagal dikirim", message);
    } finally {
      setLoadingSendOtp(false);
    }
  }

  // Memverifikasi OTP 6 digit agar user boleh lanjut reset password.
  async function handleVerifyOtp() {
    if (!otpSent) {
      return;
    }

    if (!otpRegex.test(otp.trim())) {
      void showErrorAlert("OTP tidak valid", "OTP harus 6 digit angka.");
      return;
    }

    setLoadingVerifyOtp(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizeEmail(email),
          otp: otp.trim(),
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "OTP salah.");
      }

      setOtpVerified(true);
      await showSuccessAlert("OTP valid", "Silakan lanjut reset password.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Verifikasi OTP gagal.";
      setOtpVerified(false);
      void showErrorAlert("Verifikasi gagal", message);
    } finally {
      setLoadingVerifyOtp(false);
    }
  }

  // Menjalankan reset password setelah OTP valid dan form lolos validasi.
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!isRegisteredEmail(normalizeEmail(email))) {
      setErrors((previous) => ({
        ...previous,
        email: "Email belum terdaftar di sistem.",
      }));
      void showErrorAlert("Email tidak ditemukan", "Gunakan email yang sudah terdaftar.");
      return;
    }

    setLoading(true);
    try {
      const consumeResponse = await fetch(`${API_BASE_URL}/api/auth/consume-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizeEmail(email),
        }),
      });
      const consumeResult = await consumeResponse.json();
      if (!consumeResponse.ok || !consumeResult.success) {
        throw new Error(consumeResult.message || "Verifikasi OTP belum valid.");
      }

      resetPasswordByEmail(email, password);
      await showSuccessAlert(
        "Password berhasil direset",
        "Silakan login dengan password baru."
      );
      router.replace("/signin");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal mereset password.";
      void showErrorAlert("Reset password gagal", message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full flex-1 flex-col lg:w-1/2">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] sm:p-8">
          <div className="mb-6">
            <h1 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Reset Password
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Masukkan email akun dan password baru Anda.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <FormField
              label="Email"
              type="email"
              value={email}
              placeholder="admin@kampus.ac.id"
              error={errors.email}
              onChange={(value) => {
                setEmail(value);
                setOtpSent(false);
                setOtpVerified(false);
                setErrors((previous) => ({ ...previous, email: "" }));
              }}
            />
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={loadingSendOtp}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/5"
            >
              {loadingSendOtp
                ? "Mengirim OTP..."
                : otpSent
                  ? "Kirim Ulang OTP"
                  : "Kirim OTP ke Email"}
            </button>

            <FormField
              label="Kode OTP"
              type="text"
              value={otp}
              placeholder="6 digit OTP"
              onChange={(value) => setOtp(value)}
            />
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={!otpSent || loadingVerifyOtp}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/5"
            >
              {loadingVerifyOtp ? "Memverifikasi..." : "Verifikasi OTP"}
            </button>

            <FormField
              label="Password Baru"
              type={showPassword ? "text" : "password"}
              value={password}
              placeholder="Minimal 6 karakter"
              error={errors.password}
              onChange={(value) => {
                setPassword(value);
                setErrors((previous) => ({ ...previous, password: "" }));
              }}
              rightAction={
                <button
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200"
                >
                  {showPassword ? "Sembunyikan" : "Lihat"}
                </button>
              }
            />

            <FormField
              label="Konfirmasi Password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              placeholder="Ulangi password baru"
              error={errors.confirmPassword}
              onChange={(value) => {
                setConfirmPassword(value);
                setErrors((previous) => ({ ...previous, confirmPassword: "" }));
              }}
              rightAction={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((previous) => !previous)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200"
                >
                  {showConfirmPassword ? "Sembunyikan" : "Lihat"}
                </button>
              }
            />

            <button
              type="submit"
              disabled={loading || !otpVerified}
              className="w-full rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Memproses..." : "Reset Password"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-600 dark:text-gray-400">
            Ingat password Anda?{" "}
            <Link href="/signin" className="font-medium text-brand-600 hover:text-brand-700">
              Kembali ke login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Menormalkan email supaya validasi dan pencarian user lebih konsisten.
function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

// Menampilkan alert sukses dengan style yang sama di seluruh halaman reset password.
function showSuccessAlert(title: string, text: string) {
  return Swal.fire({
    icon: "success",
    title,
    text,
    confirmButtonColor: swalButtonColor,
  });
}

// Menampilkan alert error agar pesan gagal selalu konsisten.
function showErrorAlert(title: string, text: string) {
  return Swal.fire({
    icon: "error",
    title,
    text,
    confirmButtonColor: swalButtonColor,
  });
}

// Komponen input reusable agar field form punya tampilan dan error style yang seragam.
function FormField({
  label,
  value,
  onChange,
  placeholder,
  error,
  type = "text",
  rightAction,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
  type?: React.HTMLInputTypeAttribute;
  rightAction?: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="flex items-start gap-2">
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`h-11 w-full rounded-xl border bg-white px-4 text-sm text-gray-800 outline-none transition dark:bg-gray-900 dark:text-white/90 ${
            error
              ? "border-error-500 focus:border-error-500"
              : "border-gray-300 focus:border-brand-500 dark:border-gray-700"
          }`}
        />
        {rightAction}
      </div>
      {error ? <p className="mt-2 text-xs text-error-600">{error}</p> : null}
    </div>
  );
}
