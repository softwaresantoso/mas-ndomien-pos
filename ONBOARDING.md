# SOP Onboarding Klien Baru — POS & Ordering Template

Dokumen ini adalah proses baku setiap kali ada resto/UMKM kuliner baru yang beli sistem ini (model **clone per klien** — tiap klien dapat Firebase project, repo, dan deployment sendiri-sendiri, bukan satu sistem yang dipakai bersama).

Checklist ini diurutkan sesuai alur kerja — kerjakan dari atas ke bawah.

---

## Fase 0 — Intake (sebelum mulai teknis sama sekali)

Kirim `CLIENT-INTAKE.md` ke calon klien, kumpulkan dulu semua jawabannya. **Jangan mulai setup teknis sebelum data ini lengkap** — kalau belum lengkap (terutama foto menu dengan harga terbaca jelas), proses akan berhenti di tengah jalan sama seperti saat kita kerjakan Mas Ndomien dulu.

Yang wajib ada sebelum lanjut ke Fase 1:
- [ ] Nama resmi bisnis + nama sistem (kalau mau dikustom, kalau tidak pakai nama bisnisnya saja)
- [ ] Logo (format PNG, idealnya background transparan)
- [ ] Foto menu — **jelas, tidak terpotong, harga terbaca** (pelajaran dari Mas Ndomien: foto buram/terpotong bikin proses data entry berhenti nunggu klarifikasi)
- [ ] Daftar meja + kapasitas masing-masing
- [ ] Nama & role staff yang perlu akun (minimal 1 Owner)
- [ ] Pajak/service charge berlaku atau tidak, berapa persen
- [ ] Warna brand (atau boleh pakai warna default template)

## Fase 1 — Infrastruktur (± 30-45 menit, bisa sambil nunggu Fase 0 lengkap)

- [ ] **Firebase project baru** — console.firebase.google.com → Add project → nama sesuai klien
- [ ] Aktifkan Firestore (production mode), Authentication (Email/Password), Storage
- [ ] **Cek Storage butuh Blaze plan** (sejak Feb 2026, Spark/free tidak lagi cover Storage) — upgrade ke Blaze di awal supaya tidak kaget nanti
- [ ] **Repo GitHub baru** — opsi termudah: pakai fitur "Use this template" kalau repo `mas-ndomien-pos` sudah di-set sebagai GitHub Template Repository (Settings → Template repository, centang sekali di repo asal). Kalau belum, `git clone` manual lalu `git remote set-url origin <repo-baru>` dan push sebagai riwayat baru
- [ ] **Cloudflare Pages baru** — connect ke repo baru, build command `npm run build`, output `dist`, isi 7 environment variable (`VITE_FIREBASE_*` dari project Firebase baru + `VITE_BUSINESS_ID`)
- [ ] Tambah domain Cloudflare Pages ke **Firebase Auth → Authorized domains**

## Fase 2 — Kustomisasi kode (sekali per klien, ± 15 menit)

Sebagian besar branding (nama, logo, pajak) sekarang **tidak perlu edit kode** — cukup diisi lewat halaman `/app/settings` setelah live (lihat Fase 4). Yang masih perlu edit manual di kode (karena menyangkut file statis PWA yang di-build, bukan data runtime):

- [ ] `vite.config.js` → ganti `name`, `short_name`, `description`, `theme_color`, `background_color` di bagian `manifest`
- [ ] `index.html` → ganti `<title>`
- [ ] `public/favicon.ico` + `public/icons/icon-*.png` → ganti dengan logo klien (lihat cara generate cepat di bawah)
- [ ] `package.json` → ganti `"name"` project (kosmetik, tidak wajib tapi rapi)
- [ ] `.env.local` → isi kredensial Firebase project klien + `VITE_BUSINESS_ID` (samakan dengan `BUSINESS_ID` yang dipakai di Fase 3)

**Generate icon cepat dari logo klien** (perlu Python + Pillow, atau minta tolong saya kalau mau):
resize logo ke 192x192 dan 512x512, taruh di `public/icons/`, serta buat `favicon.ico` 64x64 — sama seperti proses waktu kita bikinkan placeholder "MN" untuk Mas Ndomien dulu.

## Fase 3 — Data awal (seed script)

- [ ] Buka `scripts/seed-menu.js`, cari komentar `// ✏️ EDIT PER CLIENT`
- [ ] Ganti `BUSINESS_ID`, `CATEGORIES` (sesuai struktur menu klien), dan `PRODUCTS` (dari foto menu yang sudah dikonfirmasi di Fase 0 — proses ekstraksi harga sama seperti `MENU-DATA.md` dulu: kalau ada yang tidak terbaca/bentrok, tandai, jangan ditebak)
- [ ] Dapatkan `serviceAccountKey.json` dari Firebase Console project klien (Project settings → Service accounts → Generate new private key), taruh di root, **jangan commit**
- [ ] Jalankan `npm run seed:menu`

## Fase 4 — Setup akun & business settings (lewat UI, bukan Firebase Console lagi!)

- [ ] Buat akun Owner pertama lewat Firebase Console (Authentication → Add user) + dokumen `businesses/{id}/users/{uid}` dengan `role: OWNER, isActive: true` (bagian ini **masih manual**, User Management UI belum dibangun — lihat README bagian "Yang BELUM dibuat")
- [ ] Login sebagai Owner, buka `/app/settings` → isi nama bisnis, upload logo, alamat, kontak, jam buka, pajak/service charge
- [ ] Buka `/app/tables` → buat meja sesuai data klien, generate & print QR
- [ ] Buka `/app/products` → cross-check hasil seed, upload foto produk kalau klien kirim foto per-item (bukan cuma foto papan menu)
- [ ] Buat akun staff lain (Admin, Kitchen+Cashier) via Firebase Console, sama seperti Owner tapi role beda

## Fase 5 — QA

- [ ] Jalankan `QA-CHECKLIST.md` lengkap (checklist-nya sudah generik, tidak spesifik Mas Ndomien — bagian menu/harga di §7 disesuaikan ke data klien baru)

## Fase 6 — Handover ke klien

- [ ] Demo langsung ke Owner: alur customer (scan QR → order → bayar), alur tiap role staff
- [ ] Serahkan kredensial: email/password tiap akun staff, link situs live
- [ ] Jelaskan batasan MVP saat ini (lihat README "Yang BELUM dibuat") supaya ekspektasi jelas — terutama kalau mereka minta tambah kategori/staff baru, masih lewat Anda (Firebase Console), bukan self-service penuh
- [ ] Sepakati siapa yang pegang biaya Firebase kalau traffic naik dan kena Blaze (biasanya klien, tapi perlu eksplisit dari awal)

---

## Hal yang BELUM bisa di-self-service klien (dari Anda masih perlu bantu manual)

Jujur dicatat supaya tidak jadi janji kosong ke klien:
- Buat akun staff baru / ganti role staff
- Tambah kategori menu baru
- Lihat/restore data kalau ada kesalahan input besar

Kalau nanti volume klien sudah banyak dan ini mulai makan waktu Anda, pertimbangkan bangun User Management + Category Management UI (sudah dirancang skeleton-nya, tinggal dieksekusi) supaya makin sedikit yang perlu Anda pegang manual per klien.
