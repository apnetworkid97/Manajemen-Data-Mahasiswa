"use client";

import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import Badge from "@/components/ui/badge/Badge";
import Checkbox from "@/components/form/input/Checkbox";
import { Modal } from "@/components/ui/modal";
import {
  deleteUserById,
  ensureSeedUsers,
  getCurrentSession,
  getStoredUsers,
  registerUser,
  updateUserById,
} from "@/lib/auth";
import type { AuthUser, UserRole } from "@/types/auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type FormState = {
  nama: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const initialForm: FormState = {
  nama: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "viewer",
};

// Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
function showToast(
  icon: "success" | "error" | "info",
  title: string,
  text?: string
) {
  return Swal.fire({
    toast: true,
    position: "top-end",
    icon,
    title,
    text,
    showConfirmButton: false,
    timer: 2400,
    timerProgressBar: true,
  });
}

// Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
function roleBadgeColor(role: UserRole) {
  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  if (role === "admin") {
    return "error" as const;
  }
  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  if (role === "operator") {
    return "warning" as const;
  }
  return "success" as const;
}

// Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
export default function UserManager() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isAllowed, setIsAllowed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  function loadUsers() {
    const allUsers = getStoredUsers().sort((a, b) => a.nama.localeCompare(b.nama));
    setUsers(allUsers);
  }

  useEffect(() => {
    ensureSeedUsers();
    const currentSession = getCurrentSession();

    // Hanya admin yang boleh membuka halaman manajemen user.
    if (currentSession?.role === "admin") {
      setCurrentSessionId(currentSession.id);
      setIsAllowed(true);
      loadUsers();
    }
  }, []);

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
    if (!keyword) {
      return users;
    }

    return users.filter(
      (user) =>
        user.nama.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        user.role.toLowerCase().includes(keyword)
    );
  }, [search, users]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / Number(rowsPerPage)));
  const safePage = Math.min(currentPage, totalPages);
  const visiblePages = getVisiblePages(safePage, totalPages);
  const startIndex = (safePage - 1) * Number(rowsPerPage);
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + Number(rowsPerPage));

  useEffect(() => {
    setCurrentPage(1);
  }, [rowsPerPage, search]);

  const deletableUsersOnPage = paginatedUsers.filter(
    (user) => user.id !== currentSessionId
  );
  const isAllVisibleSelected =
    deletableUsersOnPage.length > 0 &&
    deletableUsersOnPage.every((user) => selectedIds.includes(user.id));

  // Checkbox header hanya memilih user yang boleh dihapus, bukan user yang sedang login.
  function toggleSelectAll(checked: boolean) {
    if (!checked) {
      setSelectedIds((previous) =>
        previous.filter(
          (id) => !deletableUsersOnPage.some((user) => user.id === id)
        )
      );
      return;
    }

    setSelectedIds((previous) => [
      ...new Set([...previous, ...deletableUsersOnPage.map((user) => user.id)]),
    ]);
  }

  // Memilih satu user untuk bulk delete.
  function toggleSelectOne(id: string, checked: boolean) {
    setSelectedIds((previous) =>
      checked ? [...new Set([...previous, id])] : previous.filter((item) => item !== id)
    );
  }

  // Validasi form tambah/edit user.
  function validateFormValues(values: FormState) {
    const errors: FormErrors = {};

    if (values.nama.trim().length < 3) {
      errors.nama = "Nama minimal 3 karakter.";
    }

    if (!emailRegex.test(values.email)) {
      errors.email = "Format email tidak valid.";
    }

    if (!editingId && values.password.length < 6) {
      errors.password = "Password minimal 6 karakter.";
    }

    if (editingId && values.password && values.password.length < 6) {
      errors.password = "Password baru minimal 6 karakter.";
    }

    if (!editingId && values.confirmPassword !== values.password) {
      errors.confirmPassword = "Konfirmasi password tidak sama.";
    }

    if (editingId && values.password && values.confirmPassword !== values.password) {
      errors.confirmPassword = "Konfirmasi password tidak sama.";
    }

    if (editingId && !values.password && values.confirmPassword) {
      errors.password = "Isi password baru terlebih dahulu.";
    }

    return errors;
  }

  // Membuka modal tambah user baru.
  function openCreateModal() {
    setEditingId(null);
    setForm(initialForm);
    setFormErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsModalOpen(true);
  }

  // Membuka modal edit untuk user yang dipilih, termasuk user yang sedang login.
  function openEditModal(user: AuthUser) {
    setEditingId(user.id);
    setForm({
      nama: user.nama,
      email: user.email,
      password: "",
      confirmPassword: "",
      role: user.role,
    });
    setFormErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsModalOpen(true);
  }

  // Menyimpan perubahan user baru atau edit user lama.
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateFormValues(form);

    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    setBusy(true);

    try {
      if (editingId) {
        updateUserById(editingId, {
          nama: form.nama,
          email: form.email,
          role: form.role,
          password: form.password || undefined,
        });

        if (editingId === currentSessionId) {
          setCurrentSessionId(editingId);
        }

        void showToast("success", "Berhasil", "Data user berhasil diperbarui.");
      } else {
        registerUser({
          nama: form.nama,
          email: form.email,
          password: form.password,
          role: form.role,
        });
        void showToast("success", "Berhasil", "User baru berhasil ditambahkan.");
      }

      setIsModalOpen(false);
      loadUsers();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal menyimpan data user.";
      void showToast("error", "Gagal menyimpan user", errorMessage);
    } finally {
      setBusy(false);
    }
  }

  // Bulk delete hanya memproses user yang memang boleh dihapus.
  async function handleDeleteSelected() {
    const deletableSelectedIds = selectedIds.filter((id) => id !== currentSessionId);

    if (deletableSelectedIds.length === 0) {
      return;
    }

    const result = await Swal.fire({
      title: "Hapus user terpilih?",
      text: `${deletableSelectedIds.length} user akan dihapus permanen.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#94a3b8",
    });

    if (!result.isConfirmed) {
      return;
    }

    setBusy(true);

    try {
      deletableSelectedIds.forEach((id) => {
        deleteUserById(id);
      });
      setSelectedIds([]);
      void showToast("success", "Berhasil", "User terpilih berhasil dihapus.");
      loadUsers();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal menghapus user.";
      void showToast("error", "Gagal menghapus user", errorMessage);
    } finally {
      setBusy(false);
    }
  }

  // Jika bukan admin, tampilkan pesan akses ditolak.
  if (!isAllowed) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-6 py-4 text-sm text-gray-600 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-300">
        Halaman ini hanya dapat diakses oleh admin.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[26px] border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-white/[0.03] sm:p-7">
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-xl bg-brand-500 px-5 py-3 text-sm font-medium text-white hover:bg-brand-600"
              onClick={openCreateModal}
            >
              + Tambah User
            </button>

            <button
              type="button"
              disabled={selectedIds.length === 0 || busy}
              className={`rounded-xl border px-5 py-3 text-sm font-medium transition ${
                selectedIds.length === 0 || busy
                  ? "cursor-not-allowed border-gray-300 text-gray-400"
                  : "border-error-200 text-error-600 hover:bg-error-50 dark:border-error-500/30 dark:hover:bg-error-500/10"
              }`}
              onClick={handleDeleteSelected}
            >
              {busy ? "Memproses..." : `Delete Selected (${selectedIds.length})`}
            </button>
          </div>

          <div className="w-full max-w-[360px]">
            <input
              type="text"
              value={search}
              placeholder="Search nama/email/role..."
              onChange={(event) => setSearch(event.target.value)}
              className="h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-800 outline-none transition focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </div>
        </div>

        <div className="mb-5 w-[96px]">
          <select
            value={rowsPerPage}
            onChange={(event) => setRowsPerPage(event.target.value)}
            className="h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-800 outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          >
            <option value="10">10</option>
            <option value="20">20</option>
          </select>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-white/[0.05]">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="w-[56px] px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                  >
                    <Checkbox
                      checked={isAllVisibleSelected}
                      onChange={toggleSelectAll}
                      disabled={deletableUsersOnPage.length === 0}
                    />
                  </TableCell>
                  {["Nama", "Email", "Role", "Dibuat Pada"].map((heading) => (
                    <TableCell
                      key={heading}
                      isHeader
                      className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                    >
                      {heading}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {paginatedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell className="px-5 py-8 text-sm text-gray-500 dark:text-gray-400" colSpan={5}>
                      Tidak ada data user.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      className="cursor-pointer transition hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                      onClick={() => openEditModal(user)}
                    >
                      <TableCell
                        className="px-4 py-5"
                        onClick={(event: React.MouseEvent<HTMLTableCellElement>) =>
                          event.stopPropagation()
                        }
                      >
                        <Checkbox
                          checked={selectedIds.includes(user.id)}
                          disabled={user.id === currentSessionId}
                          onChange={(checked) => toggleSelectOne(user.id, checked)}
                        />
                      </TableCell>
                      <TableCell className="px-4 py-5 text-sm font-medium text-gray-800 dark:text-white/90">
                        <div className="flex items-center gap-2">
                          <span>{user.nama}</span>
                          {user.id === currentSessionId ? (
                            <span className="rounded-full bg-blue-light-50 px-2 py-0.5 text-[11px] font-medium text-blue-light-700 dark:bg-blue-light-500/15 dark:text-blue-light-400">
                              Anda
                            </span>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-5 text-sm text-gray-700 dark:text-gray-300">
                        {user.email}
                      </TableCell>
                      <TableCell className="px-4 py-5 text-sm">
                        <Badge size="sm" color={roleBadgeColor(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-5 text-sm text-gray-700 dark:text-gray-300">
                        {new Date(user.createdAt).toLocaleDateString("id-ID")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-5 text-sm text-gray-500 dark:border-white/[0.05] dark:text-gray-400">
          <span>
            Showing {filteredUsers.length === 0 ? 0 : startIndex + 1} to{" "}
            {Math.min(startIndex + Number(rowsPerPage), filteredUsers.length)} of{" "}
            {filteredUsers.length}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safePage === 1}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200"
              onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))}
            >
              Previous
            </button>
            {visiblePages.map((page) =>
              page === "ellipsis-left" || page === "ellipsis-right" ? (
                <span
                  key={page}
                  className="px-1 text-sm text-gray-500 dark:text-gray-400"
                >
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  type="button"
                  className={`min-w-10 rounded-xl px-3 py-2 text-sm font-medium ${
                    safePage === page
                      ? "bg-brand-500 text-white"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/5"
                  }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              )
            )}
            <button
              type="button"
              disabled={safePage === totalPages}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200"
              onClick={() =>
                setCurrentPage((previous) => Math.min(totalPages, previous + 1))
              }
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="m-4 max-w-[640px]">
        <div className="p-6 sm:p-8">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              {editingId ? "Edit User" : "Tambah User Baru"}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Isi data user dan tentukan role akses.
            </p>
          </div>

          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <Field
              label="Nama Lengkap"
              value={form.nama}
              onChange={(value) => {
                setForm((previous) => ({ ...previous, nama: value }));
                setFormErrors((previous) => ({ ...previous, nama: "" }));
              }}
              placeholder="Nama user"
              error={formErrors.nama}
            />
            <Field
              label="Email"
              value={form.email}
              onChange={(value) => {
                setForm((previous) => ({ ...previous, email: value }));
                setFormErrors((previous) => ({ ...previous, email: "" }));
              }}
              placeholder="user@kampus.ac.id"
              error={formErrors.email}
            />
            <Field
              label={editingId ? "Password Baru (opsional)" : "Password"}
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(value) => {
                setForm((previous) => ({ ...previous, password: value }));
                setFormErrors((previous) => ({ ...previous, password: "" }));
              }}
              placeholder={editingId ? "Kosongkan jika tidak diubah" : "Minimal 6 karakter"}
              error={formErrors.password}
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
              label={editingId ? "Konfirmasi Password Baru" : "Konfirmasi Password"}
              type={showConfirmPassword ? "text" : "password"}
              value={form.confirmPassword}
              onChange={(value) => {
                setForm((previous) => ({ ...previous, confirmPassword: value }));
                setFormErrors((previous) => ({ ...previous, confirmPassword: "" }));
              }}
              placeholder="Ulangi password"
              error={formErrors.confirmPassword}
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
            <SelectField
              label="Role"
              value={form.role}
              onChange={(value) => {
                setForm((previous) => ({ ...previous, role: value as UserRole }));
                setFormErrors((previous) => ({ ...previous, role: "" }));
              }}
              options={[
                { value: "viewer", label: "Viewer" },
                { value: "operator", label: "Operator" },
                { value: "admin", label: "Admin" },
              ]}
            />

            <div className="flex flex-wrap items-end gap-3 md:col-span-2">
              <button
                type="submit"
                disabled={busy}
                className="rounded-xl bg-brand-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {busy ? "Menyimpan..." : editingId ? "Update User" : "Simpan User"}
              </button>
              <button
                type="button"
                className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/5"
                onClick={() => setIsModalOpen(false)}
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}

// Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
function getVisiblePages(currentPage: number, totalPages: number) {
  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  if (currentPage <= 3) {
    return [1, 2, 3, 4, "ellipsis-right", totalPages] as const;
  }

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  if (currentPage >= totalPages - 2) {
    return [1, "ellipsis-left", totalPages - 3, totalPages - 2, totalPages - 1, totalPages] as const;
  }

  return [1, "ellipsis-left", currentPage - 1, currentPage, currentPage + 1, "ellipsis-right", totalPages] as const;
}

// Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
  rightAction,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: React.HTMLInputTypeAttribute;
  error?: string;
  rightAction?: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="flex items-start gap-2">
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={`h-11 w-full rounded-xl border bg-white px-4 text-sm text-gray-800 outline-none transition dark:bg-gray-900 dark:text-white/90 ${
            error
              ? "border-error-500 focus:border-error-500 dark:border-error-500"
              : "border-gray-300 focus:border-brand-500 dark:border-gray-700"
          }`}
        />
        {rightAction}
      </div>
      {error ? <p className="text-xs text-error-600">{error}</p> : null}
    </div>
  );
}

// Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-800 outline-none transition focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
