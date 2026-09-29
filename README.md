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

```bash
npm install
cp .env.example .env.local   # isi dengan kredensial Firebase project Anda
npm run seed:menu            # perlu serviceAccountKey.json — lihat komentar di file
npm run dev
```

Deploy security rules (jalankan lagi tiap `firestore.rules` berubah): `firebase deploy --only firestore:rules`

## Yang BELUM dibuat (menyusul sesuai roadmap di ARCHITECTURE.md §9)

- Step 9: Cashier/POS
- Step 10: Reservation booking engine (logic sudah dirancang di ARCHITECTURE.md §6, UI & service layer belum)
- Step 11: Owner dashboard + reports
- Step 12: PWA polish, offline banner, QA pass

## Yang saya butuhkan dari Anda

1. **Konfirmasi harga** untuk 10 item yang bentrok antar foto (`MENU-DATA.md` §2), dan apakah item di §3 (Nugget Hotplate, Gado-gado, Somay) masih dijual.
2. Foto ulang bagian "Menu Baru" di Foto 1 yang harganya terpotong (`MENU-DATA.md` §4), kalau item-item itu masih relevan.
3. **Untuk testing Kitchen Display**: butuh akun staff dengan role `KITCHEN_CASHIER` (bukan cuma OWNER) — buat manual sama seperti akun OWNER (lihat bagian di bawah), tapi field `role` isi `KITCHEN_CASHIER`.
4. Modul mana selanjutnya: Cashier/POS atau Reservation?

## Setup akun staff pertama (perlu sebelum masuk /app/*)

1. Firebase Console → **Authentication** → Users → **Add user** → isi email & password.
2. Copy **User UID** yang muncul.
3. Firebase Console → **Firestore Database** → collection `businesses` → dokumen `mas-ndomien` → subcollection `users` → **Add document** → gunakan UID tadi sebagai Document ID → isi field:
   - `role`: `OWNER`
   - `name`: nama Anda
   - `isActive`: `true` (boolean, bukan string)
4. Login di `/login` pakai email & password tadi.
