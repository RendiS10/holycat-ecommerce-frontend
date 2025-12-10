# 🐱 HolyCat E-Commerce - Frontend

Frontend aplikasi HolyCat E-Commerce ini dibangun menggunakan **Next.js 15 (App Router)**. Aplikasi ini menyediakan antarmuka modern yang responsif untuk pengalaman belanja pelanggan serta dashboard admin yang komprehensif untuk pengelolaan toko.

---

## 🚀 Fitur Utama

### 🛒 Fitur Pelanggan (Customer)

- **Katalog Produk:** Menampilkan daftar produk dengan harga, stok, dan gambar dalam tata letak grid responsif.
- **Pencarian & Filter:**
  - Cari produk berdasarkan kata kunci.
  - Filter produk berdasarkan kategori (Obat, Vitamin, Grooming, dll).
- **Manajemen Keranjang:**
  - Tambah produk ke keranjang (validasi stok _real-time_).
  - Ubah kuantitas atau hapus item.
  - Pilih item tertentu untuk di-_checkout_.
- **Checkout & Pembayaran:**
  - **Integrasi Midtrans Snap:** Pembayaran otomatis via Virtual Account, QRIS, & E-Wallet.
  - **Pembayaran Manual:** Opsi upload bukti transfer untuk verifikasi manual.
- **Manajemen Pesanan:**
  - Riwayat pesanan lengkap dengan status warna-warni.
  - **Pelacakan Pengiriman:** Informasi kurir dan nomor resi yang dapat dilihat langsung.
  - Pembatalan pesanan (jika status masih "Menunggu Pembayaran" atau "Diproses").
- **Manajemen Profil:** Edit biodata diri dan alamat pengiriman.
- **Autentikasi:** Sistem Login dan Register aman menggunakan JWT (_HttpOnly Cookie_).

### 👑 Fitur Admin (Dashboard)

- **Dashboard Statistik:** Ringkasan metrik penting (Total User, Total Pesanan, Pendapatan Bersih, Produk Terjual).
- **Manajemen Produk (CRUD):** Tambah, Edit, dan Hapus data produk, termasuk manajemen stok dan kategori.
- **Manajemen Pesanan:**
  - Update status pesanan (Diproses, Dikemas, Dikirim, Selesai).
  - **Input Resi:** Form khusus untuk memasukkan kurir dan nomor resi saat status diubah menjadi "Dikirim".
- **Laporan & Ekspor:**
  - Visualisasi grafik pendapatan harian menggunakan **Chart.js**.
  - Filter laporan berdasarkan rentang tanggal dan status pesanan.
  - **Ekspor CSV:** Unduh data laporan penjualan dalam format CSV.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **HTTP Client:** [Axios](https://axios-http.com/)
- **State Management:** React Hooks (`useState`, `useEffect`, `useContext`)
- **Form Handling:** [React Hook Form](https://react-hook-form.com/)
- **Notifikasi:** [SweetAlert2](https://sweetalert2.github.io/) & Custom Toast Component
- **Visualisasi Data:** [Chart.js](https://www.chartjs.org/) & React-Chartjs-2
- **Payment Gateway:** Midtrans Snap (Client Script)
- **Testing:** [Cypress](https://www.cypress.io/) (E2E Testing)

---

## ⚙️ Prasyarat

Sebelum menjalankan frontend, pastikan:

1.  **Node.js** (versi 18 atau terbaru) sudah terinstal.
2.  **Backend** (`ecommerce-backend`) sudah berjalan di port default (`http://localhost:4000`).

---

## 📦 Instalasi & Menjalankan Aplikasi

### 1. Masuk ke direktori frontend

```bash
cd ecommerce-frontend
```

Ini adalah dokumen README.md yang lengkap dan terstruktur untuk folder ecommerce-frontend. Dokumen ini mencakup semua detail teknis, fitur, dan panduan instalasi yang sesuai dengan arsitektur proyek HolyCat E-Commerce Anda.Silakan salin konten di bawah ini ke dalam file ecommerce-frontend/README.md.Markdown# 🐱 HolyCat E-Commerce - Frontend

Frontend aplikasi HolyCat E-Commerce ini dibangun menggunakan **Next.js 15 (App Router)**. Aplikasi ini menyediakan antarmuka modern yang responsif untuk pengalaman belanja pelanggan serta dashboard admin yang komprehensif untuk pengelolaan toko.

---

## 🚀 Fitur Utama

### 🛒 Fitur Pelanggan (Customer)

- **Katalog Produk:** Menampilkan daftar produk dengan harga, stok, dan gambar dalam tata letak grid responsif.
- **Pencarian & Filter:**
  - Cari produk berdasarkan kata kunci.
  - Filter produk berdasarkan kategori (Obat, Vitamin, Grooming, dll).
- **Manajemen Keranjang:**
  - Tambah produk ke keranjang (validasi stok _real-time_).
  - Ubah kuantitas atau hapus item.
  - Pilih item tertentu untuk di-_checkout_.
- **Checkout & Pembayaran:**
  - **Integrasi Midtrans Snap:** Pembayaran otomatis via Virtual Account, QRIS, & E-Wallet.
  - **Pembayaran Manual:** Opsi upload bukti transfer untuk verifikasi manual.
- **Manajemen Pesanan:**
  - Riwayat pesanan lengkap dengan status warna-warni.
  - **Pelacakan Pengiriman:** Informasi kurir dan nomor resi yang dapat dilihat langsung.
  - Pembatalan pesanan (jika status masih "Menunggu Pembayaran" atau "Diproses").
- **Manajemen Profil:** Edit biodata diri dan alamat pengiriman.
- **Autentikasi:** Sistem Login dan Register aman menggunakan JWT (_HttpOnly Cookie_).

### 👑 Fitur Admin (Dashboard)

- **Dashboard Statistik:** Ringkasan metrik penting (Total User, Total Pesanan, Pendapatan Bersih, Produk Terjual).
- **Manajemen Produk (CRUD):** Tambah, Edit, dan Hapus data produk, termasuk manajemen stok dan kategori.
- **Manajemen Pesanan:**
  - Update status pesanan (Diproses, Dikemas, Dikirim, Selesai).
  - **Input Resi:** Form khusus untuk memasukkan kurir dan nomor resi saat status diubah menjadi "Dikirim".
- **Laporan & Ekspor:**
  - Visualisasi grafik pendapatan harian menggunakan **Chart.js**.
  - Filter laporan berdasarkan rentang tanggal dan status pesanan.
  - **Ekspor CSV:** Unduh data laporan penjualan dalam format CSV.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **HTTP Client:** [Axios](https://axios-http.com/)
- **State Management:** React Hooks (`useState`, `useEffect`, `useContext`)
- **Form Handling:** [React Hook Form](https://react-hook-form.com/)
- **Notifikasi:** [SweetAlert2](https://sweetalert2.github.io/) & Custom Toast Component
- **Visualisasi Data:** [Chart.js](https://www.chartjs.org/) & React-Chartjs-2
- **Payment Gateway:** Midtrans Snap (Client Script)
- **Testing:** [Cypress](https://www.cypress.io/) (E2E Testing)

---

## ⚙️ Prasyarat

Sebelum menjalankan frontend, pastikan:

1.  **Node.js** (versi 18 atau terbaru) sudah terinstal.
2.  **Backend** (`ecommerce-backend`) sudah berjalan di port default (`http://localhost:4000`).

---

## 📦 Instalasi & Menjalankan Aplikasi

### 1. Masuk ke direktori frontend

```bash
cd ecommerce-frontend
2. Instal DependensiDirekomendasikan menggunakan pnpm untuk efisiensi disk space.Bash# Menggunakan pnpm (Disarankan)
pnpm install

# Atau menggunakan npm
npm install
3. Konfigurasi Environment VariablesBuat file .env.local di root folder ecommerce-frontend dan tambahkan Client Key Midtrans Anda:Cuplikan kode# Ganti dengan Client Key dari Dashboard Midtrans (Sandbox/Production)
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY="SB-Mid-client-xxxxxxxxxxxx"
Catatan: URL Backend dikonfigurasi di app/lib/axiosClient.js atau secara langsung di komponen. Default mengarah ke http://localhost:4000.4. Jalankan Server DevelopmentBash# Menggunakan pnpm
pnpm run dev

# Atau menggunakan npm
npm run dev
Akses aplikasi di browser melalui http://localhost:3000.🧪 Pengujian (Testing)Proyek ini menggunakan Cypress untuk End-to-End (E2E) Testing, mensimulasikan interaksi pengguna nyata.Menjalankan CypressPastikan server Backend (port 4000) dan Frontend (port 3000) keduanya sedang berjalan.Buka Cypress Test Runner:Bashnpx cypress open
Pilih E2E Testing.Pilih browser (misal: Chrome).Pilih file tes yang ingin dijalankan:spec.cy.js: Tes alur Login dasar & validasi elemen UI.checkout.cy.js: Tes alur belanja lengkap (Login -> Tambah ke Keranjang -> Checkout).order-tracking.cy.js: Tes validasi riwayat pesanan dan detail status.📂 Struktur Folder Utamaecommerce-frontend/
├── app/
│   ├── admin/           # Halaman khusus Admin (Dashboard, Produk, Order, Laporan)
│   │   ├── login/       # Login khusus Admin
│   │   ├── orders/      # Manajemen Pesanan
│   │   ├── products/    # CRUD Produk
│   │   └── reports/     # Laporan & Grafik
│   ├── cart/            # Halaman Keranjang
│   ├── checkout/        # Halaman Checkout
│   ├── components/      # Komponen UI Reusable (Header, ProductCard, Toast, dll)
│   ├── lib/             # Helper functions (Axios Client, Swal Helper)
│   ├── login/           # Halaman Login Customer
│   ├── order/           # Halaman Detail Pesanan (Pembayaran & Tracking)
│   ├── orders/          # Halaman Riwayat Pesanan User
│   ├── products/        # Halaman Listing & Detail Produk
│   ├── profile/         # Halaman Profil User
│   ├── register/        # Halaman Registrasi
│   ├── layout.js        # Layout utama (termasuk script Midtrans)
│   └── page.js          # Halaman Utama (Landing Page)
├── cypress/             # File pengujian E2E
├── public/              # Aset statis (gambar, icon, svg)
└── ...
🎨 Akun Demo (Seed Data)Gunakan akun berikut untuk pengujian (pastikan Anda sudah menjalankan npm run seed di backend):RoleEmailPasswordAdmintest@example.comsecretCustomer(Silakan daftar akun baru)-Dibuat oleh Rendi Sutendi
```
