export type StudentStatus = "Reguler" | "Beasiswa";
export type SearchType = "linear" | "binary" | "sequential";
export type SortMethod =
  | "bubble"
  | "insertion"
  | "selection"
  | "merge"
  | "shell";
export type SortField = "nim" | "nama" | "semester" | "angkatan" | "prodi";
export type SortOrder = "asc" | "desc";

export interface Student {
  id: string;
  nim: string;
  nama: string;
  email: string;
  tempatLahir: string;
  tanggalLahir: string;
  prodi: string;
  semester: number;
  angkatan: number;
  status: StudentStatus;
  statusAktif: "Aktif" | "Tidak Aktif";
  kontakLabel: string;
}

export interface StudentFormState {
  nim: string;
  nama: string;
  email: string;
  tempatLahir: string;
  tanggalLahir: string;
  prodi: string;
  semester: string;
  angkatan: string;
  status: StudentStatus;
  statusAktif: "Aktif" | "Tidak Aktif";
}

export interface StudentMeta {
  total: number;
  totalSemuaData: number;
  page: number;
  limit: number;
  totalPages: number;
  startIndex: number;
  returnedRows: number;
  status: "all" | StudentStatus;
  searchType: SearchType;
  sortMethod: SortMethod;
  sortBy: SortField;
  sortOrder: SortOrder;
  complexity: {
    search: string;
    sort: string;
    crudAccess: string;
    exportImport: string;
  };
  executionTime: {
    search: number;
    sort: number;
  };
}
