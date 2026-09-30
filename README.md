# Praktikum 3 PABWE — Pengembangan Aplikasi Berbasis Web 2026

**Repositori:** `ifs24023-pabwe-p3`  
**Identitas:** `ifs24023`  
**Institusi:** Institut Teknologi Del  

---

## 📌 Deskripsi Proyek
Proyek ini merupakan implementasi **Single Page Application (SPA)** berbasis **Vanilla JavaScript** (ES6+), **Semantic HTML5**, **Tailwind CSS (CDN)**, dan **Tabler Icons**. Seluruh manipulasi DOM, event listener, dan logika bisnis dibuat tanpa framework JavaScript, dengan data persisten menggunakan `localStorage` browser.

Aplikasi terbagi menjadi **3 Fitur Utama** yang diakses melalui navigasi Tab:

---

## 🚀 Fitur Aplikasi

### 1. Catatan Pengeluaran Harian (Expense Tracker)
- **Ringkasan Finansial Realtime:** Menampilkan total pemasukan, total pengeluaran, dan saldo akhir secara dinamis.
- **Operasi CRUD Lengkap:**
  - Tambah transaksi dengan validasi field wajib & jumlah nominal (`amount > 0`).
  - Ubah data transaksi menggunakan **Modal Dialog** terintegrasi.
  - Hapus transaksi dengan **Modal Konfirmasi** pencegah ketidaksengajaan.
- **Pencarian & Multi-Filter:**
  - Pencarian langsung berdasarkan judul atau kategori.
  - Filter berdasarkan tipe transaksi (*Semua*, *Pengeluaran*, *Pemasukan*).
  - Filter berdasarkan kategori (*Makanan*, *Transportasi*, *Pendidikan*, dll.).
  - Sorting: *Tanggal Terbaru*, *Tanggal Terlama*, *Nominal Terbesar*, *Nominal Terkecil*, dan *Judul (A–Z)*.
- **Persistensi Data:** Disimpan ke `localStorage` dengan key `pabwe-p3-expenses`.
- **Empty State:** Tampilan ramah ketika belum ada transaksi atau saat pencarian tidak ditemukan.

### 2. Bookmark / Link Manager
- **Manajemen Tautan Web Favorit:**
  - Tambah tautan dengan nama, kategori/tag, catatan singkat, dan URL.
  - **Validasi URL:** Memeriksa format protokol (`http://` atau `https://`) menggunakan `new URL()`.
  - Membuka tautan langsung di tab baru secara aman dengan atribut `target="_blank"` dan `rel="noopener noreferrer"`.
  - Fitur salin URL ke clipboard dengan satu klik disertai notifikasi Toast.
- **Operasi CRUD Lengkap:**
  - Ubah dan Hapus bookmark melalui **Modal Dialog**.
- **Pencarian & Pengurutan:**
  - Cari berdasarkan judul, URL, atau catatan.
  - Filter kategori (*Dokumentasi*, *Belajar*, *Tools*, *Desain*, dll.).
  - Sorting: *Terbaru*, *Judul A–Z*, *Judul Z–A*, dan *Kategori*.
- **Persistensi Data:** Disimpan ke `localStorage` dengan key `pabwe-p3-bookmarks`.

### 3. Kuis Interaktif (Quiz App)
- **Berbasis Data JavaScript (Array of Objects):** Memuat 8 pertanyaan seputar Web Development, DOM, Event Handling, dan LocalStorage.
- **Alur Interaktif:**
  - Kartu mulai dengan tampilan rekor skor tertinggi (*High Score*).
  - Penghitung waktu mundur (*Timer*) 25 detik per soal.
  - Indikator progres soal aktif dan *progress bar*.
  - Feedback visual instan saat memilih jawaban (warna hijau untuk benar, merah untuk salah) beserta kotak penjelasan singkat (*explanation*).
- **Hasil Akhir & High Score:**
  - Perhitungan skor total dan persentase akurasi.
  - Penyimpanan rekor skor tertinggi (*High Score*) ke `localStorage` (`pabwe-p3-quiz-high-score`).
  - Ulasan lengkap (*Review*) seluruh soal yang membandingkan jawaban pengguna dengan kunci jawaban yang benar.
  - Tombol ulangi kuis (*Try Again*).

### 4. Integrasi & Pengalaman Pengguna (UX)
- **Tab State Persistence:** Tab terakhir yang aktif disimpan di `localStorage` (`pabwe-p3-active-tab`), sehingga saat halaman di-refresh tab tidak kembali ke awal.
- **Sistem Modal Reusable:** Mendukung penutupan dengan tombol Batal, tombol X, klik pada area backdrop luar, atau menekan tombol `Escape` pada keyboard.
- **Sistem Notifikasi Toast:** Indikator visual ketika aksi berhasil, peringatan input, atau data dihapus.
- **Responsive Design:** Tampilan adaptif dan rapi untuk layar desktop maupun smartphone.

---

## 📁 Struktur Direktori
```text
ifs24023-pabwe-p3/
├── index.html              # Antarmuka utama dan markup modal 3 fitur
├── assets/
│   └── script.js           # Seluruh logika JavaScript eksternal (DOM, state, localStorage)
├── pabwe-2026-p3.html      # Panduan praktikum acuan
└── README.md               # Dokumentasi proyek
```

---

## 💻 Cara Menjalankan Proyek
Aplikasi ini murni berjalan di sisi klien (Client-Side). Anda dapat menjalankannya dengan:

1. **Buka Langsung di Browser:**  
   Cukup klik ganda atau *drag-and-drop* file `index.html` ke browser favorit Anda (Google Chrome, Firefox, Edge, Safari).

2. **Menggunakan Live Server / Local HTTP Server (Opsional):**  
   Jika menggunakan terminal / PowerShell:
   ```bash
   # Menggunakan Python
   python -m http.server 8000
   
   # Atau menggunakan npx serve / live-server
   npx serve .
   ```
   Lalu buka URL `http://localhost:8000` pada browser.

---

## ✅ Checklist Pemenuhan Tugas Praktikum
- [x] Nama repositori sesuai format: `{username}-pabwe-p3` (`ifs24023-pabwe-p3`)
- [x] Hanya `index.html` + `assets/script.js` sebagai inti
- [x] 3 Tab berjalan: Expense Tracker, Bookmark Manager, Quiz App
- [x] Tab terakhir diingat setelah refresh (`localStorage`)
- [x] Expense Tracker: CRUD + ringkasan saldo + cari/filter/sort + `localStorage`
- [x] Bookmark Manager: CRUD + validasi URL + cari/sort + `localStorage`
- [x] Quiz App: ≥ 5 soal dari array of objects + skor + high score `localStorage`
- [x] Fitur ubah dan hapus menggunakan Modal Dialog
- [x] Responsive diuji pada tampilan desktop dan mobile
- [x] Kode rapi, terstruktur, dan tidak hanya copy-paste mentah
