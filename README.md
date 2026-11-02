# 🌐 Modern Portfolio Website with Dynamic Admin CMS

Website portofolio interaktif dan modern yang dibangun menggunakan **Next.js 15 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, dan **Google Firebase**. Dilengkapi dengan halaman **Admin CMS** dinamis untuk mengelola konten, palet tema warna, proyek, dan statistik pengunjung secara *real-time* tanpa perlu mengubah kode sumber.

---

## ⚠️ Pemberitahuan Modifikasi & Lisensi Asli (Attribution Notice)

> **Catatan Penting:**  
> Proyek ini merupakan **hasil modifikasi dan pengembangan lanjutan** (porting dari template HTML statis menjadi website dinamis berbasis Next.js App Router & Firebase CMS).
>
> - **Nama Desain / Template Asli**: [ProMan - Personal Portfolio HTML Template](https://htmlcodex.com/personal-portfolio-html-template)
> - **Desainer / Pembuat Asli**: [HTML Codex](https://htmlcodex.com)
> - **Distributor Asli**: [ThemeWagon](https://themewagon.com)
> - **Lisensi Asli**: [Creative Commons Attribution 4.0 International License (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/)
> - **Kredit Footer & Lisensi**: Sesuai dengan lisensi CC BY 4.0 dan file `LICENSE.txt`, kredit pengembang asli tetap dicantumkan dan dipertahankan pada **footer website** (`components/Footer.tsx`) serta tidak boleh dihapus tanpa lisensi khusus dari pembuat aslinya.

---

## 🛠️ Teknologi & Framework yang Digunakan

Website ini dibangun menggunakan teknologi web modern:

| Komponen / Fitur | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Framework Utama** | [Next.js 15.3.3](https://nextjs.org/) | Menggunakan arsitektur App Router dengan Static Site Generation (`output: 'export'`) |
| **Library Antarmuka (UI)** | [React 19.0.0](https://react.dev/) | Rendering komponen dinamis dan responsif |
| **Bahasa Pemrograman** | [TypeScript 5.7.3](https://www.typescriptlang.org/) | Type-safe codebase untuk mencegah bug runtime |
| **Styling & CSS** | [Tailwind CSS v4.0.0](https://tailwindcss.com/) | Utilitas CSS modern didukung `@tailwindcss/postcss` & PostCSS 8 dengan CSS Custom Properties |
| **Icon Pack** | [Lucide React](https://lucide.dev/) | Set ikon modern dan ringan |
| **Database & Realtime Sync** | [Cloud Firestore (Firebase v12.17.1)](https://firebase.google.com/docs/firestore) | Database NoSQL real-time untuk menyimpan konten portofolio dan analitik pengunjung |
| **Autentikasi Admin** | [Firebase Authentication](https://firebase.google.com/docs/auth) | Sistem login terproteksi untuk Halaman Admin CMS |
| **Pelacak Kunjungan (Analytics)** | Firebase Analytics & Custom Tracker | Memantau jumlah *views*, *unique visitors*, serta estimasi bandwidth data |
| **Formulir Kontak (Contact Form)** | [Formspree](https://formspree.io/) | Meneruskan pesan pengunjung langsung ke email pribadi |
| **Hosting Deployment** | [Firebase Hosting](https://firebase.google.com/docs/hosting) | Mendukung penyajian file statis berkecepatan tinggi dengan CDN global |

---

## ✨ Fitur-Fitur Utama

1. **Dashboard Admin CMS Interaktif (`/admin`)**:
   - **Theme & Colors**: Ganti palet warna secara instan melalui *color picker* atau 5 preset warna siap pakai.
   - **Navigation & Brand**: Kustomisasi nama brand dan menu navigasi.
   - **Header & Hero**: Ubah nama, jabatan/profesi dinamis, foto profil, dan tombol unduh CV.
   - **About & Statistics**: Ubah pengalaman tahun, deskripsi diri, poin sorotan (*highlights*), serta jumlah klien dan proyek selesai.
   - **Skills & Timeline**: Atur persentase kemampuan (*skills bar*) serta riwayat pendidikan dan pengalaman kerja.
   - **Services**: Kelola kartu jasa, deskripsi, harga, dan ikon.
   - **Portfolio Projects**: Tambah, edit, dan hapus galeri proyek, lengkap dengan foto dan modal popup detail.
   - **Contact & Social Media**: Kelola kontak telepon, email, alamat kantor, dan tautan sosial media (Instagram, GitHub, LinkedIn, Twitter, Facebook, YouTube).
   - **Footer & Copyright**: Sesuaikan teks hak cipta.
2. **Dukungan Foto Google Drive**:
   - Tidak memerlukan *bucket storage* berbayar; cukup salin tautan berbagi (*share link*) foto dari Google Drive, sistem akan otomatis mengonversinya menjadi URL gambar langsung.
3. **Penyimpanan Lokal & Sinkronisasi Antar-Tab (Cross-Tab Sync)**:
   - Perubahan data di Halaman Admin langsung terefleksi secara instan di tab portofolio tanpa perlu refresh manual.
4. **Statistik Pengunjung**:
   - Penghitungan *Page Views*, *Unique Visitors*, dan estimasi transfer data (upload & download).
5. **Responsif & Mobile Friendly**:
   - Tata letak adaptif dan navigasi lancar untuk perangkat desktop, tablet, maupun smartphone.

---

## 📋 Prasyarat Sistem (Prerequisites)

Sebelum menjalankan proyek, pastikan perangkat Anda telah terinstal:
- **Node.js** (versi 18.x atau versi 20.x ke atas yang stabil)
- **NPM** (bawaan Node.js) atau **Yarn** / **PNPM** / **Bun**
- **Git**
- **Akun Google Firebase** (gratis / Spark Plan)

---

## 🚀 Panduan Mengkloning dan Menjalankan Proyek

Ikuti langkah-langkah di bawah ini untuk mengunduh dan menjalankan website ini di komputer lokal Anda:

### 1. Kloning Repository
Buka terminal / command prompt, lalu jalankan:
```bash
git clone https://github.com/USERNAME_ANDA/NAMA_REPOSITORY.git
cd NAMA_REPOSITORY
```

### 2. Instal Dependensi Proyek
Instal semua modul yang diperlukan:
```bash
npm install
```

### 3. Konfigurasi Firebase SDK (YOUR_FIREBASE_SDK)

Proyek ini memerlukan koneksi ke Google Firebase untuk database konten dan autentikasi admin.

1. Salin file template `.env.example` menjadi `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Buka file `.env.local` dan ganti nilai template dengan kredensial Firebase SDK Anda:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID
   NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=YOUR_FIREBASE_MEASUREMENT_ID

   # URL Domain Website (Opsional, untuk metadata OpenGraph & SEO)
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```
   *(Atau Anda juga dapat menggantinya langsung di file [lib/firebase.ts](file:///home/allghifari/Documents/Projects/Portofolio/Template/template_7/lib/firebase.ts))*.

### 4. Menjalankan Server Pengembangan (Development Server)
Jalankan perintah berikut:
```bash
npm run dev
```
Buka browser dan akses alamat:
- **Halaman Website Portofolio**: [http://localhost:3000](http://localhost:3000)
- **Halaman Admin CMS**: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## ⚙️ Cara Menyiapkan Google Firebase (Langkah Awal)

Jika Anda belum memiliki proyek Firebase:

1. **Buat Proyek Baru**:
   - Buka [Firebase Console](https://console.firebase.google.com/) dan buat proyek baru.
   - Tambahkan aplikasi Web (**</>**) untuk mendapatkan konfigurasi `firebaseConfig`.
2. **Aktifkan Firebase Authentication**:
   - Masuk ke menu **Build** > **Authentication** > klik **Get Started**.
   - Pada tab **Sign-in method**, aktifkan **Email/Password**.
   - Masuk ke tab **Users** dan klik **Add user** untuk membuat akun Admin pertama Anda (masukkan email dan password Anda).
3. **Aktifkan Cloud Firestore Database**:
   - Masuk ke menu **Build** > **Firestore Database** > klik **Create database**.
   - Pilih mode produksi (*production mode*) dan tentukan lokasi server terdekat.
   - Pada tab **Rules**, pastikan aturan keamanan mengizinkan pembacaan publik dan penulisan hanya untuk admin yang telah login:
     ```javascript
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         // Data portofolio dapat dibaca oleh publik, namun hanya admin login yang dapat mengubahnya
         match /portfolio/{document=**} {
           allow read: if true;
           allow write: if request.auth != null;
         }
       }
     }
     ```
4. **Perbarui file `.firebaserc`**:
   - Ganti `YOUR_FIREBASE_PROJECT_ID` pada `.firebaserc` dengan Project ID Firebase Anda.

---

## 🏗️ Build dan Deploy ke Hosting

### Build untuk Produksi
Untuk mengekspor website menjadi file HTML/CSS/JS statis yang siap di-hosting:
```bash
npm run build
```
File hasil build akan berada di direktori `out/`.

### Deploy ke Firebase Hosting
1. Instal Firebase CLI secara global (jika belum):
   ```bash
   npm install -g firebase-tools
   ```
2. Login ke akun Google Firebase Anda:
   ```bash
   firebase login
   ```
3. Deploy website:
   ```bash
   firebase deploy
   ```

---

## 📖 Ringkasan Penggunaan Admin CMS

- **Akses Dashboard**: Kunjungi `/admin` dan login menggunakan email & password Firebase Authentication Anda.
- **Input Gambar Google Drive**:
  1. Upload foto ke Google Drive.
  2. Klik kanan foto > **Share** > ubah akses menjadi **Anyone with the link**.
  3. Salin link dan tempel ke kolom foto di Admin CMS (otomatis dikonversi).
- **Formulir Kontak (Formspree)**:
  1. Buat formulir di [Formspree.io](https://formspree.io) dan salin *endpoint URL*.
  2. Tempel URL pada tab **Contact & Formspree** di halaman Admin.
- **Simpan Perubahan**:
  - Selalu klik tombol **Save All Changes** di pojok kanan atas setelah melakukan perubahan agar data tersimpan ke Cloud Firestore.

---

## 📄 Lisensi

- Desain dasar website ini berlisensi di bawah **Creative Commons Attribution 4.0 International (CC BY 4.0)** oleh [HTML Codex](https://htmlcodex.com).
- Kode modifikasi dan arsitektur Next.js CMS ini disediakan untuk portofolio personal dan penggunaan non-komersial/komersial dengan tetap mematuhi ketentuan atribusi lisensi asli pada bagian footer.
- Rincian lengkap lisensi dapat dibaca pada file [LICENSE.txt](file:///home/allghifari/Documents/Projects/Portofolio/Template/template_7/LICENSE.txt).
