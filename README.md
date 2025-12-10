# 🐱 HolyCat E-Commerce - Frontend

Frontend aplikasi HolyCat E-Commerce yang dibangun menggunakan **Next.js 15 (App Router)**. Aplikasi ini menyediakan antarmuka modern dan responsif untuk pelanggan berbelanja dan panel administrasi yang lengkap untuk mengelola toko.

## 🚀 Fitur Utama

### 🛒 Fitur Pelanggan (Customer)

- **Katalog Produk:** Menampilkan daftar produk dengan tampilan grid, harga, dan stok.
- **Pencarian & Filter:** Cari produk berdasarkan nama dan filter berdasarkan kategori (Obat, Vitamin, Grooming, dll).
- **Manajemen Keranjang:** Tambah produk, ubah kuantitas, hapus item, dan pilih item tertentu untuk checkout.
- **Checkout & Pembayaran:**
  - Integrasi **Midtrans Snap** untuk pembayaran otomatis (Virtual Account, E-Wallet).
  - Opsi pembayaran manual (Upload Bukti Transfer).
- **Manajemen Pesanan:**
  - Lihat riwayat pesanan dan detail status.
  - Pelacakan pengiriman (Info Kurir & No. Resi).
  - Batalkan pesanan (jika belum diproses).
- **Profil Pengguna:** Edit data diri dan alamat pengiriman.
- **Autentikasi:** Login dan Register aman menggunakan JWT (HttpOnly Cookie).

### 👑 Fitur Admin (Dashboard)

- **Dashboard Statistik:** Ringkasan total user, pesanan, pendapatan, dan produk terjual.
- **Manajemen Produk (CRUD):** Tambah, Edit, dan Hapus produk beserta gambar dan stok.
- **Manajemen Pesanan:**
  - Ubah status pesanan (Diproses, Dikemas, Dikirim, Selesai).
  - Input Nomor Resi dan Kurir saat status diubah ke "Dikirim".
- **Laporan & Ekspor:**
  - Visualisasi grafik pendapatan harian (Chart.js).
  - Filter laporan berdasarkan rentang tanggal dan status.
  - Ekspor data pesanan ke file **CSV**.

---

## 🛠️ Teknologi yang Digunakan

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **HTTP Client:** [Axios](https://axios-http.com/)
- **State Management:** React Hooks (`useState`, `useContext`) & Zustand
- **Form Handling:** [React Hook Form](https://react-hook-form.com/)
- **Notifikasi:** [SweetAlert2](https://sweetalert2.github.io/) & Custom Toast Provider
- **Visualisasi Data:** [Chart.js](https://www.chartjs.org/) & React Chartjs 2
- **Payment Gateway:** Midtrans Snap (Client Script)
- **Testing:** [Cypress](https://www.cypress.io/) (E2E Testing)

---

## ⚙️ Prasyarat

Sebelum menjalankan frontend, pastikan:

1.  **Node.js** (versi 18 atau terbaru) sudah terinstal.
2.  **Backend** (`ecommerce-backend`) sudah berjalan di `http://localhost:4000`.

---

## 📦 Instalasi & Menjalankan Aplikasi

### 1. Masuk ke direktori frontend

```bash
cd ecommerce-frontend
```

### 2. Instal Dependensi

Kami merekomendasikan menggunakan **pnpm** (atau npm).

```bash
# Menggunakan pnpm (Disarankan)
pnpm install

# Atau menggunakan npm
npm install
```

### 3. Konfigurasi Environment Variables

Buat file `.env.local` di root folder `ecommerce-frontend` dan tambahkan Client Key Midtrans Anda (sesuai mode Sandbox/Production):

```env
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY="SB-Mid-client-xxxxxxxxxxxx"
```

> **Catatan:** Aplikasi dikonfigurasi secara _hardcoded_ untuk menghubungi backend di `http://localhost:4000` via Axios. Jika backend berjalan di URL lain, sesuaikan konfigurasi di `app/lib/axiosClient.js` atau komponen terkait.

### 4. Jalankan Server Development

```bash
# Menggunakan pnpm
pnpm run dev

# Atau menggunakan npm
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

---

## 🧪 Pengujian (Testing)

Proyek ini menggunakan **Cypress** untuk _End-to-End (E2E) Testing_.

### Menjalankan Cypress

Pastikan server backend (port 4000) dan frontend (port 3000) **keduanya sedang berjalan**.

1.  Buka Cypress Test Runner:
    ```bash
    npx cypress open
    ```
2.  Pilih **E2E Testing**.
3.  Pilih browser (misal: Chrome).
4.  Pilih file tes yang ingin dijalankan:
    - **`spec.cy.js`**: Tes alur Login dasar.
    - **`checkout.cy.js`**: Tes alur belanja lengkap (Login -> Add to Cart -> Checkout).
    - **`order-tracking.cy.js`**: Tes melihat riwayat dan detail pesanan.

---

## 📂 Struktur Folder Utama

```
ecommerce-frontend/
├── app/
│   ├── admin/           # Halaman khusus Admin (Dashboard, Produk, Order, Laporan)
│   │   ├── login/       # Login khusus Admin
│   │   ├── orders/      # Manajemen Pesanan
│   │   ├── products/    # CRUD Produk
│   │   └── reports/     # Laporan & Grafik
│   ├── cart/            # Halaman Keranjang
│   ├── checkout/        # Halaman Checkout
│   ├── components/      # Komponen UI (Header, ProductCard, Toast, dll)
│   ├── lib/             # Helper functions (Axios, Swal)
│   ├── login/           # Halaman Login Customer
│   ├── order/           # Halaman Detail Pesanan (Pembayaran & Tracking)
│   ├── orders/          # Halaman Riwayat Pesanan
│   ├── products/        # Halaman Listing & Detail Produk
│   ├── profile/         # Halaman Profil User
│   ├── register/        # Halaman Registrasi
│   ├── layout.js        # Layout utama (termasuk script Midtrans)
│   └── page.js          # Halaman Utama (Home)
├── cypress/             # File pengujian E2E
├── public/              # Aset statis (gambar, icon)
└── ...
```

---

## 🎨 Panduan Akun (Seed Data)

Untuk pengujian, Anda dapat menggunakan akun yang telah dibuat oleh seeder backend:

- **Akun Admin:**

  - Email: `test@example.com`
  - Password: `secret`

- **Akun Customer:**
  - Silakan registrasi akun baru melalui halaman `/register`.

---

_Dibuat oleh Rendi Sutendi_
