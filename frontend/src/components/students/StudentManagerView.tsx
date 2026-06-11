"use client";

import React from "react";
import Badge from "@/components/ui/badge/Badge";
import { Modal } from "@/components/ui/modal";
import Checkbox from "@/components/form/input/Checkbox";
import type { UserRole } from "@/types/auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

const STUDY_PROGRAM_GROUPS = [
  {
    faculty: "Fakultas Teknik",
    options: [
      "Teknik Informatika (S1)",
      "Teknik Industri (S1)",
      "Teknik Mesin (S1)",
      "Teknik Elektro (S1)",
      "Teknik Kimia (S1)",
    ],
  },
  {
    faculty: "Fakultas Hukum",
    options: ["Ilmu Hukum (S1)"],
  },
  {
    faculty: "Fakultas Ekonomi dan Bisnis",
    options: ["Manajemen (S1)", "Akuntansi (S1)"],
  },
  {
    faculty: "Fakultas Keguruan dan Ilmu Pendidikan (FKIP)",
    options: [
      "Pendidikan Pancasila dan Kewarganegaraan (PPKn) (S1)",
      "Pendidikan Ekonomi (S1)",
      "Pendidikan Jasmani (S1)",
    ],
  },
  {
    faculty: "Fakultas Sastra & Ilmu Komunikasi",
    options: ["Sastra Indonesia (S1)", "Sastra Inggris (S1)"],
  },
  {
    faculty: "Fakultas MIPA & Lainnya",
    options: ["Matematika (S1)"],
  },
] as const;

type ModalMode = "create" | "edit";
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
type FormErrors = Partial<Record<keyof StudentFormState, string>>;

interface StudentManagerViewProps {
  isBusy: boolean;
  loading: boolean;
  isPending: boolean;
  busyAction: BusyAction;
  meta: StudentMeta;
  loadDurationMs: number;
  paginatedStudents: Student[];
  filteredTotal: number;
  startIndex: number;
  rowsPerPage: string;
  onRowsPerPageChange: (value: string) => void;
  selectedFileName: string;
  currentRole: UserRole;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canImport: boolean;
  canExport: boolean;
  isExportOpen: boolean;
  setIsExportOpen: React.Dispatch<React.SetStateAction<boolean>>;
  exportPanelRef: React.RefObject<HTMLDivElement | null>;
  isFilterOpen: boolean;
  setIsFilterOpen: React.Dispatch<React.SetStateAction<boolean>>;
  filterPanelRef: React.RefObject<HTMLDivElement | null>;
  search: string;
  setSearch: (value: string) => void;
  searchType: SearchType;
  setSearchType: (value: SearchType) => void;
  sortBy: SortField;
  setSortBy: (value: SortField) => void;
  sortMethod: SortMethod;
  setSortMethod: (value: SortMethod) => void;
  sortOrder: SortOrder;
  setSortOrder: (value: SortOrder) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
  selectedIds: string[];
  isAllVisibleSelected: boolean;
  toggleSelectAll: (checked: boolean) => void;
  toggleSelectOne: (id: string, checked: boolean) => void;
  openCreateModal: () => void;
  openEditModal: (student: Student) => void;
  handleDeleteSelected: () => void;
  handleExport: (format: "csv" | "json") => void;
  resetFilter: () => void;
  runFilter: () => void;
  totalPages: number;
  safeCurrentPage: number;
  onPageChange: (page: number) => void;
  isModalOpen: boolean;
  closeModal: () => void;
  modalMode: ModalMode;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  form: StudentFormState;
  formErrors: FormErrors;
  updateFormValue: (
    key: keyof StudentFormState,
    value: string | StudentStatus,
  ) => void;
  isImportModalOpen: boolean;
  setIsImportModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  importFile: File | null;
  setImportFile: React.Dispatch<React.SetStateAction<File | null>>;
  handleImportSubmit: () => void;
  downloadImportTemplate: (format: "csv" | "json") => void;
}
//Fungsi Menghitung time complexity
// function estimateTimeMs(complexity: string, n: number): number {
//   const operationCost = 0.000001; // ms per operasi
//   let operations = 0;

//   switch (complexity) {
//     case "O(1)":
//       operations = 1;
//       break;

//     case "O(log n)":
//       operations = Math.log2(n);
//       break;

//     case "O(n)":
//       operations = n;
//       break;

//     case "O(n log n)":
//       operations = n * Math.log2(n);
//       break;

//     case "O(n^2)":
//       operations = n * n;
//       break;

//     case "O(n^3)":
//       operations = n * n * n;
//       break;

//     default:
//       return 0;
//   }

//   return operations * operationCost;
// }

// Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
export default function StudentManagerView({
  isBusy,
  loading,
  isPending,
  busyAction,
  meta,
  loadDurationMs,
  paginatedStudents,
  filteredTotal,
  startIndex,
  rowsPerPage,
  onRowsPerPageChange,
  selectedFileName,
  currentRole,
  canCreate,
  canEdit,
  canDelete,
  canImport,
  canExport,
  isExportOpen,
  setIsExportOpen,
  exportPanelRef,
  isFilterOpen,
  setIsFilterOpen,
  filterPanelRef,
  search,
  setSearch,
  searchType,
  setSearchType,
  sortBy,
  setSortBy,
  sortMethod,
  setSortMethod,
  sortOrder,
  setSortOrder,
  statusFilter,
  onStatusFilterChange,
  selectedIds,
  isAllVisibleSelected,
  toggleSelectAll,
  toggleSelectOne,
  openCreateModal,
  openEditModal,
  handleDeleteSelected,
  handleExport,
  resetFilter,
  runFilter,
  totalPages,
  safeCurrentPage,
  onPageChange,
  isModalOpen,
  closeModal,
  modalMode,
  handleSubmit,
  form,
  formErrors,
  updateFormValue,
  isImportModalOpen,
  setIsImportModalOpen,
  importFile,
  setImportFile,
  handleImportSubmit,
  downloadImportTemplate,
}: StudentManagerViewProps) {
  const visiblePages = getVisiblePages(safeCurrentPage, totalPages);
  const visibleRowEnd = Math.min(
    startIndex + paginatedStudents.length,
    filteredTotal,
  );
  const loadDurationLabel = formatLoadDuration(loadDurationMs);
  const roleDescription =
    currentRole === "admin"
      ? "Admin: akses penuh termasuk registrasi user dan seluruh data mahasiswa."
      : currentRole === "operator"
        ? "Operator: tambah, edit, dan export data mahasiswa."
        : "Viewer: hanya melihat data mahasiswa.";

  return (
    <div className="space-y-6">
      <TopLoadingBar isBusy={isBusy} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          title="Total Seluruh Data"
          value={String(meta.totalSemuaData)}
          subtitle="data yang tersimpan di file"
        />
        <MetricCard
  title="Kompleksitas Search"
  value={meta.complexity.search}
  subtitle={`Execution: ${meta.executionTime.search.toFixed(2)} ms`}
/>

<MetricCard
  title="Kompleksitas Sort"
  value={meta.complexity.sort}
  subtitle={`Execution: ${meta.executionTime.sort.toFixed(2)} ms`}
/>
      </div>

      <div className="rounded-2xl border border-blue-light-200 bg-blue-light-50 px-4 py-3 text-sm text-blue-light-700 dark:border-blue-light-500/30 dark:bg-blue-light-500/10 dark:text-blue-light-400">
        Role aktif:{" "}
        <span className="font-semibold capitalize">{currentRole}</span>.{" "}
        {roleDescription}
      </div>

      <div className="rounded-[26px] border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-white/[0.03] sm:p-7">
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex flex-wrap gap-3">
            {canCreate ? (
              <ActionButton
                label="Add Item"
                icon="+"
                variant="primary"
                loading={busyAction === "submit" && isModalOpen}
                onClick={openCreateModal}
              />
            ) : null}

            {canExport ? (
              <div ref={exportPanelRef} className="relative">
                <ActionButton
                  label="Export File"
                  icon="↓"
                  loading={busyAction === "export"}
                  onClick={() => setIsExportOpen((previous) => !previous)}
                />
                {isExportOpen ? (
                  <div className="absolute left-0 top-14 z-30 w-[180px] rounded-2xl border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-800 dark:bg-gray-900">
                    <button
                      type="button"
                      className="block w-full rounded-xl px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/5"
                      onClick={() => handleExport("csv")}
                    >
                      Export CSV
                    </button>
                    <button
                      type="button"
                      className="block w-full rounded-xl px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/5"
                      onClick={() => handleExport("json")}
                    >
                      Export JSON
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}

            {canImport ? (
              <ActionButton
                label="Import File"
                icon="↑"
                loading={busyAction === "import"}
                onClick={() => setIsImportModalOpen(true)}
              />
            ) : null}

            {canDelete ? (
              <button
                type="button"
                disabled={selectedIds.length === 0 || isBusy}
                className={`rounded-xl border px-5 py-3 text-sm font-medium transition dark:border-gray-700 ${
                  selectedIds.length === 0 || isBusy
                    ? "cursor-not-allowed border-gray-300 text-gray-400"
                    : "border-error-200 text-error-600 hover:bg-error-50 dark:border-error-500/30"
                }`}
                onClick={handleDeleteSelected}
              >
                {busyAction === "bulk-delete"
                  ? "Menghapus..."
                  : `Delete Selected (${selectedIds.length})`}
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-3 self-start rounded-xl border border-gray-300 bg-white p-1 dark:border-gray-700 dark:bg-gray-900">
            {(["all", "Reguler", "Beasiswa"] as const).map((item) => (
              <button
                key={item}
                type="button"
                className={`rounded-lg px-4 py-1.5 text-sm font-medium ${
                  statusFilter === item
                    ? "bg-brand-500 text-white"
                    : "text-gray-600 dark:text-gray-300"
                }`}
                onClick={() => onStatusFilterChange(item)}
              >
                {item === "all" ? "All" : item}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="w-[96px]">
            <select
              value={rowsPerPage}
              onChange={(event) => onRowsPerPageChange(event.target.value)}
              className="h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-800 outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              <option value="10">10</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
              <option value="-1">All</option>
            </select>
          </div>

          <div
            ref={filterPanelRef}
            className="relative flex w-full flex-col gap-3 xl:w-auto xl:min-w-[430px]"
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={search}
                placeholder="Search nim/nama..."
                onChange={(event) => setSearch(event.target.value)}
                className="h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-800 outline-none transition focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
              <button
                type="button"
                className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-transparent dark:text-gray-200 dark:hover:bg-white/5"
                onClick={() => setIsFilterOpen((previous) => !previous)}
              >
                Filter
              </button>
            </div>

            {isFilterOpen ? (
              <div className="right-0 top-14 z-20 origin-top-right rounded-2xl border border-gray-200 bg-white p-4 shadow-lg transition-all duration-200 ease-out dark:border-gray-800 dark:bg-gray-900 xl:absolute xl:w-[320px]">
                <div className="space-y-4">
                  <SelectField
                    label="Status"
                    value={statusFilter}
                    onChange={(value) =>
                      onStatusFilterChange(value as StatusFilter)
                    }
                    options={[
                      { value: "all", label: "All" },
                      { value: "Reguler", label: "Reguler" },
                      { value: "Beasiswa", label: "Beasiswa" },
                    ]}
                  />
                  <SelectField
                    label="Metode Search"
                    value={searchType}
                    onChange={(value) => setSearchType(value as SearchType)}
                    options={[
                      { value: "sequential", label: "Sequential Search" },
                      { value: "linear", label: "Linear Search" },
                      { value: "binary", label: "Binary Search" },
                    ]}
                  />
                  <SelectField
                    label="Sort By"
                    value={sortBy}
                    onChange={(value) => setSortBy(value as SortField)}
                    options={[
                      { value: "nim", label: "NIM" },
                      { value: "nama", label: "Nama" },
                      { value: "semester", label: "Semester" },
                      { value: "angkatan", label: "Angkatan" },
                      { value: "prodi", label: "Program Studi" },
                    ]}
                  />
                  <SelectField
                    label="Sort Method"
                    value={sortMethod}
                    onChange={(value) => setSortMethod(value as SortMethod)}
                    options={[
                      { value: "merge", label: "Merge" },
                      { value: "shell", label: "Shell" },
                      { value: "insertion", label: "Insertion" },
                      { value: "bubble", label: "Bubble" },
                      { value: "selection", label: "Selection" },
                    ]}
                  />
                  <SelectField
                    label="Sort Direction"
                    value={sortOrder}
                    onChange={(value) => setSortOrder(value as SortOrder)}
                    options={[
                      { value: "asc", label: "ASC" },
                      { value: "desc", label: "DESC" },
                    ]}
                  />
                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/5"
                      onClick={resetFilter}
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      className="w-full rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
                      onClick={runFilter}
                    >
                      {busyAction === "filter" ? "Loading..." : "Apply"}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-white/[0.05]">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  {canDelete ? (
                    <TableCell
                      isHeader
                      className="w-[56px] px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                    >
                      <Checkbox
                        checked={isAllVisibleSelected}
                        onChange={toggleSelectAll}
                      />
                    </TableCell>
                  ) : null}
                  {[
                    "NIM",
                    "Nama Mahasiswa",
                    "TTL",
                    "Program Studi",
                    "Semester",
                    "Status",
                    "Status Aktif",
                  ].map((heading) => (
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
                {paginatedStudents.length === 0 ? (
                  <TableRow>
                    <TableCell
                      className="px-5 py-8 text-sm text-gray-500"
                      colSpan={canDelete ? 8 : 7}
                    >
                      Tidak ada data mahasiswa yang cocok dengan filter saat
                      ini.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedStudents.map((student) => (
                    <TableRow
                      key={student.id}
                      className={`${canEdit ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02]" : ""} transition`}
                      onClick={
                        canEdit ? () => openEditModal(student) : undefined
                      }
                    >
                      {canDelete ? (
                        <TableCell
                          className="px-4 py-5"
                          onClick={(
                            event: React.MouseEvent<HTMLTableCellElement>,
                          ) => event.stopPropagation()}
                        >
                          <Checkbox
                            checked={selectedIds.includes(student.id)}
                            onChange={(checked) =>
                              toggleSelectOne(student.id, checked)
                            }
                          />
                        </TableCell>
                      ) : null}
                      <TableCell className="px-4 py-5 text-sm font-medium text-gray-800 dark:text-white/90">
                        {student.nim}
                      </TableCell>
                      <TableCell className="px-4 py-5 text-sm text-gray-700 dark:text-gray-200">
                        <div>
                          <p className="font-medium">{student.nama}</p>
                          <p className="mt-1 text-xs text-gray-500">
                            {student.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-5 text-sm text-gray-700 dark:text-gray-200">
                        {student.tempatLahir}, {student.tanggalLahir}
                      </TableCell>
                      <TableCell className="px-4 py-5 text-sm text-gray-700 dark:text-gray-200">
                        {student.prodi}
                      </TableCell>
                      <TableCell className="px-4 py-5 text-sm text-gray-700 dark:text-gray-200">
                        {student.semester}
                      </TableCell>
                      <TableCell className="px-4 py-5 text-sm">
                        <Badge
                          size="sm"
                          color={
                            student.status === "Beasiswa"
                              ? "warning"
                              : "success"
                          }
                        >
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-5 text-sm">
                        <Badge
                          size="sm"
                          color={
                            student.statusAktif === "Aktif"
                              ? "success"
                              : "error"
                          }
                        >
                          {student.statusAktif}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-4 border-t border-gray-100 pt-5 text-sm text-gray-500 dark:border-white/[0.05] dark:text-gray-400">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="flex flex-wrap items-center gap-3">
              {loading || isPending
                ? "Memuat data..."
                : `Showing ${filteredTotal === 0 ? 0 : startIndex + 1} to ${visibleRowEnd} of ${filteredTotal}`}
              {selectedFileName ? (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 dark:bg-white/[0.05] dark:text-gray-300">
                  Import terakhir: {selectedFileName}
                </span>
              ) : null}
            </span>
            <span>
              Search: {meta.searchType} | Sort: {meta.sortMethod} (
              {meta.sortOrder})
            </span>
          </div>

          <div className="flex flex-wrap justify-end">
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={safeCurrentPage === 1}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200"
                onClick={() => onPageChange(safeCurrentPage - 1)}
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
                      safeCurrentPage === page
                        ? "bg-brand-500 text-white"
                        : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/5"
                    }`}
                    onClick={() => onPageChange(page)}
                  >
                    {page}
                  </button>
                ),
              )}

              <button
                type="button"
                disabled={safeCurrentPage === totalPages}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200"
                onClick={() => onPageChange(safeCurrentPage + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ComplexityBox
          title="Pencarian"
          value={meta.complexity.search}
          description={`Metode aktif: ${meta.searchType}`}
        />
        <ComplexityBox
          title="Pengurutan"
          value={meta.complexity.sort}
          description={`Metode aktif: ${meta.sortMethod}`}
        />
        <ComplexityBox
          title="CRUD Array"
          value={meta.complexity.crudAccess}
          description="Edit dan hapus mencari index data dulu."
        />
        <ComplexityBox
          title="Import / Export"
          value={meta.complexity.exportImport}
          description="Proses file dibaca per elemen data."
        />
      </div> */}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        className="m-4 max-w-[760px]"
      >
        <div className="p-6 sm:p-8">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              {modalMode === "edit"
                ? "Edit Data Mahasiswa"
                : "Input Data Mahasiswa"}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Semua field wajib diisi dengan format yang benar.
            </p>
          </div>

          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <Field
              label="NIM"
              value={form.nim}
              onChange={(value) => updateFormValue("nim", value)}
              placeholder="230100010001"
              error={formErrors.nim}
            />
            <Field
              label="Nama Mahasiswa"
              value={form.nama}
              onChange={(value) => updateFormValue("nama", value)}
              placeholder="Andi Saputra"
              error={formErrors.nama}
            />
            <Field
              label="Email"
              type="email"
              value={form.email}
              onChange={(value) => updateFormValue("email", value)}
              placeholder="andi@example.com"
              error={formErrors.email}
            />
            <Field
              label="Tempat Lahir"
              value={form.tempatLahir}
              onChange={(value) => updateFormValue("tempatLahir", value)}
              placeholder="Bandung"
              error={formErrors.tempatLahir}
            />
            <Field
              label="Tanggal Lahir"
              type="date"
              value={form.tanggalLahir}
              onChange={(value) => updateFormValue("tanggalLahir", value)}
              placeholder="2004-01-15"
              error={formErrors.tanggalLahir}
            />
            <StudyProgramSelectField
              label="Program Studi"
              value={form.prodi}
              onChange={(value) => updateFormValue("prodi", value)}
              error={formErrors.prodi}
            />
            <Field
              label="Semester"
              type="number"
              value={form.semester}
              onChange={(value) => updateFormValue("semester", value)}
              placeholder="4"
              error={formErrors.semester}
            />
            <Field
              label="Angkatan"
              type="number"
              value={form.angkatan}
              onChange={(value) => updateFormValue("angkatan", value)}
              placeholder="2023"
              error={formErrors.angkatan}
            />
            <SelectField
              label="Status Mahasiswa"
              value={form.status}
              onChange={(value) =>
                updateFormValue("status", value as StudentStatus)
              }
              options={[
                { value: "Reguler", label: "Reguler" },
                { value: "Beasiswa", label: "Beasiswa" },
              ]}
            />
            <SelectField
              label="Status Aktif"
              value={form.statusAktif}
              onChange={(value) => updateFormValue("statusAktif", value)}
              options={[
                { value: "Aktif", label: "Aktif" },
                { value: "Tidak Aktif", label: "Tidak Aktif" },
              ]}
            />

            <div className="flex flex-wrap items-end gap-3 md:col-span-2">
              <button
                type="submit"
                disabled={isBusy}
                className="rounded-xl bg-brand-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {busyAction === "submit"
                  ? "Menyimpan..."
                  : modalMode === "edit"
                    ? "Update Data"
                    : "Simpan Data"}
              </button>
              <button
                type="button"
                className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/5"
                onClick={closeModal}
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      </Modal>

      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        className="m-4 max-w-[640px]"
      >
        <div className="p-6 sm:p-8">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Import Data Mahasiswa
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Download template format import, lalu upload file CSV atau JSON.
            </p>
          </div>

          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                className="rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/5"
                onClick={() => downloadImportTemplate("csv")}
              >
                Download Template CSV
              </button>
              <button
                type="button"
                className="rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/5"
                onClick={() => downloadImportTemplate("json")}
              >
                Download Template JSON
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Pilih File Import
              </label>
              <input
                type="file"
                accept=".csv,.json"
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  setImportFile(file);
                }}
                className="block w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-brand-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
              />
              {importFile ? (
                <p className="text-xs text-gray-500">
                  File dipilih: {importFile.name}
                </p>
              ) : null}
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-300">
              Format field wajib:
              <span className="mt-2 block font-mono text-xs">
                nim, nama, email, tempatLahir, tanggalLahir, prodi, semester,
                angkatan, status, statusAktif
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={busyAction === "import"}
                className="rounded-xl bg-brand-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-70"
                onClick={handleImportSubmit}
              >
                {busyAction === "import" ? "Mengimport..." : "Import Data"}
              </button>
              <button
                type="button"
                className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/5"
                onClick={() => setIsImportModalOpen(false)}
              >
                Batal
              </button>
            </div>
          </div>
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
    return [
      1,
      "ellipsis-left",
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ] as const;
  }

  return [
    1,
    "ellipsis-left",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis-right",
    totalPages,
  ] as const;
}

// Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
function TopLoadingBar({ isBusy }: { isBusy: boolean }) {
  return (
    <div className="pointer-events-none fixed left-0 right-0 top-0 z-[1000001] h-1 bg-transparent">
      <div
        className={`h-full bg-brand-500 transition-all duration-300 ${
          isBusy ? "w-4/5 opacity-100" : "w-full opacity-0"
        }`}
      />
    </div>
  );
}

// Mengubah durasi milidetik menjadi tampilan yang lebih mudah dibaca mahasiswa.
function formatLoadDuration(durationMs: number) {
  if (durationMs < 1000) {
    return `${Math.round(durationMs)} ms`;
  }

  if (durationMs < 60000) {
    return `${(durationMs / 1000).toFixed(2)} s`;
  }

  return `${(durationMs / 60000).toFixed(2)} menit`;
}

// Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
function ActionButton({
  label,
  icon,
  loading = false,
  variant = "secondary",
  onClick,
}: {
  label: string;
  icon: string;
  loading?: boolean;
  variant?: "primary" | "secondary";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={loading}
      className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-70 ${
        variant === "primary"
          ? "bg-brand-500 text-white hover:bg-brand-600"
          : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-transparent dark:text-gray-200 dark:hover:bg-white/5"
      }`}
      onClick={onClick}
    >
      {loading ? (
        <Spinner />
      ) : (
        <span className="text-base leading-none">{icon}</span>
      )}
      {label}
    </button>
  );
}

// Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
function Spinner() {
  return (
    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
  );
}

// Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
function MetricCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: React.ReactNode;
  subtitle: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4 dark:border-gray-800 dark:bg-white/[0.03]">
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
        {value}
      </p>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        {subtitle}
      </p>
    </div>
  );
}

// Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: React.HTMLInputTypeAttribute;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
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

// Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
function StudyProgramSelectField({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`h-11 w-full rounded-xl border bg-white px-4 text-sm text-gray-800 outline-none transition dark:bg-gray-900 dark:text-white/90 ${
          error
            ? "border-error-500 focus:border-error-500 dark:border-error-500"
            : "border-gray-300 focus:border-brand-500 dark:border-gray-700"
        }`}
      >
        {STUDY_PROGRAM_GROUPS.map((group) => (
          <optgroup key={group.faculty} label={group.faculty}>
            {group.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      {error ? <p className="text-xs text-error-600">{error}</p> : null}
    </div>
  );
}
