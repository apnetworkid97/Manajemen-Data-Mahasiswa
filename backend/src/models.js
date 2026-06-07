class Person {
  #nama;
  #email;

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  constructor({ nama, email }) {
    this.#nama = nama;
    this.#email = email;
  }

  get nama() {
    return this.#nama;
  }

  get email() {
    return this.#email;
  }

  get kontakLabel() {
    return `${this.#nama} <${this.#email}>`;
  }
}

class Mahasiswa extends Person {
  #id;
  #nim;
  #tempatLahir;
  #tanggalLahir;
  #prodi;
  #semester;
  #angkatan;
  #statusAktif;

  constructor({
    id,
    nim,
    nama,
    email,
    tempatLahir,
    tanggalLahir,
    prodi,
    semester,
    angkatan,
    statusAktif,
  }) {
    super({ nama, email });
    this.#id = id;
    this.#nim = nim;
    this.#tempatLahir = tempatLahir;
    this.#tanggalLahir = tanggalLahir;
    this.#prodi = prodi;
    this.#semester = semester;
    this.#angkatan = angkatan;
    this.#statusAktif = statusAktif;
  }

  get id() {
    return this.#id;
  }

  get nim() {
    return this.#nim;
  }

  get prodi() {
    return this.#prodi;
  }

  get tempatLahir() {
    return this.#tempatLahir;
  }

  get tanggalLahir() {
    return this.#tanggalLahir;
  }

  get semester() {
    return this.#semester;
  }

  get angkatan() {
    return this.#angkatan;
  }

  get statusAktif() {
    return this.#statusAktif;
  }

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  getJenisMahasiswa() {
    return "Umum";
  }

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  toJSON() {
    return {
      id: this.#id,
      nim: this.#nim,
      nama: this.nama,
      email: this.email,
      tempatLahir: this.#tempatLahir,
      tanggalLahir: this.#tanggalLahir,
      prodi: this.#prodi,
      semester: this.#semester,
      angkatan: this.#angkatan,
      status: this.getJenisMahasiswa(),
      statusAktif: this.#statusAktif,
      kontakLabel: this.kontakLabel,
    };
  }
}

class MahasiswaReguler extends Mahasiswa {
  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  getJenisMahasiswa() {
    return "Reguler";
  }
}

class MahasiswaBeasiswa extends Mahasiswa {
  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  getJenisMahasiswa() {
    return "Beasiswa";
  }
}

module.exports = {
  Person,
  Mahasiswa,
  MahasiswaReguler,
  MahasiswaBeasiswa,
};
