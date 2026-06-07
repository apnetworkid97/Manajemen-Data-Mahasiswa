const { ValidationError } = require("./errors");

// Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
function toCsv(students) {
  const headers = [
    "id",
    "nim",
    "nama",
    "email",
    "tempatLahir",
    "tanggalLahir",
    "prodi",
    "semester",
    "angkatan",
    "status",
    "statusAktif",
  ];

  const rows = students.map((student) =>
    headers
      .map((header) => {
        const value = String(student[header] ?? "");
        return `"${value.replaceAll('"', '""')}"`;
      })
      .join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}

// Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
function parseCsv(content) {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  if (lines.length < 2) {
    throw new ValidationError("File CSV minimal harus memiliki header dan 1 baris data.");
  }

  const headers = splitCsvLine(lines[0]);
  const requiredHeaders = [
    "nim",
    "nama",
    "email",
    "tempatLahir",
    "tanggalLahir",
    "prodi",
    "semester",
    "angkatan",
    "status",
    "statusAktif",
  ];

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  for (const header of requiredHeaders) {
    if (!headers.includes(header)) {
      throw new ValidationError(`Header CSV '${header}' tidak ditemukan.`);
    }
  }

  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    const item = {};

    headers.forEach((header, index) => {
      item[header] = values[index] ?? "";
    });

    return item;
  });
}

// Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
function splitCsvLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const nextChar = line[i + 1];

    // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
    if (char === '"' && nextChar === '"') {
      current += '"';
      i += 1;
      continue;
    }

    // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values.map((value) => value.trim());
}

module.exports = {
  toCsv,
  parseCsv,
};
