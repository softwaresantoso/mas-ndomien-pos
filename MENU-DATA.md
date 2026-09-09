# Menu Data — Ekstraksi dari Foto & Verifikasi

Sumber: 4 foto menu yang diunggah.

- **Foto 3 & 4** — kartu menu resmi, ber-brand "Pondok Es Teler Mas Ndomien" (logo + nama jelas). **Dipakai sebagai sumber utama/authoritative** karena jelas milik bisnis ini dan datanya konsisten secara internal.
- **Foto 1 & 2** — papan menu tanpa branding apa pun, foto 2 ada watermark "Google Maps". Tidak bisa dipastikan ini kartu Mas Ndomien yang mana/kapan. **Tidak dipakai sebagai sumber harga utama** karena beberapa harganya bentrok dengan kartu resmi (lihat tabel konflik di bawah).

Sesuai instruksi §7: harga yang tidak terbaca atau bentrok antar sumber TIDAK ditebak — ditandai `NEED_VERIFICATION`.

---

## 1. Data yang dipakai (dari Foto 3 & 4 — sudah di-seed ke `scripts/seed-menu.js`)

### Menu Spesial
| Item | Harga | Catatan |
|---|---|---|
| Paket Keluarga (ayam panggang jowo utuh + nasi + lalapan & urapan + es teh, untuk 5 orang) | 110.000 | |

### Menu Makanan
| Item | Harga |
|---|---|
| Nasi ayam panggang jowo | 25.000 |
| Nasi ayam goreng jowo | 25.000 |
| Nasi nila bakar | 25.000 |
| Nasi nila goreng | 25.000 |
| Nasi lele bakar | 15.000 |
| Nasi lele goreng | 15.000 |
| Nasi Sop ayam pecok jowo | 25.000 |

### Nasi Goreng
| Item | Harga |
|---|---|
| Nasi goreng original | 12.000 |
| Nasi goreng mawut | 15.000 |
| Nasi goreng selimut | 15.000 |

### Bakmi & Lain-lain (satu kolom di kartu asli)
| Item | Harga |
|---|---|
| Mi goreng jowo | 12.000 |
| Mi godog jowo | 12.000 |
| Indomie goreng | 12.000 |
| Indomie kuah | 12.000 |
| Kwe tiaw goreng | 15.000 |
| Kwe tiaw kuah | 15.000 |
| Cap cay goreng | 15.000 |
| Cap cay kuah | 15.000 |

### Menu Geprek *(kategori baru — tidak ada di 10 kategori awal, tapi jelas section terpisah di kartu asli)*
| Item | Harga |
|---|---|
| Nasi ayam geprek | 13.000 |
| Nasi ayam gepuk BBQ | 13.000 |
| Nasi ayam gepuk Teriyaki | 13.000 |
| Nasi ayam gepuk lada hitam | 13.000 |

### Hotplate
| Item | Harga |
|---|---|
| Chicken hotplate | 15.000 |
| Sosis hotplate | 15.000 |
| Bakso hotplate | 15.000 |

### Makanan Ringan
| Item | Harga |
|---|---|
| Siomai | 12.000 |
| Kentang goreng | 12.000 |
| Sosis goreng | 12.000 |
| Tahu bakso goreng | 12.000 |
| MIX (sosis & kentang) | 15.000 |

### Es Teler *(dipisah dari daftar Minuman karena ini nama & identitas brand)*
| Item | Harga |
|---|---|
| Es teler | 12.000 |
| Es kelapa muda | 6.000 |

### Minuman
| Item | Harga |
|---|---|
| Teh panas/dingin | 3.000 |
| Jeruk panas/dingin | 4.000 |
| Lemon tea panas/dingin | 4.000 |
| Milktea panas/dingin | 5.000 |
| Kopi hitam panas/dingin | 5.000 |
| Kopi susu panas/dingin | 6.000 |
| Susu jahe panas/dingin | 5.000 |
| Jahe panas/dingin | 5.000 |
| Susu coklat/putih | 5.000 |

### Aneka Jus
| Item | Harga |
|---|---|
| Jus alpukat | 12.000 |
| Jus jambu | 10.000 |
| Jus buah naga | 12.000 |
| Jus mangga | 12.000 |
| Jus wortel | 10.000 |
| Jus timun | 10.000 |
| Jus tomat | 10.000 |

### Milkshake
| Item | Harga |
|---|---|
| Milkshake coklat | 8.000 |
| Milkshake strawberry | 8.000 |
| Milkshake melon | 8.000 |
| Cappuccino cincau | 8.000 |
| Es coklat | 6.000 |

---

## 2. NEED_VERIFICATION — konflik harga antara Foto 1/2 vs Foto 3/4

Item yang sama muncul di kedua sumber dengan **harga berbeda**. Belum di-seed sampai Anda konfirmasi mana yang berlaku saat ini (mungkin foto 1/2 adalah papan lama yang belum diupdate, atau sebaliknya):

| Item | Harga di Foto 3/4 (kartu resmi) | Harga di Foto 1/2 (papan) |
|---|---|---|
| Chicken hotplate | 15.000 | 12.000 |
| Sosis hotplate | 15.000 | 12.000 |
| Bakso hotplate | 15.000 | 12.000 |
| Kentang goreng | 12.000 | 8.000 |
| Es teler | 12.000 | 10.000 |
| Teh panas/dingin | 3.000 | 4.000 |
| Lemon tea panas/dingin | 4.000 | 5.000 |
| Jahe panas/dingin | 5.000 | 6.000 |
| Susu jahe | 5.000 | 6.000 |
| Kopi hitam | 5.000 | 6.000 |

## 3. NEED_VERIFICATION — item yang hanya muncul di Foto 1/2 (tidak ada di kartu resmi)

| Item | Harga terbaca | Catatan |
|---|---|---|
| Nugget hotplate | 12.000 | tidak ada di kartu resmi — item baru atau sudah dihapus? |
| Gado-gado | tidak terbaca jelas | |
| Somay | tidak terbaca jelas (mungkin duplikat "Siomai") | |
| Es kelapa muda | Rp 10.000 di foto 1, vs Rp 6.000 di foto 4 | perlu konfirmasi |

## 4. NEED_VERIFICATION — bagian "Menu Baru" di Foto 1 (harga terpotong/tidak terbaca)

Foto 1 punya section "Menu Baru" dengan foto produk, tapi angka harga di sisi kanan sebagian besar terpotong/tidak terbaca jelas dalam foto:

| Item | Harga terbaca |
|---|---|
| Selat Sayur | tidak terbaca |
| Nasi Lele Bakar | kemungkinan duplikat item Menu Makanan di atas |
| Nasi Lele Goreng | kemungkinan duplikat item Menu Makanan di atas |
| Nasi Ula/Ulam Asam Manis | tidak terbaca, nama juga tidak 100% jelas |
| Tahu Baksi Goreng | kemungkinan duplikat "Tahu Bakso Goreng" |
| Sisis Goreng | kemungkinan duplikat "Sosis Goreng" |
| Nugget Goreng | tidak terbaca |

---

## Yang saya butuhkan dari Anda

1. Untuk 10 item di tabel §2 — harga mana yang berlaku sekarang: kartu resmi (foto 3/4) atau papan (foto 1/2)?
2. Apakah item di §3 (Nugget Hotplate, Gado-gado, Somay) memang masih dijual?
3. Foto 1 bagian "Menu Baru" — boleh foto ulang yang lebih jelas/tidak terpotong supaya harganya bisa dibaca?

Sambil menunggu jawaban, saya sudah seed **44 item yang tidak ambigu** dari kartu resmi ke `scripts/seed-menu.js` supaya menu sudah bisa langsung dites.
