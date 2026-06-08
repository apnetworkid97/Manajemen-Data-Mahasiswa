"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { getCurrentSession, hasPermission } from "@/lib/auth";
import Swal from "sweetalert2";
import StudentManagerView from "@/components/students/StudentManagerView";
import type { UserRole } from "@/types/auth";
import type {
  SearchType,
  SortField,
  SortMethod,
  SortOrder,
  Student,
  StudentFormState,
  StudentMeta,
  StudentStatus,
} from "@/types/student";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

const STUDY_PROGRAM_OPTIONS: readonly string[] = [
  "Teknik Informatika (S1)",
  "Teknik Industri (S1)",
  "Teknik Mesin (S1)",
  "Teknik Elektro (S1)",
  "Teknik Kimia (S1)",
  "Ilmu Hukum (S1)",
  "Manajemen (S1)",
  "Akuntansi (S1)",
  "Pendidikan Pancasila dan Kewarganegaraan (PPKn) (S1)",
  "Pendidikan Ekonomi (S1)",
  "Pendidikan Jasmani (S1)",
  "Sastra Indonesia (S1)",
  "Sastra Inggris (S1)",
  "Matematika (S1)",
];

const initialFormState: StudentFormState = {
  nim: "",
  nama: "",
  email: "",
  tempatLahir: "",
  tanggalLahir: "",
  prodi: STUDY_PROGRAM_OPTIONS[0],
  semester: "",
  angkatan: "",
  status: "Reguler",
  statusAktif: "Aktif",
};

const initialMeta: StudentMeta = {
  total: 0,
  totalSemuaData: 0,
  searchType: "sequential",
  sortMethod: "insertion",
  sortBy: "nim",
  sortOrder: "asc",
  complexity: {
    search: "O(n)",
    sort: "O(n^2)",
    crudAccess: "O(n)",
    exportImport: "O(n)",
  },
  executionTime: {
    search: 0,
    sort: 0,
  },
};

const nimRegex = /^\d{12}$/;
const namaRegex = /^[A-Za-z\s'.]{3,60}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const tempatLahirRegex = /^[A-Za-z\s'.-]{2,60}$/;

type ModalMode = "create" | "edit";
type FormErrors = Partial<Record<keyof StudentFormState, string>>;
type StatusFilter = "all" | "Reguler" | "Beasiswa";
type BusyAction =
  | null
  | "submit"
  | "delete"
  | "bulk-delete"
  | "import"
  | "export"
  | "search"
  | "filter";

// Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
async function readFileAsText(file: File) {
  return file.text();
}

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
export default function StudentManager() {
  const [currentRole, setCurrentRole] = useState<UserRole>("viewer");
  const [students, setStudents] = useState<Student[]>([]);
  const [meta, setMeta] = useState<StudentMeta>(initialMeta);
  const [form, setForm] = useState<StudentFormState>(initialFormState);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("sequential");
  const [sortBy, setSortBy] = useState<SortField>("nim");
  const [sortMethod, setSortMethod] = useState<SortMethod>("insertion");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [loading, setLoading] = useState(false);
  const [busyAction, setBusyAction] = useState<BusyAction>(null);
  const [isPending, startTransition] = useTransition();
  const [selectedFileName, setSelectedFileName] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [rowsPerPage, setRowsPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [importFile, setImportFile] = useState<File | null>(null);

  const filterPanelRef = useRef<HTMLDivElement | null>(null);
  const exportPanelRef = useRef<HTMLDivElement | null>(null);
  const isBusy = loading || isPending || busyAction !== null;
  const canCreate = hasPermission(currentRole, "create_student");
  const canEdit = hasPermission(currentRole, "edit_student");
  const canDelete = hasPermission(currentRole, "delete_student");
  const canImport = hasPermission(currentRole, "import_student");
  const canExport = hasPermission(currentRole, "export_student");

  useEffect(() => {
    const currentSession = getCurrentSession();
    // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
    if (currentSession) {
      setCurrentRole(currentSession.role);
    }
  }, []);

  const loadStudents = useCallback(
    async (
      overrides?: Partial<{
        search: string;
        searchType: SearchType;
        sortBy: SortField;
        sortMethod: SortMethod;
        sortOrder: SortOrder;
      }>
    ) => {
      setLoading(true);

      try {
        const params = new URLSearchParams({
          search: overrides?.search ?? debouncedSearch,
          searchType: overrides?.searchType ?? searchType,
          sortBy: overrides?.sortBy ?? sortBy,
          sortMethod: overrides?.sortMethod ?? sortMethod,
          sortOrder: overrides?.sortOrder ?? sortOrder,
        });

        // Mulai ukur SEBELUM fetch — ini yang mengukur waktu server memproses search+sort
const fetchStart = performance.now();

const response = await fetch(
  `${API_BASE_URL}/api/students?${params.toString()}`
);
const result = await response.json();

// Total waktu round-trip ke server
const totalTime = performance.now() - fetchStart;

if (!response.ok) {
  throw new Error(result.message || "Gagal mengambil data mahasiswa.");
}

setStudents(result.data);

// Gunakan executionTime dari server jika tersedia,
// fallback ke estimasi dari total fetch time
setMeta({
  ...result.meta,
  executionTime: {
    search: result.meta.executionTime?.search ?? totalTime * 0.6,
    sort: result.meta.executionTime?.sort ?? totalTime * 0.4,
  },
});
        setSelectedIds([]);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Terjadi kesalahan.";
        void showToast("error", "Gagal memuat data", errorMessage);
      } finally {
        setLoading(false);
        setBusyAction(null);
      }
    },
    [debouncedSearch, searchType, sortBy, sortMethod, sortOrder]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 350);

    return () => {
      window.clearTimeout(timer);
    };
  }, [search]);

  useEffect(() => {
    setBusyAction((previous) => previous ?? "search");
    startTransition(() => {
      void loadStudents({ search: debouncedSearch });
    });
    setCurrentPage(1);
  }, [debouncedSearch, loadStudents, startTransition]);

  useEffect(() => {
    // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node;

      if (
        isFilterOpen &&
        filterPanelRef.current &&
        !filterPanelRef.current.contains(target)
      ) {
        setIsFilterOpen(false);
      }

      if (
        isExportOpen &&
        exportPanelRef.current &&
        !exportPanelRef.current.contains(target)
      ) {
        setIsExportOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isExportOpen, isFilterOpen]);

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  function updateFormValue(
    key: keyof StudentFormState,
    value: string | StudentStatus
  ) {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));

    setFormErrors((previous) => ({
      ...previous,
      [key]: "",
    }));
  }

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  function validateFormValues(values: StudentFormState) {
    const errors: FormErrors = {};

    if (!nimRegex.test(values.nim)) {
      errors.nim = "NIM harus tepat 12 digit angka.";
    }

    if (!namaRegex.test(values.nama)) {
      errors.nama =
        "Nama hanya boleh berisi huruf, spasi, titik, atau apostrof.";
    }

    if (!emailRegex.test(values.email)) {
      errors.email = "Email tidak valid.";
    }

    if (!tempatLahirRegex.test(values.tempatLahir)) {
      errors.tempatLahir = "Tempat lahir minimal 2 karakter.";
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(values.tanggalLahir)) {
      errors.tanggalLahir = "Tanggal lahir harus format YYYY-MM-DD.";
    }

    if (!STUDY_PROGRAM_OPTIONS.includes(values.prodi)) {
      errors.prodi = "Program studi harus dipilih dari daftar.";
    }

    const semester = Number(values.semester);
    if (!Number.isInteger(semester) || semester < 1 || semester > 14) {
      errors.semester = "Semester harus berupa angka bulat 1-14.";
    }

    const angkatan = Number(values.angkatan);
    if (!Number.isInteger(angkatan) || angkatan < 2018 || angkatan > 2035) {
      errors.angkatan = "Angkatan harus berupa angka 2018-2035.";
    }

    return errors;
  }

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  function openCreateModal() {
    // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
    if (!canCreate) {
      void showToast("error", "Akses ditolak", "Role Anda tidak dapat menambah data.");
      return;
    }

    setModalMode("create");
    setEditingId(null);
    setForm(initialFormState);
    setFormErrors({});
    setIsModalOpen(true);
  }

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  function openEditModal(student: Student) {
    // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
    if (!canEdit) {
      return;
    }

    setModalMode("edit");
    setEditingId(student.id);
    setForm({
      nim: student.nim,
      nama: student.nama,
      email: student.email,
      tempatLahir: student.tempatLahir,
      tanggalLahir: student.tanggalLahir,
      prodi: student.prodi,
      semester: String(student.semester),
      angkatan: String(student.angkatan),
      status: student.status,
      statusAktif: student.statusAktif,
    });
    setFormErrors({});
    setIsModalOpen(true);
  }

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  function closeModal() {
    setIsModalOpen(false);
    setFormErrors({});
    setForm(initialFormState);
    setEditingId(null);
    setModalMode("create");
  }

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if ((modalMode === "create" && !canCreate) || (modalMode === "edit" && !canEdit)) {
      void showToast("error", "Akses ditolak", "Role Anda tidak dapat menyimpan data.");
      return;
    }

    const validationErrors = validateFormValues(form);

    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      void showToast(
        "error",
        "Validasi gagal",
        "Cek kembali field form yang berwarna merah."
      );
      return;
    }

    setBusyAction("submit");

    try {
      const endpoint =
        modalMode === "edit" && editingId
          ? `${API_BASE_URL}/api/students/${editingId}`
          : `${API_BASE_URL}/api/students`;

      const method = modalMode === "edit" ? "PUT" : "POST";
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          semester: Number(form.semester),
          angkatan: Number(form.angkatan),
        }),
      });

      const result = await response.json();

      // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
      if (!response.ok) {
        throw new Error(result.message || "Gagal menyimpan data.");
      }

      void showToast("success", "Berhasil", result.message);
      closeModal();
      await loadStudents();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Terjadi kesalahan.";
      void showToast("error", "Gagal menyimpan data", errorMessage);
      setBusyAction(null);
    }
  }

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  async function handleDeleteSelected() {
    // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
    if (!canDelete) {
      void showToast("error", "Akses ditolak", "Role Anda tidak dapat menghapus data.");
      return;
    }

    // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
    if (selectedIds.length === 0) {
      return;
    }

    const result = await Swal.fire({
      title: "Hapus data terpilih?",
      text: `${selectedIds.length} data mahasiswa yang dipilih akan dihapus permanen.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus semua",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#94a3b8",
    });

    // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
    if (!result.isConfirmed) {
      return;
    }

    setBusyAction("bulk-delete");

    try {
      const response = await fetch(`${API_BASE_URL}/api/students/bulk-delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: selectedIds }),
      });
      const payload = await response.json();

      // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
      if (!response.ok) {
        throw new Error(payload.message || "Gagal menghapus data terpilih.");
      }

      void showToast("success", "Berhasil", payload.message);
      setSelectedIds([]);
      await loadStudents();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Terjadi kesalahan.";
      void showToast("error", "Gagal menghapus data terpilih", errorMessage);
      setBusyAction(null);
    }
  }

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  function resetFilter() {
    setSearch("");
    setSearchType("sequential");
    setSortBy("nim");
    setSortMethod("insertion");
    setSortOrder("asc");
    setStatusFilter("all");
    setRowsPerPage("10");
    setCurrentPage(1);
    void showToast("info", "Filter direset");
    setIsFilterOpen(false);
  }

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  function runFilter() {
    setBusyAction("filter");
    setCurrentPage(1);
    startTransition(() => {
      void loadStudents();
    });
    setIsFilterOpen(false);
  }

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  async function handleImportSubmit() {
    // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
    if (!canImport) {
      void showToast("error", "Akses ditolak", "Role Anda tidak dapat import data.");
      return;
    }

    // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
    if (!importFile) {
      void showToast("error", "File import belum dipilih");
      return;
    }

    const extension = importFile.name.split(".").pop()?.toLowerCase();
    // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
    if (extension !== "csv" && extension !== "json") {
      void showToast("error", "Format file tidak valid", "Gunakan file CSV atau JSON.");
      return;
    }

    setBusyAction("import");

    try {
      const content = await readFileAsText(importFile);
      const response = await fetch(`${API_BASE_URL}/api/students/import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          format: extension,
          content,
        }),
      });
      const payload = await response.json();

      // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
      if (!response.ok) {
        throw new Error(payload.message || "Import gagal.");
      }

      setSelectedFileName(importFile.name);
      void showToast("success", "Import berhasil", payload.message);
      setCurrentPage(1);
      setIsImportModalOpen(false);
      setImportFile(null);
      await loadStudents();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Terjadi kesalahan.";
      void showToast("error", "Import gagal", errorMessage);
      setBusyAction(null);
    }
  }

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  async function handleExport(format: "csv" | "json") {
    // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
    if (!canExport) {
      void showToast("error", "Akses ditolak", "Role Anda tidak dapat export data.");
      return;
    }

    setBusyAction("export");
    setIsExportOpen(false);
    window.open(`${API_BASE_URL}/api/students/export?format=${format}`, "_blank");
    window.setTimeout(() => {
      setBusyAction(null);
    }, 500);
  }

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  function downloadImportTemplate(format: "csv" | "json") {
    const jsonTemplate = JSON.stringify(
      [
        {
          nim: "230100010001",
          nama: "Andi Saputra",
          email: "andi@example.com",
          tempatLahir: "Bandung",
          tanggalLahir: "2004-01-15",
          prodi: "Teknik Informatika (S1)",
          semester: 4,
          angkatan: 2023,
          status: "Reguler",
          statusAktif: "Aktif",
        },
      ],
      null,
      2
    );

    const csvTemplate = [
      "nim,nama,email,tempatLahir,tanggalLahir,prodi,semester,angkatan,status,statusAktif",
      '"230100010001","Andi Saputra","andi@example.com","Bandung","2004-01-15","Teknik Informatika (S1)","4","2023","Reguler","Aktif"',
    ].join("\n");

    const content = format === "json" ? jsonTemplate : csvTemplate;
    const mimeType =
      format === "json"
        ? "application/json;charset=utf-8"
        : "text/csv;charset=utf-8";
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `template-import-mahasiswa.${format}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  const statusFilteredStudents = useMemo(() => {
    return statusFilter === "all"
      ? students
      : students.filter((student) => student.status === statusFilter);
  }, [statusFilter, students]);

  const isShowAllRows = rowsPerPage === "-1";
  const rowsPerPageNumber = Number(rowsPerPage);
  const totalPages = Math.max(
    1,
    isShowAllRows
      ? 1
      : Math.ceil(statusFilteredStudents.length / rowsPerPageNumber)
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = isShowAllRows ? 0 : (safeCurrentPage - 1) * rowsPerPageNumber;
  const paginatedStudents = isShowAllRows
    ? statusFilteredStudents
    : statusFilteredStudents.slice(
        startIndex,
        startIndex + rowsPerPageNumber
      );

  useEffect(() => {
    setCurrentPage(1);
  }, [rowsPerPage, statusFilter]);

  const isAllVisibleSelected =
    paginatedStudents.length > 0 &&
    paginatedStudents.every((student) => selectedIds.includes(student.id));

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  function toggleSelectAll(checked: boolean) {
    // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
    if (!checked) {
      setSelectedIds((previous) =>
        previous.filter((id) => !paginatedStudents.some((student) => student.id === id))
      );
      return;
    }

    setSelectedIds((previous) => [
      ...new Set([...previous, ...paginatedStudents.map((student) => student.id)]),
    ]);
  }

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  function toggleSelectOne(id: string, checked: boolean) {
    setSelectedIds((previous) =>
      checked ? [...new Set([...previous, id])] : previous.filter((item) => item !== id)
    );
  }

  return (
    <StudentManagerView
      isBusy={isBusy}
      loading={loading}
      isPending={isPending}
      busyAction={busyAction}
      meta={meta}
      paginatedStudents={paginatedStudents}
      statusFilteredStudents={statusFilteredStudents}
      startIndex={startIndex}
      rowsPerPage={rowsPerPage}
      setRowsPerPage={setRowsPerPage}
      selectedFileName={selectedFileName}
      currentRole={currentRole}
      canCreate={canCreate}
      canEdit={canEdit}
      canDelete={canDelete}
      canImport={canImport}
      canExport={canExport}
      isExportOpen={isExportOpen}
      setIsExportOpen={setIsExportOpen}
      exportPanelRef={exportPanelRef}
      isFilterOpen={isFilterOpen}
      setIsFilterOpen={setIsFilterOpen}
      filterPanelRef={filterPanelRef}
      search={search}
      setSearch={setSearch}
      searchType={searchType}
      setSearchType={setSearchType}
      sortBy={sortBy}
      setSortBy={setSortBy}
      sortMethod={sortMethod}
      setSortMethod={setSortMethod}
      sortOrder={sortOrder}
      setSortOrder={setSortOrder}
      statusFilter={statusFilter}
      setStatusFilter={setStatusFilter}
      selectedIds={selectedIds}
      isAllVisibleSelected={isAllVisibleSelected}
      toggleSelectAll={toggleSelectAll}
      toggleSelectOne={toggleSelectOne}
      openCreateModal={openCreateModal}
      openEditModal={openEditModal}
      handleDeleteSelected={handleDeleteSelected}
      handleExport={handleExport}
      resetFilter={resetFilter}
      runFilter={runFilter}
      totalPages={totalPages}
      safeCurrentPage={safeCurrentPage}
      setCurrentPage={setCurrentPage}
      isModalOpen={isModalOpen}
      closeModal={closeModal}
      modalMode={modalMode}
      handleSubmit={handleSubmit}
      form={form}
      formErrors={formErrors}
      updateFormValue={updateFormValue}
      isImportModalOpen={isImportModalOpen}
      setIsImportModalOpen={setIsImportModalOpen}
      importFile={importFile}
      setImportFile={setImportFile}
      handleImportSubmit={handleImportSubmit}
      downloadImportTemplate={downloadImportTemplate}
    />
  );
}
