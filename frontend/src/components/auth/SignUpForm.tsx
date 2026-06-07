"use client";

import Button from "@/components/ui/button/Button";
import { registerUser } from "@/lib/auth";
import { getOtpLimitMessage, recordOtpSend } from "@/lib/otp-rate-limit";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Swal from "sweetalert2";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SignUpErrors = {
  nama?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  otp?: string;
};

// Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
export default function SignUpForm() {
  const router = useRouter();
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [errors, setErrors] = useState<SignUpErrors>({});
  const [loadingSendOtp, setLoadingSendOtp] = useState(false);
  const [loadingVerifyOtp, setLoadingVerifyOtp] = useState(false);
  const [loadingRegister, setLoadingRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  function validateForm() {
    const nextErrors: SignUpErrors = {};

    if (nama.trim().length < 3) {
      nextErrors.nama = "Nama minimal 3 karakter.";
    }

    if (!emailRegex.test(email)) {
      nextErrors.email = "Format email tidak valid.";
    }

    // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
    if (password.length < 6) {
      nextErrors.password = "Password minimal 6 karakter.";
    }

    if (confirmPassword !== password) {
      nextErrors.confirmPassword = "Konfirmasi password tidak sama.";
    }

    // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
    if (!otpVerified) {
      nextErrors.otp = "Verifikasi OTP wajib dilakukan sebelum daftar.";
    }

    return nextErrors;
  }

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  async function handleSendOtp() {
    const normalizedEmail = email.trim().toLowerCase();
    if (!emailRegex.test(normalizedEmail)) {
      setErrors((previous) => ({
        ...previous,
        email: "Isi email valid dulu sebelum kirim OTP.",
      }));
      return;
    }

    const otpLimitMessage = getOtpLimitMessage(normalizedEmail);
    if (otpLimitMessage) {
      void Swal.fire({
        icon: "error",
        title: "OTP belum bisa dikirim",
        text: otpLimitMessage,
        confirmButtonColor: "#465fff",
      });
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

      // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal mengirim OTP.");
      }

      setOtpSent(true);
      setOtpVerified(false);
      setOtp("");
      recordOtpSend(normalizedEmail);
      void Swal.fire({
        icon: "success",
        title: "OTP terkirim",
        text: "Silakan cek inbox email Anda.",
        confirmButtonColor: "#465fff",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal mengirim OTP.";
      void Swal.fire({
        icon: "error",
        title: "OTP gagal dikirim",
        text: message,
        confirmButtonColor: "#465fff",
      });
    } finally {
      setLoadingSendOtp(false);
    }
  }

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  async function handleVerifyOtp() {
    // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
    if (!otpSent) {
      setErrors((previous) => ({
        ...previous,
        otp: "Kirim OTP dulu sebelum verifikasi.",
      }));
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setErrors((previous) => ({
        ...previous,
        otp: "Kode OTP harus 6 digit angka.",
      }));
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
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
        }),
      });
      const result = await response.json();

      // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
      if (!response.ok || !result.success) {
        throw new Error(result.message || "OTP tidak valid.");
      }

      setOtpVerified(true);
      setErrors((previous) => ({ ...previous, otp: "" }));
      void Swal.fire({
        icon: "success",
        title: "OTP valid",
        text: "Email berhasil diverifikasi.",
        confirmButtonColor: "#465fff",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "OTP tidak valid.";
      setOtpVerified(false);
      void Swal.fire({
        icon: "error",
        title: "Verifikasi gagal",
        text: message,
        confirmButtonColor: "#465fff",
      });
    } finally {
      setLoadingVerifyOtp(false);
    }
  }

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoadingRegister(true);
    try {
      const verifyConsumeResponse = await fetch(`${API_BASE_URL}/api/auth/consume-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
        }),
      });
      const consumeResult = await verifyConsumeResponse.json();

      // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
      if (!verifyConsumeResponse.ok || !consumeResult.success) {
        throw new Error(consumeResult.message || "Verifikasi OTP belum valid.");
      }

      registerUser({
        nama: nama.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: "viewer",
      });

      await Swal.fire({
        icon: "success",
        title: "Registrasi berhasil",
        text: "User baru berhasil dibuat. Silakan login.",
        confirmButtonColor: "#465fff",
      });
      router.replace("/signin");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal registrasi.";
      void Swal.fire({
        icon: "error",
        title: "Registrasi gagal",
        text: message,
        confirmButtonColor: "#465fff",
      });
    } finally {
      setLoadingRegister(false);
    }
  }

  return (
    <div className="flex w-full flex-1 flex-col lg:w-1/2">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] sm:p-8">
          <div className="mb-6">
            <h1 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Registrasi User Baru
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Daftar akun baru dan verifikasi OTP via email.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <Field
              label="Nama Lengkap"
              value={nama}
              placeholder="Nama mahasiswa/user"
              onChange={(value) => {
                setNama(value);
                setErrors((previous) => ({ ...previous, nama: "" }));
              }}
              error={errors.nama}
            />

            <Field
              label="Email"
              value={email}
              placeholder="nama@kampus.ac.id"
              onChange={(value) => {
                setEmail(value);
                setOtpSent(false);
                setOtpVerified(false);
                setErrors((previous) => ({ ...previous, email: "", otp: "" }));
              }}
              error={errors.email}
              rightAction={
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loadingSendOtp}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:text-gray-200"
                >
                  {loadingSendOtp ? "Mengirim..." : otpSent ? "Kirim Ulang OTP" : "Kirim OTP"}
                </button>
              }
            />

            <Field
              label="Kode OTP"
              value={otp}
              placeholder="6 digit OTP"
              onChange={(value) => {
                setOtp(value);
                setOtpVerified(false);
                setErrors((previous) => ({ ...previous, otp: "" }));
              }}
              error={errors.otp}
              rightAction={
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={loadingVerifyOtp || !otpSent}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:text-gray-200"
                >
                  {loadingVerifyOtp ? "Memverifikasi..." : "Verifikasi OTP"}
                </button>
              }
            />

            {otpVerified ? (
              <p className="text-xs font-medium text-success-600">
                OTP terverifikasi. Registrasi siap diproses.
              </p>
            ) : null}

            <Field
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              placeholder="Minimal 6 karakter"
              onChange={(value) => {
                setPassword(value);
                setErrors((previous) => ({ ...previous, password: "" }));
              }}
              error={errors.password}
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

            <Field
              label="Konfirmasi Password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              placeholder="Ulangi password"
              onChange={(value) => {
                setConfirmPassword(value);
                setErrors((previous) => ({ ...previous, confirmPassword: "" }));
              }}
              error={errors.confirmPassword}
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

            <Button className="w-full" size="sm" disabled={loadingRegister}>
              {loadingRegister ? "Memproses..." : "Daftar"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-600 dark:text-gray-400">
            Sudah punya akun?{" "}
            <Link href="/signin" className="font-medium text-brand-600 hover:text-brand-700">
              Login di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
function Field({
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
