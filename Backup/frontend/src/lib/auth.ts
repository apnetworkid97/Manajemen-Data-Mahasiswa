import type { AuthPermission, AuthSession, AuthUser, UserRole } from "@/types/auth";

const USERS_STORAGE_KEY = "mdm_users";
const SESSION_STORAGE_KEY = "mdm_session";
export const AUTH_SESSION_CHANGED_EVENT = "auth-session-changed";

const defaultUsers: AuthUser[] = [
  {
    id: "user-admin-001",
    nama: "Admin Mahasiswa",
    email: "admin@kampus.ac.id",
    password: "admin123",
    role: "admin",
    createdAt: new Date("2026-01-01").toISOString(),
  },
  {
    id: "user-operator-001",
    nama: "Operator Akademik",
    email: "operator@kampus.ac.id",
    password: "operator123",
    role: "operator",
    createdAt: new Date("2026-01-02").toISOString(),
  },
  {
    id: "user-viewer-001",
    nama: "Viewer Akademik",
    email: "viewer@kampus.ac.id",
    password: "viewer123",
    role: "viewer",
    createdAt: new Date("2026-01-03").toISOString(),
  },
];

// Cek apakah kode sedang berjalan di browser agar localStorage aman dipakai.
function canUseStorage() {
  return typeof window !== "undefined";
}

// Broadcast perubahan session agar komponen UI bisa refresh tanpa reload halaman.
function dispatchSessionChanged() {
  if (!canUseStorage()) {
    return;
  }

  window.dispatchEvent(new CustomEvent(AUTH_SESSION_CHANGED_EVENT));
}

// Samakan format email jadi lowercase + tanpa spasi pinggir.
function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

// Isi user default jika localStorage belum punya data user.
export function ensureSeedUsers() {
  if (!canUseStorage()) {
    return;
  }

  const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
  if (!storedUsers) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
  }
}

// Ambil daftar user dari localStorage, fallback ke user default jika rusak/kosong.
export function getStoredUsers() {
  if (!canUseStorage()) {
    return defaultUsers;
  }

  ensureSeedUsers();
  const rawUsers = localStorage.getItem(USERS_STORAGE_KEY);

  try {
    return rawUsers ? (JSON.parse(rawUsers) as AuthUser[]) : defaultUsers;
  } catch {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
  }
}

// Simpan daftar user terbaru ke localStorage.
export function saveStoredUsers(users: AuthUser[]) {
  if (!canUseStorage()) {
    return;
  }

  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

// Validasi login dengan mencocokkan email dan password.
export function authenticateUser(email: string, password: string) {
  const users = getStoredUsers();

  return (
    users.find(
      (user) =>
        normalizeEmail(user.email) === normalizeEmail(email) &&
        user.password === password
    ) || null
  );
}

// Daftarkan user baru dengan validasi email unik.
export function registerUser(input: {
  nama: string;
  email: string;
  password: string;
  role: UserRole;
}) {
  const users = getStoredUsers();
  const email = normalizeEmail(input.email);

  const existingUser = users.find((user) => normalizeEmail(user.email) === email);
  if (existingUser) {
    throw new Error("Email sudah terdaftar.");
  }

  const newUser: AuthUser = {
    id: `user-${Date.now()}`,
    nama: input.nama.trim(),
    email,
    password: input.password,
    role: input.role,
    createdAt: new Date().toISOString(),
  };

  saveStoredUsers([...users, newUser]);
  return newUser;
}

// Update data user berdasarkan id, termasuk cek bentrok email.
export function updateUserById(
  userId: string,
  input: {
    nama: string;
    email: string;
    role: UserRole;
    password?: string;
  }
) {
  const users = getStoredUsers();
  const email = normalizeEmail(input.email);

  const existingUser = users.find(
    (user) => normalizeEmail(user.email) === email && user.id !== userId
  );
  if (existingUser) {
    throw new Error("Email sudah terdaftar oleh user lain.");
  }

  const nextUsers = users.map((user) => {
    if (user.id !== userId) {
      return user;
    }

    return {
      ...user,
      nama: input.nama.trim(),
      email,
      role: input.role,
      password: input.password ? input.password : user.password,
    };
  });

  saveStoredUsers(nextUsers);

  // Jika user yang diedit adalah user yang sedang login, sinkronkan session-nya.
  const updatedUser = nextUsers.find((user) => user.id === userId);
  const currentSession = getCurrentSession();
  if (updatedUser && currentSession?.id === userId) {
    setCurrentSession(updatedUser);
  }

  return updatedUser;
}

// Hapus user berdasarkan id, tapi cegah menghapus admin terakhir.
export function deleteUserById(userId: string) {
  const users = getStoredUsers();
  const targetUser = users.find((user) => user.id === userId);

  if (!targetUser) {
    throw new Error("User tidak ditemukan.");
  }

  const currentSession = getCurrentSession();
  if (currentSession?.id === userId) {
    throw new Error("User yang sedang login tidak boleh dihapus.");
  }

  const totalAdmin = users.filter((user) => user.role === "admin").length;
  if (targetUser.role === "admin" && totalAdmin <= 1) {
    throw new Error("Minimal harus ada satu admin.");
  }

  saveStoredUsers(users.filter((user) => user.id !== userId));
}

// Simpan sesi login aktif user.
export function setCurrentSession(user: AuthUser) {
  if (!canUseStorage()) {
    return;
  }

  const session: AuthSession = {
    id: user.id,
    nama: user.nama,
    email: user.email,
    role: user.role,
  };

  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  dispatchSessionChanged();
}

// Ambil data sesi login aktif.
export function getCurrentSession() {
  if (!canUseStorage()) {
    return null;
  }

  const rawSession = localStorage.getItem(SESSION_STORAGE_KEY);

  try {
    return rawSession ? (JSON.parse(rawSession) as AuthSession) : null;
  } catch {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

// Hapus sesi login aktif (logout).
export function clearCurrentSession() {
  if (!canUseStorage()) {
    return;
  }

  localStorage.removeItem(SESSION_STORAGE_KEY);
  dispatchSessionChanged();
}

// Aturan RBAC sederhana: role mana boleh melakukan aksi apa.
export function hasPermission(role: UserRole, permission: AuthPermission) {
  const permissionMap: Record<UserRole, AuthPermission[]> = {
    admin: [
      "manage_users",
      "create_student",
      "edit_student",
      "delete_student",
      "import_student",
      "export_student",
      "view_student",
    ],
    operator: ["create_student", "edit_student", "export_student", "view_student"],
    viewer: ["view_student"],
  };

  return permissionMap[role].includes(permission);
}

// Cek apakah email sudah ada di sistem.
export function isRegisteredEmail(emailInput: string) {
  const users = getStoredUsers();
  const email = normalizeEmail(emailInput);
  return users.some((user) => normalizeEmail(user.email) === email);
}

// Reset password user berdasarkan email terdaftar.
export function resetPasswordByEmail(emailInput: string, newPassword: string) {
  const users = getStoredUsers();
  const email = normalizeEmail(emailInput);

  const targetUser = users.find((user) => normalizeEmail(user.email) === email);
  if (!targetUser) {
    throw new Error("Email tidak ditemukan.");
  }

  if (newPassword.length < 6) {
    throw new Error("Password baru minimal 6 karakter.");
  }

  const nextUsers = users.map((user) =>
    normalizeEmail(user.email) === email
      ? {
          ...user,
          password: newPassword,
        }
      : user
  );

  saveStoredUsers(nextUsers);
}
