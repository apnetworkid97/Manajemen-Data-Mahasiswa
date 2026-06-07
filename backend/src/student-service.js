const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");
const {
  bubbleSort,
  insertionSort,
  selectionSort,
  mergeSort,
  shellSort,
  linearSearchByNim,
  sequentialSearchByName,
  binarySearchByNim,
} = require("./algorithms");
const { MahasiswaReguler, MahasiswaBeasiswa } = require("./models");
const {
  ValidationError,
  NotFoundError,
  FileStorageError,
} = require("./errors");
const { toCsv, parseCsv } = require("./file-utils");

const DATA_DIRECTORY = path.join(__dirname, "..", "data");
const DATA_FILE = path.join(DATA_DIRECTORY, "students.json");

const SORTERS = {
  bubble: bubbleSort,
  insertion: insertionSort,
  selection: selectionSort,
  merge: mergeSort,
  shell: shellSort,
};

const ALLOWED_STUDY_PROGRAMS = [
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

class StudentService {
  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  async ensureStorage() {
    try {
      await fs.mkdir(DATA_DIRECTORY, { recursive: true });
      await fs.access(DATA_FILE);
    } catch {
      await fs.writeFile(DATA_FILE, "[]", "utf-8");
    }
  }

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  async readStudents() {
    await this.ensureStorage();

    try {
      const raw = await fs.readFile(DATA_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      throw new FileStorageError(`Gagal membaca file data: ${error.message}`);
    }
  }

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  async writeStudents(students) {
    await this.ensureStorage();

    try {
      await fs.writeFile(DATA_FILE, JSON.stringify(students, null, 2), "utf-8");
    } catch (error) {
      throw new FileStorageError(`Gagal menyimpan file data: ${error.message}`);
    }
  }

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  validateStudentPayload(payload) {
    const nimPattern = /^\d{12}$/;
    const namePattern = /^[A-Za-z\s'.]{3,60}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const tempatLahirPattern = /^[A-Za-z\s'.-]{2,60}$/;
    const allowedStatus = ["Reguler", "Beasiswa"];
    const allowedStatusAktif = ["Aktif", "Tidak Aktif"];

    if (!nimPattern.test(String(payload.nim ?? ""))) {
      throw new ValidationError("NIM harus berupa tepat 12 digit angka.");
    }

    if (!namePattern.test(String(payload.nama ?? ""))) {
      throw new ValidationError("Nama hanya boleh berisi huruf, spasi, titik, atau apostrof.");
    }

    if (!emailPattern.test(String(payload.email ?? ""))) {
      throw new ValidationError("Format email tidak valid.");
    }

    if (!tempatLahirPattern.test(String(payload.tempatLahir ?? ""))) {
      throw new ValidationError("Tempat lahir minimal 2 karakter.");
    }

    const tanggalLahir = String(payload.tanggalLahir ?? "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggalLahir)) {
      throw new ValidationError("Tanggal lahir harus format YYYY-MM-DD.");
    }
    const parsedDate = new Date(`${tanggalLahir}T00:00:00.000Z`);
    if (Number.isNaN(parsedDate.getTime())) {
      throw new ValidationError("Tanggal lahir tidak valid.");
    }

    const prodi = String(payload.prodi ?? "").trim();
    if (!ALLOWED_STUDY_PROGRAMS.includes(prodi)) {
      throw new ValidationError("Program studi harus dipilih dari daftar yang tersedia.");
    }

    const semester = Number(payload.semester);
    if (!Number.isInteger(semester) || semester < 1 || semester > 14) {
      throw new ValidationError("Semester harus berupa angka bulat antara 1 sampai 14.");
    }

    const angkatan = Number(payload.angkatan);
    if (!Number.isInteger(angkatan) || angkatan < 2018 || angkatan > 2035) {
      throw new ValidationError("Angkatan harus berupa angka antara 2018 sampai 2035.");
    }

    if (!allowedStatus.includes(String(payload.status ?? ""))) {
      throw new ValidationError("Status mahasiswa harus Reguler atau Beasiswa.");
    }

    if (!allowedStatusAktif.includes(String(payload.statusAktif ?? ""))) {
      throw new ValidationError("Status aktif harus Aktif atau Tidak Aktif.");
    }
  }

  buildStudent(payload, id = crypto.randomUUID()) {
    this.validateStudentPayload(payload);

    const normalized = {
      id,
      nim: String(payload.nim).trim(),
      nama: String(payload.nama).trim(),
      email: String(payload.email).trim().toLowerCase(),
      tempatLahir: String(payload.tempatLahir).trim(),
      tanggalLahir: String(payload.tanggalLahir).trim(),
      prodi: String(payload.prodi).trim(),
      semester: Number(payload.semester),
      angkatan: Number(payload.angkatan),
      statusAktif: String(payload.statusAktif).trim(),
    };

    const student =
      payload.status === "Beasiswa"
        ? new MahasiswaBeasiswa(normalized)
        : new MahasiswaReguler(normalized);

    return student.toJSON();
  }

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  findStudentPointer(students, id) {
    const index = students.findIndex((student) => student.id === id);

    // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
    if (index === -1) {
      throw new NotFoundError("Data mahasiswa tidak ditemukan.");
    }

    return {
      collection: students,
      index,
      get current() {
        return students[index];
      },
      // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
      replace(nextValue) {
        students[index] = nextValue;
      },
      // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
      remove() {
        students.splice(index, 1);
      },
    };
  }

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  ensureNimIsUnique(students, nim, excludedId = null) {
    const found = students.find(
      (student) => student.nim === nim && student.id !== excludedId
    );

    // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
    if (found) {
      throw new ValidationError("NIM sudah digunakan oleh mahasiswa lain.");
    }
  }

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  applySearch(students, search, searchType) {
    // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
    if (!search) {
      return students;
    }

    // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
    if (searchType === "binary") {
      return binarySearchByNim(students, search);
    }

    // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
    if (searchType === "linear") {
      return linearSearchByNim(students, search);
    }

    return sequentialSearchByName(students, search);
  }

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  applySort(students, sortBy, sortOrder, sortMethod) {
    const sorter = SORTERS[sortMethod] || insertionSort;
    return sorter(students, sortBy, sortOrder);
  }

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  getComplexity(searchType, sortMethod) {
    const searchComplexityMap = {
      linear: "O(n)",
      sequential: "O(n)",
      binary: "O(log n) pada data terurut",
    };

    const sortComplexityMap = {
      bubble: "O(n^2)",
      insertion: "O(n^2)",
      selection: "O(n^2)",
      merge: "O(n log n)",
      shell: "Bervariasi, umum O(n log n) sampai O(n^2)",
    };

    return {
      search: searchComplexityMap[searchType] || "O(n)",
      sort: sortComplexityMap[sortMethod] || "O(n^2)",
      crudAccess: "Akses array: O(1), pencarian item saat edit/hapus: O(n)",
      exportImport: "O(n)",
    };
  }

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  async listStudents(query) {
    const students = await this.readStudents();
    const sortBy = query.sortBy || "nim";
    const sortOrder = query.sortOrder === "desc" ? "desc" : "asc";
    const sortMethod = query.sortMethod || "insertion";
    const searchType = query.searchType || "sequential";
    const search = String(query.search || "").trim();

    const searched = this.applySearch(students, search, searchType);
    const sorted = this.applySort(searched, sortBy, sortOrder, sortMethod);

    return {
      data: sorted,
      meta: {
        total: sorted.length,
        totalSemuaData: students.length,
        searchType,
        sortMethod,
        sortBy,
        sortOrder,
        complexity: this.getComplexity(searchType, sortMethod),
      },
    };
  }

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  async createStudent(payload) {
    const students = await this.readStudents();
    this.ensureNimIsUnique(students, String(payload.nim));

    const newStudent = this.buildStudent(payload);
    students.push(newStudent);
    await this.writeStudents(students);

    return newStudent;
  }

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  async updateStudent(id, payload) {
    const students = await this.readStudents();
    const pointer = this.findStudentPointer(students, id);
    this.ensureNimIsUnique(students, String(payload.nim), id);

    const updatedStudent = this.buildStudent(payload, pointer.current.id);
    pointer.replace(updatedStudent);
    await this.writeStudents(students);

    return updatedStudent;
  }

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  async deleteStudent(id) {
    const students = await this.readStudents();
    const pointer = this.findStudentPointer(students, id);
    const deleted = pointer.current;
    pointer.remove();
    await this.writeStudents(students);
    return deleted;
  }

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  async deleteManyStudents(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new ValidationError("Pilih minimal 1 data mahasiswa untuk dihapus.");
    }

    const students = await this.readStudents();
    const idSet = new Set(ids);
    const deletedStudents = students.filter((student) => idSet.has(student.id));

    // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
    if (deletedStudents.length === 0) {
      throw new NotFoundError("Data mahasiswa yang dipilih tidak ditemukan.");
    }

    const remainingStudents = students.filter((student) => !idSet.has(student.id));
    await this.writeStudents(remainingStudents);

    return {
      deletedCount: deletedStudents.length,
      deletedStudents,
    };
  }

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  async exportStudents(format) {
    const students = await this.readStudents();

    // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
    if (format === "csv") {
      return {
        contentType: "text/csv; charset=utf-8",
        fileName: "data-mahasiswa.csv",
        body: toCsv(students),
      };
    }

    return {
      contentType: "application/json; charset=utf-8",
      fileName: "data-mahasiswa.json",
      body: JSON.stringify(students, null, 2),
    };
  }

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  async importStudents(format, content) {
    if (!content || !String(content).trim()) {
      throw new ValidationError("Isi file import tidak boleh kosong.");
    }

    let parsedStudents;

    // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
    if (format === "csv") {
      parsedStudents = parseCsv(content);
    } else if (format === "json") {
      parsedStudents = JSON.parse(content);
    } else {
      throw new ValidationError("Format import harus csv atau json.");
    }

    if (!Array.isArray(parsedStudents)) {
      throw new ValidationError("File JSON harus berisi array data mahasiswa.");
    }

    const normalizedStudents = [];

    // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
    for (const item of parsedStudents) {
      this.ensureNimIsUnique(normalizedStudents, String(item.nim));
      const student = this.buildStudent(item, item.id || crypto.randomUUID());
      normalizedStudents.push(student);
    }

    await this.writeStudents(normalizedStudents);

    return {
      imported: normalizedStudents.length,
      students: normalizedStudents,
    };
  }
}

module.exports = {
  StudentService,
};
