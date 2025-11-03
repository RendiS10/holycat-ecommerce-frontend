describe("Alur Checkout E2E", () => {
  // Gunakan session untuk login sekali saja
  beforeEach(() => {
    // Buat session login
    cy.session(
      "loggedInUser",
      () => {
        cy.visit("http://localhost:3000/login");
        cy.get('input[type="email"]').type("test@example.com"); // Akun admin/seed
        cy.get('input[type="password"]').type("secret");
        cy.get('button[type="submit"]').click();
        cy.get(".swal2-confirm").click(); // Klik OK pada notifikasi sukses
        cy.get("header").contains("Akun Saya").should("be.visible"); // Tunggu login selesai
      },
      {
        cacheAcrossSpecs: true, // Simpan sesi di semua file tes
      }
    );
  });

  it("seharusnya berhasil login, tambah item, checkout, dan membuat pesanan", () => {
    // 1. Kunjungi halaman utama
    cy.visit("http://localhost:3000/");

    // 2. Tambah "Kucing Lucu" ke keranjang
    cy.contains("Kucing Lucu")
      .parents(".bg-white")
      .find("button")
      .contains("Masukan Keranjang")
      .click();

    // 3. Klik OK pada notifikasi sukses
    cy.get(".swal2-confirm").click();

    // 4. Pergi ke Halaman Keranjang
    cy.visit("http://localhost:3000/cart");

    // 5. Ceklis item pertama (seharusnya sudah otomatis)
    cy.get('input[type="checkbox"]').eq(1).should("be.checked");

    // 6. Klik "Proceed to Checkout"
    cy.get("button").contains("Proceed to Checkout").click();

    // --- [PERBAIKAN DI SINI] ---

    // 7. [WAJIB] Tunggu hingga teks "Loading checkout data..." MUNCUL.
    //    Ini adalah konfirmasi bahwa navigasi ke halaman /checkout telah terjadi.
    //    Saya tambahkan timeout 10 detik untuk memberi waktu Next.js memuat halaman.
    cy.contains("Loading checkout data...", { timeout: 10000 }).should(
      "be.visible"
    );

    // 8. [WAJIB] SEKARANG, tunggu hingga teks "Loading checkout data..." HILANG.
    //    Ini adalah konfirmasi bahwa data (cart/user) telah selesai di-load.
    cy.contains("Loading checkout data...").should("not.exist");

    // 9. Sekarang kita AMAN untuk memverifikasi URL
    cy.url().should("include", "/checkout?items=");

    // 10. Dan kita AMAN untuk memverifikasi konten halaman
    cy.contains("Ringkasan Belanja").should("be.visible");

    // 11. Lanjutkan alur
    cy.get('input[value="BANK_TRANSFER"]').check();
    cy.get("button").contains("Buat Pesanan").click();

    // 12. Verifikasi hasil
    cy.url().should("include", "/order/"); // Tunggu navigasi ke halaman order

    // Verifikasi bahwa halaman detail pesanan berhasil dimuat
    cy.contains("Detail Pesanan #").should("be.visible");
    cy.contains("Menunggu Pembayaran").should("be.visible");
  });
});
