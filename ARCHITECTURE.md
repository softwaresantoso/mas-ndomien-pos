# MAS NDOMIEN POS & ORDERING — Architecture Plan

**Bisnis:** Pondok Es Teler Mas Ndomien
**Sistem:** Restaurant Operation System (Online Ordering + Table + Reservation + KDS + POS + Reporting)
**Status:** Phase 1 (Core MVP) — project baru, belum ada repository sebelumnya.

---

## 1. Product Architecture

```
                         ┌─────────────────────────┐
                         │   Firebase (per business) │
                         │  Auth · Firestore · Storage │
                         └───────────┬───────────────┘
                                     │ realtime listeners
        ┌────────────────┬──────────┼──────────┬────────────────┐
        │                │          │          │                │
   /order (public)   /app/dashboard /app/kitchen /app/cashier  /app/... (admin/owner)
   Customer PWA       Owner          Dapur+Kasir  Dapur+Kasir   Admin/Owner
   no login           full access    kitchen view cashier view  ops management
```

Satu aplikasi (satu React app, satu Firebase project per business/tenant), dua "wajah":
- **Customer-facing** (`/order/*`) — publik, tanpa login, mobile-first.
- **Internal staff app** (`/app/*`) — dilindungi Firebase Auth + role claim, layout berbeda per role (bottom-nav mobile untuk kitchen/cashier, sidebar untuk owner/admin desktop).

Multi-tenant siap dari awal: semua data dibungkus di bawah `/businesses/{businessId}`, tapi UI MVP di-hardcode ke satu `businessId` (Mas Ndomien) lewat env var, supaya bisa jadi template PARDI tanpa rewrite struktur data.

---

## 2. User Flow (ringkas)

**Customer — Dine-in via QR**
`Scan QR meja → /order?table=table-07 → lihat menu → tambah ke cart → checkout (tanpa login) → dapat ORD-code → halaman tracking status realtime`

**Customer — Take-away**
`/order → pilih menu → cart → checkout (isi nama, no. WA opsional) → ORD-code → tracking`

**Customer — Reservasi**
`/order/reservasi → pilih tanggal/jam/jumlah tamu → sistem cek availability meja → isi data → konfirmasi → RSV-code`

**Admin**
`Login → /app/dashboard → kelola order & reservasi masuk realtime → assign/konfirmasi meja`

**Kitchen+Kasir**
`Login → /app/kitchen (Kanban NEW/PROCESSING/READY) atau /app/cashier (daftar order siap dibayar → pilih metode → selesai)`

**Owner**
`Login → /app/dashboard (omzet, transaksi, produk terlaris) → /app/reports → /app/products (kelola menu) → /app/users`

---

## 3. Information Architecture (Route Map)

```
/order                       Landing customer (kategori, produk populer)
/order?table={tableId}       Landing customer terkunci ke meja tsb
/order/menu                  Full menu + filter kategori
/order/product/:slug         Detail produk + modifier
/order/cart                  Cart
/order/checkout              Checkout (dine-in / take-away)
/order/track/:orderNumber    Order status tracking
/order/reservasi             Form reservasi
/order/reservasi/:code       Status reservasi

/login                       Staff login

/app/dashboard               Role-aware dashboard (Owner: bisnis; Admin: ops)
/app/orders                  Order management (Admin/Owner)
/app/reservations            Reservation management (Admin/Owner)
/app/tables                  Table management + QR generator (Admin/Owner)
/app/kitchen                 Kitchen Display System (Dapur+Kasir)
/app/cashier                 POS / Cashier (Dapur+Kasir)
/app/products                Menu management (Owner, Admin=view only)
/app/categories              Category management (Owner)
/app/customers                Customer database (Owner/Admin)
/app/inventory                Placeholder Phase 2 (Owner)
/app/reports                  Reporting (Owner)
/app/users                    User management (Owner only)
/app/settings                 Business config (Owner only)
```

Route guard: `<ProtectedRoute allow={['OWNER','ADMIN']}>` wrapper baca custom claim role dari Firebase Auth token; redirect ke `/login` atau halaman 403 kalau tidak sesuai. Customer route (`/order/*`) tidak pernah butuh auth.

---

## 4. Firestore Schema

```
businesses/{businessId}
  name, logoUrl, address, phone, whatsapp, openingHours,
  tax {enabled, percent}, serviceCharge {enabled, percent},
  currency, orderNumberPrefix, createdAt

businesses/{businessId}/users/{userId}
  uid, name, email, role: OWNER|ADMIN|KITCHEN_CASHIER,
  permissions: { canViewFinance, canManageUsers, ... }, isActive, createdAt

businesses/{businessId}/categories/{categoryId}
  name, slug, sortOrder, isActive

businesses/{businessId}/products/{productId}
  name, slug, categoryId, description, imageUrl, price,
  isAvailable, isFeatured, sortOrder, station: kitchen|beverage|cashier|mixed,
  modifierGroups: [{ id, name, type: single|multiple, required,
                      options: [{ id, name, priceDelta }] }],
  isArchived, createdAt, updatedAt

businesses/{businessId}/tables/{tableId}
  tableNumber, capacity, status: AVAILABLE|RESERVED|OCCUPIED|CLEANING|DISABLED,
  qrCode (storage URL), isActive

businesses/{businessId}/orders/{orderId}
  orderNumber (ORD-YYYYMMDD-XXX), orderType: DINE_IN|TAKE_AWAY,
  customerId?, customerName, customerPhone?,
  tableId?, items: [{ productId, name, price, qty, modifiers, notes, station, itemStatus }],
  subtotal, discount, tax, serviceCharge, total,
  orderStatus: PENDING|CONFIRMED|PROCESSING|READY|SERVED|PICKED_UP|COMPLETED|CANCELLED,
  paymentStatus: UNPAID|PARTIAL|PAID|REFUNDED,
  notes, createdAt, updatedAt, createdBy

businesses/{businessId}/reservations/{reservationId}
  reservationCode (RSV-YYMMDD-XXX), customerName, customerPhone,
  date, time, guestCount, tableId?, preOrderItems?: [...],
  status: PENDING|CONFIRMED|ARRIVED|SEATED|COMPLETED|CANCELLED|REJECTED|NO_SHOW,
  notes, createdAt, updatedAt

businesses/{businessId}/payments/{paymentId}
  orderId, amount, method: CASH|QRIS|TRANSFER|OTHER, status,
  reference?, paidAmount?, change?, paidAt, cashierId, createdAt

businesses/{businessId}/customers/{customerId}
  name, phone, totalOrders, totalSpent, lastOrderAt, createdAt

businesses/{businessId}/inventory/{itemId}        // Phase 2 skeleton only
businesses/{businessId}/stockMovements/{moveId}   // Phase 2 skeleton only
businesses/{businessId}/auditLogs/{logId}
  userId, action, entityType, entityId, before, after, createdAt
```

Index yang dibutuhkan (didaftarkan di `firestore.indexes.json`): `orders` by (`orderStatus`, `createdAt`), `orders` by (`tableId`, `orderStatus`), `reservations` by (`date`, `status`).

---

## 5. Role Permission Matrix

| Area | OWNER | ADMIN | DAPUR+KASIR | CUSTOMER |
|---|---|---|---|---|
| Dashboard bisnis (omzet, laporan) | ✅ | operasional saja | ❌ | — |
| Order management | ✅ | ✅ | lihat order utk dapur/kasir sendiri | order sendiri via kode |
| Reservation management | ✅ | ✅ | ❌ | reservasi sendiri via kode |
| Table management + QR | ✅ | ✅ (tanpa hapus) | ❌ | ❌ |
| Kitchen display | ✅ | ❌ | ✅ | ❌ |
| Cashier/POS | ✅ | ❌ | ✅ | ❌ |
| Menu management (create/edit/harga) | ✅ | lihat saja | ❌ | lihat saja |
| Customer database | ✅ | ✅ | ❌ | ❌ |
| Reports keuangan | ✅ | hanya jika diberi permission | ❌ | ❌ |
| User management | ✅ | ❌ | ❌ | ❌ |
| Settings sistem sensitif | ✅ | ❌ | ❌ | ❌ |

Implementasi: custom claim `role` di Firebase Auth token + dokumen `permissions` per user untuk override granular (mis. admin tertentu diberi `canViewFinance: true`). Dicek di dua tempat: route guard (UX) **dan** Firestore Security Rules (yang sebenarnya menegakkan).

---

## 6. Reservation Logic

1. Customer pilih tanggal + jam + jumlah tamu.
2. Query meja: `status != DISABLED AND capacity >= guestCount`, lalu exclude meja yang punya reservasi CONFIRMED/PENDING dengan overlap waktu (asumsi durasi standar 90 menit, configurable di `businesses/{id}.reservationSettings.durationMinutes`).
3. Jika tidak ada meja spesifik dipilih → sistem beri rekomendasi meja berkapasitas pas (bukan kombinasi multi-meja untuk MVP).
4. Simpan reservasi status `PENDING`. Meja **tidak langsung** ditandai RESERVED sampai admin `CONFIRMED` — mencegah slot terkunci oleh reservasi spam yang belum divalidasi (asumsi konservatif, didokumentasikan sebagai assumption).
5. Saat admin confirm → meja di-set `RESERVED` pada rentang jam terkait (dicek ulang di server-side via Firestore transaction agar tidak race condition dengan reservasi lain).
6. Saat customer datang → admin mark `ARRIVED` → `SEATED` → table jadi `OCCUPIED`.
7. Selesai makan → `COMPLETED` → table balik `CLEANING` → admin manual set `AVAILABLE` setelah dibersihkan (sengaja manual, bukan otomatis, supaya realistis operasional).
8. Double-booking dicegah dengan Firestore transaction saat create/confirm — bukan hanya validasi UI.

---

## 7. Order State Machine

```
orderStatus:
PENDING → CONFIRMED → PROCESSING → READY → SERVED (dine-in) / PICKED_UP (take-away) → COMPLETED
PENDING → CANCELLED
CONFIRMED → CANCELLED

paymentStatus (independen, tidak campur dengan orderStatus):
UNPAID → PARTIAL → PAID
PAID → REFUNDED
```

Transisi hanya via satu fungsi service layer `transitionOrderStatus(orderId, next)` yang memvalidasi transisi legal (whitelist map), supaya tidak ada tempat lain di kode yang bisa set status sembarangan.

---

## 8. Component Architecture (ringkas)

```
src/
  app/                     # internal staff app shell (sidebar/bottom-nav per role)
  order/                   # customer-facing shell
  components/
    ui/                    # Button, Card, Badge, Modal, Toast, Skeleton (design system)
    order/                 # ProductCard, CartDrawer, ModifierSelector
    kitchen/               # KitchenTicketCard, StationTabs
    cashier/                # PaymentPanel, OrderSummary
    tables/                 # TableGridCard, QRGeneratorModal
    reservations/            # ReservationForm, ReservationCalendar
  hooks/                   # useAuth, useBusiness, useCart, useRealtimeOrders
  services/                # firestore service layer (one file per collection)
  lib/                     # firebase.js, orderStateMachine.js, reservationEngine.js
  constants/               # roles, statuses, stations, paymentMethods
  context/                  # AuthContext, CartContext, BusinessContext
```

Prinsip: **tidak ada Firestore call langsung di dalam component** — semua lewat `services/*`, supaya security & validasi terpusat dan gampang dites.

---

## 9. Implementation Roadmap (Phase 1 breakdown)

| Step | Modul | Output |
|---|---|---|
| 1 | Project scaffold + design tokens + Firebase config + PWA manifest | struktur folder, konfigurasi |
| 2 | Firestore schema + Security Rules + seed script | `firestore.rules`, `seed.js` |
| 3 | Auth + role routing | `AuthContext`, `ProtectedRoute` |
| 4 | Customer: menu, product detail, cart | `/order/*` |
| 5 | Customer: checkout + QR table binding | order creation flow |
| 6 | Table management + QR generator | `/app/tables` |
| 7 | Order management (admin) + order tracking (customer) | realtime listeners |
| 8 | Kitchen Display System | `/app/kitchen` |
| 9 | Cashier/POS + payment | `/app/cashier` |
| 10 | Reservation (customer + admin) | booking engine |
| 11 | Owner dashboard + basic reports | `/app/dashboard`, `/app/reports` |
| 12 | PWA polish (offline feedback, install prompt) + QA pass | final MVP |

Saya mulai dari **Step 1–3** sekarang (scaffold, schema, security rules, auth) karena semua modul lain bergantung padanya.

---

## Assumptions yang diambil (§49)

- Durasi reservasi default 90 menit per sesi (configurable).
- Meja baru berstatus `RESERVED` setelah admin confirm, bukan langsung saat customer submit.
- 1 business = 1 Firebase project untuk MVP (multi-tenant via `businessId` disiapkan strukturnya, tapi belum multi-project routing).
- Role `DAPUR_KASIR` digabung satu akun bisa akses kitchen & cashier sekaligus (sesuai brief §21).
- Harga & nama menu memakai placeholder `NEED VERIFICATION` sampai foto menu asli diberikan — **tidak mengarang data**.
