# 🐱 HolyCat E-Commerce

![Node.js](https://img.shields.io/badge/Node.js-v18+-green) ![Next.js](https://img.shields.io/badge/Next.js-15-black) ![Express.js](https://img.shields.io/badge/Express.js-5-lightgrey) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue) ![Status](https://img.shields.io/badge/Status-Completed-success)

**HolyCat E-Commerce** adalah aplikasi belanja _full-stack_ modern yang dirancang untuk toko perlengkapan hewan peliharaan. Aplikasi ini dibangun dengan arsitektur Monorepo yang memisahkan **Frontend (Next.js)** dan **Backend (Express.js)**, dilengkapi dengan fitur autentikasi aman, integrasi pembayaran _real-time_, dan dashboard admin yang komprehensif.

---

## 🚀 Fitur Utama

### 🛒 Fitur Pelanggan (Customer)

- **Autentikasi Aman:** Registrasi dan Login menggunakan JWT yang disimpan dalam _HttpOnly Cookie_.
- **Katalog Produk:** Penelusuran produk dengan fitur **Pencarian** dan **Filter Kategori** (Obat, Vitamin, Grooming, dll).
- **Keranjang Belanja:** Tambah item, ubah kuantitas, dan hapus item secara _real-time_.
- **Checkout & Pembayaran:**
  - Integrasi **Midtrans Snap** untuk pembayaran otomatis (Virtual Account, E-Wallet).
  - Opsi pembayaran manual dengan **Upload Bukti Transfer**.
- **Manajemen Pesanan:**
  - Riwayat pesanan lengkap dengan status terkini.
  - **Pelacakan Pengiriman:** Informasi kurir dan nomor resi yang diupdate oleh admin.
  - Pembatalan pesanan (jika status masih diproses).
- **Manajemen Profil:** Edit biodata dan alamat pengiriman.

### 👑 Fitur Admin (Dashboard)

- **Dashboard Analitik:** Ringkasan statistik (Total User, Total Pesanan, Pendapatan, Produk Terjual).
- **Manajemen Produk (CRUD):** Tambah, Edit, dan Hapus produk beserta manajemen stok dan gambar.
- **Manajemen Pesanan:**
  - Update status pesanan (Diproses, Dikemas, Dikirim, Selesai, Dibatalkan).
  - Input **Nomor Resi** saat mengubah status menjadi "Dikirim".
- **Laporan & Ekspor:**
  - Visualisasi grafik tren pendapatan harian.
  - Filter laporan berdasarkan tanggal dan status.
  - **Ekspor CSV** untuk data penjualan.

---

## 🛠️ Tech Stack

### Frontend (`/ecommerce-frontend`)

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS 4
- **State Management:** React Hooks & Context
- **HTTP Client:** Axios
- **Form Handling:** React Hook Form
- **UI Components:** SweetAlert2, Chart.js (React-Chartjs-2)
- **Testing:** Cypress (E2E)

### Backend (`/ecommerce-backend`)

- **Runtime:** Node.js
- **Framework:** Express.js 5
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JSON Web Token (JWT), Bcrypt, Cookie-Parser
- **Payment Gateway:** Midtrans Client
- **Email Service:** Nodemailer (SMTP)
- **Testing:** Mocha, Supertest

---
