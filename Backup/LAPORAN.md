# Laporan Singkat Proyek

## Judul

Manajemen Data Mahasiswa Berbasis Web GUI menggunakan Next.js dan Node.js.

## Deskripsi Singkat

Project ini adalah aplikasi sederhana untuk mengelola data mahasiswa. Pengguna dapat menambah, mengubah, menghapus, mencari, mengurutkan, mengimpor, dan mengekspor data mahasiswa melalui antarmuka web.

## Pemetaan Requirement

### 1. Input, edit, hapus, tampilkan data mahasiswa

- Logic CRUD ada di frontend `frontend/src/components/students/StudentManager.tsx`
- Tampilan CRUD ada di frontend `frontend/src/components/students/StudentManagerView.tsx`
- Data ditampilkan dalam bentuk datatable
- Backend menggunakan array saat data dibaca dari file JSON
- Operasi dilakukan melalui fungsi-fungsi service
- Konsep pointer direpresentasikan dengan `findStudentPointer()` pada backend

### 2. Penyimpanan dan pembacaan data dari file

- File utama: `backend/data/students.json`
- Backend menggunakan `fs/promises` untuk membaca dan menulis file

### 3. Penerapan OOP

- `Person` sebagai superclass
- `Mahasiswa` sebagai turunan dari `Person`
- `MahasiswaReguler` dan `MahasiswaBeasiswa` sebagai turunan dari `Mahasiswa`
- Enkapsulasi menggunakan private field seperti `#nama`, `#email`, `#nim`
- Pewarisan terlihat pada hubungan antar class
- Polimorfisme terlihat pada method `getJenisMahasiswa()`

### 4. Fitur pencarian data

- `Sequential Search`: mencari nama yang mengandung keyword
- `Linear Search`: mencari NIM secara langsung pada data belum terurut
- `Binary Search`: mencari NIM pada data terurut

### 5. Fitur pengurutan data

Implementasi tersedia di `backend/src/algorithms.js`:

- Bubble Sort
- Insertion Sort
- Selection Sort
- Merge Sort
- Shell Sort

Minimal 2 metode sudah terpenuhi, bahkan tersedia lebih dari 2 agar mudah diuji.

### 6. Validasi Regex

Regex dipakai pada frontend dan backend untuk:

- NIM
- Nama
- Email
- Program Studi

Tujuannya agar validasi tidak hanya bergantung pada tampilan.

### 7. Try-Catch dan Exception

- Backend memakai `try-catch`
- Terdapat custom exception:
  - `AppError`
  - `ValidationError`
  - `NotFoundError`
  - `FileStorageError`

### 8. Estimasi Time Complexity

- `n` = jumlah data mahasiswa (bukan angka tetap)
- Sequential Search: `O(n)`
- Linear Search: `O(n)`
- Binary Search (implementasi saat ini): `O(n log n)` karena data di-sort dulu, lalu binary search `O(log n)`
- Bubble Sort: `O(n^2)`
- Insertion Sort: `O(n^2)`
- Selection Sort: `O(n^2)`
- Merge Sort: `O(n log n)`
- Import/Export: `O(n)`
- Edit/Hapus dengan pencarian index: `O(n)`

### 8.1 Pengukuran Waktu Eksekusi (Benchmark Praktis)

Selain Big-O, project ini juga menyediakan benchmark waktu eksekusi nyata.

Command:

```bash
cd backend
npm run benchmark:time
```

Contoh hasil (ms) saat pengujian lokal:

- n=100: linear 0.008, sequential 0.015, binary 0.178, insertion 0.101, selection 0.434, bubble 0.475, shell 0.108, merge 0.105
- n=1000: linear 0.020, sequential 0.077, binary 0.831, insertion 2.058, selection 21.513, bubble 20.249, shell 0.509, merge 0.517
- n=3000: linear 0.027, sequential 0.203, binary 2.286, insertion 69.761, selection 181.796, bubble 177.733, shell 2.080, merge 1.144

Interpretasi singkat:

- Algoritma `O(n^2)` (bubble/selection/insertion) meningkat jauh lebih cepat saat `n` membesar.
- Algoritma `O(n log n)` (merge, shell rata-rata) lebih stabil untuk data lebih besar.
- Binary search di implementasi ini lebih mahal dari linear search murni karena ada langkah sorting dulu.

### 9. Guidelines dan Best Practices

- Penamaan variabel dibuat deskriptif
- Kode dipisah per tanggung jawab
- Komentar seperlunya
- Frontend dan backend dipisah agar modular
- Pada frontend, file logic dan file tampilan juga dipisah agar mudah maintenance

### 10. Export dan Import CSV/JSON

- Export:
  - `GET /api/students/export?format=csv`
  - `GET /api/students/export?format=json`
- Import:
  - `POST /api/students/import`

## Penjelasan Pointer pada JavaScript

JavaScript tidak memiliki pointer eksplisit seperti C/C++. Karena requirement backend diminta menggunakan Node.js, konsep pointer disesuaikan menjadi reference object.

Contohnya pada fungsi `findStudentPointer()`:

- function ini mencari index data mahasiswa dalam array
- lalu mengembalikan object yang menunjuk ke posisi data tersebut
- object itu dipakai untuk `replace()` saat edit dan `remove()` saat hapus

Dengan cara ini, ide pointer tetap bisa dijelaskan secara akademik tanpa memaksakan bahasa yang memang tidak mendukung pointer mentah.

## Kesimpulan

Project ini memenuhi kebutuhan tugas dasar algoritma, struktur data, OOP, file I/O, GUI, dan dokumentasi dengan pendekatan yang tetap sederhana dan mudah dipahami mahasiswa semester 3.
