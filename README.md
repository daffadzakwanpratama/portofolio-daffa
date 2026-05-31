# ⚡ Daffa - Premium Minimalist Portfolio & Admin Dashboard

Sebuah website portofolio profesional bertema **Minimalis Modern (Monokrom)** lengkap dengan **Dashboard Admin** mandiri terintegrasi untuk mengelola data profil, keahlian (*skills*), dan riwayat perjalanan (*timeline*) secara dinamis.

Dibuat menggunakan teknologi **Vanilla HTML, CSS, dan JavaScript Murni (No Frameworks, No External Libraries)** dengan fokus utama pada performa ultra-ringan, estetika visual mewah ala Apple, responsivitas penuh, serta keamanan penyimpanan data peramban.

---

## ✨ Fitur Unggulan

### 🌐 Halaman Utama (Landing Page)
* **Monochrome Minimalist Theme**: Kombinasi warna *off-white*, putih bersih, abu-abu arang pekat, dan aksen hitam solid yang menyajikan ketajaman kontras visual mewah bergaya minimalis modern.
* **Premium Micro-Interactions**: Efek melayang (*hover*) interaktif menggunakan transisi Apple-style *cubic-bezier* (`0.25s cubic-bezier(0.16, 1, 0.3, 1)`) pada setiap tombol dan kartu proyek.
* **Auto Profile Initializer**: Secara otomatis merender inisial avatar ("DA") bermotif gradasi estetis ungu-biru jika pengguna belum mengunggah file foto avatar kustom.
* **Auto Project Thumbnail Visualizer**: Jika proyek belum memiliki tautan gambar thumbnail, sistem CSS akan secara dinamis memicu pembuatan latar belakang gradasi warna HSL abstrak unik yang disesuaikan secara dinamis berdasarkan judul proyek Anda!
* **High-Precision ScrollSpy & Navigation Bar**: Menu navigasi dilengkapi dengan ScrollSpy presisi tinggi berbasis `getBoundingClientRect()` dan interaksi instan. Ketika mengeklik menu, garis indikator bawah (*underline*) berpindah secara instan secara mulus. Sensor *smart mute* 800ms mencegah terjadinya loncatan bergetar saat *smooth scrolling* bergulir ke section tujuan.
* **Scroll-Triggered Skill Levels**: Progress bar keahlian dianimasikan terisi secara dinamis hanya saat pengunjung men-scroll layar hingga bagian *Keahlian* terlihat.
* **IntersectionObserver Scroll Reveal**: Seluruh kartu riwayat hidup dan bagian konten akan meluncur naik secara lembut (*glide-up transition*) saat memasuki area pandang layar.

### 🛡️ Dashboard Admin (Panel Kontrol Mandiri)
* **Modular Panel Transitions**: Navigasi sidebar responsif untuk beralih antar menu (Profil, Keahlian, Riwayat) secara dinamis tanpa muat ulang halaman dengan efek memudar (*fade transition*) yang sangat halus.
* **Kelola Profil Terpadu**: Formulir lengkap untuk mengedit Nama, Jabatan, Biografi, Domisili, Email, Tautan CV/Resume PDF, dan 4 jejaring sosial utama.
* **Kelola Keahlian (Skills CRUD)**: Slider persentase dinamis terupdate secara *real-time*, form penambahan keahlian baru berdasarkan kategori, serta fitur edit/hapus keahlian lama.
* **Kelola Riwayat Hidup (Timeline CRUD)**: Form penambahan riwayat pengalaman kerja dan pendidikan. Dilengkapi dengan **Dynamic Bullet Points Builder** untuk menambah/menghapus baris deskripsi kerja secara dinamis menggunakan masukan terpisah.
* **SafeStorage Sandbox & Real-Time Sync**: Menggunakan utilitas pembungkus penyimpanan data `SafeStorage` untuk mencegah crash pada browser yang memblokir akses lokal. Setiap penyimpanan langsung menyinkronkan data portofolio publik secara instan.
* **Toast Success Notification**: Kotak informasi gelap mengambang di sudut bawah layar yang memberikan umpan balik instan saat aksi simpan berhasil dieksekusi.

---

## 📁 Struktur Folder Proyek

```text
portofolio/
├── assets/
│   ├── css/
│   │   ├── styles.css     # Gaya visual halaman utama portofolio
│   │   └── admin.css      # Gaya visual dashboard panel admin
│   └── js/
│       ├── app.js         # Pengendali render & interaksi halaman utama
│       ├── data.js        # Objek database awal (default portfolio data)
│       └── admin.js       # Pengendali render & CRUD formulir admin
├── index.html             # Landing page portofolio utama (Publik)
├── admin.html             # Dashboard panel admin kelola data (Privat)
├── .gitignore             # File konfigurasi pengabaian repositori Git
└── README.md              # Dokumentasi lengkap repositori proyek
```

---

## 🛠️ Panduan Menjalankan Proyek Secara Lokal

Karena proyek ini dibangun menggunakan teknologi Vanilla web murni tanpa kompilasi/dependensi npm yang rumit, Anda dapat langsung menjalankannya di komputer Anda:

1. Unduh atau klon repositori ini ke komputer lokal Anda.
2. Buka folder proyek, lalu klik ganda berkas **`index.html`** untuk langsung membukanya di browser Google Chrome, Safari, Microsoft Edge, atau browser favorit Anda!
3. Untuk masuk ke dashboard kelola data, buka berkas **`admin.html`** di browser Anda. Lakukan perubahan data, lalu buka kembali `index.html` (lakukan Hard Refresh `Ctrl + F5` jika diperlukan) untuk melihat perubahan sinkron secara instan!

---

## 🚀 Panduan Mengunggah & Deploy ke GitHub (Gratis Selamanya!)

Anda dapat mengunggah proyek portofolio ini ke akun GitHub pribadi Anda dan menyajikannya secara **LIVE gratis** ke seluruh dunia menggunakan layanan **GitHub Pages**:

### Langkah 1: Klon & Inisialisasi Git Lokal
Buka aplikasi terminal atau command prompt (Cwd: di dalam folder `portofolio`), lalu jalankan perintah berikut:
```bash
# Inisialisasi repositori git baru
git init

# Tambahkan seluruh file ke staging area
git add .

# Buat commit pertama Anda
git commit -m "First Commit: Premium Portfolio with Admin Dashboard"
```

### Langkah 2: Buat Repositori Baru di GitHub
1. Buka akun [GitHub](https://github.com) Anda, lalu buat repositori baru bernama `portofolio` (atau nama lain bebas).
2. Biarkan opsi inisialisasi (README, gitignore, License) **tidak tercentang** (kosong).
3. Salin perintah *"push an existing repository from the command line"* yang diberikan oleh GitHub, contoh:
```bash
# Hubungkan repositori lokal ke GitHub
git remote add origin https://github.com/USERNAME-ANDA/NAMA-REPOSITORI.git

# Setel nama branch utama ke 'main'
git branch -M main

# Unggah file ke GitHub
git push -u origin main
```

### Langkah 3: Deploy ke Layanan LIVE Gratis (GitHub Pages)
Setelah file berhasil diunggah ke GitHub:
1. Masuk ke halaman repositori portofolio Anda di GitHub.
2. Buka tab **Settings** (Pengaturan) di bagian menu atas.
3. Di bilah menu sebelah kiri, cari dan klik **Pages** (GitHub Pages).
4. Pada bagian *Build and deployment*, di menu dropdown **Source**, pilih **Deploy from a branch**.
5. Di bawahnya, pada bagian *Branch*, ubah dropdown pertama dari `None` menjadi **`main`**, lalu klik tombol **Save** (Simpan).
6. Tunggu sekitar 1-2 menit, lalu segarkan (*refresh*) halaman pengaturan tersebut. Anda akan melihat kotak notifikasi hijau di bagian atas yang bertuliskan:
   > 🚀 **Your site is live at: `https://USERNAME-ANDA.github.io/NAMA-REPOSITORI/`**
7. Selamat! Website portofolio premium Anda kini sudah online dan dapat diakses oleh siapa saja di internet secara gratis!
