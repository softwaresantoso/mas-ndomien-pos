# Mas Ndomien POS & Ordering

Lihat `ARCHITECTURE.md` untuk full architecture plan (schema, permission matrix, state machine, roadmap).
Lihat `MENU-DATA.md` untuk sumber data menu dan item yang masih perlu verifikasi harga.

## Status saat ini (selesai)

**Step 1–3 — Scaffold & fondasi**
- [x] Project scaffold (Vite + React + Tailwind + PWA plugin)
- [x] Design tokens (`tailwind.config.js`) — merah/cream/dark sesuai brand
- [x] Constants terpusat (`src/constants`) — role, status, station
- [x] Firebase config (`src/lib/firebase.js`) — env-driven, siap multi-tenant
- [x] Order state machine (`src/lib/orderStateMachine.js`)
- [x] Order service layer (`src/services/orderService.js`) — nomor order atomic via transaction, total dihitung server-side, tidak percaya input client
- [x] Firestore Security Rules (`firestore.rules`) — role-based, customer hanya bisa create/get order & reservasi miliknya sendiri, tidak bisa list semua data
- [x] Auth context + role-based route guard (`src/context/AuthContext.jsx`, `src/components/ProtectedRoute.jsx`)
- [x] Route architecture lengkap (`src/App.jsx`) dengan stub halaman untuk semua modul

**Step 4–5 — Customer Ordering UI**
- [x] `OrderLanding` — hero, deteksi meja dari `?table=`, kategori, produk unggulan
- [x] `OrderMenu` — grid menu + filter kategori
- [x] `ProductDetail` — modifier group (single/multiple), qty, catatan, validasi pilihan wajib
- [x] `Cart` — edit qty/hapus item, pilih dine-in/take-away (terkunci ke dine-in bila datang dari QR meja)
- [x] `Checkout` — form take-away, submit ke `orderService.createOrder`, error message ramah
- [x] `OrderTracking` — status realtime via `subscribeOrder`, progress step, pesan "PESANAN ANDA SUDAH SIAP"
- [x] `CartContext` — persist ke sessionStorage

**Data menu**
- [x] `MENU-DATA.md` — hasil ekstraksi 4 foto menu, dengan tabel konflik harga & item yang perlu verifikasi
- [x] `scripts/seed-menu.js` — seed business info + 11 kategori + **54 produk terverifikasi** dari kartu menu resmi (foto 3 & 4). Item dengan harga bentrok/tidak terbaca (lihat `MENU-DATA.md` §2–4) **tidak** ikut di-seed.

**Step 6 — Table Management + QR Generator**
- [x] `tableService.js` — CRUD meja, `setTableStatus` (auto-sync `isActive` saat status DISABLED), `buildTableOrderUrl` (generate URL QR dari `window.location.origin`, jadi otomatis benar di domain manapun tanpa hardcode)
- [x] `TablesManagement` (`/app/tables`) — grid meja realtime, ubah status langsung dari dropdown (Tersedia/Direservasi/Terisi/Dibersihkan/Nonaktif)
- [x] `QrCodeModal` — generate QR per meja (encode `{domain}/order?table={id}`), **Download PNG** dan **Print** langsung dari browser, tanpa perlu simpan file ke Storage
- [x] `TableFormModal` — tambah/edit meja (nomor + kapasitas)
- [x] Ikon PWA placeholder (`favicon.ico`, `icon-192.png`, `icon-512.png`) — monogram "MN" sementara, tinggal ganti file dengan nama sama begitu ada logo asli
- [x] `Login.jsx` — form login staff (sebelumnya stub kosong, sekarang fungsional)
- [x] `AppShell` — navigasi sidebar (desktop) / bottom-nav (mobile) untuk `/app/*`, otomatis menampilkan menu sesuai role

**Step 7 — Order Management (admin)**
- [x] `orderService.subscribeAllOrders` — realtime semua order (200 terbaru), filter/search dilakukan client-side supaya tidak perlu banyak composite index
- [x] `OrdersManagement` (`/app/orders`) — search (nomor order/nama/meja), filter tab (Semua/Pending/Confirmed/Processing/Ready/Completed/Cancelled/Belum Lunas)
- [x] `OrderDetailModal` — detail item + modifier + catatan, tombol transisi status sesuai `orderStateMachine` (tombol yang tampil otomatis menyesuaikan status saat ini, tidak bisa lompat status ilegal)
- [x] **Fix bug**: counter nomor order dipindah dari path `settings/` (staff-only) ke path `counters/` (public write) di Security Rules — sebelumnya bikin checkout customer gagal dengan pesan generik

**Step 8 — Kitchen Display System**
- [x] `ORDER_STATUS_TRANSITIONS` diupdate: `PENDING` sekarang bisa langsung ke `PROCESSING` (selain lewat `CONFIRMED`) — dapur bisa langsung mulai masak begitu order masuk, tidak perlu menunggu admin klik "Confirm" dulu (workflow realistis resto kecil)
- [x] `Kitchen` (`/app/kitchen`) — Kanban 3 kolom (Baru/Diproses/Siap), FIFO (order terlama diproses duluan), tab filter station (Semua/Dapur/Minuman)
- [x] `KitchenTicketCard` — font & tombol besar sesuai brief (nomor order, badge nomor meja, daftar item + modifier, catatan customer disorot merah), tombol "MULAI PROSES" / "TANDAI SIAP" otomatis sesuai status
- [x] Filter station memfilter baik daftar order maupun item yang ditampilkan di tiap tiket — order campuran (makanan + minuman) tetap muncul di kedua tab tapi item yang ditampilkan disesuaikan

**Step 9 — Cashier / POS**
- [x] `paymentService.recordPayment` — transaction atomik: catat dokumen `payments/{id}` + update `paymentStatus` order sekaligus. Kalau order sudah `SERVED`/`PICKED_UP` dan pembayaran lunas penuh, otomatis lanjut ke `COMPLETED` (transaksi resmi selesai)
- [x] `Cashier` (`/app/cashier`) — tab "Belum Lunas" (semua order menunggu pembayaran, tersortir dari yang tertua) dan "Riwayat" (transaksi terbaru)
- [x] `PaymentPanel` — pilih metode (Cash/QRIS/Transfer/Lainnya), untuk Cash ada input jumlah dibayar + hitung kembalian otomatis, validasi tidak bisa submit kalau bayar kurang
- [x] Struktur `payments` collection future-ready untuk payment gateway (field `reference`, `paidAmount`, `change`, `cashierId` terpisah dari data order) sesuai brief §23

**Step 10 — Reservation (customer + admin)**
- [x] `reservationStateMachine.js` — mirror pola `orderStateMachine.js`, transisi legal: `PENDING → CONFIRMED/REJECTED/CANCELLED`, `CONFIRMED → ARRIVED/CANCELLED/NO_SHOW`, `ARRIVED → SEATED → COMPLETED`
- [x] `reservationService.js` — generate kode `RSV-YYMMDD-XXX` via counter atomic (sama pola dengan nomor order); **cegah double-booking**: `confirmReservation` mengecek konflik jadwal (meja + tanggal + rentang waktu overlap) sebelum admin bisa confirm, kalau bentrok admin dapat pesan error yang jelas untuk pilih meja lain
- [x] Meja **tidak langsung terkunci** saat reservasi baru masuk (`PENDING`) — baru status meja ikut berubah (`RESERVED`/`OCCUPIED`/`CLEANING`) begitu admin confirm/mark arrived/seated/completed, sesuai ARCHITECTURE.md §6 (mencegah reservasi spam mengunci slot)
- [x] `ReservationForm` (`/order/reservasi`) — 3 langkah: tanggal+jam+jumlah tamu → pilih meja (otomatis rekomendasi kapasitas terkecil yang muat) → data diri → dapat kode reservasi
- [x] `ReservationStatus` (`/order/reservasi/:id`) — status realtime dengan pesan berbeda per status
- [x] `ReservationsManagement` (`/app/reservations`) — filter tanggal (default hari ini) + status + search, tombol aksi (Konfirmasi/Tolak/Batalkan/Tandai Datang/Duduk/Selesai/Tidak Hadir) otomatis sesuai status saat ini

**Step 11 — Owner Dashboard + Reports**
- [x] `reportService.js` — query rentang tanggal (bukan realtime, karena laporan bisa mundur jauh ke belakang melebihi cap 200-500 dokumen yang dipakai modul lain) + `aggregateReportData` (fungsi agregasi bersama yang dipakai Dashboard maupun Reports, angka konsisten di kedua tempat)
- [x] `Dashboard` (`/app/dashboard`) — statistik hari ini: omzet, transaksi, item terjual, pesanan aktif, belum lunas, reservasi hari ini + jumlah tamu, menu terlaris (bar list sederhana, refresh tiap 60 detik)
- [x] `Reports` (`/app/reports`, **Owner-only**) — filter preset (Hari Ini/7 Hari/30 Hari) + date range custom; breakdown: penjualan per kategori, metode pembayaran, dine-in vs take-away, order dibatalkan, reservasi tidak hadir
- [x] **Fix rule**: `reservations` list diubah dari admin/owner-only jadi semua staff aktif (`isStaff`) — Dashboard yang bisa diakses semua role butuh baca jumlah reservasi hari ini, sementara aksi kelola reservasi (update) tetap admin/owner-only

**Fix penting — Product Management (admin) yang sebelumnya kelewat**
- [x] `productService.js` — tambah fungsi admin: `subscribeAllProductsAdmin`, `createProduct`, `updateProduct`, `setProductArchived`/`Available`/`Featured` (soft delete only, sesuai brief §28: jangan hapus produk yang sudah pernah dipakai transaksi), `uploadProductImage` (ke Firebase Storage)
- [x] `ProductsManagement` (`/app/products`) — search + filter kategori, list produk dengan quick-toggle (Tersedia/Populer), tombol Arsipkan. **Owner** full akses, **Admin** view-only (checkbox/tombol edit otomatis disabled, sesuai permission matrix)
- [x] `ProductFormModal` — upload foto ke Storage, editor modifier group (tambah/hapus grup & opsi, tipe pilih-1/pilih-banyak, wajib/opsional, harga tambahan per opsi)
- [x] `storage.rules` (baru) — foto produk publicly readable, upload butuh login staff
- [x] Belum ada: halaman Category Management terpisah — untuk sekarang kategori baru masih perlu ditambah manual lewat Firebase Console (kategori sudah stabil dari seed awal, jarang berubah untuk resto kecil)

**Step 12 — PWA Polish & QA Akhir**
- [x] `useOnlineStatus` + `OfflineBanner` — banner merah "Koneksi terputus" saat offline, banner hijau "Koneksi kembali normal" sebentar saat online lagi (dipasang global, muncul di semua halaman)
- [x] `useInstallPrompt` + `InstallBanner` — banner custom "Install aplikasi ini" muncul begitu browser mendukung (menggantikan UI install default browser yang tidak konsisten)
- [x] Indikator "Menyinkronkan…" di halaman tracking order & reservasi customer — muncul kalau ada write yang masih pending saat koneksi terputus (`hasPendingWrites` dari Firestore snapshot metadata)
- [x] `QA-CHECKLIST.md` — checklist lengkap yang perlu dites manual di device asli (saya tidak punya akses ke HP/browser Anda), mencakup semua role, PWA install, offline behavior, console error check, sampai data harga menu

## Cara menjalankan (di komputer Anda — environment saya tidak punya akses jaringan)

```bash
npm install
cp .env.example .env.local   # isi dengan kredensial Firebase project Anda
npm run seed:menu            # perlu serviceAccountKey.json — lihat komentar di file
npm run dev
```

Deploy security rules (jalankan lagi tiap `firestore.rules` berubah): `firebase deploy --only firestore:rules`

**Fix — Navigasi mobile staff (drawer menu)**
- [x] Masalah: bottom-nav mobile menampung sampai 9 item untuk role Owner (Dashboard/Order/Reservasi/Meja/Dapur/Kasir/Menu/Laporan/Pengaturan) — kepencet-pencet, teks terlalu kecil
- [x] `AppShell` di mobile sekarang: top bar tipis (ikon ☰ + judul halaman aktif + ikon pintas Dashboard di kanan) → tap ☰ buka **drawer slide dari samping** berisi semua menu, tutup otomatis saat pilih menu atau tap area gelap di luar drawer
- [x] Desktop tidak berubah (sidebar tetap, ruang di layar lebar tidak masalah)
- [x] Dashboard selalu satu tap lewat ikon rumah di top bar, sesuai request "Dashboard sebagai tampilan utama"
- [x] Catatan kecil: beberapa halaman admin masih punya padding bawah ekstra (`pb-16`) sisa dari desain bottom-nav lama — kosmetik saja, tidak mengganggu fungsi, bisa dirapikan nanti kalau mau

**Fix — Staff entry point di PWA terinstall**
- [x] Masalah: `start_url` PWA ("/order") bikin staff yang install app selalu mendarat di halaman customer, tanpa jalan jelas ke area mereka
- [x] `OrderLanding` sekarang: kalau staff **belum login**, muncul link kecil "Staff Login" di pojok kanan atas (tidak mengganggu tampilan customer). Kalau staff **sudah pernah login** (sesi tersimpan), muncul bar pintas "Login sebagai {role} · Buka Dashboard →" di paling atas — jadi tiap buka app, staff langsung lihat jalan ke dashboard mereka tanpa perlu ketik URL manual
- [x] Tambah `env(safe-area-inset-top/bottom)` global di `index.css` — supaya konten (termasuk bar baru ini) tidak ketutupan status bar/notch Android saat PWA dibuka standalone

**Step 14 — Proses onboarding klien baru (productization lanjutan)**
- [x] `ONBOARDING.md` — SOP lengkap 6 fase (Intake → Infrastruktur → Kustomisasi kode → Seed data → Setup akun → QA → Handover) untuk tiap klien baru di model clone/template
- [x] `CLIENT-INTAKE.md` — form pertanyaan untuk dikirim ke calon klien SEBELUM mulai kerja teknis (pelajaran dari Mas Ndomien: mulai tanpa foto menu yang jelas bikin proses berhenti di tengah)
- [x] `scripts/seed-menu.js` — ditandai jelas bagian mana yang **wajib diedit per klien** (`✏️ EDIT PER CLIENT`), supaya tidak ketinggalan ganti saat clone ke resto lain
- [x] Dicatat jujur di `ONBOARDING.md`: apa yang masih perlu bantuan manual Anda per klien (buat akun staf baru, tambah kategori) — supaya tidak jadi janji kosong ke calon klien soal self-service penuh

**Step 13 — Settings page + Powered by SantoSoft (mulai productization ke klien lain)**
- [x] `businessService.js` — tambah `subscribeBusinessInfo`, `updateBusinessInfo`, `uploadBusinessLogo`
- [x] `Settings` (`/app/settings`, **Owner-only**) — edit nama bisnis, logo, alamat, telepon/WA, jam buka, pajak & service charge (persen + toggle aktif), durasi default reservasi — semua langsung dari UI, tidak perlu lagi sentuh Firebase Console
- [x] **Tutup loop lama**: `createOrder` sebelumnya selalu set `tax: 0, serviceCharge: 0` (ditandai TODO sejak Step 1) — sekarang beneran dihitung dari Settings, dalam transaction yang sama dengan pembuatan order. `Checkout.jsx` juga diupdate supaya customer lihat rincian pajak/service charge **sebelum** konfirmasi, jadi tidak ada selisih antara yang dilihat dan yang tersimpan
- [x] `storage.rules` — tambah path `business/**` untuk upload logo
- [x] Logo bisnis (kalau diisi di Settings) otomatis tampil di hero halaman customer
- [x] **"Powered by SantoSoft"** — dipasang di `OrderLanding` (halaman pertama yang dilihat SETIAP customer scan QR) dan sidebar `AppShell` (dilihat staff tiap hari). Logo sudah dioptimasi (702KB → 14KB, background dibuat transparan) dan disimpan di `public/branding/santosoft-logo.png`

## Yang BELUM dibuat (menyusul sesuai roadmap di ARCHITECTURE.md §9)

- Category/Customer/Inventory/User/Settings management (`/app/categories`, `/app/customers`, `/app/inventory`, `/app/users`, `/app/settings`) — belum dirouting sama sekali, sengaja ditunda karena kategori sudah stabil dari seed awal dan Phase 2/3 di ARCHITECTURE.md. Untuk sekarang, akun staff baru & kategori baru masih perlu dibuat manual lewat Firebase Console.
- Logo asli (masih placeholder monogram "MN")
- **Lihat `QA-CHECKLIST.md`** untuk daftar lengkap yang perlu dites manual sebelum benar-benar dianggap siap dijual — ada beberapa (device asli, install PWA, dsb) yang tidak bisa saya verifikasi dari sini.

## Yang saya butuhkan dari Anda

1. **Konfirmasi harga** untuk 10 item yang bentrok antar foto (`MENU-DATA.md` §2), dan apakah item di §3 (Nugget Hotplate, Gado-gado, Somay) masih dijual.
2. Foto ulang bagian "Menu Baru" di Foto 1 yang harganya terpotong (`MENU-DATA.md` §4), kalau item-item itu masih relevan.
3. **Untuk testing Kitchen Display & Cashier**: butuh akun staff dengan role `KITCHEN_CASHIER` (bukan cuma OWNER) — buat manual sama seperti akun OWNER, tapi field `role` isi `KITCHEN_CASHIER`.
4. Setup Firebase Storage rules kalau belum (lihat bagian di bawah).
5. **Jalankan `QA-CHECKLIST.md`** sebelum mengumumkan project ini "selesai" ke pemilik resto.

## Setup Firebase Storage Rules (baru — dibutuhkan untuk upload foto produk)

Berbeda dari Firestore, Storage butuh init & deploy terpisah:

```bash
firebase init storage
```
Saat ditanya "What file should be used for Storage Rules?" → terima default `storage.rules` (sudah saya buatkan). Kalau ditanya overwrite, jawab **N**.

```bash
firebase deploy --only storage
```

## Setup akun staff pertama (perlu sebelum masuk /app/*)

1. Firebase Console → **Authentication** → Users → **Add user** → isi email & password.
2. Copy **User UID** yang muncul.
3. Firebase Console → **Firestore Database** → collection `businesses` → dokumen `mas-ndomien` → subcollection `users` → **Add document** → gunakan UID tadi sebagai Document ID → isi field:
   - `role`: `OWNER`
   - `name`: nama Anda
   - `isActive`: `true` (boolean, bukan string)
4. Login di `/login` pakai email & password tadi.
