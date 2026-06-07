export type UserRole = "admin" | "operator" | "viewer";

export interface AuthUser {
  id: string;
  nama: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthSession {
  id: string;
  nama: string;
  email: string;
  role: UserRole;
}

export type AuthPermission =
  | "manage_users"
  | "create_student"
  | "edit_student"
  | "delete_student"
  | "import_student"
  | "export_student"
  | "view_student";
