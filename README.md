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
- [x] `scripts/seed-menu.js` — seed business info + 11 kategori + **44 produk terverifikasi** dari kartu menu resmi (foto 3 & 4). Item dengan harga bentrok/tidak terbaca (lihat `MENU-DATA.md` §2–4) **tidak** ikut di-seed.

## Cara menjalankan (di komputer Anda — environment saya tidak punya akses jaringan)

```bash
npm install
cp .env.example .env.local   # isi dengan kredensial Firebase project Anda
npm run seed:menu            # perlu serviceAccountKey.json — lihat komentar di file
npm run dev
```

Deploy security rules: `firebase deploy --only firestore:rules`

## Yang BELUM dibuat (menyusul sesuai roadmap di ARCHITECTURE.md §9)

- Step 6: table management + QR generator (Admin/Owner)
- Step 7: order management admin (Admin/Owner)
- Step 8: Kitchen Display System
- Step 9: Cashier/POS
- Step 10: Reservation booking engine (logic sudah dirancang di ARCHITECTURE.md §6, UI & service layer belum)
- Step 11: Owner dashboard + reports
- Step 12: PWA polish, offline banner, QA pass

## Yang saya butuhkan dari Anda

1. **Konfirmasi harga** untuk 10 item yang bentrok antar foto (`MENU-DATA.md` §2), dan apakah item di §3 (Nugget Hotplate, Gado-gado, Somay) masih dijual.
2. Foto ulang bagian "Menu Baru" di Foto 1 yang harganya terpotong (`MENU-DATA.md` §4), kalau item-item itu masih relevan.
3. Modul mana selanjutnya: Table + QR, Order Management, Kitchen Display, atau Reservation?
