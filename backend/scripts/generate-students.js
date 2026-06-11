const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");

const DATA_FILE = path.join(__dirname, "..", "data", "students.json");

const firstNames = [
  "farah",
  "Andi",
  "Budi",
  "Citra",
  "Dewa",
  "Eka",
  "Fajar",
  "Gita",
  "Hana",
  "Intan",
  "Joko",
  "aditya",
  "agus",
  "Rizky",
  "Adinda",
  "Bayu",
  "Chelsea",
  "Dimas",
  "Evelyn",
  "Fahri",
  "Ghea",
  "Haikal",
  "Iqbal",
  "Jessica",
  "Kevin",
  "Luna",
  "Mikael",
  "Nadia",
  "Omar",
  "Queen",
  "Rafa",
  "Sarah",
  "Tasya",
  "Vina",
  "Wahyu",
  "Zara",
  "Gilang",
  "Andhika",
  "Bintang",
  "Cahya",
  "Dian",
  "Elisa",
  "Fery",
  "Gibran",
  "Hasbi",
  "Ilham",
  "Jasmine",
  "Keisha",
  "Lambda",
  "Mira",
  "Naufal",
  "Octavia",
  "Rizqi",
  "Sari",
  "Taufik",
  "Vivian",
  "Wijaya",
  "Yusra",
  "Zaky",
  "Alif",
  "Bayuangga",
  "Aldebaran",
  "Bima",
  "Citrakanti",
  "Deandra",
  "Elverna",
  "Fauzan",
  "Ganesa",
  "Hafiz",
  "Indira",
  "Jihan",
  "Kalila",
  "Laras",
  "Maulina",
  "Nugraha",
  "Olivia",
  "Qori",
  "Rahmat",
  "Sinta",
  "Tirta",
  "Vivienne",
  "Wisnu",
  "Yuniar",
  "Zainab",
  "Arya",
  "Bayuputra",
  "Abimana",
  "Baskara",
  "Citayamitra",
  "Devan",
  "Emeliana",
  "Fadli",
  "Genta",
  "Hanif",
  "Irfan",
  "Juwita",
  "Kania",
  "Lutfi",
  "Maisqooh",
  "Naufal",
  "Okta",
  "Rizkiya",
  "Siska",
  "Tian",
  "Vanya",
  "Wira",
  "Yoga",
  "Zaskia",
  "Aisyah",
  "Bahwa",
  "Cakra",
  "Dion",
  "Elza",
  "Febrianti",
  "Galuh",
  "Hanum",
  "Izzat",
  "Jovita",
  "Kenanga",
  "Laila",
  "Mahendra",
  "Nuraini",
  "Opal",
  "Risa",
  "Syafira",
  "Triyana",
  "Vania",
  "Wahida",
  "Yulian",
  "Zoe",
];

const lastNames = [
  "nurjannah", "Saputra", "Pratama", "Lestari", "Maharani", "Nugroho", "Putri", 
  "Wijaya", "Kusuma", "Firmansyah", "Ramadhan", "prakoso",
  "Setiawan", "Dewi", "Susanto", "Handayani", "Wijono", "Permana", "Wibowo", "Ajipto", 
  "Santosa", "Hartati", "Paramita", "Setyoadi", "Prayoga", "Aditama", "Wijaya", "Septika", 
  "Kartika", "Anggraeni", "Hasriadi", "Budiyanti", "Saputro", "Wulandari",
  "Susilo", "Pranata", "Dewiarti", "Handoko", "Wardoyo", "Yudhoyono", "Siregar", "Simanjuntak", 
  "Tambunan", "Suharno", "Widodo", "Santoso", "Utomo", "Gunawan", "Pramono", "Sudarto", 
  "Susanti", "Kartikawati", "Wahyudi", "Fajaruddin", "Nugrohojo", "Siregar",
  "Setjati", "Paramita Sari", "Laksana", "Saputri", "Susilawati", "Pratama Negara", "Winarno", "Adhikari", 
  "Kumalasari", "Wijayanti", "Tamboyono", "Gunadi", "Setyabudi", "Puspitasari", "Harjanto", "Basuki", 
  "Wicaksono", "Dewanti", "Prasetyo", "Saputro", "Winarsih", "Ambarwati",
  "Aryadhana", "Baskoro", "Citrawati", "Dharmawan", "Eko", "Fauzi", "Girianto", "Hanifuddin", 
  "Indrawati", "Jaya", "Kaldi", "Luhormanti", "Maulida", "Nugraha", "Octavia Sari", "Rizaldi", "Sariputri", 
  "Tiangara", "Vardana", "Wibisono", "Yulianti", "Zulfikar", "Akmal", "Bachtiar", "Cakrawala", "Darmadi", 
  "Elokawati", "Febriyanti", "Galih", "Hasbullah", "Ilmi", "Juwantari", "Kuswanto", "Lubis", "Magde", "Rizkyan"
];

const prodiList = [
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
const kotaLahirList = [
  //Jawa & Sekitarnya (Jawa Barat, DIY, Jawa Tengah, Jawa Timur)
  "Jakarta", "Bogor", "Bandung", "Yogyakarta", "Solo", "Semarang", 
  "Malang", "Kediri", "Tegal", "Pekalongan", "Magelang", "Purwokerto", 
  "Kebon Kawangi", "Banyuwangi", "Probolinggo",

  //Sumatra (Meliputi Sumatera Utara, Aceh, Riau, Jambi, dll.)
  "Medan", "Palembang", "Pekanbaru", "Tanjungpinang", "Bengkulu", 
  "Padang", "Sibolga", "Binjai", "Sungai Kepayang", "Bukittinggi",

  //Kalimantan (Borneo)
  "Banjarmasin", "Samarinda", "Palangka Raya", "Pontianak", "Singkawang",

  //Sulawesi & Timur Indonesia
  "Makassar", "Manado", "Kendari", "Mamuju", // Sulawesi
  "Denpasar", "Kuta", "Mataram", // Bali
  "Ambon", "Tual", "Bau-Bau", // Maluku
  "Jayapura", "Waingapu", "Timika", // Papua & Papua Timur

  //Daerah Lain yang Penting (Representatif)
  "Palopo", "Raja Ampat", "Samaritigunggal", "Singkawang", 
];

function randomFrom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateNim(existingNims) {
  let nim = "";
  do {
    nim = String(randomInt(202300, 202699)) + String(randomInt(100000, 999999));
  } while (existingNims.has(nim));
  existingNims.add(nim);
  return nim;
}

function makeStudent(index, existingNims) {
  const nama = `${randomFrom(firstNames)} ${randomFrom(lastNames)}`;
  const nim = generateNim(existingNims);
  const email = `${nama.toLowerCase().replace(/\s+/g, ".")}${index}@example.com`;

  return {
    id: crypto.randomUUID(),
    nim,
    nama,
    email,
    tempatLahir: randomFrom(kotaLahirList),
    tanggalLahir: `${randomInt(2000, 2006)}-${String(randomInt(1, 12)).padStart(2, "0")}-${String(randomInt(1, 28)).padStart(2, "0")}`,
    prodi: randomFrom(prodiList),
    semester: randomInt(1, 8),
    angkatan: randomInt(2020, 2026),
    status: Math.random() > 0.7 ? "Beasiswa" : "Reguler",
    statusAktif: Math.random() > 0.15 ? "Aktif" : "Tidak Aktif",
  };
}

async function run() {
  const countArg = Number(process.argv[2] || 50);
  const mode = (process.argv[3] || "append").toLowerCase();
  const total = Number.isInteger(countArg) && countArg > 0 ? countArg : 50;

  let current = [];
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    current = Array.isArray(parsed) ? parsed : [];
  } catch {
    current = [];
  }

  const base = mode === "replace" ? [] : current;
  const existingNims = new Set(base.map((student) => String(student.nim)));
  const generated = [];

  for (let i = 0; i < total; i += 1) {
    generated.push(makeStudent(i + 1, existingNims));
  }

  const result = [...base, ...generated];
  await fs.writeFile(DATA_FILE, JSON.stringify(result, null, 2), "utf-8");

  console.log(`Berhasil generate ${generated.length} data mahasiswa (mode: ${mode}). Total data sekarang: ${result.length}.`);
}

run().catch((error) => {
  console.error(`Gagal generate data: ${error.message}`);
  process.exit(1);
});
