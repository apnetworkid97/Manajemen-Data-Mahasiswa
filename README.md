# Manajemen Data Mahasiswa

Aplikasi web sederhana untuk mata kuliah Algoritma & Pemrograman 2. Project ini dibuat dari template `tailadmin-next-typescript-pro`, lalu disederhanakan menjadi studi kasus CRUD data mahasiswa agar mudah dibaca oleh mahasiswa semester 3.

## Teknologi

- Frontend: Next.js 16 + TypeScript
- Backend: Node.js + JavaScript
- UI Template: TailAdmin Next TypeScript Pro
- Penyimpanan data: file JSON lokal

## Fitur Utama

- Login page sederhana
- Signup page dengan OTP email (SMTP)
- Logout dari user dropdown
- RBAC sederhana (`admin`, `operator`, `viewer`)
- Beranda difungsikan sebagai dashboard ringkas (role aktif, total user, total mahasiswa, quick action)
- Menu `Registrasi User` (admin only) dengan datatable + modal tambah/edit user
- CRUD data mahasiswa: input, edit, hapus, tampilkan
- Datatable mahasiswa dengan pagination
- Modal input dan edit data mahasiswa
- Edit data dengan klik baris tabel
- Bulk delete dengan checkbox
- Validasi form menggunakan Regex
- Validasi NIM wajib tepat 12 digit angka
- Data mahasiswa lebih lengkap: tempat lahir, tanggal lahir, dan status aktif
- Program Studi menggunakan select option per fakultas (bukan input bebas)
- Border merah pada field yang error
- Penyimpanan dan pembacaan data dari file JSON
- Import file `CSV` dan `JSON`
- Export file `CSV` dan `JSON`
- Modal import dengan download template `CSV` dan `JSON`
- Konfirmasi aksi menggunakan `SweetAlert2`
- Verifikasi OTP via endpoint backend (`send-otp`, `verify-otp`, `consume-otp`)
- Pencarian langsung saat mengetik
- Pencarian data:
  - `Sequential Search` untuk nama
  - `Linear Search` untuk NIM
  - `Binary Search` untuk NIM
- Pengurutan data:
  - `Insertion Sort`
  - `Bubble Sort`
  - `Selection Sort`
  - `Merge Sort`
  - `Shell Sort`
- OOP:
  - class
  - object
  - encapsulation
  - inheritance
  - polymorphism
- Error handling dengan `try-catch` dan custom `Exception`
- Ringkasan estimasi time complexity

## Checklist Requirement Tugas

- [x] Input, edit, hapus, dan tampilkan data mahasiswa (array, fungsi, pointer-like/reference di JavaScript)
- [x] Penyimpanan dan pembacaan data dari file (File I/O)
- [x] Penerapan OOP (class, objek, enkapsulasi, pewarisan, polimorfisme)
- [x] Fitur pencarian data (Linear Search, Binary Search, Sequential Search)
- [x] Fitur pengurutan data (Insertion, Selection, Merge, Bubble, Shell Sort)
- [x] Validasi input menggunakan Regular Expression (Regex)
- [x] Penanganan error menggunakan Try-Catch & Exception
- [x] Estimasi Time Complexity untuk fitur utama
- [x] Guidelines & Best Practices (penamaan variabel, modularisasi kode, komentar)
- [x] Signup + verifikasi OTP email via SMTP

## Struktur Folder

```text
Algoritma & Pemrograman 2/
|-- frontend/
|   |-- src/
|   |   |-- app/
|   |   |-- layout/
|   |   |   |-- AppSidebar.tsx
|   |   |   |-- AppHeader.tsx
|   |   |   `-- Backdrop.tsx
|   |   |-- components/auth/SignInForm.tsx
|   |   |-- components/students/StudentManager.tsx
|   |   |-- components/students/StudentManagerView.tsx
|   |   `-- types/student.ts
|   |-- public/
|   `-- package.json
|-- backend/
|   |-- data/students.json
|   |-- .env.example
|   |-- src/
|   |   |-- algorithms.js
|   |   |-- errors.js
|   |   |-- file-utils.js
|   |   |-- models.js
|   |   |-- otp-service.js
|   |   `-- student-service.js
|   |-- package.json
|   `-- server.js
|-- LAPORAN.md
`-- README.md
```

## Struktur Frontend

- `frontend/src/app/(admin)/layout.tsx`
  - layout utama halaman admin sekaligus pengecekan login sederhana
- `frontend/src/app/(admin)/page.tsx`
  - halaman beranda dashboard utama
- `frontend/src/app/(full-width-pages)/(auth)/signin/page.tsx`
  - route halaman login
- `frontend/src/app/(full-width-pages)/(auth)/layout.tsx`
  - layout login
- `frontend/src/layout/AppSidebar.tsx`
  - sidebar template + menu `Registrasi User` untuk admin
- `frontend/src/layout/AppHeader.tsx`
  - topbar/header
- `frontend/src/components/auth/SignInForm.tsx`
  - form login sederhana menggunakan `localStorage`
- `frontend/src/components/auth/SignUpForm.tsx`
  - form registrasi user dengan verifikasi OTP via email
- `frontend/src/components/home/BerandaDashboard.tsx`
  - konten dashboard beranda
- `frontend/src/components/users/UserManager.tsx`
  - manajemen user berbasis datatable (tanpa import/export), khusus admin
- `frontend/src/components/students/StudentManager.tsx`
  - logic utama: state, fetch API, handler CRUD, import/export, filter, pagination
- `frontend/src/components/students/StudentManagerView.tsx`
  - tampilan utama: toolbar, tabel, modal form, modal import

Dengan pemisahan ini, file logic dan file tampilan lebih mudah di-maintain.

## Cara Menjalankan

1. Masuk ke folder backend pada terminal pertama:

```bash
cd backend
```

2. Install dependency backend:

```bash
npm install
```

3. Jalankan backend:

```bash
npm run start
```

4. Masuk ke folder frontend pada terminal kedua:

```bash
cd frontend
```

5. Install dependency frontend:

```bash
npm install
```

6. Jalankan frontend:

```bash
npm run dev
```

7. Cek lint frontend:

```bash
npm run lint
```

8. Jika ingin mode production, build dulu lalu start:

```bash
npm run build
npm run start
```

9. Buka browser:

```text
http://localhost:3000/signin
```

Halaman signup:

```text
http://localhost:3000/signup
```

Backend default berjalan di:

```text
http://localhost:4000
```

Alternatif untuk backend:

```bash
cd backend
npm run dev
```

Jika muncul error `EADDRINUSE`, artinya port `4000` sedang dipakai proses lain. Solusinya:

```bash
set PORT=4001
npm run start
```

## Environment Variable

Frontend: salin `.env.example` menjadi `.env.local` bila ingin mengubah URL backend.

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

File ini berada di `frontend/.env.example`.

Backend (OTP SMTP): salin `backend/.env.example` menjadi `backend/.env`, lalu isi akun SMTP.

```env
PORT=4000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM="Manajemen Data Mahasiswa <your_email@gmail.com>"
```

Catatan:

- Untuk Gmail gunakan App Password, bukan password akun biasa.
- OTP disimpan in-memory selama 5 menit (hilang saat server restart).
- Pengiriman OTP dibatasi: minimal jeda 1 menit antar pengiriman dan maksimal 3 kali dalam 24 jam per email.

## Login Demo

Gunakan akun berikut untuk masuk:

```text
Email    : admin@kampus.ac.id
Password : admin123
```

Catatan:

- Login ini dibuat sederhana menggunakan `localStorage`
- Tujuannya agar mudah dipahami dan dipresentasikan oleh mahasiswa semester 3

## Endpoint Backend

- `GET /api/health`
- `GET /api/students`
- `POST /api/students`
- `PUT /api/students/:id`
- `DELETE /api/students/:id`
- `POST /api/students/bulk-delete`
- `GET /api/students/export?format=csv`
- `GET /api/students/export?format=json`
- `POST /api/students/import`
- `POST /api/auth/send-otp`
- `POST /api/auth/verify-otp`
- `POST /api/auth/consume-otp`

## Generate Data Mahasiswa Massal (Random)

Jalankan dari folder `backend`:

```bash
npm run seed:students
```

Default akan menambah 50 data random (`append`).

Jumlah custom (contoh 200 data):

```bash
npm run seed:students -- 200
```

Ganti total data lama (replace) + generate baru:

```bash
npm run seed:students -- 100 replace
```

## Benchmark Execution Time (Praktis)

Jalankan dari folder `backend`:

```bash
npm run benchmark:time
```

Contoh output (milidetik, sample lokal):

```text
n=100   -> linear 0.008 | sequential 0.015 | binary 0.178 | insertion 0.101 | selection 0.434 | bubble 0.475 | shell 0.108 | merge 0.105
n=1000  -> linear 0.020 | sequential 0.077 | binary 0.831 | insertion 2.058 | selection 21.513 | bubble 20.249 | shell 0.509 | merge 0.517
n=3000  -> linear 0.027 | sequential 0.203 | binary 2.286 | insertion 69.761 | selection 181.796 | bubble 177.733 | shell 2.080 | merge 1.144
```

Catatan:

- Angka benchmark bisa berubah tergantung spesifikasi laptop/PC.
- Untuk laporan teori tetap gunakan Big-O, benchmark ini sebagai bukti praktis.

## Format Data Mahasiswa

```json
{
  "nim": "230100010001",
  "nama": "Andi Saputra",
  "email": "andi@example.com",
  "tempatLahir": "Bandung",
  "tanggalLahir": "2004-01-15",
  "prodi": "Informatika",
  "semester": 4,
  "angkatan": 2023,
  "status": "Reguler",
  "statusAktif": "Aktif"
}
```

## Catatan Akademik

- `n` pada kompleksitas waktu adalah simbol jumlah data (misalnya jumlah mahasiswa), bukan angka tetap.
- Konsep `pointer` tidak tersedia secara literal seperti di C/C++, karena backend menggunakan JavaScript.
- Pada project ini, konsep pointer dijelaskan melalui `reference/pointer-like object` saat proses edit dan hapus data di service backend.
- Catatan implementasi pencarian: mode `binary` saat ini melakukan pengurutan data dulu, sehingga total kompleksitas praktiknya `O(n log n)` (sort + binary search).
- Penjelasan detail requirement tugas tersedia di file [LAPORAN.md](./LAPORAN.md).
- Refactor terbaru: form reset password dirapikan agar fungsi lebih pendek dan komentar fungsi dibuat spesifik (bukan komentar placeholder).
- Frontend sudah diperbarui ke Next.js 16. Build menggunakan mode `--webpack` karena project masih memakai custom webpack config untuk SVG.

## Catatan

File yang sudah disiapkan agar enak dipresentasikan atau di-push:

- `README.md` untuk overview project
- `LAPORAN.md` untuk pemetaan requirement tugas
- struktur code yang dipisah frontend dan backend
- layout frontend dipisah dari logic konten agar mudah maintenance
- sample data pada `backend/data/students.json`
