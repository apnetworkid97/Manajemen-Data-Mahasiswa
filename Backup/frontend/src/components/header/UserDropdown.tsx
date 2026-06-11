"use client";

import {
  AUTH_SESSION_CHANGED_EVENT,
  clearCurrentSession,
  getCurrentSession,
  updateUserById,
} from "@/lib/auth";
import type { AuthSession } from "@/types/auth";
import { Modal } from "@/components/ui/modal";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Dropdown } from "../ui/dropdown/Dropdown";

type ProfileForm = {
  nama: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type ProfileErrors = Partial<Record<keyof ProfileForm, string>>;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function UserDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthSession | null>(null);
  const [form, setForm] = useState<ProfileForm>({
    nama: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Ambil ulang session saat ada login, logout, atau update profil.
    const syncCurrentUser = () => {
      setCurrentUser(getCurrentSession());
    };

    syncCurrentUser();
    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, syncCurrentUser);

    return () => {
      window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, syncCurrentUser);
    };
  }, []);

  function toggleDropdown() {
    setIsOpen((previous) => !previous);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  function handleLogout() {
    clearCurrentSession();
    closeDropdown();
    router.replace("/signin");
  }

  // Buka modal edit dengan data user yang sedang login.
  function openEditProfileModal() {
    if (!currentUser) {
      return;
    }

    setForm({
      nama: currentUser.nama,
      email: currentUser.email,
      password: "",
      confirmPassword: "",
    });
    setErrors({});
    setIsEditModalOpen(true);
    closeDropdown();
  }

  function validateProfileForm(values: ProfileForm): ProfileErrors {
    const nextErrors: ProfileErrors = {};

    if (values.nama.trim().length < 3) {
      nextErrors.nama = "Nama minimal 3 karakter.";
    }

    if (!emailRegex.test(values.email.trim())) {
      nextErrors.email = "Format email tidak valid.";
    }

    if (values.password && values.password.length < 6) {
      nextErrors.password = "Password baru minimal 6 karakter.";
    }

    if (values.password && values.confirmPassword !== values.password) {
      nextErrors.confirmPassword = "Konfirmasi password tidak sama.";
    }

    if (!values.password && values.confirmPassword) {
      nextErrors.password = "Isi password baru terlebih dahulu.";
    }

    return nextErrors;
  }

  async function handleSaveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentUser) {
      return;
    }

    const validationErrors = validateProfileForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSaving(true);
    try {
      updateUserById(currentUser.id, {
        nama: form.nama.trim(),
        email: form.email.trim(),
        role: currentUser.role,
        password: form.password || undefined,
      });

      setIsEditModalOpen(false);
      await Swal.fire({
        icon: "success",
        title: "Profil diperbarui",
        text: "Data akun berhasil diubah. Silakan login ulang.",
        confirmButtonColor: "#465fff",
      });
      clearCurrentSession();
      router.replace("/signin");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal memperbarui profil.";
      void Swal.fire({
        icon: "error",
        title: "Gagal update profil",
        text: message,
        confirmButtonColor: "#465fff",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={toggleDropdown}
          className="dropdown-toggle flex items-center text-gray-700 dark:text-gray-400"
        >
          <span className="mr-3 h-11 w-11 overflow-hidden rounded-full">
            <Image
              width={44}
              height={44}
              src="/images/user/user.png"
              alt="User"
              className="h-11 w-11 object-cover"
            />
          </span>

          <span className="mr-1 block font-medium text-theme-sm">
            {currentUser?.nama || "User"}
          </span>

          <svg
            className={`stroke-gray-500 transition-transform duration-200 dark:stroke-gray-400 ${
              isOpen ? "rotate-180" : ""
            }`}
            width="18"
            height="20"
            viewBox="0 0 18 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <Dropdown
          isOpen={isOpen}
          onClose={closeDropdown}
          className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
        >
          <div>
            <span className="block text-theme-sm font-medium text-gray-700 dark:text-gray-400">
              {currentUser?.nama || "User"}
            </span>
            <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
              {currentUser?.email || "-"}
            </span>
            <span className="mt-2 inline-block rounded-full bg-blue-light-50 px-3 py-1 text-xs font-medium capitalize text-blue-light-700 dark:bg-blue-light-500/15 dark:text-blue-light-400">
              Role: {currentUser?.role || "-"}
            </span>
          </div>

          <button
            type="button"
            onClick={openEditProfileModal}
            className="mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-theme-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
          >
            Edit Profil
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-theme-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
          >
            Sign out
          </button>
        </Dropdown>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        className="m-4 max-w-[560px]"
      >
        <div className="p-6 sm:p-8">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Edit Profil
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Ubah data user yang sedang login.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSaveProfile}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Nama
              </label>
              <input
                type="text"
                value={form.nama}
                onChange={(event) => {
                  setForm((previous) => ({ ...previous, nama: event.target.value }));
                  setErrors((previous) => ({ ...previous, nama: "" }));
                }}
                className={`h-11 w-full rounded-xl border bg-white px-4 text-sm text-gray-800 outline-none transition dark:bg-gray-900 dark:text-white/90 ${
                  errors.nama
                    ? "border-error-500 focus:border-error-500"
                    : "border-gray-300 focus:border-brand-500 dark:border-gray-700"
                }`}
              />
              {errors.nama ? <p className="text-xs text-error-600">{errors.nama}</p> : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(event) => {
                  setForm((previous) => ({ ...previous, email: event.target.value }));
                  setErrors((previous) => ({ ...previous, email: "" }));
                }}
                className={`h-11 w-full rounded-xl border bg-white px-4 text-sm text-gray-800 outline-none transition dark:bg-gray-900 dark:text-white/90 ${
                  errors.email
                    ? "border-error-500 focus:border-error-500"
                    : "border-gray-300 focus:border-brand-500 dark:border-gray-700"
                }`}
              />
              {errors.email ? (
                <p className="text-xs text-error-600">{errors.email}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Password Baru (opsional)
              </label>
              <div className="flex items-start gap-2">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(event) => {
                    setForm((previous) => ({ ...previous, password: event.target.value }));
                    setErrors((previous) => ({ ...previous, password: "" }));
                  }}
                  placeholder="Kosongkan jika tidak diubah"
                  className={`h-11 w-full rounded-xl border bg-white px-4 text-sm text-gray-800 outline-none transition dark:bg-gray-900 dark:text-white/90 ${
                    errors.password
                      ? "border-error-500 focus:border-error-500"
                      : "border-gray-300 focus:border-brand-500 dark:border-gray-700"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200"
                >
                  {showPassword ? "Sembunyikan" : "Lihat"}
                </button>
              </div>
              {errors.password ? (
                <p className="text-xs text-error-600">{errors.password}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Konfirmasi Password Baru
              </label>
              <div className="flex items-start gap-2">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(event) => {
                    setForm((previous) => ({
                      ...previous,
                      confirmPassword: event.target.value,
                    }));
                    setErrors((previous) => ({ ...previous, confirmPassword: "" }));
                  }}
                  placeholder="Ulangi password baru"
                  className={`h-11 w-full rounded-xl border bg-white px-4 text-sm text-gray-800 outline-none transition dark:bg-gray-900 dark:text-white/90 ${
                    errors.confirmPassword
                      ? "border-error-500 focus:border-error-500"
                      : "border-gray-300 focus:border-brand-500 dark:border-gray-700"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((previous) => !previous)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200"
                >
                  {showConfirmPassword ? "Sembunyikan" : "Lihat"}
                </button>
              </div>
              {errors.confirmPassword ? (
                <p className="text-xs text-error-600">{errors.confirmPassword}</p>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-brand-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/5"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
