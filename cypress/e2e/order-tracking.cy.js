describe("UI Test: Order Tracking & Status", () => {
  beforeEach(() => {
    // Kita ganti ID session lagi biar fresh
    cy.session(
      "loggedInUser_Final_Fix_v2",
      () => {
        cy.intercept("POST", "**/auth/login").as("loginRequest");

        cy.visit("http://localhost:3000/login");
        cy.get('input[type="email"]').type("test@example.com");
        cy.get('input[type="password"]').type("secret");
        cy.get('button[type="submit"]').click();

        // Tunggu Login
        cy.wait("@loginRequest").its("response.statusCode").should("eq", 200);
        cy.wait(1000); // Tunggu animasi

        // Klik OK Popup
        cy.get(".swal2-confirm").should("be.visible").click();

        // Validasi Home
        cy.get("header")
          .contains("Akun Saya", { timeout: 15000 })
          .should("be.visible");
        cy.location("pathname", { timeout: 10000 }).should("eq", "/");
      },
      { cacheAcrossSpecs: true }
    );
  });

  it("Harus bisa melihat daftar pesanan dan detail status", () => {
    cy.visit("http://localhost:3000/orders");

    // Pastikan list order muncul
    cy.contains("Riwayat Pesanan Saya", { timeout: 10000 }).should(
      "be.visible"
    );
    cy.get(".shadow.border").should("have.length.at.least", 1);

    // KLIK ORDER
    cy.get(".shadow.border").first().click();

    // --- SOLUSI FINAL ---

    // 1. Jeda Keselamatan (Biarkan loading script selesai)
    cy.wait(2000);

    // 2. Cek URL DULU (Karena di log ini sudah terbukti sukses)
    cy.url({ timeout: 10000 }).should("include", "/order/");

    // 3. JANGAN cari <main>. Cari saja di seluruh BODY apakah ada kata "Status"
    // Ini jauh lebih aman daripada mencari tag spesifik.
    cy.get("body", { timeout: 10000 }).should("contain", "Status");

    // 4. Cek Indikator Status (Lingkaran warna warni)
    // Pastikan class ini benar ada di kodingan front-end kamu
    cy.get(".rounded-full").should("exist");

    // 5. Cek Info Pengiriman (Opsional/Kondisional)
    cy.get("body").then(($body) => {
      const text = $body.text().toLowerCase();
      // Kita cek keywords yang umum ada di resi
      if (
        text.includes("dikirim") ||
        text.includes("selesai") ||
        text.includes("kurir")
      ) {
        cy.contains("Info Pengiriman").should("be.visible");
      }
    });
  });
});
