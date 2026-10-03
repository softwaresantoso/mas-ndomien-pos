# Form Intake Klien Baru — POS & Ordering System

Kirim ini ke calon klien (lewat WA/email/Google Form), kumpulkan semua jawabannya **sebelum** mulai setup teknis (lihat `ONBOARDING.md` Fase 0). Proses akan macet di tengah kalau datanya belum lengkap — terutama foto menu.

---

## 1. Identitas Bisnis

- Nama resmi bisnis: _______________
- Nama yang mau ditampilkan di aplikasi (boleh beda dari nama resmi): _______________
- Alamat lengkap: _______________
- Nomor telepon: _______________
- Nomor WhatsApp (untuk dihubungi customer): _______________
- Jam operasional: _______________
- Logo (lampirkan file PNG, idealnya background transparan, minimal 500x500px): [ ] terlampir

## 2. Menu

- [ ] Lampirkan foto menu — **syarat penting**: foto harus jelas, tidak terpotong, tidak blur, dan **harga harus terbaca**. Kalau menu fisik rusak/pudar, lebih baik tulis ulang daftar menu manual di spreadsheet daripada foto yang tidak terbaca.
- Kategori menu yang diinginkan (boleh dikosongkan, nanti disarankan berdasarkan foto): _______________
- Ada produk yang punya pilihan/tambahan (modifier)? Contoh: level pedas, topping tambahan, pilihan ukuran. Kalau ada, sebutkan produk mana saja dan pilihannya: _______________
- Ada produk favorit/andalan yang mau ditandai "Populer" di halaman utama?: _______________

## 3. Meja & Reservasi

- Jumlah meja: _______________
- Kapasitas tiap meja (contoh: Meja 1 = 4 orang, Meja 2 = 2 orang, dst): _______________
- Terima reservasi online? [ ] Ya [ ] Tidak
- Kalau ya, durasi rata-rata 1x kunjungan (default 90 menit, bisa diubah nanti kapan saja di Settings): _______________

## 4. Staf & Peran

Sistem punya 3 role staf (di luar customer yang tidak perlu login):
- **Owner** — akses penuh (dashboard, laporan, kelola menu, kelola staf)
- **Admin** — kelola order, reservasi, meja (tidak bisa lihat laporan keuangan atau kelola staf)
- **Dapur + Kasir** — Kitchen Display + proses pembayaran

Isi daftar staf yang perlu akun:
| Nama | Role | Email untuk login |
|---|---|---|
| | | |
| | | |

## 5. Keuangan

- Kena pajak? [ ] Ya, ___% [ ] Tidak
- Kena service charge? [ ] Ya, ___% [ ] Tidak
- Metode pembayaran yang diterima: [ ] Cash [ ] QRIS [ ] Transfer [ ] Lainnya: _______________

## 6. Lain-lain

- Preferensi warna brand (boleh kirim contoh gambar/kode warna, atau pakai default template): _______________
- Punya domain sendiri yang mau dipakai (misal `order.namaresto.com`), atau pakai subdomain gratis dari hosting?: _______________
- Siapa yang akan bayar biaya Firebase kalau traffic naik melebihi batas gratis? (biasanya klien, perlu disepakati di awal): _______________

---

**Setelah form ini lengkap**, lanjut ke `ONBOARDING.md` Fase 1.
