const {
  bubbleSort,
  insertionSort,
  selectionSort,
  mergeSort,
  shellSort,
  linearSearchByNim,
  sequentialSearchByName,
  binarySearchByNim,
} = require("../src/algorithms");

const STUDY_PROGRAMS = [
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

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateStudents(total) {
  const data = [];
  const usedNim = new Set();

  while (data.length < total) {
    const nim = String(230100000000 + randomInt(1, 899999)).padStart(12, "0");
    if (usedNim.has(nim)) {
      continue;
    }

    usedNim.add(nim);
    const index = data.length + 1;
    data.push({
      id: `bench-${index}`,
      nim,
      nama: `Mahasiswa ${index}`,
      email: `mahasiswa${index}@example.com`,
      tempatLahir: "Bandung",
      tanggalLahir: "2004-01-01",
      prodi: STUDY_PROGRAMS[index % STUDY_PROGRAMS.length],
      semester: randomInt(1, 8),
      angkatan: randomInt(2020, 2026),
      status: index % 4 === 0 ? "Beasiswa" : "Reguler",
      statusAktif: index % 5 === 0 ? "Tidak Aktif" : "Aktif",
    });
  }

  return data;
}

function measureMs(fn) {
  const start = process.hrtime.bigint();
  fn();
  const end = process.hrtime.bigint();
  return Number(end - start) / 1_000_000;
}

function avgMs(fn, repeat = 3) {
  const samples = [];
  for (let i = 0; i < repeat; i += 1) {
    samples.push(measureMs(fn));
  }
  return samples.reduce((a, b) => a + b, 0) / samples.length;
}

function runBenchmark() {
  const sizes = [100, 1000, 3000];
  const rows = [];

  sizes.forEach((n) => {
    const students = generateStudents(n);
    const searchNim = students[Math.floor(n / 2)].nim;
    const searchNameKeyword = "Mahasiswa";

    rows.push({
      n,
      linear_search_ms: avgMs(() => linearSearchByNim(students, searchNim)),
      sequential_search_ms: avgMs(() =>
        sequentialSearchByName(students, searchNameKeyword)
      ),
      binary_search_ms: avgMs(() => binarySearchByNim(students, searchNim)),
      insertion_sort_ms: avgMs(() => insertionSort(students, "nama", "asc")),
      selection_sort_ms: avgMs(() => selectionSort(students, "nama", "asc")),
      bubble_sort_ms: avgMs(() => bubbleSort(students, "nama", "asc")),
      shell_sort_ms: avgMs(() => shellSort(students, "nama", "asc")),
      merge_sort_ms: avgMs(() => mergeSort(students, "nama", "asc")),
    });
  });

  console.table(
    rows.map((row) => ({
      n: row.n,
      linear: row.linear_search_ms.toFixed(3),
      sequential: row.sequential_search_ms.toFixed(3),
      binary: row.binary_search_ms.toFixed(3),
      insertion: row.insertion_sort_ms.toFixed(3),
      selection: row.selection_sort_ms.toFixed(3),
      bubble: row.bubble_sort_ms.toFixed(3),
      shell: row.shell_sort_ms.toFixed(3),
      merge: row.merge_sort_ms.toFixed(3),
    }))
  );
}

runBenchmark();
