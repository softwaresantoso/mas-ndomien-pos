# QA Checklist Final — Sebelum Dianggap Siap Dijual

Checklist ini menerjemahkan Final Acceptance Criteria (ARCHITECTURE.md §51, brief asli §48 & §51) jadi langkah yang bisa Anda jalankan sendiri. Saya tidak punya akses ke device/browser asli Anda, jadi bagian ini perlu dites manual.

Centang tiap baris (`[ ]` → `[x]`) sambil jalan. Kalau ada yang gagal, screenshot error di Console (F12) dan kirim ke saya.

---

## 0. Persiapan sebelum mulai

- [ ] `npm run seed:menu` sudah dijalankan, menu tidak kosong
- [ ] `firestore.rules` versi terbaru sudah di-deploy (`firebase deploy --only firestore:rules`)
- [ ] `storage.rules` sudah di-deploy (`firebase deploy --only storage`)
- [ ] Minimal ada 1 akun tiap role: `OWNER`, `ADMIN`, `KITCHEN_CASHIER`
- [ ] Minimal 2-3 meja sudah dibuat di `/app/tables` dengan QR sudah di-generate

## 1. Customer — alur lengkap (test di HP asli, bukan cuma desktop)

- [ ] Scan QR meja → landing page otomatis menunjukkan "Meja X"
- [ ] Buka menu, semua 54 produk (atau sejumlah yang sudah Anda finalisasi) tampil dengan kategori benar
- [ ] Buka detail produk yang punya modifier (mis. minuman panas/dingin) → wajib pilih sebelum bisa "Tambah ke Keranjang"
- [ ] Tambah beberapa item ke cart, ubah qty, hapus salah satu item
- [ ] Checkout dine-in (dari QR) → tidak perlu isi nama/nomor meja lagi (sudah otomatis)
- [ ] Checkout take-away (buka `/order` tanpa `?table=`) → wajib isi nama
- [ ] Setelah checkout, halaman tracking menampilkan status real-time
- [ ] Buka `/order/reservasi`, coba reservasi lengkap 3 langkah, dapat kode `RSV-...`
- [ ] **Matikan koneksi internet HP** (mode pesawat) di tengah proses — banner "Koneksi terputus" muncul, tidak nge-blank
- [ ] Nyalakan lagi koneksi — banner "Koneksi kembali normal" muncul sebentar lalu hilang

## 2. Admin (`/app/*` dengan akun ADMIN)

- [ ] Login, `/app/dashboard` menampilkan angka hari ini
- [ ] `/app/orders` — order dari test di atas muncul, coba ubah status lewat modal
- [ ] `/app/reservations` — reservasi test muncul, coba **Konfirmasi** → cek status meja di `/app/tables` ikut berubah jadi "Direservasi"
- [ ] `/app/tables` — generate ulang 1 QR, download PNG, coba scan pakai HP lain untuk pastikan QR valid
- [ ] `/app/products` — pastikan checkbox/tombol edit **ter-disable** (admin cuma view-only sesuai desain)
- [ ] Coba akses `/app/reports` langsung lewat URL — harus otomatis redirect ke halaman Forbidden (karena admin bukan owner)
- [ ] Coba akses `/app/users` — memang belum dibangun, pastikan tidak error fatal (halaman stub biasa)

## 3. Kitchen + Cashier (`/app/*` dengan akun KITCHEN_CASHIER)

- [ ] Login, `/app/dashboard` **tidak boleh muncul error permission-denied** di Console (ini sempat jadi bug, sudah diperbaiki di Step 11)
- [ ] `/app/kitchen` — order baru muncul di kolom "Baru", klik "Mulai Proses" → pindah ke "Diproses" → "Tandai Siap" → pindah ke "Siap"
- [ ] Coba tab filter "Dapur" dan "Minuman" — order campuran tetap muncul di keduanya, item yang tampil beda
- [ ] `/app/cashier` — order yang belum lunas muncul, coba bayar Cash dengan uang lebih, cek kembalian terhitung benar
- [ ] Setelah bayar lunas, cek tab "Riwayat" — transaksi muncul
- [ ] Coba akses `/app/reports`, `/app/products` edit, `/app/users` lewat URL langsung — harus ke-block (redirect Forbidden atau tombol ter-disable)

## 4. Owner (akses penuh)

- [ ] Semua yang di atas + `/app/reports` bisa diakses, coba ganti preset tanggal (Hari Ini/7 Hari/30 Hari)
- [ ] `/app/products` — tambah produk baru dengan foto, modifier, pastikan muncul di menu customer setelah disimpan
- [ ] `/app/products` — arsipkan 1 produk, pastikan hilang dari menu customer tapi order lama yang pakai produk itu tetap utuh datanya

## 5. PWA & Device

- [ ] Buka situs live di Chrome Android → muncul banner "Install aplikasi ini" (atau menu "Add to Home Screen" manual kalau browser tidak trigger otomatis)
- [ ] Install, buka dari home screen → tampil fullscreen tanpa address bar browser
- [ ] Icon di home screen bukan lagi placeholder "MN" generic (ganti dulu kalau logo asli sudah ada — lihat README bagian icon)
- [ ] Test di minimal 2 ukuran layar: HP kecil (~360px) dan tablet/desktop

## 6. Console & link check

- [ ] Buka Console (F12) di tiap halaman utama (`/order`, `/app/dashboard`, `/app/kitchen`, dst) — pastikan tidak ada error merah (warning boleh)
- [ ] Klik semua link navigasi (sidebar desktop + bottom nav mobile) — tidak ada yang 404
- [ ] Refresh langsung di URL dalam (mis. `/app/orders`, `/order/menu`) — tidak 404 (kalau 404, cek `netlify.toml` ter-deploy)

## 7. Data & harga (khusus resto ini)

- [ ] Semua harga di `MENU-DATA.md` §2 (10 item bentrok) sudah dikonfirmasi dan di-update di `/app/products` kalau perlu
- [ ] Item di §3 (Nugget Hotplate, Gado-gado, Somay) sudah diputuskan: tambah manual lewat `/app/products` kalau memang masih dijual

---

## Kalau semua di atas sudah dicentang

Project ini sudah memenuhi Final Acceptance Criteria dari brief asli (§51) untuk MVP Phase 1. Yang **sengaja belum dibangun** (bukan bug, tapi keputusan scope untuk MVP — lihat README bagian "Yang BELUM dibuat"):

- Category/Customer/Inventory/User Management (halaman admin terpisah — masih lewat Firebase Console manual)
- Phase 2: Inventory, WhatsApp notification, printer thermal, pre-order reservation
- Phase 3: Loyalty, membership, voucher, multi-branch

Ini semua eksplisit "Phase 2/3" di roadmap asli, bukan kekurangan MVP — aman untuk mulai dipakai/dijual dengan catatan itu.
